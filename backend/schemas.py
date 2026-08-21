from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

    full_name: str
    college: str

    course: Optional[str] = None
    year: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    college: str

    course: Optional[str] = None
    year: Optional[str] = None

    role: str

    total_points: int
    total_xp: int

    current_streak: int
    longest_streak: int
    active_days: int

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):

    id: int
    title: str
    description: str
    category: str
    difficulty: str
    thumbnail: str | None
    total_modules: int
    total_points: int

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):

    id: int
    title: str
    description: str | None
    lesson_number: int
    video_path: str | None
    duration: int | None
    points: int

    class Config:
        from_attributes = True


class ModuleResponse(BaseModel):

    id: int
    title: str
    description: str | None
    module_number: int
    points: int

    lessons: list[LessonResponse] = []

    class Config:
        from_attributes = True

class LessonDetailResponse(BaseModel):

    id: int
    title: str
    description: str | None
    lesson_number: int
    video_path: str | None
    duration: int | None
    points: int

    class Config:
        from_attributes = True