from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserRegister, UserLogin
from auth import hash_password, verify_password, create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    # Check username
    existing_username = db.query(User).filter(
        User.username == user_data.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Check email
    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(
        user_data.password
    )

    # Create student
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        college=user_data.college,
        course=user_data.course,
        year=user_data.year,
        role="student"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Student registered successfully",
        "user_id": new_user.id,
        "username": new_user.username
    }


@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user (allow username or email login)
    user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Verify password
    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create JWT
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "role": user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "college": user.college,
            "role": user.role
        }
    }

@router.post("/admin/register")
def register_admin(
    username: str,
    email: str,
    password: str,
    full_name: str,
    college: str,
    admin_key: str,
    db: Session = Depends(get_db)
):

    SECRET_ADMIN_KEY = "ECOQUEST_ADMIN_2026"

    if admin_key != SECRET_ADMIN_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid admin registration key"
        )

    existing_username = db.query(User).filter(
        User.username == username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    existing_email = db.query(User).filter(
        User.email == email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    admin = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        college=college,
        role="admin"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "message": "Admin registered successfully",
        "admin_id": admin.id,
        "username": admin.username,
        "role": admin.role
    }