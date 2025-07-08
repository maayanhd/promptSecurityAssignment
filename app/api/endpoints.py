from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas.inspection_result import PromptInspectorResponse
from app.services.pdf_reader import extract_text_from_pdf
from app.services.prompt_client import inspect_text

router = APIRouter()


@router.post("/inspect")
async def inspect_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    contents = await file.read()

    try:
        text = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")

    try:
        raw_response = inspect_text(text)
        parsed = PromptInspectorResponse.parse_obj(raw_response)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to call Prompt Security API or parse response: {str(e)}")

    # Extract the secrets, findings, and other useful info
    secrets = parsed.result.prompt.findings.Secrets or []
    violations = parsed.result.prompt.violations or []
    language_info = parsed.result.prompt.findings.Language_Detector or []


    return {
        "secrets_detected": bool(secrets),
        "secrets": [s.dict() for s in secrets],
        "violations": violations,
        "language": [lang.dict() for lang in language_info],
        "original_text_length": len(text),
        "conversation_id": parsed.result.conversation_id
    }
