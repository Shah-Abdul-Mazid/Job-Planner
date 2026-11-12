"""
Seed database with real Bangladesh bank job application data.
Run automatically on first startup if DB is empty.
"""

from __future__ import annotations
from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.models.item import Item, ItemExamination, NotificationModel


def seed_database(db: Session) -> None:
    print("🌱 Seeding database with real job application data...")

    # ── 4 Real Applications ───────────────────────────────────────────────────
    app1 = Item(
        organization_name="Combined 9 Banks & 2 FIs",
        post_name="Senior Officer (General)",
        job_id="26101",
        grade="Grade-9 (903 Posts)",
        tracking_id="2052062-116683",
        roll_number="116683",
        application_date=date(2026, 9, 15),
        deadline=date(2026, 10, 1),
        status="Exam Scheduled",
        admit_card_available=True,
        notes=(
            "MCQ Preliminary Exam: 13 Nov 2026 (Friday), 3:00 PM – 4:00 PM (100 Marks). "
            "Report by 2:00 PM. Centre: Shamsul Hoque Khan School & College, Matuail, Demra, Jatrabari. "
            "BSCS Notice No. 348/2026 (27/10/2026) for 903 Senior Officer posts across 9 Banks & 2 FIs. "
            "Bring admit card + NID."
        ),
    )
    app2 = Item(
        organization_name="Sonali Bank PLC",
        post_name="Assistant Database Administrator",
        job_id="26109",
        grade="Grade 9",
        tracking_id="2052062-838456",
        roll_number="338528",
        application_date=date(2026, 10, 5),
        deadline=date(2026, 10, 20),
        status="Submitted",
        admit_card_available=False,
        notes="Tracking: 2052062-838456. Monitor sonalibank.com.bd for exam notice.",
    )
    app3 = Item(
        organization_name="Combined 10 Banks",
        post_name="Officer (IT)/MIS and ICT Officer",
        job_id="26105",
        grade="Grade 10",
        tracking_id="2052062-932886",
        roll_number="338528",
        application_date=date(2026, 10, 3),
        deadline=date(2026, 10, 18),
        status="Submitted",
        admit_card_available=False,
        notes="Tracking: 2052062-932886. Combined recruitment for 10 banks consortium.",
    )
    app4 = Item(
        organization_name="Combined 8 Banks",
        post_name="Senior Officer (IT)",
        job_id="26104",
        grade="Grade 9",
        tracking_id="2052062-394651",
        roll_number="338528",
        application_date=date(2026, 10, 2),
        deadline=date(2026, 10, 17),
        status="Submitted",
        admit_card_available=False,
        notes="Tracking: 2052062-394651. Combined recruitment for 8 state-owned banks.",
    )

    for app in [app1, app2, app3, app4]:
        db.add(app)

    db.flush()  # get IDs assigned

    # ── Confirmed Examination for BB Senior Officer ───────────────────────────
    # Source: BSCS Notice No. 357/2026 (official — NEVER overwrite with AI inference)
    exam = ItemExamination(
        item_id=app1.id,
        exam_date=datetime(2026, 11, 13, 9, 0, 0),   # 3 PM BDT = 9 AM UTC (stored as naive UTC)
        exam_type="MCQ",
        start_time="15:00",
        end_time="16:00",
        reporting_time="14:00",
        center_name="Shamsul Hoque Khan School & College",
        center_address="Matuail, Demra Road, Jatrabari, Dhaka 1361",
        status="Scheduled",
        schedule_status="confirmed",
        verified=True,
        source_notice_ref="BSCS Notice No. 357/2026",
    )
    db.add(exam)

    # ── Notifications ─────────────────────────────────────────────────────────
    notif1 = NotificationModel(
        title="⚠️ Exam Tomorrow — Combined 9 Banks Senior Officer",
        message=(
            "Your Combined 9 Banks & 2 FIs Senior Officer (Job ID: 26101) MCQ exam is on 13 November 2026 at 3:00 PM. "
            "Report to Shamsul Hoque Khan School & College, Jatrabari by 2:00 PM. "
            "Bring your admit card and NID."
        ),
        notification_type="exam_alert",
        is_read=False,
    )
    notif2 = NotificationModel(
        title="📋 Admit Card Available — Combined 9 Banks & 2 FIs",
        message="Your admit card for Combined 9 Banks Senior Officer (Roll: 116683) is available. Exam: 13 Nov 2026.",
        notification_type="admit_card",
        is_read=False,
    )
    db.add(notif1)
    db.add(notif2)

    db.commit()
    print("✅ Seeded 4 applications, 1 examination, 2 notifications.")
