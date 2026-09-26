from pypdf import PdfReader
from dotenv import load_dotenv
load_dotenv()
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_openrouter import ChatOpenRouter


template = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are an advanced Resume Intelligence & Scoring Engine.  
Your role is to act as a professional ATS (Applicant Tracking System) analyst and career coach.  

Your capabilities include:

1. **Resume Parsing & Structuring** – Extract all sections (Personal Info, Summary, Experience, Education, Skills, Certifications, Projects, Achievements).
2. **Skill Extraction & Categorization** – Separate Technical, Soft, and Domain skills.
3. **Contextual Scoring** – Score the resume out of 100 based on:
   - ATS compatibility (keywords, formatting, sections)
   - Relevance to a given job description (if provided)
   - Depth of experience (quantifiable achievements, action verbs)
   - Skill density and diversity
   - Education & certification weightage
   - Project quality and impact
4. **Weakness Identification** – Detect and highlight:
   - Missing sections
   - Vague or non-quantified bullet points
   - Overused or weak action verbs
   - Low keyword match score
   - Lack of measurable outcomes (%, $, numbers)
   - Gaps in technical/modern skill stack
   - Poor formatting or inconsistent tense
5. **Actionable Feedback** – Provide section-wise improvement suggestions with examples.
6. **Comparative Analysis** – If multiple resumes, rank them.

You must respond in **structured JSON** or **Markdown** (as per user request).  
Your tone must be professional, analytical, and constructive.  
Do not hallucinate. Only infer from the given resume and job description (if any).

{pdf}
"""
    ),
    (
        "human",
        """
{text}

I want you to analyze the following resume in detail.

Resume Text:
[PASTE RESUME HERE]

Job Description (optional but preferred):
[PASTE JD HERE]

Please perform the following advanced-level analytics:

1. **Overall Resume Score** (out of 100) with a breakdown:
   - ATS Compatibility Score
   - Skill Relevance Score
   - Experience Quality Score
   - Education & Certification Score
   - Project & Achievement Score

2. **Strengths** – Top 5 strong points.

3. **Weaknesses / Gaps** – List at least 5 specific weak areas with clear reasoning.

4. **Section-wise Feedback**:
   - Summary
   - Experience
   - Skills
   - Education
   - Projects
   - Certifications (if any)

5. **Missing Keywords** – Suggest high-impact keywords missing for the given JD.

6. **Rewriting Suggestions** – Provide 2–3 rewritten bullet points for the weakest experience section.

7. **Final Verdict** – Is this resume shortlisted or rejected? Why?

Output format: Structured Markdown with clear headings and bullet points.
"""
    )
])


def analyze_resume(doc,text):
    data=PyPDFLoader(doc)
    pdf=data.load()
    
    mollmel=ChatOpenRouter(
        model='google/gemma-4-26B-A4B-it'
    )
    final_prompt=template.invoke({"pdf":pdf,'text':text})
    print(final_prompt.to_string())
   