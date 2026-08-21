from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid

from database import get_db


from models import (
    User,
    Course,
    Module,
    Lesson,
    Quiz,
    Question
)

from routes.user_routes import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get("/dashboard")
def admin_dashboard(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    total_students = db.query(User).filter(
        User.role == "student"
    ).count()

    total_courses = db.query(Course).count()

    total_modules = db.query(Module).count()

    total_lessons = db.query(Lesson).count()

    return {
        "message": "Welcome to EcoQuest Admin Dashboard",

        "statistics": {
            "students": total_students,
            "courses": total_courses,
            "modules": total_modules,
            "lessons": total_lessons
        }
    }


# ============================================================
# GET ALL STUDENTS
# ============================================================

@router.get("/students")
def get_students(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    students = db.query(User).filter(
        User.role == "student"
    ).all()

    return [
        {
            "id": student.id,
            "username": student.username,
            "email": student.email,
            "full_name": student.full_name,
            "college": student.college,
            "course": student.course,
            "year": student.year,
            "total_xp": student.total_xp,
            "total_points": student.total_points,
            "current_streak": student.current_streak
        }

        for student in students
    ]

@router.post("/courses")
def create_course(
    title: str,
    description: str,
    category: str,
    difficulty: str = "Beginner",
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):

    course = Course(
        title=title,
        description=description,
        category=category,
        difficulty=difficulty,
        total_modules=0,
        total_points=0
    )

    db.add(course)
    db.commit()
    db.refresh(course)

    return {
        "message": "Course created successfully",
        "course_id": course.id,
        "title": course.title
    }

@router.post("/courses/{course_id}/modules")
def create_module(
    course_id: int,
    title: str,
    description: str,
    points: int = 50,
    current_admin=Depends(get_current_admin),
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

    module_count = db.query(Module).filter(
        Module.course_id == course_id
    ).count()

    module = Module(
        course_id=course_id,
        title=title,
        description=description,
        module_number=module_count + 1,
        points=points
    )

    db.add(module)

    course.total_modules = module_count + 1
    course.total_points += points

    db.commit()
    db.refresh(module)

    return {
        "message": "Module created successfully",
        "module_id": module.id,
        "module_number": module.module_number,
        "course_id": course_id
    }

@router.post("/courses/{course_id}/modules")
def create_module(
    course_id: int,
    title: str,
    description: str,
    points: int = 50,
    current_admin=Depends(get_current_admin),
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

    module_count = db.query(Module).filter(
        Module.course_id == course_id
    ).count()

    module = Module(
        course_id=course_id,
        title=title,
        description=description,
        module_number=module_count + 1,
        points=points
    )

    db.add(module)

    course.total_modules = module_count + 1
    course.total_points += points

    db.commit()
    db.refresh(module)

    return {
        "message": "Module created successfully",
        "module_id": module.id,
        "module_number": module.module_number,
        "course_id": course_id
    }

@router.post("/modules/{module_id}/lessons")
def create_lesson(
    module_id: int,
    title: str,
    description: str,
    duration: int = 0,
    points: int = 10,
    current_admin=Depends(get_current_admin),
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

    lesson_count = db.query(Lesson).filter(
        Lesson.module_id == module_id
    ).count()

    lesson = Lesson(
        module_id=module_id,
        title=title,
        description=description,
        lesson_number=lesson_count + 1,
        duration=duration,
        points=points
    )

    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return {
        "message": "Lesson created successfully",
        "lesson_id": lesson.id,
        "lesson_number": lesson.lesson_number,
        "module_id": module_id
    }

@router.post("/lessons/{lesson_id}/video")
def upload_video(
    lesson_id: int,
    video: UploadFile = File(...),
    current_admin=Depends(get_current_admin),
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

    # Allowed video formats
    allowed_extensions = {
        ".mp4",
        ".webm",
        ".mov",
        ".mkv"
    }

    extension = Path(video.filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format"
        )

    # Create upload directory
    upload_directory = Path(
        "uploads/videos"
    )

    upload_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    # Generate unique filename
    unique_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        upload_directory /
        unique_filename
    )

    # Save video
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            video.file,
            buffer
        )

    # Save path in database
    lesson.video_path = str(
        file_path
    )

    db.commit()
    db.refresh(lesson)

    return {
        "message": "Video uploaded successfully",
        "lesson_id": lesson.id,
        "filename": unique_filename,
        "video_path": f"/videos/{unique_filename}"
    }

# ============================================================
# CREATE QUIZ
# ============================================================

@router.post("/courses/{course_id}/quizzes")
def create_quiz(
    course_id: int,
    title: str,
    description: str = "",
    points_per_question: int = 10,

    current_admin=Depends(get_current_admin),

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

    quiz = Quiz(

        course_id=course_id,

        title=title,

        description=description,

        points_per_question=points_per_question
    )

    db.add(quiz)

    db.commit()

    db.refresh(quiz)

    return {

        "message": "Quiz created successfully",

        "quiz_id": quiz.id,

        "title": quiz.title
    }


# ============================================================
# ADD QUESTION
# ============================================================

@router.post("/quizzes/{quiz_id}/questions")
def add_question(

    quiz_id: int,

    question_text: str,

    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,

    correct_answer: str,

    current_admin=Depends(get_current_admin),

    db: Session = Depends(get_db)
):

    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id
    ).first()

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found"
        )

    correct_answer = correct_answer.upper()

    if correct_answer not in ["A", "B", "C", "D"]:

        raise HTTPException(
            status_code=400,
            detail="Correct answer must be A, B, C or D"
        )


    question = Question(

        quiz_id=quiz_id,

        question_text=question_text,

        option_a=option_a,

        option_b=option_b,

        option_c=option_c,

        option_d=option_d,

        correct_answer=correct_answer
    )


    db.add(question)

    db.commit()

    db.refresh(question)


    return {

        "message": "Question added successfully",

        "question_id": question.id,

        "quiz_id": quiz_id
    }