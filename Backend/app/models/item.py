"""Item ORM model — replace with SQLAlchemy / SQLModel Table."""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Item:
    title: str
    description: Optional[str]
    price: float
    id: int = field(default=0)
