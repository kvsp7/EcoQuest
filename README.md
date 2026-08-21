# EcoQuest 🌱

EcoQuest is a gamified environmental learning portal featuring interactive vector animations, an SVG Quest Tree navigation system, and an integrated FastAPI backend.

---

## 🚀 How to Run the Project (Post-Download)

Follow these steps once you extract the ZIP file and open the project directory in your IDE (like VS Code):

### Step 1: Start the Backend Server

Open a terminal inside your IDE and run:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Setup python virtual environment
python -m venv venv

# 3. Activate the environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install backend dependencies
pip install fastapi uvicorn python-multipart pydantic

# 5. Launch the backend API
uvicorn main:app --reload
```

The API will be live at: [http://127.0.0.1:8000](http://127.0.0.1:8000) (Docs at `/docs`).

---

### Step 2: Start the Frontend Server

Open a **second terminal** in your IDE at the project root folder (where `index.html` is located) and run:

```bash
# Run local HTTP server
python -m http.server 3000
```

---

### Step 3: Explore the App

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

#### Available Test Accounts:
- **Admin Portal:** Username: `admin` | Password: `Admin@12345`
- **Student Portal:** Click **Create an account** on the login page to register a custom student profile!

---

*EcoQuest - Sowing the seeds of environmental knowledge, one quest at a time.* 🌲
