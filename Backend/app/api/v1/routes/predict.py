from fastapi import APIRouter
from app.schemas.predict import PredictRequest, PredictResponse
from app.services.inference import inference_service

router = APIRouter()

@router.post("", response_model=PredictResponse, summary="Classify recruitment document text")
def predict(request: PredictRequest) -> PredictResponse:
    return inference_service.run_prediction(request)
