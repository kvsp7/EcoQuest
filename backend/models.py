from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


# ============================================================
# USER
# ============================================================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    college = Column(
        String(150),
        nullable=False
    )

    course = Column(
        String(100),
        nullable=True
    )

    year = Column(
        String(20),
        nullable=True
    )

    bio = Column(
        String(500),
        nullable=True
    )

    linkedin = Column(
        String(255),
        nullable=True
    )

    github = Column(
        String(255),
        nullable=True
    )

    portfolio = Column(
        String(255),
        nullable=True
    )

    role = Column(
        String(20),
        default="student"
    )

    total_points = Column(
        Integer,
        default=0
    )

    total_xp = Column(
        Integer,
        default=0
    )

    current_streak = Column(
        Integer,
        default=0
    )

    longest_streak = Column(
        Integer,
        default=0
    )

    active_days = Column(
        Integer,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    enrollments = relationship(
        "Enrollment",
        back_populates="user"
    )


# ============================================================
# COURSE
# ============================================================

class Course(Base):

    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    difficulty = Column(
        String(50),
        default="Beginner"
    )

    thumbnail = Column(
        String(255),
        nullable=True
    )

    total_modules = Column(
        Integer,
        default=0
    )

    total_points = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    modules = relationship(
        "Module",
        back_populates="course",
        cascade="all, delete-orphan"
    )

    enrollments = relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan"
    )


# ============================================================
# MODULE
# ============================================================

class Module(Base):

    __tablename__ = "modules"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    module_number = Column(
        Integer,
        nullable=False
    )

    points = Column(
        Integer,
        default=50
    )

    course = relationship(
        "Course",
        back_populates="modules"
    )

    lessons = relationship(
        "Lesson",
        back_populates="module",
        cascade="all, delete-orphan"
    )


# ============================================================
# LESSON
# ============================================================

class Lesson(Base):

    __tablename__ = "lessons"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    module_id = Column(
        Integer,
        ForeignKey("modules.id"),
        nullable=False
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    lesson_number = Column(
        Integer,
        nullable=False
    )

    video_path = Column(
        String(500),
        nullable=True
    )

    duration = Column(
        Integer,
        nullable=True
    )

    points = Column(
        Integer,
        default=10
    )

    module = relationship(
        "Module",
        back_populates="lessons"
    )


# ============================================================
# ENROLLMENT
# ============================================================

class Enrollment(Base):

    __tablename__ = "enrollments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    progress_percentage = Column(
        Integer,
        default=0
    )

    completed = Column(
        Boolean,
        default=False
    )

    enrolled_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="enrollments"
    )

    course = relationship(
        "Course",
        back_populates="enrollments"
    )

# ============================================================
# LESSON PROGRESS
# ============================================================

class LessonProgress(Base):

    __tablename__ = "lesson_progress"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id"),
        nullable=False
    )

    completed = Column(
        Boolean,
        default=False
    )

    watched_seconds = Column(
        Integer,
        default=0
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ============================================================
# QUIZ
# ============================================================

class Quiz(Base):

    __tablename__ = "quizzes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    points_per_question = Column(
        Integer,
        default=10
    )

    questions = relationship(
        "Question",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )


# ============================================================
# QUESTION
# ============================================================

class Question(Base):

    __tablename__ = "questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id"),
        nullable=False
    )

    question_text = Column(
        Text,
        nullable=False
    )

    option_a = Column(
        String(500),
        nullable=False
    )

    option_b = Column(
        String(500),
        nullable=False
    )

    option_c = Column(
        String(500),
        nullable=False
    )

    option_d = Column(
        String(500),
        nullable=False
    )

    correct_answer = Column(
        String(1),
        nullable=False
    )

    quiz = relationship(
        "Quiz",
        back_populates="questions"
    )


# ============================================================
# QUIZ ATTEMPT
# ============================================================

class QuizAttempt(Base):

    __tablename__ = "quiz_attempts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id"),
        nullable=False
    )

    score = Column(
        Integer,
        default=0
    )

    total_questions = Column(
        Integer,
        default=0
    )

    percentage = Column(
        Integer,
        default=0
    )

    xp_earned = Column(
        Integer,
        default=0
    )

    points_earned = Column(
        Integer,
        default=0
    )

    completed_at = Column(
        DateTime,
        default=datetime.utcnow
    )