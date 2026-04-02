# 🧠 LOGICIA — Your AI Exam Brain

[![Agile Methodology](https://img.shields.io/badge/Methodology-Agile-blueviolet.svg)](#-agile-methodology)
[![Framework](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg)](https://www.mongodb.com/atlas)

> **Empowering India's Aspirants.** An intelligent, all-in-one AI tutor designed specifically for competitive exams like UPSC, SSC, Banking, Railways, and more.

---

## 📖 Overview

**LOGICIA** is a next-generation education platform that goes beyond simple answers. It acts as a personal coach, breaking down complex topics in Polity, History, Science, and Quantitative Aptitude into understandable, step-by-step logic. Whether it's a intricate UPSC Article explanation or a lightning-fast SSC Math shortcut, LOGICIA is built to help students **Think Smart and Score Higher.**

### 🛑 The Problem

Standard AI tools often provide generic answers, often cluttered with messy LaTeX symbols, and lack the specific context required for Indian competitive exams. Students struggle to find structured explanations that include shortcuts, mnemonics, and difficulty tagging in a single place.

### ✅ The Solution

A specialized AI ecosystem that leverages **Symbolic Math (SymPy)** for perfect calculations and **Advanced LLMs** for deep pedagogical explanations. It translates complex concepts into clean, readable bilingual (English/Telugu) structures designed for the Indian exam pattern.

---

## ✨ Key Features

- 🏛️ **Multi-Domain Intelligence:** Expert coaching for UPSC, SSC, IBPS, RRB, NDA, and State PSCs.
- 🔢 **Step-by-Step Logic:** Every math and reasoning problem is broken down into logical steps with clear intermediate results (⇒).
- 💡 **Exam Shortcuts:** Built-in "Tricks" section for math shortcuts and GK mnemonics (acronyms to remember facts).
- 📊 **MCQ Deep-Dive:** Intelligent analysis of options — explaining not just why an answer is right, but why others are wrong.
- 🏷️ **Difficulty Tagging:** Every response is tagged as [Easy], [Moderate], or [Hard] to help students gauge the level.
- 🇮🇳 **Bilingual Support:** Full support for English and Telugu (script and logic).
- ☁️ **Cloud Persistence:** Conversations are securely stored in MongoDB Atlas, allowing students to revisit their history anytime.

---

## 🔄 Agile Methodology

This project was developed using a strict **Agile/Scrum** framework to ensure rapid delivery and high-quality iterations.

- **Sprint-Based Development:** Features like the "AI Brain Upgrade" and "Database Persistence" were delivered in iterative sprints.
- **Continuous Feedback Loop:** User struggles (like the recent MongoDB SSL handshake issue or LaTeX symbol clutter) were identified and resolved in real-time "hot-fixes" within the same iteration.
- **Incremental Improvements:** Started as a simple math solver and evolved into a comprehensive competitive exam platform through constant feature backlogs and refinements.
- **Refactoring & Optimization:** Regular code reviews to ensure clean architecture (FastAPI) and responsive UI designs.

---

## 🛠️ Tech Stack

### Frontend

- **React 18 + Vite:** For a lightning-fast, modern SPA experience.
- **TypeScript:** Ensuring type safety and fewer runtime errors.
- **Vanilla CSS:** Custom-crafted premium aesthetics (Glow effects, Dark Mode).
- **Lucide React:** Beautiful, consistent iconography.

### Backend

- **FastAPI:** High-performance Python framework for the primary API.
- **SymPy:** Symbolic mathematics engine for formula parsing and calculation.
- **OpenRouter (LLM):** Orchestrating elite intelligence for exam-specific tutoring.
- **Uvicorn:** ASGI server for production-ready performance.

### Database & Tools

- **MongoDB Atlas:** Scalable cloud-based NoSQL storage for user conversations.
- **Python 3.10+:** Core backend logic.
- **Httpx:** Asynchronous HTTP calls for rapid AI response generation.

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.10 or higher
- Node.js (v16+) and npm
- MongoDB Atlas Account

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Accessible at: `http://localhost:8080` (or 5173).

---

## 📅 Roadmap & Enhancements

- [ ] **Mock Test Engine:** Timed exam simulations for specific categories (SSC/UPSC).
- [ ] **Voice Interaction:** Ask questions and hear explanations in a natural exam-coach voice.
- [ ] **Predictive Analytics:** Personalized progress tracking based on chat history.
- [ ] **Image-to-Question:** Upload a photo of a textbook question for instant AI analysis.

---

## 🤝 Contributing

We follow Agile practices! If you find a bug or have a feature request, please open an issue in the **Sprints** backlog.

---

_Developed with ❤️ for the aspirants of India._
