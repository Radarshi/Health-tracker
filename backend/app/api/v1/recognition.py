import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, RecognitionJob
from app.services.ai_recognition_service import FoodRecognitionService

router = APIRouter(prefix="/food-recognition", tags=["Food Recognition & Segmentation"])

@router.post("/analyze")
async def analyze_food_image(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Food photo analysis endpoint using FoodSAM regional segmentation & classification.
    Returns detected food regions, confidence scores, candidate alternatives,
    and requires user portion confirmation before saving to a meal.
    """
    try:
        content = await file.read()
        target_path, image_url = FoodRecognitionService.validate_and_normalize_image(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Run FoodSAM segmentation & classification
    analysis_result = await FoodRecognitionService.segment_and_classify_meal(
        image_path=target_path,
        image_url=image_url,
        user_notes=notes
    )

    # Save job record
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    job = RecognitionJob(
        id=job_id,
        user_id=current_user.id,
        image_path=str(target_path),
        filename=file.filename,
        status="completed",
        detections_json=analysis_result
    )
    db.add(job)
    db.commit()

    analysis_result["job_id"] = job_id
    return analysis_result

@router.get("/jobs/{job_id}")
def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(RecognitionJob).filter(
        RecognitionJob.id == job_id,
        RecognitionJob.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Recognition job not found")

    return {
        "job_id": job.id,
        "status": job.status,
        "detections": job.detections_json,
        "created_at": job.created_at
    }
