from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from models import User, get_db
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/google/callback")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
import PyPDF2
import openai
import spacy
import os
import asyncio
from typing import Optional
from datetime import datetime, timedelta
import time
from collections import defaultdict
import json
from functools import lru_cache

# Load NLP Model (ensure you run python -m spacy download en_core_web_sm first)
nlp = spacy.load("en_core_web_sm")

# Get OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

app = FastAPI()

# JWT token functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "full_name": user.full_name}}

@app.post("/register")
async def register(email: str, password: str, full_name: str, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = User.get_password_hash(password)
    user = User(email=email, hashed_password=hashed_password, full_name=full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully"}

@app.get("/auth/google")
async def google_auth():
    return {
        "url": f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile"
    }

@app.get("/auth/google/callback")
async def google_auth_callback(code: str, db: Session = Depends(get_db)):
    try:
        # Exchange code for tokens
        token_endpoint = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        response = requests.post(token_endpoint, data=data)
        tokens = response.json()
        
        # Verify ID token
        id_info = id_token.verify_oauth2_token(
            tokens["id_token"], requests.Request(), GOOGLE_CLIENT_ID)
        
        # Get or create user
        email = id_info["email"]
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=id_info.get("name", ""),
                is_google_user=True,
                google_id=id_info["sub"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": email, "full_name": user.full_name}}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with Google: {str(e)}"
        )

@app.get("/check-auth")
async def check_auth(current_user: User = Depends(get_current_user)):
    return {"authenticated": True, "user": {"email": current_user.email, "full_name": current_user.full_name}}

@app.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}

# Rate limiting setup
RATE_LIMIT_DURATION = timedelta(minutes=1)
MAX_REQUESTS = 10
request_history = defaultdict(list)

def rate_limit(client_ip: str):
    now = datetime.now()
    request_history[client_ip] = [
        timestamp for timestamp in request_history[client_ip]
        if now - timestamp < RATE_LIMIT_DURATION
    ]
    request_history[client_ip].append(now)
    
    if len(request_history[client_ip]) > MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

# Memory limit for PDF processing (10MB)
MAX_PDF_SIZE = 10 * 1024 * 1024

@app.post("/upload_resume/")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    client_ip: str = Depends(lambda x: x.client.host)
):
    """
    1. Validates file size and type
    2. Reads the uploaded PDF file
    3. Extracts text using PyPDF2
    4. Parses the text using SpaCy to find relevant entities
    5. Returns the parsed data as JSON
    """
    # Apply rate limiting
    rate_limit(client_ip)

    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    try:
        # Read file content with timeout
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {MAX_PDF_SIZE/1024/1024}MB"
            )

        text = extract_text_from_pdf(content)
        parsed_data = analyze_resume(text)
        return {
            "filename": file.filename,
            "parsed_data": parsed_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """
    Extracts text from PDF bytes using PyPDF2 with safety checks.
    """
    try:
        from io import BytesIO
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        
        # Limit number of pages for processing
        MAX_PAGES = 30
        if len(pdf_reader.pages) > MAX_PAGES:
            raise HTTPException(
                status_code=400,
                detail=f"PDF exceeds maximum page limit of {MAX_PAGES}"
            )

        text_list = []
        for page in pdf_reader.pages[:MAX_PAGES]:
            try:
                page_text = page.extract_text()
                if page_text:
                    text_list.append(page_text)
            except Exception as e:
                continue  # Skip problematic pages
                
        if not text_list:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )
            
        return " ".join(text_list)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF: {str(e)}"
        )

