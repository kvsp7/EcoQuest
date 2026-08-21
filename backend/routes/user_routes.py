from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import decode_access_token


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is missing"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format"
        )

    token = authorization.split(" ")[1]

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "college": current_user.college,
        "course": current_user.course,
        "year": current_user.year,
        "bio": current_user.bio,

        "social": {
            "linkedin": current_user.linkedin,
            "github": current_user.github,
            "portfolio": current_user.portfolio
        },

        "gamification": {
            "total_points": current_user.total_points,
            "total_xp": current_user.total_xp,
            "current_streak": current_user.current_streak,
            "longest_streak": current_user.longest_streak,
            "active_days": current_user.active_days
        },

        "role": current_user.role
    }

def get_current_admin(
    current_user=Depends(get_current_user)
):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user