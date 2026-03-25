# 🤖 AI-Powered Math Tutor Chatbot

## 📌 Overview
This project is an **AI-driven Math Tutor Chatbot** designed to solve mathematical problems and provide **step-by-step explanations** in a human-understandable way.

It uses a **hybrid architecture** that combines:
- Symbolic computation (for accuracy)
- Large Language Models (for explanation)

The system is built to behave like an intelligent tutor, not just a calculator.

---

## 🎯 Objectives
- Solve mathematical problems accurately
- Explain solutions step-by-step
- Help users understand the logic behind answers
- Provide visualizations (graphs)
- Maintain conversation history

---

## 🧠 System Design Philosophy

This system follows a **multi-layer intelligent pipeline**:

1. **Problem Understanding**
2. **Mathematical Solving**
3. **Explanation Generation**
4. **Visualization (Optional)**
5. **Response Delivery**

---

## ⚙️ Core Architecture


User → Frontend (React)
→ Backend (FastAPI)
→ Problem Classifier
→ Math Engine (SymPy)
→ Explanation Engine (LLM)
→ Graph Engine (Matplotlib)
→ Database (MongoDB)
→ Response → Frontend


---

## 🔄 Workflow (Step-by-Step)

### 1. User Input
- User enters a math problem in the chat interface

Example:

x^2 - 5x + 6 = 0


---

### 2. API Request
Frontend sends request:
```json
POST /solve
{
  "question": "x^2 - 5x + 6 = 0"
}
3. Problem Classification

Backend identifies problem type:

Algebra
Arithmetic
Calculus
Word problem
4. Math Solving (Symbolic Engine)
Uses SymPy for accurate computation
Avoids hallucinations from LLM
5. Explanation Generation (LLM)
Uses AI model to convert solution into:
Step-by-step explanation
Simple language
Teacher-like reasoning
6. Graph Generation (Optional)
If problem is graphable:
Generate function plot
Send visualization to frontend
7. Data Storage

Stores:

Question
Answer
Explanation
Timestamp
8. Response Delivery

Backend returns structured response:

{
  "answer": "...",
  "steps": "...",
  "graph": "optional"
}
🧩 Key Components
1. Problem Classifier

Detects type of math problem and routes accordingly.

2. Math Engine (SymPy)

Responsible for:

Equation solving
Algebra
Symbolic computation
3. Explanation Engine (LLM)

Responsible for:

Natural language explanation
Step-by-step reasoning
Simplification of concepts
4. Graph Engine
Generates plots for functions
Helps visual understanding
5. Memory System
Stores chat history
Enables session continuity
🛠️ Tech Stack
Frontend
React.js
Tailwind CSS
Backend
FastAPI (Python)
AI / Logic
OpenAI API (LLM)
SymPy
Visualization
Matplotlib
Database
MongoDB
🔍 Intelligent Routing Logic

Example:

if "x" in input:
    use_sympy_solver()
else:
    use_llm_directly()
💡 Why Hybrid Approach?
Component	Purpose
SymPy	Accurate math solving
LLM	Human-like explanation

This avoids:

Incorrect answers (LLM limitation)
Lack of explanation (pure math engines)
🚀 Features
✅ Step-by-step solutions
✅ AI explanations (teacher style)
✅ Graph visualization
✅ Chat interface
✅ History tracking
