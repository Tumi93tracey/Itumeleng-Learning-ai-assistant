/**
 * South African subject-choice, APS and study-programme data.
 * Pure data + pure helpers — safe to import on client and server.
 *
 * IMPORTANT: entry requirements change yearly. Every result in the UI must
 * carry a reminder to confirm on the university's own prospectus.
 */

export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** NSC 7-point achievement scale. */
export const NSC_SCALE: { level: Level; label: string; min: number; max: number }[] = [
  { level: 7, label: "Outstanding achievement", min: 80, max: 100 },
  { level: 6, label: "Meritorious achievement", min: 70, max: 79 },
  { level: 5, label: "Substantial achievement", min: 60, max: 69 },
  { level: 4, label: "Adequate achievement", min: 50, max: 59 },
  { level: 3, label: "Moderate achievement", min: 40, max: 49 },
  { level: 2, label: "Elementary achievement", min: 30, max: 39 },
  { level: 1, label: "Not achieved", min: 0, max: 29 },
];

export function percentToLevel(percent: number): Level {
  const found = NSC_SCALE.find((band) => percent >= band.min && percent <= band.max);
  return (found?.level ?? 1) as Level;
}

/* ---------------------------------------------------------------- subjects */

export type SubjectKey =
  | "home-language"
  | "fal"
  | "maths"
  | "maths-lit"
  | "life-orientation"
  | "physical-sciences"
  | "life-sciences"
  | "geography"
  | "history"
  | "accounting"
  | "business-studies"
  | "economics"
  | "cat"
  | "it"
  | "tourism"
  | "consumer-studies"
  | "visual-arts"
  | "egd";

export type Subject = {
  key: SubjectKey;
  name: string;
  /** Compulsory subjects every NSC learner takes. */
  compulsory?: boolean;
  /** Grouping used by the subject-choice adviser. */
  stream: "language" | "maths" | "core" | "science" | "commerce" | "humanities" | "creative";
};

export const SUBJECTS: Subject[] = [
  { key: "home-language", name: "Home Language", compulsory: true, stream: "language" },
  { key: "fal", name: "First Additional Language", compulsory: true, stream: "language" },
  { key: "life-orientation", name: "Life Orientation", compulsory: true, stream: "core" },
  { key: "maths", name: "Mathematics", stream: "maths" },
  { key: "maths-lit", name: "Mathematical Literacy", stream: "maths" },
  { key: "physical-sciences", name: "Physical Sciences", stream: "science" },
  { key: "life-sciences", name: "Life Sciences", stream: "science" },
  { key: "geography", name: "Geography", stream: "humanities" },
  { key: "history", name: "History", stream: "humanities" },
  { key: "accounting", name: "Accounting", stream: "commerce" },
  { key: "business-studies", name: "Business Studies", stream: "commerce" },
  { key: "economics", name: "Economics", stream: "commerce" },
  { key: "cat", name: "Computer Applications Technology", stream: "science" },
  { key: "it", name: "Information Technology", stream: "science" },
  { key: "tourism", name: "Tourism", stream: "commerce" },
  { key: "consumer-studies", name: "Consumer Studies", stream: "creative" },
  { key: "visual-arts", name: "Visual Arts", stream: "creative" },
  { key: "egd", name: "Engineering Graphics and Design", stream: "science" },
];

export const SUBJECT_BY_KEY: Record<SubjectKey, Subject> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.key, subject]),
) as Record<SubjectKey, Subject>;

/* ------------------------------------------------------------- APS scoring */

export type SubjectMark = { key: SubjectKey; percent: number };

export type ApsResult = {
  /** APS from the best six subjects, excluding Life Orientation. */
  aps: number;
  /** APS including Life Orientation (some institutions count it). */
  apsWithLo: number;
  counted: { key: SubjectKey; name: string; percent: number; level: Level }[];
  excluded: { key: SubjectKey; name: string; percent: number; level: Level; reason: string }[];
  levels: Partial<Record<SubjectKey, Level>>;
  /** Minimum NSC pass and bachelor-pass checks. */
  bachelorPass: boolean;
  bachelorNotes: string[];
};

