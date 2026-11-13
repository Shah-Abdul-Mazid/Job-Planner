"""
seed.py — Seed the in-memory application store with real user data.
Imported by items.py on first request if the store is empty.

Applications for Shah Abdul Mazid:
  1. Combined 9 Banks & 2 FIs — Senior Officer (General) #26101  → Exam Scheduled (Nov 13)
  2. Combined 8 Banks — Senior Officer IT (Grade-9) #26104        → Submitted
  3. Combined 10 Banks — Officer IT/MIS (Grade-10) #26105         → Submitted
  4. Combined 8 Banks — Assistant Programmer (Grade-9) #26106     → Submitted
  5. Karmasangsthan Bank — Asst. System Engineer (Grade-9) #26108 → Submitted
  6. Sonali Bank PLC — Asst. Database Admin (Grade-9) #26109      → Submitted
"""

from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc).isoformat()


SEED_APPLICATIONS = [
    {
        "id": 1,
        "organization_name": "Combined 9 Banks & 2 FIs",
        "post_name": "Senior Officer (General)",
        "job_id": "26101",
        "grade": "Grade-9",
        "tracking_id": "26101-2052062-208657",
        "roll_number": "116683",
        "application_date": "2026-09-15",
        "deadline": "2026-10-01",
        "status": "Exam Scheduled",
        "admit_card_available": True,
        "admit_card_url": None,
        "notes": "MCQ Exam: 13 Nov 2026, 03:00–04:00 PM. Report by 02:00 PM. Center: Shamsul Hoque Khan School & College, Jatrabari, Dhaka. Roll: 116683. BSCS Notice No. 357/2026.",
        "choices": [
            {"id": 1, "preference_order": 1, "choice_organization": "Bangladesh Bank"},
            {"id": 2, "preference_order": 2, "choice_organization": "Sonali Bank PLC"},
        ],
        "examinations": [
            {
                "id": 1,
                "item_id": 1,
                "exam_type": "MCQ",
                "exam_date": "2026-11-13",
                "start_time": "03:00 PM",
                "end_time": "04:00 PM",
                "reporting_time": "02:00 PM",
                "center_name": "Shamsul Hoque Khan School & College",
                "center_address": "Matuail, Demra Road, Jatrabari, Dhaka-1361",
                "status": "Scheduled",
                "schedule_status": "confirmed",
                "verified": True,
                "source_notice_ref": "BSCS Notice No. 357/2026",
            }
        ],
        "created_at": _now(),
        "updated_at": _now(),
    },
    {
        "id": 2,
        "organization_name": "Combined 8 Banks",
        "post_name": "Senior Officer IT (Grade-9)",
        "job_id": "26104",
        "grade": "Grade-9",
        "tracking_id": "2052062-394651",
        "roll_number": None,
        "application_date": "2026-09-20",
        "deadline": "2026-10-05",
        "status": "Submitted",
        "admit_card_available": False,
        "admit_card_url": None,
        "notes": "Exam date not yet announced. Monitor official portal.",
        "choices": [],
        "examinations": [],
        "created_at": _now(),
        "updated_at": _now(),
    },
    {
        "id": 3,
        "organization_name": "Combined 10 Banks",
        "post_name": "Officer IT / MIS and ICT Officer (Grade-10)",
        "job_id": "26105",
        "grade": "Grade-10",
        "tracking_id": "2052062-932886",
        "roll_number": None,
        "application_date": "2026-09-20",
        "deadline": "2026-10-05",
        "status": "Submitted",
        "admit_card_available": False,
        "admit_card_url": None,
        "notes": "Exam date not yet announced.",
        "choices": [],
        "examinations": [],
        "created_at": _now(),
        "updated_at": _now(),
    },
    {
        "id": 4,
        "organization_name": "Combined 8 Banks",
        "post_name": "Assistant Programmer (Grade-9)",
        "job_id": "26106",
        "grade": "Grade-9",
        "tracking_id": "2052062-748291",
        "roll_number": None,
        "application_date": "2026-09-22",
        "deadline": "2026-10-10",
        "status": "Submitted",
        "admit_card_available": False,
        "admit_card_url": None,
        "notes": "Exam date not yet announced.",
        "choices": [],
        "examinations": [],
        "created_at": _now(),
        "updated_at": _now(),
    },
    {
        "id": 5,
        "organization_name": "Karmasangsthan Bank",
        "post_name": "Assistant System Engineer (Grade-9)",
        "job_id": "26108",
        "grade": "Grade-9",
        "tracking_id": "2052062-581920",
        "roll_number": None,
        "application_date": "2026-09-25",
        "deadline": "2026-10-15",
        "status": "Submitted",
        "admit_card_available": False,
        "admit_card_url": None,
        "notes": "Exam date not yet announced.",
        "choices": [],
        "examinations": [],
        "created_at": _now(),
        "updated_at": _now(),
    },
    {
        "id": 6,
        "organization_name": "Sonali Bank PLC",
        "post_name": "Assistant Database Administrator (Grade-9)",
        "job_id": "26109",
        "grade": "Grade-9",
        "tracking_id": "26109-2052062-838456",
        "roll_number": None,
        "application_date": "2026-09-25",
        "deadline": "2026-10-15",
        "status": "Submitted",
        "admit_card_available": False,
        "admit_card_url": None,
        "notes": "Applicant tracking copy. Awaiting admit card publication.",
        "choices": [],
        "examinations": [],
        "created_at": _now(),
        "updated_at": _now(),
    },
]
