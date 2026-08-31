# """
# OCR Service
# ===========
# Extracts raw text from evidence files.

# Supports:
#   - Images (PNG, JPG, JPEG, WEBP, BMP, TIFF) via pytesseract
#   - PDFs via pdfplumber
#   - QR code decoding via pyzbar + OpenCV
# """

# import io
# from dataclasses import dataclass, field
# from pathlib import Path
# from typing import Optional

# import pytesseract
# from PIL import Image, ImageFilter, ImageEnhance


# # ─────────────────────────────────────────────────────────────
# # Optional heavy dependencies — graceful degradation
# # ─────────────────────────────────────────────────────────────

# try:
#     import pdfplumber
#     PDF_SUPPORT = True
# except ImportError:
#     PDF_SUPPORT = False

# try:
#     import cv2
#     import numpy as np
#     from pyzbar.pyzbar import decode as qr_decode
#     QR_SUPPORT = True
# except ImportError:
#     QR_SUPPORT = False


# # ─────────────────────────────────────────────────────────────
# # Result dataclass
# # ─────────────────────────────────────────────────────────────

# @dataclass
# class OCRResult:
#     """Structured result returned by OCRService.extract()."""

#     raw_text: str = ""

#     # QR codes decoded from the image (each entry is the decoded string)
#     qr_codes: list[str] = field(default_factory=list)

#     # How the text was obtained
#     extraction_method: str = "unknown"

#     # Detected file category
#     file_type: str = "unknown"

#     # Any non-fatal warnings during extraction
#     warnings: list[str] = field(default_factory=list)


# # ─────────────────────────────────────────────────────────────
# # OCR Service
# # ─────────────────────────────────────────────────────────────

# class OCRService:
#     """
#     Multi-format OCR + QR service.

#     Usage
#     -----
#     result = await ocr.extract("path/to/evidence.png")
#     print(result.raw_text)
#     print(result.qr_codes)
#     """

#     IMAGE_EXTENSIONS = {
#         ".png", ".jpg", ".jpeg",
#         ".webp", ".bmp", ".tiff", ".tif"
#     }
#     PDF_EXTENSIONS = {".pdf"}

#     # Tesseract config for best accuracy on mixed text
#     TESSERACT_CONFIG = "--oem 3 --psm 6"

#     # ─────────────────────────────────────────────────────
#     # Public interface
#     # ─────────────────────────────────────────────────────

#     async def extract(
#         self,
#         file_path: str,
#         file_bytes: Optional[bytes] = None
#     ) -> OCRResult:
#         """
#         Extract text and QR codes from an evidence file.

#         Parameters
#         ----------
#         file_path:
#             Absolute or relative path to the file.
#             Used to determine file type even when file_bytes is provided.
#         file_bytes:
#             Optional raw file content. When provided the file is read from
#             memory rather than disk (useful for in-memory uploads).
#         """
#         path = Path(file_path)
#         ext = path.suffix.lower()

#         if ext in self.PDF_EXTENSIONS:
#             return await self._extract_pdf(path, file_bytes)

#         if ext in self.IMAGE_EXTENSIONS:
#             return await self._extract_image(path, file_bytes)

#         # Unknown extension — attempt image OCR as a fallback
#         return OCRResult(
#             file_type="unknown",
#             extraction_method="none",
#             warnings=[
#                 f"Unsupported file extension '{ext}'. "
#                 "Only images and PDFs are supported."
#             ]
#         )

#     # ─────────────────────────────────────────────────────
#     # PDF extraction
#     # ─────────────────────────────────────────────────────

#     async def _extract_pdf(
#         self,
#         path: Path,
#         file_bytes: Optional[bytes]
#     ) -> OCRResult:

#         result = OCRResult(file_type="pdf")

#         if not PDF_SUPPORT:
#             result.warnings.append(
#                 "pdfplumber is not installed. "
#                 "Install it with: pip install pdfplumber"
#             )
#             return result

#         try:
#             source = (
#                 io.BytesIO(file_bytes)
#                 if file_bytes
#                 else path
#             )

#             pages_text: list[str] = []

#             with pdfplumber.open(source) as pdf:
#                 for page in pdf.pages:
#                     text = page.extract_text() or ""
#                     pages_text.append(text)

#             result.raw_text = "\n\n".join(pages_text).strip()
#             result.extraction_method = "pdfplumber"

#         except Exception as exc:
#             result.warnings.append(f"PDF extraction failed: {exc}")

#         return result

#     # ─────────────────────────────────────────────────────
#     # Image extraction (OCR + QR)
#     # ─────────────────────────────────────────────────────

#     async def _extract_image(
#         self,
#         path: Path,
#         file_bytes: Optional[bytes]
#     ) -> OCRResult:

