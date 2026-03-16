# Nova AI — Voice Tutor

Nova AI is a bilingual voice-powered AI tutor built with Next.js and Amazon Bedrock. Users tap a microphone button, speak in Hindi or English, and receive warm conversational responses delivered both as text and spoken audio. The application features persistent chat history, a space-themed landing page with an animated AI robot, smooth-scroll navigation, and a slide-in contact panel — all built with a dark glassmorphism design system.

---

## Features

- Voice-first interaction via the browser's Web Speech API
- Bilingual support for Hindi and English with a single toggle
- AI responses powered by Amazon Nova Lite via AWS Bedrock
- Persistent in-session chat history with auto-generated session titles
- Text-to-speech playback using the correct language voice
- Animated SVG robot on the landing page with opening chest panels
- Canvas-based falling stars background across all pages
- Slide-in contact panel without page navigation
- Smooth-scroll navigation to page sections
- Fully responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI Model | Amazon Nova Lite v1 via AWS Bedrock |
| Speech Input | Web Speech API — SpeechRecognition |
| Speech Output | Web Speech API — SpeechSynthesis |
| Background Animation | HTML Canvas API |
| UI Library | React 19 |

---

## Project Structure

```
nova-voice-tutor/
│
├── app/                              # Next.js App Router root
│   ├── page.tsx                      # Root route — renders the landing page
│   ├── layout.tsx                    # Global layout, metadata, and fonts
│   ├── globals.css                   # Global Tailwind base styles
│   ├── icon.svg                      # App favicon (mic + blue dot)
│   ├── favicon.ico                   # Legacy fallback favicon
│   │
│   ├── app/                          # /app route — voice chat interface
│   │   └── page.tsx                  # Renders VoiceRecorder component
│   │
│   ├── landing/                      # /landing route
│   │   └── page.tsx                  # Landing page: hero, features, robot,
│   │                                 # how it works, language cards, CTA, footer
│   │
│   ├── contact/                      # /contact route — standalone contact page
│   │   └── page.tsx                  # Full-screen contact form
│   │
│   └── api/
│       └── voice/
│           └── route.ts              # POST /api/voice
│                                     # Calls Amazon Bedrock Nova Lite
│                                     # Returns AI response as JSON
│
├── components/
│   ├── VoiceRecorder.tsx             # Main voice chat UI
│   │                                 # Manages sessions, mic, TTS, language
│   └── FallingStars.tsx              # Canvas falling stars animation
│
├── public/
│   ├── favicon.svg                   # SVG favicon served at /favicon.svg
│   └── *.svg                         # Next.js default static assets
│
├── .env.local                        # AWS credentials (not committed)
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── postcss.config.mjs                # PostCSS and Tailwind configuration
├── eslint.config.mjs                 # ESLint configuration
├── package.json                      # Dependencies and scripts
└── README.md                         # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- An AWS account with access to Amazon Bedrock
- The `amazon.nova-lite-v1:0` model enabled in `us-east-1`

### Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/nova-voice-tutor.git
cd nova-voice-tutor
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Ensure your IAM user or role has the `bedrock:InvokeModel` permission for the Nova Lite model.

### Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/app` | Voice chat interface |
| `/contact` | Standalone contact page |
| `/landing` | Direct route to landing page |

---

## Architecture

```
User speaks into microphone
            |
            v
SpeechRecognition API (hi-IN or en-US)
            |
            v
POST /api/voice  { question, lang }
            |
            v
AWS Bedrock — amazon.nova-lite-v1:0
System prompt enforces language + plain text output
            |
            v
AI response returned as { answer: string }
            |
            v
Chat bubble rendered in UI
SpeechSynthesis API reads response aloud
            |
            v
Session saved to chat history sidebar
```

---

## Language Support

| Language | Recognition Locale | TTS Locale |
|---|---|---|
| English | en-US | en-US |
| Hindi | hi-IN | hi-IN |

The language toggle controls the speech recognition locale, the API instruction, and the TTS voice simultaneously. The API receives an explicit `lang` field so the model cannot default to the wrong language.

---

## Key Components

**VoiceRecorder.tsx**

Handles all voice chat logic including session creation and deletion, speech recognition, API communication, text-to-speech playback with correct voice selection, the collapsible sidebar, and the language toggle.

**FallingStars.tsx**

A canvas-based background animation that renders 60 falling stars with gradient trails. Fixed behind all page content. Cleans up `requestAnimationFrame` and event listeners on unmount.

**app/api/voice/route.ts**

The server-side API route. Receives `{ question, lang }` from the client, builds a hard language-enforcement instruction into the system prompt, invokes `amazon.nova-lite-v1:0` via the AWS Bedrock Runtime SDK, and returns the response as `{ answer: string }`.

---

## Landing Page Sections

| Section | Description |
|---|---|
| Navbar | Floating rounded card, transparent at top, frosted glass on scroll |
| Hero | Two-column layout — headline and CTAs on the left, animated robot on the right |
| Stats Strip | Animated counters for key metrics |
| Features | Six feature cards with accent colors and hover states |
| How It Works | Three-step guide alongside a live auto-playing demo widget |
| Language Cards | English and Hindi mode cards with subject tags |
| CTA Banner | Call to action linking to the voice interface |
| Footer | Rounded card with navigation links |

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `AWS_REGION` | Yes | AWS region (e.g. us-east-1) |
| `AWS_ACCESS_KEY_ID` | Yes | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS IAM secret key |

Never commit `.env.local` to version control.

---

## Deployment

The project is compatible with Vercel out of the box.

1. Push the repository to GitHub
2. Import the project on vercel.com
3. Add environment variables in the Vercel project settings
4. Deploy

Ensure your AWS credentials have Bedrock access from Vercel's deployment region.

---

## Future Improvements

- Persist chat history across sessions using a database or localStorage
- User authentication and personalized learning profiles
- Support for additional Indian languages
- Quiz generation from conversation history
- Streamed AI responses for faster perceived latency
- Voice activity detection to auto-start recording

---

## Author

Kshitij Jain — Student Developer

---

## License

This project is licensed under the MIT License. See LICENSE for details.

---

## Hackathon

Built for the Amazon Nova AI Hackathon using Amazon Nova foundation models via AWS Bedrock.
