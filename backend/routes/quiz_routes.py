from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db

from models import (
    Quiz,
    Question,
    QuizAttempt,
    User
)

from routes.user_routes import get_current_user


router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"]
)


# ============================================================
# GET ALL QUIZZES
# ============================================================

@router.get("/")
def get_quizzes(
    db: Session = Depends(get_db)
):

    quizzes = db.query(Quiz).all()

    return [
        {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "course_id": quiz.course_id,
            "total_questions": len(quiz.questions)
        }

        for quiz in quizzes
    ]


# ============================================================
# GET QUIZ
# ============================================================

@router.get("/{quiz_id}")
def get_quiz(
    quiz_id: int,
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

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "course_id": quiz.course_id,

        "questions": [

            {
                "id": question.id,
                "question": question.question_text,

                "options": {
                    "A": question.option_a,
                    "B": question.option_b,
                    "C": question.option_c,
                    "D": question.option_d
                }
            }

            for question in quiz.questions
        ]
    }


# ============================================================
# SUBMIT QUIZ
# ============================================================

@router.post("/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    answers: dict,
    current_user=Depends(get_current_user),
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

    # Check if already attempted

    existing_attempt = db.query(
        QuizAttempt
    ).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id
    ).first()

    if existing_attempt:

        raise HTTPException(
            status_code=400,
            detail="You have already completed this quiz"
        )


    questions = quiz.questions

    score = 0

    for question in questions:

        student_answer = answers.get(
            str(question.id)
        )

        if student_answer:

            student_answer = student_answer.upper()

        if student_answer == question.correct_answer.upper():

            score += 1


    total_questions = len(questions)

    if total_questions > 0:

        percentage = int(
            (score / total_questions) * 100
        )

    else:

        percentage = 0


    xp = (
        score *
        quiz.points_per_question
    )


    attempt = QuizAttempt(

        user_id=current_user.id,

        quiz_id=quiz.id,

        score=score,

        total_questions=total_questions,

        percentage=percentage,

        xp_earned=xp,

        points_earned=xp
    )


    db.add(attempt)


    # Add XP and points

    current_user.total_xp += xp

    current_user.total_points += xp


    db.commit()


    return {

        "message": "Quiz submitted successfully",

        "quiz_id": quiz.id,

        "score": score,

        "total_questions": total_questions,

        "percentage": percentage,

        "xp_earned": xp,

        "points_earned": xp,

        "total_xp": current_user.total_xp,

        "total_points": current_user.total_points
    }

# ============================================================
# QUIZ LEADERBOARD
# ============================================================

@router.get("/{quiz_id}/leaderboard")
def get_leaderboard(
    quiz_id: int,
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

    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id
    ).order_by(
        QuizAttempt.score.desc(),
        QuizAttempt.completed_at.asc()
    ).all()

    leaderboard = []

    for rank, attempt in enumerate(attempts, start=1):

        user = db.query(User).filter(
            User.id == attempt.user_id
        ).first()

        if not user:
            continue

        leaderboard.append({
            "rank": rank,
            "student_name": user.full_name or user.username,
            "college": user.college,
            "score": attempt.score,
            "total_questions": attempt.total_questions,
            "percentage": attempt.percentage,
            "xp_earned": attempt.xp_earned
        })

    return {
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "leaderboard": leaderboard
    }