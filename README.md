# Nova Voice Tutor

An AI-powered voice tutor that helps students learn concepts through natural voice conversations. The application uses Amazon Nova’s speech AI to allow students to ask questions verbally and receive clear spoken explanations with follow-up questions to test understanding.

Built for the Amazon Nova AI Hackathon.

---

# Problem

Many students struggle to understand complex concepts while studying alone. Traditional learning tools like notes or videos are passive and do not provide interactive explanations.

Students often need a personal tutor who can explain topics simply and ask questions to check understanding.

---

# Solution

Nova Voice Tutor is an AI voice-based learning assistant that allows students to learn by simply speaking.

Students can:

- Ask questions using their voice
- Receive clear spoken explanations
- Get follow-up questions to reinforce learning
- Practice concepts interactively

The goal is to make learning more conversational, engaging, and effective.

---

# How It Uses Amazon Nova

This project uses Amazon Nova AI models to enable real-time voice interaction.

Technologies used:

- Amazon Nova 2 Sonic – speech-to-speech conversational AI
- Amazon Nova 2 Lite – reasoning and explanation generation
- AWS Bedrock – access to Amazon Nova models
- Next.js – frontend web application
- Node.js – backend API

The AI receives voice input, understands the question, generates a response, and replies with voice output.

---

# Architecture

```
User Voice Input
       ↓
Browser Microphone
       ↓
Frontend (Next.js)
       ↓
Backend API (Node.js)
       ↓
Amazon Nova (via AWS Bedrock)
       ↓
AI Response (Text + Voice)
       ↓
Voice Played Back to User
```

---

# Features

- Voice-based question asking
- AI explanations in simple language
- Follow-up questions to test understanding
- Topic-based tutoring (Programming, Math, etc.)
- Real-time conversational learning

---

# Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/nova-voice-tutor.git
```

Go into the project folder:

```bash
cd nova-voice-tutor
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open in your browser:

```
http://localhost:3000
```

---

# Demo

Demo Video: (Add your demo video link here)

The demo shows:

1. Student asking a question using voice
2. AI explaining the concept
3. AI asking a follow-up question

---

# Project Structure

```
nova-voice-tutor
│
├── app
│   ├── page.tsx
│   └── api
│
├── components
│
├── public
│
├── package.json
│
└── README.md
```

---

# Future Improvements

- Personalized learning memory for each student
- Quiz generation for revision
- Multi-language tutoring
- Topic-based study sessions
- Mobile application version

---

# Author

Kshitij Jain  
Student Developer

---

# Hackathon Submission

Project built for the Amazon Nova AI Hackathon using Amazon Nova foundation models to create an AI-powered learning experience.