def analyze_resume(text: str):
    """
    Enhanced resume analysis using SpaCy to extract relevant information.
    """
    doc = nlp(text)
    
    # Initialize data structures
    skills = set()
    organizations = set()
    education = set()
    locations = set()
    dates = set()
    
    # Extract entities
    for ent in doc.ents:
        if ent.label_ == "ORG":
            organizations.add(ent.text)
        elif ent.label_ == "GPE":
            locations.add(ent.text)
        elif ent.label_ == "DATE":
            dates.add(ent.text)
        elif ent.label_ in ["PRODUCT", "WORK_OF_ART"]:
            skills.add(ent.text)
    
    # Look for education-related keywords
    education_keywords = ["university", "college", "bachelor", "master", "phd", "degree", "diploma"]
    for sent in doc.sents:
        sent_lower = sent.text.lower()
        if any(keyword in sent_lower for keyword in education_keywords):
            education.add(sent.text.strip())
    
    # Look for common skills
    skill_keywords = [
        "python", "javascript", "java", "c++", "react", "angular", "vue", "node",
        "management", "leadership", "communication", "project management", "agile",
        "marketing", "sales", "analytics", "design", "research", "development",
        "strategy", "planning", "analysis", "operations", "coordination"
    ]
    text_lower = text.lower()
    for skill in skill_keywords:
        if skill in text_lower:
            skills.add(skill.title())
    
    return {
        "skills": list(skills),
        "organizations": list(organizations),
        "education": list(education),
        "locations": list(locations),
        "dates": list(dates),
        "full_text": text
    }

# Mock job data
MOCK_JOBS = [
    {
        "title": "Help Desk Technician - Remote",
        "link": "https://example.com/job1",
        "company": "TechCorp",
        "location": "Remote"
    },
    {
        "title": "IT Support Specialist",
        "link": "https://example.com/job2",
        "company": "Global Systems",
        "location": "Remote"
    },
    {
        "title": "Technical Support Engineer",
        "link": "https://example.com/job3",
        "company": "CloudTech",
        "location": "Remote"
    }
]

@app.get("/search_jobs/")
def search_jobs(
    query: str,
    location: str,
    current_user: User = Depends(get_current_user),
    client_ip: str = Depends(lambda x: x.client.host)
):
    """
    Returns mock job data instead of scraping.
    """
    # Apply rate limiting
    rate_limit(client_ip)
    
    # Filter mock jobs based on query and location
    filtered_jobs = [
        job for job in MOCK_JOBS
        if query.lower() in job["title"].lower()
        and location.lower() in job["location"].lower()
    ]
    
    return {"jobs": filtered_jobs}

@app.post("/generate_resume/")
async def generate_resume(
    userInfo: dict,
    skills: str,
    job_desc: str,
    resumeText: str,
    current_user: User = Depends(get_current_user),
    client_ip: str = Depends(lambda x: x.client.host)
):
    """
    Generates a professional executive resume using provided information.
    """
    # Apply rate limiting
    rate_limit(client_ip)
    
    # Input validation
    required_fields = ["fullName", "email", "phone"]
    if not all(field in userInfo and userInfo[field] for field in required_fields):
        raise HTTPException(
            status_code=400,
            detail="Required personal information is missing"
        )
    
    # Limit input lengths
    MAX_LENGTH = 5000  # Increased for full resume text
    if len(resumeText) > MAX_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Resume text exceeds maximum length of {MAX_LENGTH} characters"
        )

    try:
        prompt = f"""
        You are an expert executive resume writer. Create a professional executive resume following this structure:

        [CONTACT INFORMATION]
        {userInfo['fullName']}
        {userInfo.get('location', '')}
        {userInfo['email']} | {userInfo['phone']}
        {userInfo.get('linkedIn', '')}

        [PROFESSIONAL SUMMARY]
        Create a compelling executive summary highlighting expertise and achievements.

        [CORE COMPETENCIES]
        List key skills and areas of expertise relevant to the position.

        [PROFESSIONAL EXPERIENCE]
        Extract and enhance relevant experience from:
        {resumeText}

        [EDUCATION & CERTIFICATIONS]
        Education: {userInfo.get('education', 'Extract from resume text')}
        Certifications: {userInfo.get('certifications', 'Extract from resume text')}

        Additional Information:
        - Years of Experience: {userInfo.get('yearsOfExperience', 'Extract from resume')}
        - Skills: {skills}
        - Target Position: {job_desc}

        Format the resume in a clean, professional executive style with:
        - Clear section headings
        - Bullet points for achievements and responsibilities
        - Metrics and quantifiable results where possible
        - Action verbs to start bullet points
        - Consistent formatting throughout
        
        Focus on leadership, strategic initiatives, and high-level accomplishments.
        """
        
        # Add timeout for OpenAI API call
        response = await asyncio.wait_for(
            openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,  # Limit response length
                temperature=0.7
            ),
            timeout=30.0  # 30 second timeout
        )
        
        return {"resume": response.choices[0].message.content}
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Request timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating resume: {str(e)}"
        )
