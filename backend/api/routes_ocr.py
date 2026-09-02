from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Optional
from pathlib import Path
import shutil
import uuid
from backend.config import Config
from backend.tools.document_ocr import DocumentOCRTool

router = APIRouter(prefix="/api/documents", tags=["Documents & OCR"])
ocr_tool = DocumentOCRTool()

@router.post("/upload-ocr")
async def upload_and_parse_document(
    file: UploadFile = File(...),
    document_type_hint: Optional[str] = Form(None)
):
    """Uploads a financial PDF or image document and executes OCR entity extraction."""
    file_id = f"doc-{uuid.uuid4().hex[:8]}"
    file_extension = Path(file.filename).suffix
    save_path = Config.UPLOADS_DIR / f"{file_id}_{file.filename}"
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Perform OCR parsing
    ocr_result = ocr_tool.execute(
        document_names=[file.filename],
        raw_text_context=f"Document Type Hint: {document_type_hint or 'Auto-Detect'}"
    )

    return {
        "file_id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_path": str(save_path),
        "ocr_result": ocr_result
    }
