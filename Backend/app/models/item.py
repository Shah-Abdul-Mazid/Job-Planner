from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Item(Base):
    """Primary Job Application Item Model."""
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    organization_name = Column(String(255), nullable=False, index=True)
    post_name = Column(String(255), nullable=False, index=True)
    job_id = Column(String(100), nullable=False, index=True)
    grade = Column(String(50), nullable=True)

    tracking_id = Column(String(100), nullable=True, index=True)
    roll_number = Column(String(100), nullable=True, index=True)

    application_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)

    # Status: Submitted, Admit Card Available, Exam Scheduled, Shortlisted, Written Examination, Viva, Selected, Rejected
    status = Column(String(100), default="Submitted", index=True)

    admit_card_available = Column(Boolean, default=False)
    admit_card_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="items")
    choices = relationship("ItemChoice", back_populates="item", cascade="all, delete-orphan")
    examinations = relationship("ItemExamination", back_populates="item", cascade="all, delete-orphan")

class ItemChoice(Base):
    __tablename__ = "item_choices"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    preference_order = Column(Integer, default=1)
    choice_organization = Column(String(255), nullable=False)

    item = relationship("Item", back_populates="choices")

class ItemExamination(Base):
    __tablename__ = "item_examinations"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)

    exam_type = Column(String(50), default="MCQ", index=True)  # MCQ, Written, Practical, Viva
    exam_date = Column(DateTime, nullable=True, index=True)
    start_time = Column(String(50), nullable=True)
    end_time = Column(String(50), nullable=True)
    reporting_time = Column(String(50), nullable=True)

    center_name = Column(String(255), nullable=True)
    center_address = Column(String(500), nullable=True)
    roll_range_start = Column(String(50), nullable=True)
    roll_range_end = Column(String(50), nullable=True)

    status = Column(String(50), default="Scheduled")
    schedule_status = Column(String(50), default="confirmed")
    verified = Column(Boolean, default=False)
    source_notice_ref = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    item = relationship("Item", back_populates="examinations")

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    application_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    category = Column(String(100), default="admit_card")
    extracted_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    notification_type = Column(String(100), index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    target_date = Column(DateTime, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
