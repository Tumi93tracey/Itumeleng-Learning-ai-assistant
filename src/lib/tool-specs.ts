/**
 * Tool definitions shared by the guided forms (client) and the generation
 * server function (server). Pure data + pure prompt builders — no secrets.
 */

export type FieldType = "text" | "textarea" | "select";

export type ToolField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
  /** Marks a field where personal details could be entered by mistake. */
  privacy?: boolean;
};

export type ToolId =
  | "lesson-plan"
  | "curriculum-planner"
  | "parent-message"
  | "summarizer"
  | "task-planner"
  | "research";

export type ToolSpec = {
  id: ToolId;
  name: string;
  tagline: string;
  /** The real classroom problem this solves. */
  problem: string;
  saves: string;
  icon: "book" | "mail" | "notes" | "calendar" | "search";
  /** The persona/role the AI is given. */
  role: string;
  /** How the model must format the answer. */
  outputFormat: string[];
  fields: ToolField[];
  sample: Record<string, string>;
  sampleOutput: string;
};

const AGE_BANDS = [
  "Babies (6–18 months)",
  "Toddlers (18 months–3 years)",
  "Playgroup (3–4 years)",
  "Grade R (5–6 years)",
  "Grade 1–3 / Foundation Phase (6–9 years)",
];

export const TOOL_SPECS: ToolSpec[] = [
  {
    id: "lesson-plan",
    name: "Lesson plan generator",
    tagline: "A CAPS-aware lesson plan built around the child in front of you.",
    problem:
      "It's Sunday evening and tomorrow's phonics lesson still isn't planned. Writing a full plan with activities, materials and differentiation by hand takes about 45 minutes per lesson.",
    saves: "≈40 minutes per lesson plan",
    icon: "book",
    role:
      "You are an experienced South African early childhood development (ECD) practitioner and Foundation Phase teacher who plans CAPS-aligned lessons for children from 6 months to 9 years.",
    outputFormat: [
      "Lesson title and age band",
      "3–4 learning objectives written as observable child behaviours",
      "Likely CAPS link (subject, skill area) — clearly flagged as needing the teacher's own check",
      "Materials list, using only what the teacher said is available",
      "Step-by-step activities with minute-by-minute timings (intro, main, consolidation)",
      "Differentiation: how to simplify and how to extend",
      "Simple observation-based assessment with what to look for",
      "One short home extension for parents",
    ],
    fields: [
      {
        id: "ageBand",
        label: "Age group",
        type: "select",
        options: AGE_BANDS,
        required: true,
      },
      {
        id: "topic",
        label: "Theme or skill",
        type: "text",
        placeholder: "Letter sound 's' / counting to 10 / farm animals",
        required: true,
      },
      {
        id: "focus",
        label: "Curriculum focus area",
        type: "select",
        options: [
          "Early literacy & phonics",
          "Emergent numeracy",
          "Life Skills / beginning knowledge",
          "Fine & gross motor",
          "Sensory & play-based learning",
          "Social-emotional development",
        ],
        required: true,
      },
      {
        id: "duration",
        label: "Lesson length",
        type: "select",
        options: ["15 minutes", "20 minutes", "30 minutes", "45 minutes", "60 minutes"],
        required: true,
      },
      {
        id: "groupSize",
        label: "Group size",
        type: "select",
        options: ["One-on-one", "Small group (2–6)", "Half class (7–15)", "Full class (16–35)"],
        required: true,
      },
      {
        id: "resources",
        label: "Resources you actually have",
        type: "textarea",
        rows: 2,
        placeholder: "Flashcards, crayons, playdough, no printer, outdoor space",
        help: "The plan will only use what you list here.",
      },
      {
        id: "support",
        label: "Learners needing extra support",
        type: "textarea",
        rows: 2,
        placeholder: "Two learners still learning letter sounds; one very shy",
        help: "Describe needs, not names.",
        privacy: true,
      },
      {
        id: "language",
        label: "Language of instruction",
        type: "select",
        options: ["English", "English with isiZulu support", "English with Sesotho support", "Afrikaans"],
      },
    ],
    sample: {
      ageBand: "Grade R (5–6 years)",
      topic: "Letter sound 's' — snakes and sounds",
      focus: "Early literacy & phonics",
      duration: "30 minutes",
      groupSize: "Full class (16–35)",
      resources: "Sand tray, flashcards, wax crayons, story book, no printer",
      support: "Three learners still confusing 's' and 'sh'; one learner needs movement breaks",
      language: "English with isiZulu support",
    },
    sampleOutput: `## Sound Safari: the letter **s**
**Age band:** Grade R (5–6 years) · **Length:** 30 minutes · **Group:** full class

### Learning objectives
By the end of the lesson each child should be able to:
1. Say the /s/ sound in isolation when shown the letter card.
2. Name at least two objects that begin with /s/.
3. Trace the letter *s* in the sand tray with the correct starting point.
4. Join in the "sssss" snake movement song without prompting.

### Likely CAPS link
Home Language — Listening and Speaking, plus Phonics (recognising and sounding single letters). *Please check against your school's current CAPS phonics sequence.*

### Materials
Sand tray · letter *s* flashcards · wax crayons · storybook · open floor space

### Activities
**0–4 min · Snake greeting (whole group)**
Children stand and make a long "sssss" as they wiggle arms like a snake. Ask: *what does your mouth do when you make that sound?*

**4–12 min · Sound hunt**
Hold up the *s* card. Children hunt the classroom for something starting with /s/ (sock, scissors, seat). Each child names one item. Say the isiZulu word alongside where it helps ("isicathulo — shoe" contrast).

**12–22 min · Sand tray writing (rotating small groups)**
Model *s* starting at the top curve. Each child traces three times while whispering "sssss". Others colour a large *s* outline with crayons while they wait.

**22–28 min · Story listening**
Read the story and ask children to hiss softly every time they hear an /s/ word.

**28–30 min · Closing**
Each child says one /s/ word at the door as a "ticket out".

### Differentiation
*Simplify:* for the three learners confusing /s/ and /sh/, sit them close and use a mirror so they can see the lips stay wide for /s/. Practise only two words.
*Extend:* ask confident learners to find /s/ at the end of words (bus, glass).
*Movement:* the learner needing movement breaks leads the snake wiggle between activities.

### Assessment (observation)
Tick per child: says /s/ correctly · names an /s/ word · traces *s* with correct start point. Note any child who needs a second round tomorrow.

### Home extension
"Tonight, find three things in your home that start with 'sss'. Bring one to school tomorrow."`,
  },
  {
    id: "parent-message",
    name: "Parent message generator",
    tagline: "Say the hard thing kindly — and the good thing properly.",
    problem:
      "Parent communication is where teachers lose evenings and sleep. A concern written in a hurry reads as blame; a lovely piece of progress goes unsaid because there was no time to write it.",
    saves: "≈15 minutes per message",
    icon: "mail",
    role:
      "You are an experienced ECD educator writing to a parent or guardian. You are warm, specific, respectful of the parent's time, and you never blame the child or the family.",
    outputFormat: [
      "A short subject line (skip for a WhatsApp or homework-book note)",
      "The message itself, in the requested tone and channel length",
      "One clear next step or invitation",
      "If asked, a shorter simplified version",
      "A one-line note on anything the teacher must confirm before sending",
    ],
    fields: [
      {
        id: "purpose",
        label: "Purpose of the message",
        type: "select",
        options: [
          "Progress update",
          "Raise a concern gently",
          "Praise / celebrate progress",
          "Invitation (meeting, event, outing)",
          "Report an incident at school",
          "Request support with homework or routine",
          "Late payment or admin reminder",
        ],
        required: true,
      },
      {
        id: "audience",
        label: "Who you're writing to",
        type: "select",
        options: [
          "Parent of a baby/toddler",
          "Parent of a Grade R learner",
          "Parent of a Foundation Phase learner",
          "Guardian or grandparent",
          "School principal or head of phase",
        ],
        required: true,
      },
      {
        id: "tone",
        label: "Tone",
        type: "select",
        options: ["Warm and friendly", "Formal and professional", "Firm but kind", "Encouraging and hopeful"],
        required: true,
      },
      {
        id: "channel",
        label: "Channel",
        type: "select",
        options: ["Email", "WhatsApp message", "Note in the homework book", "Printed letter"],
        required: true,
      },
      {
        id: "details",
        label: "What happened / what you want to say",
        type: "textarea",
        rows: 4,
        placeholder:
          "T. is now blending 3-letter words on her own, but she is very tired in the afternoons and cries easily.",
        required: true,
        help: "Use initials instead of full names.",
        privacy: true,
      },
      {
        id: "readingLevel",
        label: "Language level",
        type: "select",
        options: ["Plain, simple English", "Standard English", "Formal English"],
      },
      {
        id: "extras",
        label: "Also include",
        type: "select",
        options: [
          "Nothing extra",
          "A shorter WhatsApp version too",
          "A simplified version for a parent who reads little English",
          "Two tone options to choose from",
        ],
      },
    ],
    sample: {
      purpose: "Raise a concern gently",
      audience: "Parent of a Grade R learner",
      tone: "Firm but kind",
      channel: "Email",
      details:
        "T. is blending three-letter words well, but arrives without breakfast most days and struggles to focus before 10am. Twice this week she fell asleep during story time.",
      readingLevel: "Plain, simple English",
      extras: "A shorter WhatsApp version too",
    },
    sampleOutput: `**Subject:** A quick note about T.'s mornings

Good afternoon,

I hope you are well. I wanted to share something small but important, and to say first how well T. is doing with her reading — she is now blending three-letter words on her own, which is right where we want her to be.

What I have noticed over the last two weeks is that mornings are hard for her. She often tells me she has not eaten, and before about 10am she finds it difficult to concentrate. Twice this week she fell asleep during story time. Children of this age simply cannot focus on learning when they are hungry or short on sleep.

Could we look at this together? Even something small in the morning helps, and if getting breakfast in is difficult at the moment, please tell me — the school has options and I would rather help than have T. sitting hungry.

**Next step:** May I call you this week, or would a short chat at pick-up on Thursday suit you better?

Warm regards,
Itumeleng Kgaswane

---

### Shorter WhatsApp version
Good afternoon 🙂 T.'s reading is coming along beautifully — she's blending 3-letter words on her own now. I did want to mention that she's often hungry and very tired in the mornings and it's making it hard for her to focus. Can we chat about it this week? Happy to help where I can. — Itumeleng

---

**Before you send:** confirm the two sleep incidents and the dates, and check that the parent prefers email over a call.`,
  },
  {
    id: "summarizer",
    name: "Meeting & conversation summarizer",
    tagline: "Rough notes in. Summary, decisions and action items out.",
    problem:
      "After a parent meeting or staff briefing the notes sit in a book and nothing gets followed up. A week later nobody remembers who agreed to do what, by when.",
    saves: "≈25 minutes per meeting",
    icon: "notes",
    role:
      "You are a meticulous education administrator who turns messy handwritten meeting notes into a clear record with owners and deadlines.",
    outputFormat: [
      "A 2–3 sentence summary",
      "Key points discussed",
      "Decisions made",
      "Action items in a table: action, who, by when",
      "Deadlines and follow-up date",
      "A short parent-friendly recap that can be sent as-is",
      "Anything unclear in the notes, listed as questions to confirm",
    ],
    fields: [
      {
        id: "meetingType",
        label: "Type of conversation",
        type: "select",
        options: [
          "Parent-teacher meeting",
          "Staff / phase meeting",
          "Support or intervention meeting",
          "Incident debrief",
          "Tutoring session record",
        ],
        required: true,
      },
      {
        id: "notes",
        label: "Your rough notes",
        type: "textarea",
        rows: 8,
        placeholder: "Paste or type exactly what you scribbled — spelling and order don't matter.",
        required: true,
        help: "Use initials for children and parents.",
        privacy: true,
      },
      {
        id: "attendees",
        label: "Who was there (roles)",
        type: "text",
        placeholder: "Class teacher, parent, HOD Foundation Phase",
      },
      {
        id: "date",
        label: "Date of the meeting",
        type: "text",
        placeholder: "12 March",
      },
      {
        id: "audience",
        label: "Recap written for",
        type: "select",
        options: ["The parent", "School management", "My own records", "The support team"],
      },
    ],
    sample: {
      meetingType: "Parent-teacher meeting",
      notes:
        "met mom of K. 12 march. reading behind - still not knowing all letter sounds, m s a t only. mom says no books at home, works night shift, grandmother helps w homework but cant read english. agreed: i send 3 flashcard sheets home fri. mom will do 10 min every evening w gran. K. to join reading group tues+thurs mornings from next week. school librarian to give K a library card. recheck in 4 weeks - 9 april. mom worried about him repeating grade R, i said too early to say. also mentioned K. crying at drop off, less now.",
      attendees: "Class teacher, mother, (grandmother mentioned)",
      date: "12 March",
      audience: "The parent",
    },
    sampleOutput: `### Summary
Met with K.'s mother on 12 March to discuss his reading progress. K. currently recognises four letter sounds (m, s, a, t) and is behind where we would like him at this point in Grade R. The home reading environment is limited, so we agreed on a shared plan of daily short practice at home plus extra small-group reading at school, to be reviewed in four weeks.

### Key points discussed
- K. recognises only m, s, a and t reliably.
- There are no reading books at home; his mother works night shift and his grandmother, who helps with homework, does not read English.
- Separation crying at drop-off has reduced.
- His mother raised a worry about K. repeating Grade R.

### Decisions
- Reading support will be increased at school and at home rather than waiting for the next term.
- No decision on grade progression at this stage — it is too early in the year.

### Action items
| Action | Who | By when |
| --- | --- | --- |
| Send three flashcard sheets home | Class teacher | Friday 14 March |
| 10 minutes of flashcard practice each evening | Mother, with grandmother's help | Daily from 17 March |
| Add K. to the Tuesday & Thursday morning reading group | Class teacher | From 18 March |
| Arrange a library card for K. | School librarian | Before 21 March |

### Deadlines & follow-up
- First materials home: **14 March**
- Review meeting: **9 April** (4 weeks)

### Recap you can send to the parent
Thank you for meeting me on 12 March. Here is what we agreed: I will send three flashcard sheets home on Friday, and K. will practise with them for about 10 minutes each evening with you or his grandmother. From next week he joins a small reading group on Tuesday and Thursday mornings, and the librarian will arrange a library card so he has books at home. We will meet again on 9 April to see how he is going. He is trying hard, and the drop-off crying is already much better.

### Please confirm
1. Is the grandmother available every evening, or only on night-shift days?
2. Was the reading group start date agreed as 18 March?
3. Did you promise the flashcards for Friday or "by the weekend"?`,
  },
  {
    id: "task-planner",
    name: "Teaching week planner",
    tagline: "Your list, turned into a realistic teaching day.",
    problem:
      "Marking, prep, parent calls, admin and a birthday ring for tomorrow — all on one page with no sense of what actually fits into a teaching day.",
    saves: "≈20 minutes per week",
    icon: "calendar",
    role:
      "You are a practical school-day planner who understands that a teacher's day is broken into short gaps between contact time, and that prep must fit into real windows.",
    outputFormat: [
      "A one-line reality check on whether the list fits the time available",
      "Priorities grouped as: do first (urgent + important), schedule, quick wins, and let go / delegate",
      "A time-blocked plan for the requested period, respecting contact time",
      "Prep-time estimates per task",
      "Two or three specific time-saving suggestions",
      "What to drop if the day goes wrong",
    ],
    fields: [
      {
        id: "period",
        label: "Plan for",
        type: "select",
        options: ["Today", "Tomorrow", "The whole week", "The weekend (prep only)"],
        required: true,
      },
      {
        id: "tasks",
        label: "Everything on your list",
        type: "textarea",
        rows: 6,
        placeholder:
          "Mark 32 phonics worksheets, plan Fri lesson, phone 2 parents, cut out laminated shapes, term report comments, buy glue sticks",
        required: true,
      },
      {
        id: "contactTime",
        label: "When you're with children",
        type: "text",
        placeholder: "07:30–13:00 teaching, aftercare 13:00–15:30",
      },
      {
        id: "deadlines",
        label: "Hard deadlines",
        type: "textarea",
        rows: 2,
        placeholder: "Reports due Thursday 12:00; parent evening Wednesday",
      },
      {
        id: "energy",
        label: "How this week feels",
        type: "select",
        options: ["Normal", "Very full — protect my evenings", "Exhausted, keep it minimal", "Quiet week, catch up"],
      },
      {
        id: "role",
        label: "Your role",
        type: "select",
        options: ["Class teacher", "Assistant teacher", "Playgroup / ECD practitioner", "Private tutor", "Parent at home"],
      },
    ],
    sample: {
      period: "The whole week",
      tasks:
        "Mark 32 phonics worksheets, plan Friday's lesson, phone 2 parents about absences, cut and laminate shape cards, write 12 term report comments, buy glue sticks, prepare Monday's news ring, tidy the reading corner",
      contactTime: "07:30–13:00 teaching, aftercare Mon/Wed 13:00–15:30",
      deadlines: "Report comments due Thursday 12:00; parent evening Wednesday 17:00",
      energy: "Very full — protect my evenings",
      role: "Class teacher",
    },
    sampleOutput: `**Reality check:** the report comments plus laminating are the two big blocks. Everything fits *only* if the laminating moves to a learner-friendly activity slot and the glue sticks become someone else's errand.

### Priorities
**Do first (urgent + important)**
- 12 term report comments — due Thursday 12:00
- Phone the two parents about absences (before parent evening, so it isn't awkward)

**Schedule**
- Friday's lesson plan
- Mark 32 phonics worksheets
- Monday's news ring prep

**Quick wins (under 10 minutes)**
- Tidy the reading corner
- Write the glue-stick request on the office list

**Let go / delegate**
- Cutting and laminating shape cards → cutting is a fine-motor activity, let the children cut; you laminate during aftercare
- Buying glue sticks → office/stock request, not your errand

### Time-blocked week
**Monday**
- 13:00–13:30 (aftercare, quiet) — mark 16 worksheets
- 15:40–16:00 — phone parent 1

**Tuesday**
- 10:15–10:35 break — 4 report comments
- 13:15–14:00 — 4 more report comments (best focus block of the week)

**Wednesday**
- 07:00–07:25 before school — phone parent 2
- 13:00–13:40 — final 4 report comments, then read them once through
- 17:00 — parent evening (nothing else booked after)

**Thursday**
- 09:00 — submit report comments
- 13:00–13:30 — mark the remaining 16 worksheets
- 13:30–13:45 — laminate the shape cards the children cut

**Friday**
- 12:30–13:00 — plan Friday-next-week + Monday's news ring together (same headspace)
- 13:00–13:10 — reading corner tidy with two learner helpers

### Time savers
1. **Batch the two parent calls into the same mindset**, but keep them on different days so a long first call doesn't push the second.
2. **Mark in two halves of 16**, not one block of 32 — accuracy drops badly after about 20 minutes of marking.
3. **Plan Friday's lesson and Monday's news ring in one sitting**; you are already in planning mode and it saves a whole set-up.

### If the week goes wrong
Drop the reading corner and the laminating. Protect only: report comments (Thursday), both parent calls (before Wednesday 17:00), and Friday's lesson plan.`,
  },
  {
    id: "research",
    name: "Research & resource helper",
    tagline: "Understand it quickly, then use it tomorrow.",
    problem:
      "A parent asks about dyslexia signs, or a workshop mentions phonological awareness, and the honest answer is 'I need to read up'. Reading up takes an evening you don't have.",
    saves: "≈35 minutes per topic",
    icon: "search",
    role:
      "You are an early-childhood education specialist who explains research and terminology in plain language for practitioners and parents, and always separates well-established practice from things that need a professional's input.",
    outputFormat: [
      "A plain-language explanation, no jargon (or jargon explained on the spot)",
      "Why it matters for this age group",
      "5 key takeaways",
      "3–5 concrete activities or next steps that can be used this week",
      "What to watch out for / common misunderstandings",
      "When to refer to a professional",
      "What to verify, and the kind of source to verify it with",
    ],
    fields: [
      {
        id: "topic",
        label: "Topic or question",
        type: "textarea",
        rows: 3,
        placeholder:
          "What are early signs of reading difficulty in Grade R, and what can I do in class before referring?",
        required: true,
      },
      {
        id: "audience",
        label: "Explain it for",
        type: "select",
        options: [
          "Me, the teacher",
          "A parent with no education background",
          "An ECD practitioner in training",
          "A learner (age-appropriate)",
          "School management",
        ],
        required: true,
      },
      {
        id: "depth",
        label: "How deep",
        type: "select",
        options: ["Quick overview (2 minutes)", "Working understanding", "Thorough, with nuance"],
        required: true,
      },
      {
        id: "context",
        label: "Your context",
        type: "textarea",
        rows: 2,
        placeholder: "South African public school, Grade R, 34 learners, limited resources",
      },
      {
        id: "text",
        label: "Article or document to summarise (optional)",
        type: "textarea",
        rows: 5,
        placeholder: "Paste the text here and it will be summarised instead of answered from general knowledge.",
      },
    ],
    sample: {
      topic:
        "What are the early signs of reading difficulty in Grade R, and what can I do in class before referring a child?",
      audience: "Me, the teacher",
      depth: "Working understanding",
      context: "South African public school, Grade R, 34 learners, limited resources, isiZulu home language learners",
      text: "",
    },
    sampleOutput: `### In plain language
Most Grade R children who look "behind" in reading are not struggling with reading yet — they are struggling with *hearing the sounds inside words*. That skill is called **phonological awareness**: noticing that "cat" starts with /k/, rhymes with "hat", and can be broken into three sounds. Children build it through talking, singing and rhyming long before they read. When it is weak, letters and words stay meaningless shapes.

### Why it matters at this age
Grade R is the window where sound awareness is cheap to build and expensive to skip. A child who leaves Grade R unable to hear beginning sounds usually arrives in Grade 1 already behind, and the gap widens each year.

### Five key takeaways
1. Sound awareness comes before letters, not after.
2. Difficulty hearing rhyme and beginning sounds by mid-Grade R is the clearest early warning sign.
3. A child learning in a second language may look delayed while actually developing normally — check the skill in their home language too.
4. Short daily practice (5–10 minutes) beats one long weekly session.
5. Family history of reading difficulty is a real risk factor worth asking about, kindly.

### Signs worth noting in class
- Cannot hear or produce rhymes by mid-year
- Cannot tell you what sound a word starts with, even after modelling
- Confuses very similar sounds (/s/ and /sh/, /b/ and /d/) well past the class average
- Struggles to remember letter sounds taught repeatedly
- Avoids book and writing activities, or becomes tearful during them
- Speech is noticeably less clear than peers of the same age

### What to try this week
1. **Rhyme of the day** — one rhyming pair in the morning ring, children clap when they hear a match.
2. **Sound of the week hunt** — children find classroom objects starting with one sound.
3. **Clap the syllables** in every child's name at register time (free, takes two minutes).
4. **Home-language check** — ask a colleague or parent to test rhyme and first sounds in isiZulu. Weak in both languages is a flag; strong in home language usually means it is a language-exposure issue, not a reading disorder.
5. **Keep a simple two-week observation note** per child of concern: date, what you tried, what happened.

### Common misunderstandings
- "He'll catch up in Grade 1." Sometimes, but waiting costs the cheapest year of intervention.
- "It's dyslexia." A Grade R teacher cannot and should not diagnose dyslexia; you describe what you see.
- "More worksheets will fix it." Sound work is spoken, not written.

### When to refer
Refer for a professional assessment when a child shows several signs, is weak in their home language too, and has not moved after roughly six to eight weeks of consistent daily sound work — or immediately if speech clarity or hearing is a concern. Speech-language therapist or educational psychologist via your school's support structure; in a public school this normally goes through the school-based support team and district office.

### Verify before you rely on this
Check the specific Grade R phonics sequence and referral route against your **current CAPS Home Language documents** and your **district's screening and referral procedure** — these differ by province and change. Any statement here about what a diagnosis means should be confirmed by a qualified therapist or psychologist.`,
  },
];

