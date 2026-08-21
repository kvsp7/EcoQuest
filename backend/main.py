from fastapi import FastAPI
from database import Base, engine

import models

from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.course_routes import router as course_router
from routes.lesson_routes import router as lesson_router
from fastapi.staticfiles import StaticFiles
from routes.admin_routes import router as admin_router
from routes.quiz_routes import router as quiz_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EcoQuest Environmental Education API",
    description="Backend API for the Gamified Environmental Education Platform",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)


# Register routes
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(course_router)
app.include_router(lesson_router)
app.include_router(admin_router)
app.include_router(quiz_router)

@app.get("/")
def root():

    return {
        "message": "🌱 EcoQuest API is running!",
        "status": "success",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "database": "SQLite"
    }

app.mount(
    "/videos",
    StaticFiles(directory="uploads/videos"),
    name="videos"
)