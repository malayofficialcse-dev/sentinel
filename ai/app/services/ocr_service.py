from pathlib import Path

import pytesseract
from PIL import Image


class OCRService:

    async def extract(
        self,
        file_path: str
    ) -> str:

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Evidence file not found: {file_path}"
            )

        image = Image.open(path)

        text = pytesseract.image_to_string(
            image
        )

        return text.strip()