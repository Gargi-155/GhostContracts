
from io import BytesIO
from pathlib import Path
from risk_analyzer import analyze_contract

import fitz
from docx import Document
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Ghost Contracts API",
    description="AI-assisted legal document risk analysis",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_EXTRACTED_CHARS = 100_000
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@app.get("/")
def root():
    return {"message": "Ghost Contracts API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


async def read_contract(file: UploadFile):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must be 10 MB or less.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid PDF.",
        )

    if extension == ".docx" and not content.startswith(b"PK"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file does not appear to be a valid DOCX.",
        )

    return filename, extension, content


@app.post("/upload-contract")
async def upload_contract(file: UploadFile = File(...)):
    filename, extension, content = await read_contract(file)

    return {
        "status": "success",
        "message": "Contract received successfully.",
        "filename": filename,
        "size_bytes": len(content),
        "file_type": extension.lstrip("."),
    }


def extract_pdf_text(content: bytes) -> str:
    with fitz.open(stream=content, filetype="pdf") as document:
        pages = []

        for page in document:
            pages.append(page.get_text())

        return "\n".join(pages)


def extract_docx_text(content: bytes) -> str:
    document = Document(BytesIO(content))
    sections = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            sections.append(paragraph.text)

    for table in document.tables:
        for row in table.rows:
            cells = [
                cell.text.strip().replace("\n", " ")
                for cell in row.cells
            ]
            sections.append(" | ".join(cells))

    return "\n".join(sections)


@app.post("/extract-contract")
async def extract_contract(file: UploadFile = File(...)):
    filename, extension, content = await read_contract(file)

    try:
        if extension == ".pdf":
            extracted_text = extract_pdf_text(content)
        else:
            extracted_text = extract_docx_text(content)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text. The document may be corrupted, encrypted, or invalid.",
        )

    extracted_text = extracted_text.strip()

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="No readable text was found. The document may be scanned or image-based.",
        )

    truncated = len(extracted_text) > MAX_EXTRACTED_CHARS
    extracted_text = extracted_text[:MAX_EXTRACTED_CHARS]

    return {
        "status": "success",
        "filename": filename,
        "file_type": extension.lstrip("."),
        "character_count": len(extracted_text),
        "truncated": truncated,
        "extracted_text": extracted_text,
    }

@app.post("/analyze-contract")
async def analyze_uploaded_contract(file: UploadFile = File(...)):
    filename, extension, content = await read_contract(file)

    try:
        if extension == ".pdf":
            extracted_text = extract_pdf_text(content)
        else:
            extracted_text = extract_docx_text(content)

        extracted_text = extracted_text.strip()

        if not extracted_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text was found in the document.",
            )

        file_type = filename.rsplit(".", 1)[-1].lower()
        analysis = analyze_contract(extracted_text)

        return {
            "status": "success",
            "filename": filename,
            "file_type": file_type,
            "character_count": len(extracted_text),
            "truncated": False,
            "extracted_text": extracted_text,
            "total_findings": analysis["total_findings"],
            "findings": analysis["findings"],
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to analyze the uploaded contract.",
        )