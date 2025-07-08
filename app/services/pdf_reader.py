import tempfile
from PyPDF2 import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    with tempfile.NamedTemporaryFile(delete=True) as tmp:
        tmp.write(pdf_bytes)
        tmp.flush()
        reader = PdfReader(tmp.name)
        print("number of pages", len(reader.pages))
        for page in reader.pages:
            text += page.extract_text() or ""
    return text.strip()
