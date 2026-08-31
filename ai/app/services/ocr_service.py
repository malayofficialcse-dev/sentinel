"""
OCR Service
===========
Extracts raw text from evidence files.

Supports:
  - Images (PNG, JPG, JPEG, WEBP, BMP, TIFF) via pytesseract
  - PDFs via pdfplumber
  - QR code decoding via pyzbar + OpenCV
"""

import io
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import pytesseract
from PIL import Image, ImageFilter, ImageEnhance


# ─────────────────────────────────────────────────────────────
# Optional heavy dependencies — graceful degradation
# ─────────────────────────────────────────────────────────────

try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import cv2
    import numpy as np
    from pyzbar.pyzbar import decode as qr_decode
    QR_SUPPORT = True
except ImportError:
    QR_SUPPORT = False


# ─────────────────────────────────────────────────────────────
# Result dataclass
# ─────────────────────────────────────────────────────────────

@dataclass
class OCRResult:
    """Structured result returned by OCRService.extract()."""

    raw_text: str = ""

    # QR codes decoded from the image (each entry is the decoded string)
    qr_codes: list[str] = field(default_factory=list)

    # How the text was obtained
    extraction_method: str = "unknown"

    # Detected file category
    file_type: str = "unknown"

    # Any non-fatal warnings during extraction
    warnings: list[str] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────
# OCR Service
# ─────────────────────────────────────────────────────────────

class OCRService:
    """
    Multi-format OCR + QR service.

    Usage
    -----
    result = await ocr.extract("path/to/evidence.png")
    print(result.raw_text)
    print(result.qr_codes)
    """

    IMAGE_EXTENSIONS = {
        ".png", ".jpg", ".jpeg",
        ".webp", ".bmp", ".tiff", ".tif"
    }
    PDF_EXTENSIONS = {".pdf"}

    # Tesseract config for best accuracy on mixed text
    TESSERACT_CONFIG = "--oem 3 --psm 6"

    # ─────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────

    async def extract(
        self,
        file_path: str,
        file_bytes: Optional[bytes] = None
    ) -> OCRResult:
        """
        Extract text and QR codes from an evidence file.

        Parameters
        ----------
        file_path:
            Absolute or relative path to the file.
            Used to determine file type even when file_bytes is provided.
        file_bytes:
            Optional raw file content. When provided the file is read from
            memory rather than disk (useful for in-memory uploads).
        """
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext in self.PDF_EXTENSIONS:
            return await self._extract_pdf(path, file_bytes)

        if ext in self.IMAGE_EXTENSIONS:
            return await self._extract_image(path, file_bytes)

        # Unknown extension — attempt image OCR as a fallback
        return OCRResult(
            file_type="unknown",
            extraction_method="none",
            warnings=[
                f"Unsupported file extension '{ext}'. "
                "Only images and PDFs are supported."
            ]
        )

    # ─────────────────────────────────────────────────────
    # PDF extraction
    # ─────────────────────────────────────────────────────

    async def _extract_pdf(
        self,
        path: Path,
        file_bytes: Optional[bytes]
    ) -> OCRResult:

        result = OCRResult(file_type="pdf")

        if not PDF_SUPPORT:
            result.warnings.append(
                "pdfplumber is not installed. "
                "Install it with: pip install pdfplumber"
            )
            return result

        try:
            source = (
                io.BytesIO(file_bytes)
                if file_bytes
                else path
            )

            pages_text: list[str] = []

            with pdfplumber.open(source) as pdf:
                for page in pdf.pages:
                    text = page.extract_text() or ""
                    pages_text.append(text)

            result.raw_text = "\n\n".join(pages_text).strip()
            result.extraction_method = "pdfplumber"

        except Exception as exc:
            result.warnings.append(f"PDF extraction failed: {exc}")

        return result

    # ─────────────────────────────────────────────────────
    # Image extraction (OCR + QR)
    # ─────────────────────────────────────────────────────

    async def _extract_image(
        self,
        path: Path,
        file_bytes: Optional[bytes]
    ) -> OCRResult:

        result = OCRResult(file_type="image")

        try:
            # Load image
            if file_bytes:
                image = Image.open(io.BytesIO(file_bytes))
            else:
                if not path.exists():
                    raise FileNotFoundError(
                        f"Evidence file not found: {path}"
                    )
                image = Image.open(path)

            # Pre-process for better OCR accuracy
            processed = self._preprocess_image(image)

            # OCR
            raw = pytesseract.image_to_string(
                processed,
                config=self.TESSERACT_CONFIG
            )
            result.raw_text = raw.strip()
            result.extraction_method = "pytesseract"

            # QR code decoding
            if QR_SUPPORT:
                result.qr_codes = self._decode_qr_codes(image)
            else:
                result.warnings.append(
                    "QR code support is unavailable. "
                    "Install pyzbar + opencv-python for QR decoding."
                )

        except FileNotFoundError as exc:
            raise exc

        except Exception as exc:
            result.warnings.append(f"Image extraction failed: {exc}")

        return result

    # ─────────────────────────────────────────────────────
    # Image pre-processing
    # ─────────────────────────────────────────────────────

    @staticmethod
    def _preprocess_image(image: Image.Image) -> Image.Image:
        """
        Improve OCR accuracy through a series of image enhancements:
          1. Convert to RGB (handles RGBA / palette modes)
          2. Scale up small images (OCR works better on larger images)
          3. Convert to greyscale
          4. Sharpen edges
          5. Increase contrast
        """
        # Normalise colour mode
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        # Upscale small images
        width, height = image.size
        if width < 1000:
            scale = 1000 / width
            image = image.resize(
                (int(width * scale), int(height * scale)),
                Image.LANCZOS
            )

        # Greyscale
        image = image.convert("L")

        # Sharpen
        image = image.filter(ImageFilter.SHARPEN)

        # Contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)

        return image

    # ─────────────────────────────────────────────────────
    # QR code decoding
    # ─────────────────────────────────────────────────────

    @staticmethod
    def _decode_qr_codes(image: Image.Image) -> list[str]:
        """
        Decode all QR codes / barcodes found in an image.
        Returns a list of decoded string values.
        """
        if not QR_SUPPORT:
            return []

        # Convert PIL image to OpenCV format
        cv_image = cv2.cvtColor(
            np.array(image.convert("RGB")),
            cv2.COLOR_RGB2GRAY
        )

        decoded_objects = qr_decode(cv_image)

        return [
            obj.data.decode("utf-8", errors="replace")
            for obj in decoded_objects
            if obj.data
        ]