#         result = OCRResult(file_type="image")

#         try:
#             # Load image
#             if file_bytes:
#                 image = Image.open(io.BytesIO(file_bytes))
#             else:
#                 if not path.exists():
#                     raise FileNotFoundError(
#                         f"Evidence file not found: {path}"
#                     )
#                 image = Image.open(path)

#             # Pre-process for better OCR accuracy
#             processed = self._preprocess_image(image)

#             # OCR
#             raw = pytesseract.image_to_string(
#                 processed,
#                 config=self.TESSERACT_CONFIG
#             )
#             result.raw_text = raw.strip()
#             result.extraction_method = "pytesseract"

#             # QR code decoding
#             if QR_SUPPORT:
#                 result.qr_codes = self._decode_qr_codes(image)
#             else:
#                 result.warnings.append(
#                     "QR code support is unavailable. "
#                     "Install pyzbar + opencv-python for QR decoding."
#                 )

#         except FileNotFoundError as exc:
#             raise exc

#         except Exception as exc:
#             result.warnings.append(f"Image extraction failed: {exc}")

#         return result

#     # ─────────────────────────────────────────────────────
#     # Image pre-processing
#     # ─────────────────────────────────────────────────────

#     @staticmethod
#     def _preprocess_image(image: Image.Image) -> Image.Image:
#         """
#         Improve OCR accuracy through a series of image enhancements:
#           1. Convert to RGB (handles RGBA / palette modes)
#           2. Scale up small images (OCR works better on larger images)
#           3. Convert to greyscale
#           4. Sharpen edges
#           5. Increase contrast
#         """
#         # Normalise colour mode
#         if image.mode not in ("RGB", "L"):
#             image = image.convert("RGB")

#         # Upscale small images
#         width, height = image.size
#         if width < 1000:
#             scale = 1000 / width
#             image = image.resize(
#                 (int(width * scale), int(height * scale)),
#                 Image.LANCZOS
#             )

#         # Greyscale
#         image = image.convert("L")

#         # Sharpen
#         image = image.filter(ImageFilter.SHARPEN)

#         # Contrast
#         enhancer = ImageEnhance.Contrast(image)
#         image = enhancer.enhance(2.0)

#         return image

#     # ─────────────────────────────────────────────────────
#     # QR code decoding
#     # ─────────────────────────────────────────────────────

#     @staticmethod
#     def _decode_qr_codes(image: Image.Image) -> list[str]:
#         """
#         Decode all QR codes / barcodes found in an image.
#         Returns a list of decoded string values.
#         """
#         if not QR_SUPPORT:
#             return []

#         # Convert PIL image to OpenCV format
#         cv_image = cv2.cvtColor(
#             np.array(image.convert("RGB")),
#             cv2.COLOR_RGB2GRAY
#         )

#         decoded_objects = qr_decode(cv_image)

#         return [
#             obj.data.decode("utf-8", errors="replace")
#             for obj in decoded_objects
#             if obj.data
#         ]