export function calculateAps(marks: SubjectMark[]): ApsResult {
  const scored = marks
    .filter((mark) => Number.isFinite(mark.percent))
    .map((mark) => ({
      key: mark.key,
      name: SUBJECT_BY_KEY[mark.key]?.name ?? mark.key,
      percent: mark.percent,
      level: percentToLevel(mark.percent),
    }));

  const levels: Partial<Record<SubjectKey, Level>> = {};
  for (const entry of scored) levels[entry.key] = entry.level;

  const withoutLo = scored.filter((entry) => entry.key !== "life-orientation");
  const ranked = [...withoutLo].sort((a, b) => b.level - a.level || b.percent - a.percent);
  const counted = ranked.slice(0, 6);
  const countedKeys = new Set(counted.map((entry) => entry.key));

  const excluded = scored
    .filter((entry) => !countedKeys.has(entry.key))
    .map((entry) => ({
      ...entry,
      reason:
        entry.key === "life-orientation"
          ? "Life Orientation is left out of the standard APS at most universities."
          : "Only your best six subjects (excluding Life Orientation) are counted.",
    }));

  const aps = counted.reduce((total, entry) => total + entry.level, 0);
  const lo = scored.find((entry) => entry.key === "life-orientation");
  const apsWithLo = aps + (lo ? lo.level : 0);

  // Bachelor pass (degree admission) basics.
  const notes: string[] = [];
  const homeLanguage = levels["home-language"];
  if (homeLanguage !== undefined && homeLanguage < 4) {
    notes.push("A bachelor pass needs at least 50% (level 4) in your Home Language.");
  }
  const fourPlus = withoutLo.filter((entry) => entry.level >= 4).length;
  if (fourPlus < 4) {
    notes.push("A bachelor pass needs 50% or more in four recognised subjects — you have " + fourPlus + ".");
  }
  const bachelorPass = notes.length === 0 && withoutLo.length >= 6;
  if (!bachelorPass && withoutLo.length < 6) {
    notes.push("Enter all seven subjects for an accurate result.");
  }

  return { aps, apsWithLo, counted, excluded, levels, bachelorPass, bachelorNotes: notes };
}

/* --------------------------------------------------------------- interests */

export type InterestKey =
  | "numbers"
  | "science"
  | "people"
  | "words"
  | "business"
  | "hands"
  | "tech"
  | "creative";

export const INTERESTS: { key: InterestKey; label: string; description: string }[] = [
  { key: "numbers", label: "Working with numbers", description: "Patterns, problem solving, calculations." },
  { key: "science", label: "How the body and nature work", description: "Experiments, health, the environment." },
  { key: "people", label: "Helping and teaching people", description: "Children, communities, care, counselling." },
  { key: "words", label: "Reading, writing and languages", description: "Stories, debate, explaining ideas." },
  { key: "business", label: "Money and business", description: "Selling, budgets, running things." },
  { key: "hands", label: "Building and fixing things", description: "Machines, drawing plans, practical work." },
  { key: "tech", label: "Computers and technology", description: "Coding, apps, data, gadgets." },
  { key: "creative", label: "Art, design and creating", description: "Drawing, making, performing, styling." },
];

export type SubjectPackage = {
  id: string;
  name: string;
  summary: string;
  subjects: SubjectKey[];
  keepsOpen: string[];
  interests: InterestKey[];
  warning?: string;
};

