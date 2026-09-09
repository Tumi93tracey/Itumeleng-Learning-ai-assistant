# Kgaswane Learning Assistant — AI education productivity assistant

An AI assistant for teachers, parents and learners, focused on ECD / early-years
literacy and CAPS-aware planning, branded around Itumeleng Kgaswane's educator profile.
Opens on a working tools dashboard; sign-in keeps saved work and past chats.

## What the user gets

**Dashboard (home)**
- Warm greeting, quick-start cards for each tool, recent saved items, and a
  "Try a sample" path so everything is explorable before typing anything.
- Small panel of real classroom problems it solves (e.g. "Monday lesson plan for
  Grade R phonics in 10 minutes", "Difficult parent conversation, written kindly").

**AI assistant (chat)**
- Separate saved conversations with a sidebar list; each chat has its own page URL.
- Streaming replies, suggested opening prompts for teachers / parents / learners,
  and an educator-appropriate assistant persona.

**Five guided tools** — each a structured form (not a blank prompt box), showing
the audience/role/tone controls that shape the AI request:
1. **Lesson plan generator** — age band (6mo–7yr, Grade R, Foundation Phase),
   subject/theme, CAPS focus area, duration, group size, resources on hand,
   learners needing extra support. Output: objectives, CAPS link, step-by-step
   activities with timings, materials, differentiation, assessment, home extension.
2. **Parent message generator** — purpose (progress, concern, praise, invitation,
   incident), tone (warm, formal, firm-but-kind), channel (email, WhatsApp, note
   in the book), language level, plus optional home-language version.
3. **Meeting / parent-conversation summarizer** — paste rough notes; returns a
   short summary, decisions, action items with owners and dates, follow-up date,
   and a parent-friendly recap.
4. **Task planner** — tasks in, priorities and a structured day/week teaching
   plan out, with prep-time suggestions and a realistic classroom rhythm.
5. **Research & resource helper** — topic in, plain-language explanation,
   key takeaways, age-appropriate activity ideas, and what to verify.

**Prompt engineering made visible**
- Every tool has a "See the prompt" panel showing the exact structured
  role/context/task/format instruction sent, so the technique is demonstrable.
- A Prompt Library page with the sample prompts, before/after refinements, and
  notes on why each version works better.

**Responsible AI**
- Persistent reminder to check AI output before using it with children or parents.
- Never-put-in-here guidance on learner names and personal details, with a
  built-in "use initials" nudge on the parent and summarizer tools.
- A Responsible AI page: limitations, bias risks, verification steps, privacy.

**Educator profile**
- An About page with Itumeleng's story, experience, skills, credentials,
  offerings and contact details from the portfolio.

**Saved work + accounts**
- Email/password and Google sign-in. Saved lesson plans, messages, summaries,
  plans and chats are private to each account and follow the user across devices.
- Signed-out visitors can still browse the dashboard, sample content and profile;
  generating and saving asks them to sign in.

## Design

Warm, grounded early-childhood palette — not a generic purple AI dashboard.
Deep teal and a soft clay/apricot accent on a warm off-white, with a friendly
display face for headings and a highly readable body face. Card-based dashboard,
sidebar app shell, fully responsive down to phone width for a live demo.
Custom logo mark (a book/leaf-inspired symbol), no generic sparkle icon.

## Technical notes

- Lovable Cloud enabled for accounts, saved work and chat history.
  Tables: `profiles` (display name, role: teacher/parent/learner), `chats`,
  `chat_messages`, `saved_items` (tool type + inputs + output). Row-level
  security so each account only reads its own rows; demo/sample content ships as
  static seed content in the app, so nothing is required before the first login.
- AI via Lovable AI Gateway (default chat model) called from server functions;
  the API key stays server-side. Chat streams through a server route with
  AI Elements chat UI; tools use structured server functions per tool with
  the composed prompt returned alongside the output for the "See the prompt" panel.
- Gateway failures (rate limit, credit exhaustion) surface as clear in-app
  messages rather than silent failures.
