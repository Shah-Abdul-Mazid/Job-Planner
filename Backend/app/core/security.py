from datetime import datetime, timedelta
from typing import Optional, Any
import hashlib
from app.core.config import settings

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception:
    pwd_context = None

try:
    from jose import jwt, JWTError
except Exception:
    jwt = None
    JWTError = Exception


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if pwd_context is not None:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


def get_password_hash(password: str) -> str:
    if pwd_context is not None:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire.timestamp() if hasattr(expire, "timestamp") else str(expire)})
    if jwt is not None:
        try:
            return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        except Exception:
            pass
    return hashlib.sha256(f"{to_encode}:{settings.SECRET_KEY}".encode()).hexdigest()


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    if jwt is not None:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except Exception:
            return None
    return None