export const SUBJECT_PACKAGES: SubjectPackage[] = [
  {
    id: "science",
    name: "Science stream",
    summary:
      "Mathematics, Physical Sciences and Life Sciences. The widest door into health, engineering and science degrees.",
    subjects: ["maths", "physical-sciences", "life-sciences", "geography"],
    keepsOpen: ["Medicine and health sciences", "Engineering", "BSc degrees", "Teaching (maths/science)"],
    interests: ["science", "numbers", "hands", "tech"],
    warning:
      "Demanding: only choose it if you can commit real study time to Maths and Physical Sciences every week.",
  },
  {
    id: "commerce",
    name: "Commerce stream",
    summary: "Mathematics with Accounting, Business Studies or Economics — the route into business degrees.",
    subjects: ["maths", "accounting", "business-studies", "economics"],
    keepsOpen: ["BCom (Accounting, Finance, Marketing)", "Chartered Accountancy", "Law", "Teaching (commerce)"],
    interests: ["numbers", "business", "words"],
  },
  {
    id: "humanities",
    name: "Humanities stream",
    summary:
      "History or Geography with languages and Life Sciences — strong for teaching, law, social work and psychology.",
    subjects: ["history", "geography", "life-sciences", "maths-lit"],
    keepsOpen: ["Education (ECD & Foundation Phase)", "Social work", "BA and Psychology", "Law"],
    interests: ["people", "words", "creative"],
    warning:
      "With Mathematical Literacy instead of Mathematics, most BCom, BSc, engineering and health-science degrees close.",
  },
  {
    id: "tech",
    name: "Technology stream",
    summary: "Mathematics with Information Technology and Engineering Graphics and Design.",
    subjects: ["maths", "it", "egd", "physical-sciences"],
    keepsOpen: ["Computer Science and IT", "Engineering", "Data and software careers"],
    interests: ["tech", "hands", "numbers"],
  },
  {
    id: "creative",
    name: "Creative and services stream",
    summary: "Visual Arts, Consumer Studies or Tourism with languages — practical, people-facing careers.",
    subjects: ["visual-arts", "consumer-studies", "tourism", "maths-lit"],
    keepsOpen: ["Design and fine art", "Hospitality and tourism", "Early childhood care", "Fashion"],
    interests: ["creative", "people", "business"],
  },
];

export function recommendPackages(selected: InterestKey[], comfortableWithMaths: boolean) {
  return SUBJECT_PACKAGES.map((pkg) => {
    const overlap = pkg.subjects.includes("maths") && !comfortableWithMaths ? -1 : 0;
    const matches = pkg.interests.filter((interest) => selected.includes(interest)).length;
    return { pkg, score: matches * 2 + overlap };
  })
    .sort((a, b) => b.score - a.score)
    .filter((entry) => entry.score > 0 || selected.length === 0);
}

/* -------------------------------------------------------------- programmes */

export type Programme = {
  id: string;
  name: string;
  field:
    | "Health sciences"
    | "Engineering"
    | "Science"
    | "Commerce"
    | "Education"
    | "Law & humanities"
    | "IT"
    | "Social services";
  minAps: number;
  /** Subject minimum levels required for admission. */
  requires: { key: SubjectKey; level: Level }[];
  /** Nice-to-have but not required. */
  recommended?: string;
  universities: string[];
  careers: string;
};

export const UNIVERSITIES: Record<string, { name: string; city: string; site: string }> = {
  wits: { name: "University of the Witwatersrand", city: "Johannesburg", site: "wits.ac.za" },
  up: { name: "University of Pretoria", city: "Pretoria", site: "up.ac.za" },
  uj: { name: "University of Johannesburg", city: "Johannesburg", site: "uj.ac.za" },
  uct: { name: "University of Cape Town", city: "Cape Town", site: "uct.ac.za" },
  su: { name: "Stellenbosch University", city: "Stellenbosch", site: "sun.ac.za" },
  ukzn: { name: "University of KwaZulu-Natal", city: "Durban", site: "ukzn.ac.za" },
  nwu: { name: "North-West University", city: "Potchefstroom", site: "nwu.ac.za" },
  unisa: { name: "University of South Africa (distance)", city: "Nationwide", site: "unisa.ac.za" },
  tut: { name: "Tshwane University of Technology", city: "Pretoria", site: "tut.ac.za" },
  vut: { name: "Vaal University of Technology", city: "Vanderbijlpark", site: "vut.ac.za" },
  ufs: { name: "University of the Free State", city: "Bloemfontein", site: "ufs.ac.za" },
  ul: { name: "University of Limpopo", city: "Polokwane", site: "ul.ac.za" },
};