export const TOOL_BY_ID: Record<ToolId, ToolSpec> = TOOL_SPECS.reduce(
  (acc, spec) => ({ ...acc, [spec.id]: spec }),
  {} as Record<ToolId, ToolSpec>,
);

const RESPONSIBLE_AI_RULES = [
  "Never invent facts about a specific child, family, school or policy. If something is not given, say what is missing.",
  "Flag any curriculum or policy claim as needing the educator's own verification against current CAPS or school documents.",
  "Do not diagnose learning disorders, medical or mental-health conditions. Describe observations and suggest the correct referral path.",
  "Keep language respectful of the child and the family; never blame a parent's circumstances.",
  "Use only the resources, time and group size the educator says they have.",
  "Write for a South African schooling context (CAPS, Grade R, Foundation Phase, terms) unless told otherwise.",
];

/** Builds the exact structured prompt sent to the model. Shown to the user. */
export function buildPrompt(spec: ToolSpec, values: Record<string, string>) {
  const filled = spec.fields
    .filter((field) => (values[field.id] ?? "").trim().length > 0)
    .map((field) => `- ${field.label}: ${values[field.id]!.trim()}`)
    .join("\n");

  const system = [
    `# ROLE`,
    spec.role,
    ``,
    `# TASK`,
    spec.tagline,
    ``,
    `# OUTPUT FORMAT`,
    `Respond in markdown with these sections, in this order:`,
    ...spec.outputFormat.map((line, i) => `${i + 1}. ${line}`),
    ``,
    `# RULES (responsible use)`,
    ...RESPONSIBLE_AI_RULES.map((rule) => `- ${rule}`),
    ``,
    `# STYLE`,
    `Practical, warm and concrete. No filler, no preamble, no "as an AI". Start directly with the first section.`,
  ].join("\n");

  const user = [`# CONTEXT PROVIDED BY THE EDUCATOR`, filled || "- (nothing provided yet)"].join("\n");

  return { system, user };
}
