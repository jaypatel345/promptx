# 🚀 PromptX

> **Backend-Driven AI Prompt Optimization Platform**

PromptX is a scalable, backend-focused platform that transforms raw user prompts into structured, high-quality inputs for Large Language Models (LLMs).

---

## 🌐 Live Demo

🔗 **Try it here:**  👉 [Live Demo](https://promptx.co.in/)

---

## 🧠 Problem Statement

Most users write vague or unstructured prompts → resulting in poor AI outputs.

**PromptX solves this by:**

- ✅ Structuring prompts
- ✅ Adding context
- ✅ Improving clarity
- ✅ Enhancing output quality

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 Prompt Enhancement Engine | Converts simple input into optimized prompts |
| ⚡ Fast Backend API | Low-latency processing using Node.js & Express |
| 🧩 Modular Architecture | Easily extendable service-layer design |
| 🔌 LLM Integration | Works with OpenAI and other AI providers |
| 📈 Scalable Design | Built with real-world backend practices |

---

## 🖼️ Screenshots

### 🏠 Homepage
<!-- Add screenshot here -->

### ✨ Prompt Optimization
<!-- Add screenshot here -->

---

## 🏗️ System Architecture

```
Client (React)
     ↓
API Layer (Express)
     ↓
Service Layer (Prompt Engine)
     ↓
AI Layer (LLM APIs)
     ↓
Database (MongoDB)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI Integration** | OpenAI API |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
PromptX/
│
├── client/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── config/
│
├── screenshots/
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/<your-username>/promptx.git
cd promptx
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=<your_mongodb_uri>
OPENAI_API_KEY=<your_api_key>
```

Run the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🔌 API Reference

### Optimize Prompt

```
POST /api/prompt/optimize
```

**Request Body:**

```json
{
  "input": "Explain blockchain"
}
```

**Response:**

```json
{
  "optimizedPrompt": "Explain blockchain technology in simple terms with real-world examples and use cases."
}
```

---

## 🎯 Engineering Highlights

- Clean backend architecture
- RESTful API design
- Service-layer abstraction
- AI system integration
- Scalable project structure

---

## 🚧 Roadmap

- [ ] Authentication (JWT)
- [ ] Prompt History
- [ ] Prompt Scoring System
- [ ] Multi-Model Support
- [ ] Agent-Based Prompt Optimization
- [ ] Rate Limiting & Security
- [ ] Docker + Cloud Deployment

---

## 📊 Use Cases

- AI tools & SaaS platforms
- Developer productivity tools
- Content generation systems
- Prompt engineering platforms

---

## 👨‍💻 Author

**Jay Patel**
Backend-focused developer building scalable systems and AI platforms.

---

## ⭐ Support

If you find this project useful, consider giving it a **⭐ star** on GitHub — it really helps!