export const PROGRAMMES: Programme[] = [
  {
    id: "mbchb",
    name: "MBChB (Medicine)",
    field: "Health sciences",
    minAps: 38,
    requires: [
      { key: "maths", level: 6 },
      { key: "physical-sciences", level: 6 },
      { key: "life-sciences", level: 5 },
      { key: "home-language", level: 5 },
    ],
    recommended: "Places are extremely limited; most faculties also use the NBT and a selection score.",
    universities: ["wits", "up", "uct", "su", "ukzn", "ufs", "ul"],
    careers: "Doctor, specialist, public-health practitioner.",
  },
  {
    id: "nursing",
    name: "Bachelor of Nursing",
    field: "Health sciences",
    minAps: 26,
    requires: [
      { key: "life-sciences", level: 4 },
      { key: "maths-lit", level: 4 },
      { key: "home-language", level: 4 },
    ],
    recommended: "Mathematics level 3 is accepted instead of Mathematical Literacy at most institutions.",
    universities: ["uj", "up", "ukzn", "nwu", "ufs", "unisa"],
    careers: "Registered nurse, midwife, clinic manager.",
  },
  {
    id: "physio",
    name: "BSc Physiotherapy",
    field: "Health sciences",
    minAps: 32,
    requires: [
      { key: "maths", level: 5 },
      { key: "life-sciences", level: 5 },
      { key: "physical-sciences", level: 4 },
    ],
    universities: ["wits", "up", "uct", "su", "ukzn"],
    careers: "Physiotherapist in hospitals, sport or private practice.",
  },
  {
    id: "beng",
    name: "BEng / BSc Engineering",
    field: "Engineering",
    minAps: 33,
    requires: [
      { key: "maths", level: 6 },
      { key: "physical-sciences", level: 5 },
      { key: "home-language", level: 4 },
    ],
    universities: ["wits", "up", "uct", "su", "uj", "nwu", "ukzn"],
    careers: "Civil, mechanical, electrical, mining or chemical engineer.",
  },
  {
    id: "beng-tech",
    name: "Bachelor of Engineering Technology",
    field: "Engineering",
    minAps: 26,
    requires: [
      { key: "maths", level: 4 },
      { key: "physical-sciences", level: 4 },
    ],
    recommended: "Offered at universities of technology — a strong route if your APS is below the BEng cut-off.",
    universities: ["tut", "vut", "uj"],
    careers: "Engineering technologist, technician, site supervisor.",
  },
  {
    id: "bsc",
    name: "BSc (Mathematical, Physical or Life Sciences)",
    field: "Science",
    minAps: 28,
    requires: [
      { key: "maths", level: 5 },
      { key: "physical-sciences", level: 4 },
    ],
    recommended: "Life Sciences can replace Physical Sciences for biological-science streams.",
    universities: ["wits", "up", "uj", "uct", "su", "nwu", "ukzn", "ufs", "unisa"],
    careers: "Scientist, researcher, analyst, science teacher.",
  },
  {
    id: "bcom-acc",
    name: "BCom Accounting (CA route)",
    field: "Commerce",
    minAps: 32,
    requires: [
      { key: "maths", level: 5 },
      { key: "home-language", level: 4 },
    ],
    recommended: "Accounting at school helps but is not required everywhere.",
    universities: ["wits", "up", "uj", "uct", "su", "nwu", "ukzn", "unisa"],
    careers: "Chartered accountant, auditor, financial manager.",
  },
  {
    id: "bcom-gen",
    name: "BCom (General, Marketing, Management)",
    field: "Commerce",
    minAps: 26,
    requires: [
      { key: "maths", level: 4 },
      { key: "home-language", level: 4 },
    ],
    universities: ["uj", "up", "nwu", "ukzn", "ufs", "unisa", "tut"],
    careers: "Marketer, HR practitioner, business manager, entrepreneur.",
  },
  {
    id: "bed-foundation",
    name: "BEd Foundation Phase / Early Childhood",
    field: "Education",
    minAps: 24,
    requires: [
      { key: "home-language", level: 4 },
      { key: "fal", level: 3 },
      { key: "maths-lit", level: 4 },
    ],
    recommended:
      "Mathematics level 3 also qualifies. This is the route Itumeleng recommends for anyone who loves working with young children.",
    universities: ["uj", "up", "unisa", "nwu", "ukzn", "ufs", "wits"],
    careers: "Grade R–3 teacher, ECD centre manager, remedial and literacy specialist.",
  },
  {
    id: "bed-fet",
    name: "BEd Senior Phase & FET",
    field: "Education",
    minAps: 26,
    requires: [
      { key: "home-language", level: 4 },
      { key: "maths-lit", level: 4 },
    ],
    recommended: "Choose two school subjects as teaching majors — Maths and Science majors are in high demand.",
    universities: ["uj", "up", "unisa", "nwu", "ukzn", "ufs"],
    careers: "High-school teacher, subject head, curriculum adviser.",
  },
  {
    id: "llb",
    name: "LLB (Law)",
    field: "Law & humanities",
    minAps: 30,
    requires: [
      { key: "home-language", level: 5 },
      { key: "fal", level: 4 },
    ],
    recommended: "Strong reading and writing marks matter more than Mathematics here.",
    universities: ["wits", "up", "uj", "uct", "su", "ukzn", "unisa", "nwu"],
    careers: "Attorney, advocate, legal adviser, prosecutor.",
  },
  {
    id: "ba",
    name: "BA (Languages, Psychology, Media)",
    field: "Law & humanities",
    minAps: 24,
    requires: [
      { key: "home-language", level: 4 },
      { key: "fal", level: 3 },
    ],
    universities: ["uj", "up", "wits", "unisa", "nwu", "ukzn", "ufs"],
    careers: "Psychologist (with postgraduate study), journalist, translator, HR.",
  },
  {
    id: "social-work",
    name: "Bachelor of Social Work",
    field: "Social services",
    minAps: 26,
    requires: [
      { key: "home-language", level: 4 },
      { key: "maths-lit", level: 3 },
    ],
    universities: ["uj", "up", "unisa", "nwu", "ukzn", "ufs", "ul"],
    careers: "Social worker, child-protection officer, community development worker.",
  },
  {
    id: "bsc-it",
    name: "BSc / BCom Information Technology",
    field: "IT",
    minAps: 28,
    requires: [
      { key: "maths", level: 5 },
      { key: "home-language", level: 4 },
    ],
    recommended: "Information Technology or CAT at school is helpful, not compulsory.",
    universities: ["uj", "up", "wits", "nwu", "unisa", "tut"],
    careers: "Software developer, data analyst, systems engineer.",
  },
  {
    id: "dip-it",
    name: "Diploma in Information Technology",
    field: "IT",
    minAps: 22,
    requires: [
      { key: "maths-lit", level: 4 },
      { key: "home-language", level: 3 },
    ],
    recommended: "A practical, quicker route into tech work that can bridge into a degree later.",
    universities: ["tut", "vut", "unisa"],
    careers: "Support technician, junior developer, network administrator.",
  },
];

