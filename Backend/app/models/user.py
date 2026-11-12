"""User ORM model — replace with SQLAlchemy / SQLModel Table."""
from dataclasses import dataclass, field


@dataclass
class User:
    name: str
    email: str
    hashed_password: str
    id: int = field(default=0)
