from database import SessionLocal
from models import User
from auth import hash_password


def create_admin():

    db = SessionLocal()

    existing_admin = db.query(User).filter(
        User.role == "admin"
    ).first()

    if existing_admin:

        print("Admin already exists.")
        db.close()
        return

    admin = User(
        username="admin",
        email="admin@ecoquest.com",
        password_hash=hash_password("Admin@12345"),
        full_name="EcoQuest Administrator",
        college="EcoQuest",
        course="Administration",
        year="N/A",
        role="admin"
    )

    db.add(admin)
    db.commit()

    print("🔥 Admin created successfully!")
    print("Username: admin")
    print("Password: Admin@12345")

    db.close()


if __name__ == "__main__":
    create_admin()