export type Match = {
  programme: Programme;
  status: "qualify" | "close" | "not-yet";
  apsGap: number;
  unmet: { name: string; needLevel: Level; haveLevel: Level | null }[];
};

export function matchProgrammes(aps: number, levels: Partial<Record<SubjectKey, Level>>): Match[] {
  return PROGRAMMES.map((programme) => {
    const unmet = programme.requires
      .map((requirement) => {
        let have = levels[requirement.key] ?? null;
        // Mathematics may substitute for Mathematical Literacy requirements.
        if (requirement.key === "maths-lit" && levels["maths"] !== undefined) {
          have = Math.max(levels["maths"] as number, (have ?? 0) as number) as Level;
        }
        return {
          name: SUBJECT_BY_KEY[requirement.key].name,
          needLevel: requirement.level,
          haveLevel: have,
        };
      })
      .filter((entry) => entry.haveLevel === null || entry.haveLevel < entry.needLevel);

    const apsGap = programme.minAps - aps;
    const status: Match["status"] =
      apsGap <= 0 && unmet.length === 0
        ? "qualify"
        : apsGap <= 3 && unmet.length <= 1
          ? "close"
          : "not-yet";

    return { programme, status, apsGap, unmet };
  }).sort((a, b) => {
    const order = { qualify: 0, close: 1, "not-yet": 2 } as const;
    return order[a.status] - order[b.status] || a.programme.minAps - b.programme.minAps;
  });
}

export const CAREER_DISCLAIMER =
  "This is a planning guide, not an admission decision. Universities change their minimum APS and subject requirements every year, and many programmes also use selection tests, portfolios or interviews. Always confirm on the university's own prospectus before you apply.";
