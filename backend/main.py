"""
FastAPI Backend for Portfolio
Endpoints:
  POST /api/contact   - Receive contact form submissions
  GET  /api/projects  - Serve project data
  GET  /api/artworks  - Serve artwork data
  GET  /api/health    - Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
import json
import os

app = FastAPI(title="Portfolio API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DATA STORAGE ──
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

CONTACTS_FILE = os.path.join(DATA_DIR, "contacts.json")

# ── MODELS ──
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactEntry(ContactForm):
    id: int
    created_at: str

class Project(BaseModel):
    id: int
    name: str
    category: str
    description: str
    image_url: Optional[str] = None
    tags: List[str] = []

class Artwork(BaseModel):
    id: int
    title: str
    medium: str
    year: int
    image_url: Optional[str] = None

# ── SAMPLE DATA ──
PROJECTS: List[Project] = [
    Project(
        id=1,
        name="Brand Identity",
        category="Visual Design",
        description="Complete brand identity system including logo, typography, and color palette.",
        tags=["branding", "identity", "logo"]
    ),
    Project(
        id=2,
        name="Web Design",
        category="UX/UI",
        description="Responsive web design with focus on user experience and accessibility.",
        tags=["web", "ui", "responsive"]
    ),
    Project(
        id=3,
        name="Mobile App",
        category="Interface Design",
        description="iOS and Android app design with intuitive navigation and modern aesthetics.",
        tags=["mobile", "app", "ios", "android"]
    ),
    Project(
        id=4,
        name="Illustration",
        category="Digital Art",
        description="Custom digital illustrations for editorial and commercial projects.",
        tags=["illustration", "digital", "art"]
    ),
]

ARTWORKS: List[Artwork] = [
    Artwork(id=1, title="Abstract Flow", medium="Digital", year=2026),
    Artwork(id=2, title="Urban Dreams", medium="Mixed Media", year=2025),
    Artwork(id=3, title="Nature's Echo", medium="Photography", year=2025),
    Artwork(id=4, title="Geometric Soul", medium="Vector Art", year=2024),
    Artwork(id=5, title="Chromatic Waves", medium="Digital Painting", year=2026),
    Artwork(id=6, title="Silent Motion", medium="3D Render", year=2024),
]

# ── HELPERS ──
def load_contacts() -> List[dict]:
    if not os.path.exists(CONTACTS_FILE):
        return []
    with open(CONTACTS_FILE, "r") as f:
        return json.load(f)

def save_contacts(contacts: List[dict]) -> None:
    with open(CONTACTS_FILE, "w") as f:
        json.dump(contacts, f, indent=2)

# ── ENDPOINTS ──
@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/contact")
def submit_contact(form: ContactForm):
    contacts = load_contacts()
    entry = {
        "id": len(contacts) + 1,
        "name": form.name,
        "email": form.email,
        "message": form.message,
        "created_at": datetime.utcnow().isoformat(),
    }
    contacts.append(entry)
    save_contacts(contacts)
    return {"success": True, "message": "Message received!", "id": entry["id"]}

@app.get("/api/contacts")
def get_contacts():
    return load_contacts()

@app.get("/api/projects")
def get_projects():
    return PROJECTS

@app.get("/api/artworks")
def get_artworks():
    return ARTWORKS

# ── RUN ──
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
