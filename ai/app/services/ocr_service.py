"""
Sentinel OCR Service
====================
Primary engine: RapidOCR (high-accuracy deep learning ONNX models)
Fallback: Tesseract OCR + PyMuPDF for PDFs + OpenCV for QR codes
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass, field
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

try:
    from rapidocr_onnxruntime import RapidOCR
    RAPID_OCR_AVAILABLE = True
except ImportError:
    RAPID_OCR_AVAILABLE = False

try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
    try:
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    except Exception:
        pass
except ImportError:
    PYTESSERACT_AVAILABLE = False


@dataclass
class OCRResult:
    text: str = ""
    qr_codes: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    page_count: int = 1


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

    def __init__(self):
        self.rapid_ocr = None
        if RAPID_OCR_AVAILABLE:
            try:
                self.rapid_ocr = RapidOCR()
            except Exception as e:
                print(f"[OCRService] Failed to initialize RapidOCR: {e}")

    def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
    ) -> OCRResult:
        warnings: list[str] = []

        if not file_bytes:
            return OCRResult(text="", warnings=["Uploaded file is empty."])

        try:
            if mime_type == self.PDF_MIME:
                return self._extract_pdf(file_bytes)
            elif mime_type in self.SUPPORTED_IMAGES or mime_type.startswith("image/"):
                return self._extract_image(file_bytes)
            else:
                # Try image extraction as a generic fallback
                try:
                    return self._extract_image(file_bytes)
                except Exception:
                    return OCRResult(
                        text="",
                        warnings=[f"Unsupported OCR MIME type: {mime_type}"]
                    )
        except Exception as exc:
            warnings.append(f"OCR extraction failed: {str(exc)}")
            return OCRResult(text="", warnings=warnings)

    def _extract_image(
        self,
        file_bytes: bytes
    ) -> OCRResult:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        np_img = np.array(image)

        text_lines: list[str] = []

        # 1. Primary: RapidOCR
        if self.rapid_ocr is not None:
            try:
                ocr_res, _ = self.rapid_ocr(np_img)
                if ocr_res:
                    for item in ocr_res:
                        if len(item) >= 2 and item[1]:
                            text_lines.append(str(item[1]).strip())
            except Exception as e:
                print(f"[OCRService] RapidOCR error: {e}")

        # 2. Fallback / Secondary: Tesseract if RapidOCR produced little text
        if len(" ".join(text_lines).strip()) < 10 and PYTESSERACT_AVAILABLE:
            try:
                processed = self._preprocess_image(image)
                tess_text = pytesseract.image_to_string(processed, config="--oem 3 --psm 6")
                if tess_text.strip():
                    text_lines.append(tess_text.strip())
            except Exception:
                pass

        # 3. QR Code extraction
        qr_codes = self._detect_qr_codes(np_img)

        raw_text = "\n".join(text_lines)
        normalized = self._normalize_text(raw_text)

        return OCRResult(
            text=normalized,
            qr_codes=qr_codes,
            warnings=[],
            page_count=1
        )

    def _extract_pdf(
        self,
        file_bytes: bytes
    ) -> OCRResult:
        try:
            import fitz  # PyMuPDF
        except ImportError:
            return OCRResult(
                text="",
                warnings=["PyMuPDF is not installed. Run: pip install pymupdf"]
            )

        document = fitz.open(stream=file_bytes, filetype="pdf")
        all_text: list[str] = []
        all_qr_codes: list[str] = []

        for page in document:
            native_text = page.get_text("text")
            if native_text and native_text.strip():
                all_text.append(native_text.strip())

            # Also render page for OCR
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image_bytes = pix.tobytes("png")
            page_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            np_img = np.array(page_image)

            if self.rapid_ocr is not None:
                try:
                    ocr_res, _ = self.rapid_ocr(np_img)
                    if ocr_res:
                        for item in ocr_res:
                            if len(item) >= 2 and item[1]:
                                all_text.append(str(item[1]).strip())
                except Exception:
                    pass

            qr_codes = self._detect_qr_codes(np_img)
            all_qr_codes.extend(qr_codes)

        document.close()
        all_qr_codes = list(dict.fromkeys(all_qr_codes))

        return OCRResult(
            text=self._normalize_text("\n".join(all_text)),
            qr_codes=all_qr_codes,
            warnings=[],
            page_count=len(document)
        )

    def _preprocess_image(
        self,
        image: Image.Image
    ) -> Image.Image:
        width, height = image.size
        if width < 1600:
            scale = 1600 / width
            image = image.resize(
                (int(width * scale), int(height * scale)),
                Image.Resampling.LANCZOS
            )
        image = image.convert("L")
        image = ImageEnhance.Contrast(image).enhance(1.8)
        image = ImageEnhance.Sharpness(image).enhance(1.5)
        image = image.filter(ImageFilter.MedianFilter(size=3))
        return image

    def _detect_qr_codes(
        self,
        image: np.ndarray
    ) -> list[str]:
        detector = cv2.QRCodeDetector()
        results: list[str] = []

        try:
            ok, decoded_info, _, _ = detector.detectAndDecodeMulti(image)
            if ok and decoded_info:
                for value in decoded_info:
                    if value and value.strip():
                        results.append(value.strip())
        except Exception:
            pass

        if not results:
            try:
                value, _, _ = detector.detectAndDecode(image)
                if value and value.strip():
                    results.append(value.strip())
            except Exception:
                pass

        return list(dict.fromkeys(results))

    @staticmethod
    def _normalize_text(
        text: str
    ) -> str:
        if not text:
            return ""
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()