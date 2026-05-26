from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    steam_id: str | None = None
    username: str
    email: str | None = None
    nickname: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    profile_url: str | None = None
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SteamLoginUrl(BaseModel):
    login_url: str
