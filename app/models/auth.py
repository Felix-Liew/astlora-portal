from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

try:
    from ..database import Base
except ImportError:
    from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    steam_id = Column(String(32), unique=True, index=True, nullable=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    nickname = Column(String(100), nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    profile_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
