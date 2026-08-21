from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db
from models import (
    Lesson,
    Module,
    LessonProgress
)

from routes.user_routes import get_current_user


router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"]
)


# ============================================================
# GET LESSON
# ============================================================

@router.get("/{lesson_id}")
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
):

    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    if not lesson:

        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "lesson_number": lesson.lesson_number,
        "video_path": lesson.video_path,
        "duration": lesson.duration,
        "points": lesson.points
    }


# ============================================================
# GET MODULE LESSONS
# ============================================================

@router.get("/module/{module_id}")
def get_module_lessons(
    module_id: int,
    db: Session = Depends(get_db)
):

    module = db.query(Module).filter(
        Module.id == module_id
    ).first()

    if not module:

        raise HTTPException(
            status_code=404,
            detail="Module not found"
        )

    lessons = db.query(Lesson).filter(
        Lesson.module_id == module_id
    ).order_by(
        Lesson.lesson_number
    ).all()

    return lessons


# ============================================================
# COMPLETE LESSON
# ============================================================

@router.post("/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    if not lesson:

        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    # Check existing progress

    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()


    # Already completed

    if progress and progress.completed:

        return {
            "message": "Lesson already completed",
            "xp_earned": 0,
            "points_earned": 0
        }


    # Create progress if doesn't exist

    if not progress:

        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=True
        )

        db.add(progress)

    else:

        progress.completed = True


    # Update XP

    current_user.total_xp += lesson.points

    current_user.total_points += lesson.points


    db.commit()

    return {
        "message": "Lesson completed successfully",
        "lesson_id": lesson_id,
        "xp_earned": lesson.points,
        "points_earned": lesson.points,
        "total_xp": current_user.total_xp,
        "total_points": current_user.total_points
    }