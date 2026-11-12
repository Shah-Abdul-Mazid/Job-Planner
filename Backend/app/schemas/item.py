from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict

class ItemChoiceBase(BaseModel):
    preference_order: int = 1
    choice_organization: str

class ItemChoiceResponse(ItemChoiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ItemExaminationResponse(BaseModel):
    id: int
    item_id: int
    exam_type: str = "MCQ"
    exam_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reporting_time: Optional[str] = None
    center_name: Optional[str] = None
    center_address: Optional[str] = None
    roll_range_start: Optional[str] = None
    roll_range_end: Optional[str] = None
    status: str = "Scheduled"
    schedule_status: str = "confirmed"
    verified: bool = False
    source_notice_ref: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ItemBase(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=255)
    post_name: str = Field(..., min_length=2, max_length=255)
    job_id: str = Field(..., min_length=1, max_length=100)
    grade: Optional[str] = None
    tracking_id: Optional[str] = None
    roll_number: Optional[str] = None
    application_date: Optional[date] = None
    deadline: Optional[date] = None
    status: str = Field(default="Submitted")
    admit_card_available: bool = False
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    choices: List[str] = Field(default_factory=list)

class ItemUpdate(BaseModel):
    organization_name: Optional[str] = None
    post_name: Optional[str] = None
    job_id: Optional[str] = None
    grade: Optional[str] = None
    tracking_id: Optional[str] = None
    roll_number: Optional[str] = None
    application_date: Optional[date] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    admit_card_available: Optional[bool] = None
    admit_card_url: Optional[str] = None
    notes: Optional[str] = None
    choices: Optional[List[str]] = None

class ItemResponse(ItemBase):
    id: int
    user_id: Optional[int] = None
    choices: List[ItemChoiceResponse] = []
    examinations: List[ItemExaminationResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ItemListResponse(BaseModel):
    items: List[ItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class StatusCount(BaseModel):
    status: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_applications: int
    submitted_count: int
    upcoming_exams_count: int
    shortlisted_count: int
    rejected_count: int
    pending_admit_cards: int
    upcoming_deadlines_count: int
    status_distribution: List[StatusCount]
    recent_activities: List[Dict[str, Any]]
