import os
import io
import json
import logging
import hashlib
import time
import uuid
from typing import List, Optional
from collections import OrderedDict

import PyPDF2
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google import genai
from google.genai import types

# --- LOGGING ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | [%(request_id)s] %(message)s"
    if False else "%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

# --- APP CONFIG ---
app = FastAPI(
    title="Resume.AI API",
    version="3.0.0",
    description="ATS Intelligence Engine — 8-Dimension Resume Scorer & Builder",
)

# CORS — allow all origins in dev; lock down in production via ALLOWED_ORIGINS env var
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBUyNeQd3pEwgxiRyq8O0S5tCru9EvxWtY")
MODEL_NAME = "gemini-2.5-flash"
client = genai.Client(api_key=API_KEY)

# LRU-style cache — cap at 100 entries to avoid unbounded memory growth
MAX_CACHE_SIZE = 100
_cache: OrderedDict = OrderedDict()

def cache_get(key: str):
    if key in _cache:
        _cache.move_to_end(key)          # refresh LRU position
        return _cache[key]
    return None

def cache_set(key: str, value):
    if key in _cache:
        _cache.move_to_end(key)
    _cache[key] = value
    while len(_cache) > MAX_CACHE_SIZE:
        _cache.popitem(last=False)       # evict oldest

# --- REQUEST TIMING MIDDLEWARE ---
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    rid = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000)
    response.headers["X-Request-ID"] = rid
    response.headers["X-Response-Time"] = f"{elapsed_ms}ms"
    logger.info(f"[{rid}] {request.method} {request.url.path} → {response.status_code} ({elapsed_ms}ms)")
    return response

# --- SCHEMAS ---
class JobEntry(BaseModel):
    title: str
    company: str
    location: str = "N/A"
    dates: str = "N/A"
    description: str

class ResumeSchema(BaseModel):
    user_type: str
    name: str
    target_job: str
    experience: List[JobEntry]
    email: Optional[str] = "N/A"
    phone: Optional[str] = "N/A"
    linkedin: Optional[str] = "N/A"
    location: Optional[str] = "N/A"
    education: Optional[str] = "N/A"
    skills: Optional[str] = "N/A"
    current_date: Optional[str] = None

