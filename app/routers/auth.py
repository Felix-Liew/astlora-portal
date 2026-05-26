import os
import re
from urllib.parse import urlencode
from urllib.parse import urlencode as encode_query

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

try:
    from ..core_auth import create_access_token, get_current_user
    from ..database import get_db
    from ..models import User
    from ..schemas.auth import SteamLoginUrl, Token, UserOut
except ImportError:
    from core_auth import create_access_token, get_current_user
    from database import get_db
    from models import User
    from schemas.auth import SteamLoginUrl, Token, UserOut

router = APIRouter()

STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"
STEAM_PLAYER_SUMMARIES_URL = (
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
)
STEAM_ID_RE = re.compile(r"https://steamcommunity.com/openid/id/(\d+)")


def _app_base_url() -> str:
    return os.getenv("APP_BASE_URL", "http://127.0.0.1:8000").rstrip("/")


def _steam_callback_url() -> str:
    return f"{_app_base_url()}/api/auth/steam/callback"


def _build_steam_login_url() -> str:
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": _steam_callback_url(),
        "openid.realm": _app_base_url(),
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    }
    return f"{STEAM_OPENID_URL}?{urlencode(params)}"


def _extract_steam_id(claimed_id: str | None) -> str:
    if not claimed_id:
        raise HTTPException(status_code=400, detail="Missing Steam identity")

    match = STEAM_ID_RE.fullmatch(claimed_id)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid Steam identity")

    return match.group(1)


def _verify_steam_openid(query_params: dict[str, str]) -> str:
    verification_params = dict(query_params)
    verification_params["openid.mode"] = "check_authentication"

    with httpx.Client(timeout=10) as client:
        response = client.post(STEAM_OPENID_URL, data=verification_params)

    if response.status_code != 200 or "is_valid:true" not in response.text:
        raise HTTPException(status_code=401, detail="Steam login verification failed")

    return _extract_steam_id(query_params.get("openid.claimed_id"))


def _fetch_steam_profile(steam_id: str) -> dict:
    api_key = os.getenv("STEAM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="STEAM_API_KEY is not configured")

    params = {"key": api_key, "steamids": steam_id}
    with httpx.Client(timeout=10) as client:
        response = client.get(STEAM_PLAYER_SUMMARIES_URL, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Steam profile request failed")

    players = response.json().get("response", {}).get("players", [])
    if not players:
        raise HTTPException(status_code=404, detail="Steam profile not found")

    return players[0]


def _upsert_steam_user(db: Session, profile: dict) -> User:
    steam_id = str(profile["steamid"])
    user = db.query(User).filter(User.steam_id == steam_id).first()
    if user is None:
        user = User(
            steam_id=steam_id,
            username=f"steam_{steam_id}",
            email=f"{steam_id}@steam.invalid",
            hashed_password="",
        )
        db.add(user)

    user.nickname = profile.get("personaname") or user.username
    user.avatar_url = profile.get("avatarfull") or profile.get("avatarmedium")
    user.profile_url = profile.get("profileurl")

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Steam user already exists")

    db.refresh(user)
    return user


@router.get("/steam/login")
def steam_login():
    return RedirectResponse(_build_steam_login_url())


@router.get("/steam/login-url", response_model=SteamLoginUrl)
def steam_login_url():
    return SteamLoginUrl(login_url=_build_steam_login_url())


@router.get("/steam/callback", response_model=Token)
def steam_callback(request: Request, db: Session = Depends(get_db)):
    steam_id = _verify_steam_openid(dict(request.query_params))
    profile = _fetch_steam_profile(steam_id)
    user = _upsert_steam_user(db, profile)
    access_token = create_access_token({"sub": str(user.id), "steam_id": user.steam_id})
    frontend_callback_url = os.getenv("FRONTEND_AUTH_CALLBACK_URL")
    if frontend_callback_url:
        query = encode_query({"token": access_token, "token_type": "bearer"})
        separator = "&" if "?" in frontend_callback_url else "?"
        return RedirectResponse(f"{frontend_callback_url}{separator}{query}")

    return Token(access_token=access_token)


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
