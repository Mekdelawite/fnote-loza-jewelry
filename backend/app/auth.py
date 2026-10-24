import datetime
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import AdminUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

MAX_BCRYPT_PASSWORD_BYTES = 72


def validate_password_length(password: str) -> None:
    if len(password.encode("utf-8")) > MAX_BCRYPT_PASSWORD_BYTES:
        raise ValueError("Password must not exceed 72 UTF-8 bytes")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    validate_password_length(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    validate_password_length(password)
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY.get_secret_value(),
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY.get_secret_value(),
            algorithms=[settings.ALGORITHM],
        )
        email = payload.get("sub")
        if not isinstance(email, str) or not email or not isinstance(payload.get("exp"), (int, float)):
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(AdminUser).filter(AdminUser.email == email).first()
    if user is None or not user.is_active:
        raise credentials_exception
    if user.role not in {"owner", "manager"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required",
        )
    return user
