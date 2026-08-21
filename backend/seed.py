from database import SessionLocal, Base, engine
from models import Course, Module, Lesson


# Create all database tables
Base.metadata.create_all(bind=engine)
def seed_database():

    db = SessionLocal()

    # Prevent duplicate seeding
    if db.query(Course).count() > 0:

        print("Courses already exist.")
        db.close()
        return


    # ========================================================
    # COURSE 1
    # ========================================================

    climate = Course(
        title="Climate Change & Global Warming",

        description=(
            "Learn about climate change, the greenhouse effect, "
            "its causes, impacts and possible solutions."
        ),

        category="Climate",
        difficulty="Beginner",

        total_modules=6,
        total_points=500
    )

    db.add(climate)
    db.commit()
    db.refresh(climate)


    climate_modules = [

        (
            "Introduction to Climate Change",
            "Understand climate, weather and climate change."
        ),

        (
            "The Greenhouse Effect",
            "Learn how greenhouse gases affect Earth's temperature."
        ),

        (
            "Causes of Climate Change",
            "Explore human activities responsible for climate change."
        ),

        (
            "Effects of Climate Change",
            "Understand the environmental and social impacts."
        ),

        (
            "Climate Change Solutions",
            "Explore renewable energy and sustainable solutions."
        ),

        (
            "What Students Can Do",
            "Learn practical actions students can take."
        )
    ]


    create_modules(
        db,
        climate,
        climate_modules
    )


    # ========================================================
    # COURSE 2
    # ========================================================

    waste = Course(
        title="Waste Management & Recycling",

        description=(
            "Learn about waste generation, segregation, recycling "
            "and sustainable waste management."
        ),

        category="Waste Management",
        difficulty="Beginner",

        total_modules=6,
        total_points=500
    )

    db.add(waste)
    db.commit()
    db.refresh(waste)


    waste_modules = [

        (
            "Introduction to Waste",
            "Understand waste and why waste management matters."
        ),

        (
            "Types of Waste",
            "Learn about different categories of waste."
        ),

        (
            "Waste Segregation",
            "Understand how waste should be separated."
        ),

        (
            "Recycling",
            "Learn how recyclable materials are processed."
        ),

        (
            "Plastic Pollution",
            "Understand the environmental impact of plastic."
        ),

        (
            "Sustainable Waste Management",
            "Explore sustainable approaches to waste."
        )
    ]


    create_modules(
        db,
        waste,
        waste_modules
    )


    # ========================================================
    # COURSE 3
    # ========================================================

    biodiversity = Course(
        title="Biodiversity & Ecosystem Conservation",

        description=(
            "Learn about biodiversity, ecosystems, threats to "
            "nature and conservation strategies."
        ),

        category="Biodiversity",
        difficulty="Beginner",

        total_modules=6,
        total_points=500
    )

    db.add(biodiversity)
    db.commit()
    db.refresh(biodiversity)


    biodiversity_modules = [

        (
            "Introduction to Biodiversity",
            "Understand what biodiversity means."
        ),

        (
            "Understanding Ecosystems",
            "Learn how ecosystems function."
        ),

        (
            "Importance of Biodiversity",
            "Understand why biodiversity is important."
        ),

        (
            "Threats to Biodiversity",
            "Explore the major threats to biodiversity."
        ),

        (
            "Conservation Methods",
            "Learn how biodiversity can be protected."
        ),

        (
            "Protecting Biodiversity",
            "Discover how students can help protect nature."
        )
    ]


    create_modules(
        db,
        biodiversity,
        biodiversity_modules
    )


    db.close()

    print("🌱 Database seeded successfully!")


def create_modules(
    db,
    course,
    modules
):

    for index, (title, description) in enumerate(
        modules,
        start=1
    ):

        module = Module(
            course_id=course.id,
            title=title,
            description=description,
            module_number=index,
            points=50
        )

        db.add(module)

        db.commit()
        db.refresh(module)

        # Create 2 lessons for every module

        lesson_one = Lesson(
            module_id=module.id,
            title=f"{title} - Introduction",
            description=f"Introduction to {title}",
            lesson_number=1,
            video_path=None,
            duration=300,
            points=10
        )

        lesson_two = Lesson(
            module_id=module.id,
            title=f"{title} - Deep Dive",
            description=f"Detailed explanation of {title}",
            lesson_number=2,
            video_path=None,
            duration=600,
            points=20
        )

        db.add(lesson_one)
        db.add(lesson_two)

        db.commit()


if __name__ == "__main__":

    seed_database()