"""
Sentinel OCR Service
====================

Responsible for:

1. OCR from screenshots/images
2. OCR from PDF pages
3. QR code detection
4. Image preprocessing
5. Returning normalized extracted text
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass, field
from typing import Optional

import cv2
import numpy as np
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter


# ============================================================
# OPTIONAL WINDOWS TESSERACT CONFIG
# ============================================================

try:
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )
except Exception:
    pass


# ============================================================
# RESULT
# ============================================================

@dataclass
class OCRResult:
    text: str = ""
    qr_codes: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    page_count: int = 1


# ============================================================
# OCR SERVICE
# ============================================================

class OCRService:

    SUPPORTED_IMAGES = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/bmp",
        "image/tiff",
    }

    PDF_MIME = "application/pdf"

    # --------------------------------------------------------
    # PUBLIC
    # --------------------------------------------------------

    def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
    ) -> OCRResult:

        warnings: list[str] = []

        if not file_bytes:
            return OCRResult(
                text="",
                warnings=["Uploaded file is empty."]
            )

        try:

            if mime_type == self.PDF_MIME:
                result = self._extract_pdf(file_bytes)

            elif mime_type in self.SUPPORTED_IMAGES:
                result = self._extract_image(file_bytes)

            else:
                return OCRResult(
                    text="",
                    warnings=[
                        f"Unsupported OCR MIME type: {mime_type}"
                    ]
                )

            return result

        except Exception as exc:

            warnings.append(
                f"OCR extraction failed: {str(exc)}"
            )

            return OCRResult(
                text="",
                warnings=warnings
            )

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    def _extract_image(
        self,
        file_bytes: bytes
    ) -> OCRResult:

        image = Image.open(
            io.BytesIO(file_bytes)
        ).convert("RGB")

        processed = self._preprocess_image(image)

        text = self._run_tesseract(processed)

        qr_codes = self._detect_qr_codes(
            np.array(image)
        )

        return OCRResult(
            text=self._normalize_text(text),
            qr_codes=qr_codes,
            warnings=[],
            page_count=1
        )

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    def _extract_pdf(
        self,
        file_bytes: bytes
    ) -> OCRResult:

        try:
            import fitz  # PyMuPDF
        except ImportError:
            return OCRResult(
                text="",
                warnings=[
                    "PyMuPDF is not installed. "
                    "Run: pip install pymupdf"
                ]
            )

        document = fitz.open(
            stream=file_bytes,
            filetype="pdf"
        )

        all_text: list[str] = []
        all_qr_codes: list[str] = []

        for page in document:

            # ------------------------------------------------
            # First try native PDF text
            # ------------------------------------------------

            native_text = page.get_text("text")

            if native_text and native_text.strip():

                all_text.append(
                    native_text
                )

            # ------------------------------------------------
            # Also render page for OCR
            # ------------------------------------------------

            pix = page.get_pixmap(
                matrix=fitz.Matrix(2, 2),
                alpha=False
            )

            image_bytes = pix.tobytes(
                "png"
            )

            image = Image.open(
                io.BytesIO(image_bytes)
            ).convert("RGB")

            processed = self._preprocess_image(
                image
            )

            ocr_text = self._run_tesseract(
                processed
            )

            if ocr_text.strip():

                all_text.append(
                    ocr_text
                )

            qr_codes = self._detect_qr_codes(
                np.array(image)
            )

            all_qr_codes.extend(
                qr_codes
            )

        document.close()

        # Remove duplicate QR codes
        all_qr_codes = list(
            dict.fromkeys(all_qr_codes)
        )

        return OCRResult(
            text=self._normalize_text(
                "\n".join(all_text)
            ),
            qr_codes=all_qr_codes,
            warnings=[],
            page_count=len(document)
        )

    # --------------------------------------------------------
    # PREPROCESS IMAGE
    # --------------------------------------------------------

    def _preprocess_image(
        self,
        image: Image.Image
    ) -> Image.Image:

        # Upscale
        width, height = image.size

        if width < 1600:

            scale = 1600 / width

            image = image.resize(
                (
                    int(width * scale),
                    int(height * scale)
                ),
                Image.Resampling.LANCZOS
            )

        # Grayscale
        image = image.convert("L")

        # Contrast
        image = ImageEnhance.Contrast(
            image
        ).enhance(1.8)

        # Sharpness
        image = ImageEnhance.Sharpness(
            image
        ).enhance(1.5)

        # Slight denoise
        image = image.filter(
            ImageFilter.MedianFilter(
                size=3
            )
        )

        return image

    # --------------------------------------------------------
    # TESSERACT
    # --------------------------------------------------------

    def _run_tesseract(
        self,
        image: Image.Image
    ) -> str:

        config = (
            "--oem 3 "
            "--psm 6"
        )

        try:

            return pytesseract.image_to_string(
                image,
                config=config
            )

        except pytesseract.TesseractNotFoundError:

            raise RuntimeError(
                "Tesseract OCR executable was not found. "
                "Install Tesseract or configure "
                "pytesseract.pytesseract.tesseract_cmd."
            )

    # --------------------------------------------------------
    # QR CODE
    # --------------------------------------------------------

    def _detect_qr_codes(
        self,
        image: np.ndarray
    ) -> list[str]:

        detector = cv2.QRCodeDetector()

        results: list[str] = []

        # Try multi QR detection
        try:

            ok, decoded_info, _, _ = (
                detector.detectAndDecodeMulti(
                    image
                )
            )

            if ok and decoded_info:

                for value in decoded_info:

                    if value and value.strip():

                        results.append(
                            value.strip()
                        )

        except Exception:
            pass

        # Try single QR detection as fallback
        if not results:

            try:

                value, _, _ = (
                    detector.detectAndDecode(
                        image
                    )
                )

                if value and value.strip():

                    results.append(
                        value.strip()
                    )

            except Exception:
                pass

        return list(
            dict.fromkeys(results)
        )

    # --------------------------------------------------------
    # NORMALIZATION
    # --------------------------------------------------------

    @staticmethod
    def _normalize_text(
        text: str
    ) -> str:

        if not text:
            return ""

        # Normalize CRLF
        text = text.replace(
            "\r\n",
            "\n"
        )

        text = text.replace(
            "\r",
            "\n"
        )

        # Remove excessive spaces
        text = re.sub(
            r"[ \t]+",
            " ",
            text
        )

        # Remove excessive blank lines
        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text
        )

        return text.strip()