# --- CORE LOGIC ---
def extract_text(content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = "\n".join([p.extract_text() or "" for p in reader.pages])
        if not text.strip():
            raise ValueError("PDF appears to be scanned or image-only — no extractable text found.")
        return text[:8000]
    except PyPDF2.errors.PdfReadError:
        raise HTTPException(status_code=422, detail="Could not parse the PDF. Ensure the file is not password-protected or corrupted.")

def ask_ai(prompt: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            return json.loads(response.text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=502, detail="AI returned malformed JSON. Please try again.")
        except Exception as e:
            err = str(e)
            if "503" in err or "UNAVAILABLE" in err:
                if attempt < max_retries - 1:
                    wait = 5 * (attempt + 1)
                    logger.warning(f"AI unavailable — retrying in {wait}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait)
                else:
                    raise HTTPException(
                        status_code=503,
                        detail="The AI model is under high load. Please wait 60 seconds and try again.",
                    )
            elif "QUOTA" in err or "429" in err:
                raise HTTPException(status_code=429, detail="API quota exceeded. Please try again later.")
            else:
                raise HTTPException(status_code=500, detail=f"AI error: {err[:200]}")

# ============================================================
# ATS SCORING RUBRIC (used in the /upload prompt)
# ============================================================
ATS_SCORING_RUBRIC = """
You are a certified ATS (Applicant Tracking System) specialist and senior technical recruiter with 15+ years of experience at FAANG, Fortune 500 companies, and top recruiting firms. You have deep expertise in how ATS platforms like Workday, Taleo, Greenhouse, Lever, iCIMS, and SmartRecruiters parse, rank, and filter resumes.

SCORING MISSION: Perform a thorough, unbiased ATS audit on the provided resume. Your score must reflect REAL-WORLD ATS pass rates — not inflated encouragement scores. A score of 90+ means this resume would pass 90%+ of ATS filters and impress most recruiters. Be honest and critical.

Use this EXACT 8-dimension rubric. Score each dimension independently, then sum for the final ats_score:

DIMENSION 1 — KEYWORD OPTIMIZATION (0-25 pts):
  - Are job-specific hard skills, tools, technologies, and industry terms present? (0-10)
  - Are keywords contextually placed (not just listed)? (0-8)
  - Are both spelled-out and abbreviated forms used (e.g., "Machine Learning (ML)")? (0-7)
  Deduct if: keywords are buried in a skills section only, missing role-critical tools, or keyword-stuffed unnaturally.

DIMENSION 2 — QUANTIFIED IMPACT (0-20 pts):
  - Does each bullet point contain a measurable result (%, $, time saved, scale)? (0-10)
  - Are achievements clearly differentiated from responsibilities? (0-6)
  - Is the scope/scale of impact evident (team size, budget, user count)? (0-4)
  Deduct if: bullets use passive voice, describe duties not outcomes, or lack any numbers.

DIMENSION 3 — FORMAT & PARSEABILITY (0-15 pts):
  - Is the layout single-column or ATS-safe two-column? (0-5)
  - Are standard section headers used (Experience, Education, Skills)? (0-4)
  - Is it free of tables, text boxes, headers/footers, graphics, and columns? (0-3)
  - Is the file likely PDF/Word compatible with clean encoding? (0-3)
  Deduct if: fancy design elements, infographics, or non-standard headers that ATS cannot parse.

DIMENSION 4 — CONTACT & HEADER COMPLETENESS (0-10 pts):
  - Name, email, phone, city/state present? (0-5)
  - LinkedIn URL and/or portfolio included? (0-3)
  - Contact info in body (not header/footer)? (0-2)
  Deduct if: any field is missing or in a location ATS cannot extract.

DIMENSION 5 — WORK EXPERIENCE STRUCTURE (0-10 pts):
  - Does each job entry have: title, company, location, dates? (0-5)
  - Are dates in a consistent, parseable format (MM/YYYY or Month YYYY)? (0-3)
  - Is there a clear reverse-chronological order? (0-2)
  Deduct if: date gaps are unexplained, titles are vague, or company names are abbreviated.

DIMENSION 6 — SUMMARY / OBJECTIVE QUALITY (0-8 pts):
  - Does the summary contain role-specific keywords and a clear value proposition? (0-4)
  - Is it 2-4 lines, tailored (not generic)? (0-4)
  Deduct if: generic ("results-driven professional"), absent, or just a list of adjectives.

DIMENSION 7 — EDUCATION & CERTIFICATIONS (0-7 pts):
  - Is degree, institution, and graduation year clearly stated? (0-3)
  - Are relevant certifications listed with issuing body and date? (0-4)
  Deduct if: education section is missing, dates are absent, or certifications are unverifiable.

DIMENSION 8 — LENGTH & RELEVANCE (0-5 pts):
  - Is the resume 1 page (0-5 yrs exp) or 2 pages max (5+ yrs exp)? (0-3)
  - Is all content relevant to the target role (no filler)? (0-2)
  Deduct if: overly long, includes irrelevant hobbies/personal info, or is too sparse.

RESPONSE FORMAT — Return ONLY this JSON object with no additional text:
{
  "best_domain": "<single most suitable job domain/industry for this candidate>",
  "ats_score": <integer 0-100, sum of all 8 dimensions above>,
  "score_breakdown": {
    "keyword_optimization": { "score": <0-25>, "max": 25, "note": "<1-sentence explanation>" },
    "quantified_impact": { "score": <0-20>, "max": 20, "note": "<1-sentence explanation>" },
    "format_parseability": { "score": <0-15>, "max": 15, "note": "<1-sentence explanation>" },
    "contact_completeness": { "score": <0-10>, "max": 10, "note": "<1-sentence explanation>" },
    "work_experience_structure": { "score": <0-10>, "max": 10, "note": "<1-sentence explanation>" },
    "summary_quality": { "score": <0-8>, "max": 8, "note": "<1-sentence explanation>" },
    "education_certifications": { "score": <0-7>, "max": 7, "note": "<1-sentence explanation>" },
    "length_relevance": { "score": <0-5>, "max": 5, "note": "<1-sentence explanation>" }
  },
  "pros": [
    "<specific strength with exact evidence from the resume, e.g.: 'Quantified 3 of 5 bullets in Software Engineer role with % metrics'>",
    "<specific strength with exact evidence>",
    "<specific strength with exact evidence>",
    "<specific strength with exact evidence>",
    "<specific strength with exact evidence>"
  ],
  "cons": [
    "<specific, actionable weakness with the exact line or section it refers to, e.g.: 'Bullet: Responsible for managing team — no outcome, no metric, passive voice'>",
    "<specific weakness with exact reference>",
    "<specific weakness with exact reference>",
    "<specific weakness with exact reference>",
    "<specific weakness with exact reference>"
  ],
  "suggestions": [
    {
      "priority": "HIGH",
      "category": "<e.g. Keywords | Formatting | Bullets | Summary | Contact>",
      "issue": "<exact problem found>",
      "fix": "<precise, copy-paste-ready fix or rewrite>"
    },
    {
      "priority": "HIGH",
      "category": "<category>",
      "issue": "<exact problem>",
      "fix": "<precise fix>"
    },
    {
      "priority": "MEDIUM",
      "category": "<category>",
      "issue": "<exact problem>",
      "fix": "<precise fix>"
    },
    {
      "priority": "MEDIUM",
      "category": "<category>",
      "issue": "<exact problem>",
      "fix": "<precise fix>"
    },
    {
      "priority": "LOW",
      "category": "<category>",
      "issue": "<exact problem>",
      "fix": "<precise fix>"
    }
  ],
  "missing_keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "recruiter_first_impression": "<2-3 sentence honest recruiter gut-check: would they shortlist this in 6 seconds?>"
}
"""

# ============================================================
# RESUME BUILDER PROMPT SYSTEM
# ============================================================
RESUME_BUILDER_SYSTEM = """
You are ResumeGPT — the world's leading ATS resume architect and career strategist. You have personally helped 50,000+ candidates land roles at Google, Amazon, McKinsey, Goldman Sachs, and top startups. You write resumes that:

1. PASS ATS — 95%+ keyword match rate for target roles using Workday, Taleo, Greenhouse
2. IMPRESS RECRUITERS — scannable in 6 seconds, impact-first, zero fluff
3. CONVERT TO INTERVIEWS — every word earns its place, every bullet tells a value story

YOUR WRITING PRINCIPLES:
━━━━━━━━━━━━━━━━━━━━━━

BULLET CONSTRUCTION (mandatory for every bullet):
  • Lead with a POWER VERB (past tense for past roles, present for current)
  • Include WHAT you did + HOW you did it + WHAT RESULT it produced
  • Use the CAR formula: Context → Action → Result
  • Quantify with: %, $, time saved, volume, team size, revenue, growth rate
  • BANNED words: responsible for, helped, assisted, worked on, involved in, managed (without metrics), ensured, supported
  • Each bullet: 15-25 words. One idea per bullet. No conjunctions joining two separate achievements.

POWER VERB BANK (rotate, never repeat):
  Revenue/Growth: Drove, Generated, Grew, Accelerated, Expanded, Captured, Monetized
  Engineering: Architected, Engineered, Developed, Optimized, Refactored, Deployed, Automated
  Leadership: Spearheaded, Championed, Directed, Mobilized, Mentored, Cultivated
  Analysis: Synthesized, Modeled, Forecasted, Diagnosed, Benchmarked, Quantified
  Operations: Streamlined, Centralized, Overhauled, Standardized, Orchestrated, Executed
  Collaboration: Partnered, Liaised, Facilitated, Aligned, Coordinated

SUMMARY FORMULA:
  Sentence 1: [Years of experience] + [specialization] + [top credential/achievement]
  Sentence 2: [Core technical/functional skill] + [proof point with metric]
  Sentence 3: [Career goal] + [specific value to target company/role]

KEYWORD STRATEGY:
  - Mirror exact job title language from the target role
  - Include both full form and abbreviation on first use: "Natural Language Processing (NLP)"
  - Spread keywords across summary, bullets, and skills — not just skills section
  - Include 2-3 industry-specific certifications or tools even if inferrable from context

SKILLS SECTION:
  - Format as categories: Programming Languages | Frameworks | Cloud | Tools | Methodologies
  - ONLY categorize and format the exact skills provided by the candidate.
  - STRICT RULE: Do not add, invent, or infer a single skill, tool, or methodology that the user did not explicitly type.
"""

RESUME_BUILDER_TASK = """
TASK: Using the candidate data below, generate an elite, ATS-maximized resume in JSON format.

CANDIDATE DATA:
{data}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object with these exact keys:

{{
  "summary": "<3-sentence professional summary following the FORMULA above. Must contain the exact job title '{target_job}' and at least 3 industry-specific keywords>",

  "optimized_experience": [
    [
      "<POWER VERB + action + quantified result for job 1, bullet 1>",
      "<POWER VERB + action + quantified result for job 1, bullet 2>",
      "<POWER VERB + action + quantified result for job 1, bullet 3>",
      "<POWER VERB + action + quantified result for job 1, bullet 4>",
      "<POWER VERB + action + quantified result for job 1, bullet 5>"
    ]
    // ONE inner list per job entry, same order as input. 4-6 bullets each.
  ],

  "formatted_skills": "<String categorizing ONLY the candidate's explicitly provided skills into logical groups (e.g., [Technical Skills] | [Tools] | [Methodologies]). DO NOT add any keywords that are missing from the input data.>",
  "ats_score": <integer 85-98 reflecting realistic ATS match rate after optimization>,

  "ats_improvements": [
    "<specific change made to maximize ATS score, e.g.: Added missing keyword 'cross-functional collaboration' to 3 bullets>",
    "<specific change>",
    "<specific change>"
  ],

  "cover_letter_hook": "<1 powerful opening sentence for a cover letter that references the target role and a specific achievement from the resume>"
}}

CRITICAL RULES:
- NEVER invent, infer, or hallucinate metrics, percentages, or skills that the user did not explicitly provide.
- Enhance the grammar and use power verbs, but keep the factual content 100% identical to the input.
- Score the resume EXACTLY as the analyzer would, realistically and harshly. Do not artificially inflate the ats_score.
- The summary MUST contain the exact string: '{target_job}'
"""

# --- API ROUTES ---

@app.get("/", tags=["Meta"])
async def root():
    return {
        "name": "Resume.AI API",
        "version": "3.0.0",
        "status": "operational",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /upload",
            "build": "POST /build",
            "docs": "GET /docs",
        },
    }

@app.get("/health", tags=["Meta"])
async def health():
    """Lightweight health check for uptime monitors and frontend status indicators."""
    return {
        "status": "operational",
        "version": "3.0.0",
        "model": MODEL_NAME,
        "cache_size": len(_cache),
        "timestamp": time.time(),
    }

@app.post("/upload", tags=["Analysis"])
@app.post("/analyze", tags=["Analysis"])   # friendly alias
async def analyze(file: UploadFile = File(...), current_date: Optional[str] = Form(None)):
    """Upload a PDF resume and receive a full 8-dimension ATS audit."""
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are accepted. Please upload a .pdf resume.")

    try:
        content = await file.read()

        # Guard against empty or oversized uploads (5 MB limit)
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File exceeds 5 MB. Please compress or trim your PDF.")

        key = hashlib.md5(content).hexdigest()
        cached = cache_get(key)
        if cached:
            logger.info(f"Cache HIT for {key[:8]}")
            return cached

        text = extract_text(content)
        date_context = f"IMPORTANT CONTEXT: The current date is {current_date}. Any experience listed before this date is strictly in the past. Do not flag past dates as future dates.\n\n" if current_date else ""
        prompt = ATS_SCORING_RUBRIC + "\n\n" + date_context + "--- RESUME TEXT TO ANALYZE ---\n" + text

        res = ask_ai(prompt)
        cache_set(key, res)
        return res

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analyze error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)[:200]}")


@app.post("/build", tags=["Builder"])
async def build(data: ResumeSchema):
    """Generate an ATS-optimized resume from structured candidate data."""
    try:
        date_context = f"IMPORTANT CONTEXT: The current date is {data.current_date}. Any experience listed before this date is strictly in the past. Do not flag past dates as future dates.\n\n" if data.current_date else ""
        prompt = (
            RESUME_BUILDER_SYSTEM
            + "\n\n"
            + date_context
            + RESUME_BUILDER_TASK.format(
                data=data.model_dump_json(indent=2),
                target_job=data.target_job,
            )
        )
        return ask_ai(prompt)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Build error: {e}")
        raise HTTPException(status_code=500, detail=f"Build failed: {str(e)[:200]}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)