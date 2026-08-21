from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db
from models import (
    Course,
    Module,
    Enrollment
)

from schemas import CourseResponse
from routes.user_routes import get_current_user


router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


# ============================================================
# GET ALL COURSES
# ============================================================

@router.get("/")
def get_courses(
    db: Session = Depends(get_db)
):

    courses = db.query(Course).all()

    return courses


# ============================================================
# GET SINGLE COURSE
# ============================================================

@router.get("/{course_id}")
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course


# ============================================================
# GET COURSE MODULES
# ============================================================

@router.get("/{course_id}/modules")
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    modules = db.query(Module).filter(
        Module.course_id == course_id
    ).order_by(
        Module.module_number
    ).all()

    return modules


# ============================================================
# ENROLL IN COURSE
# ============================================================

@router.post("/{course_id}/enroll")
def enroll_course(
    course_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Already enrolled in this course"
        )

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {
        "message": "Successfully enrolled",
        "course_id": course_id,
        "course_title": course.title,
        "progress": 0
    }