import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clipboard,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Home,
  Info,
  LayoutList,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  PenLine,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  Send,
  ShieldCheck,
  Target,
  Trophy,
  Upload,
  UserRound,
  Users,
  Video,
  Volleyball,
  X
} from "lucide-react";

const MAIN_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "matches", label: "Find Schools", icon: Target },
  { id: "directory", label: "College Directory", icon: Building2 },
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "email", label: "Email Builder", icon: MessageSquareText },
  { id: "outreach", label: "Outreach", icon: Send },
  { id: "timeline", label: "Recruiting Plan", icon: CalendarDays }
];

const TOOL_NAV = [{ id: "jump", label: "Jump Test", icon: Activity }];
const ROUTES = [...MAIN_NAV, ...TOOL_NAV].map((item) => item.id);
const PROFILE_SCHEMA_VERSION = "5";
const publicUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const DEFAULT_PROFILE = {
  name: "",
  gradYear: "",
  location: "",
  athleteEmail: "",
  phone: "",
  position: "",
  playerRole: "",
  height: "",
  vertical: "",
  standingReach: "",
  approachTouch: "",
  gpaUW: "",
  gpaWeighted: "",
  satStatus: "",
  satScore: "",
  academicInterests: "",
  club: "",
  clubTeam: "",
  clubRole: "",
  highSchool: "",
  schoolRole: "",
  awards: "",
  jersey: "",
  universityProfile: "",
  highlightVideo: "",
  fullMatchVideo: "",
  coachName: "",
  coachEmail: "",
  coachPhone: "",
  schedule: [{ event: "", date: "", location: "", details: "" }]
};

const DEMO_PROFILE = {
  name: "Jordan Lee",
  gradYear: "2028",
  location: "Southern California",
  athleteEmail: "jordan.lee@example.com",
  phone: "(310) 555-0148",
  position: "Outside Hitter",
  playerRole: "Six-rotation",
  height: "6'2\"",
  vertical: "34.5\"",
  standingReach: "97.5\"",
  approachTouch: "132\"",
  gpaUW: "3.9",
  gpaWeighted: "4.4",
  satStatus: "Scheduled",
  satScore: "",
  academicInterests: "Computer science and applied mathematics",
  club: "Pacific Boys Volleyball",
  clubTeam: "18-1",
  clubRole: "Starter",
  highSchool: "Westview High School",
  schoolRole: "Varsity starter and captain",
  awards: "All-League First Team; Team MVP",
  jersey: "11",
  universityProfile: "https://example.com/athlete-profile",
  highlightVideo: "https://example.com/highlights",
  fullMatchVideo: "https://example.com/full-match",
  coachName: "Coach Taylor Morgan",
  coachEmail: "coach.morgan@example.com",
  coachPhone: "(310) 555-0182",
  schedule: [{ event: "SoCal Boys Invitational", date: "2026-10-17", location: "Anaheim, CA", details: "Jersey #11; schedule pending" }]
};

const PROFILE_TABS = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "athletics", label: "Athletics", icon: Trophy },
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "links", label: "Film & links", icon: Video },
  { id: "schedule", label: "Schedule", icon: CalendarDays }
];

const FIELD_TO_TAB = {
  name: "personal", gradYear: "personal", location: "personal", athleteEmail: "personal", phone: "personal",
  position: "athletics", playerRole: "athletics", height: "athletics", vertical: "athletics", standingReach: "athletics", approachTouch: "athletics", club: "athletics", clubTeam: "athletics", clubRole: "athletics", highSchool: "athletics", schoolRole: "athletics", awards: "athletics", jersey: "athletics",
  gpaUW: "academics", gpaWeighted: "academics", satStatus: "academics", satScore: "academics", academicInterests: "academics",
  universityProfile: "links", highlightVideo: "links", fullMatchVideo: "links", coachName: "links", coachEmail: "links", coachPhone: "links",
  schedule: "schedule"
};

const PROFILE_STEPS = [
  { id: "personal", title: "Personal and contact", detail: "Name, class year, region, email and phone", icon: UserRound, fields: ["name", "gradYear", "location", "athleteEmail", "phone"] },
  { id: "athletics", title: "Athletic profile", detail: "Position, measurements, teams, role and jersey", icon: Ruler, fields: ["position", "playerRole", "height", "vertical", "standingReach", "approachTouch", "club", "clubTeam", "clubRole", "jersey", "highSchool", "schoolRole"] },
  { id: "academics", title: "Academic profile", detail: "Unweighted GPA, weighted GPA and academic interests", icon: GraduationCap, fields: ["gpaUW", "gpaWeighted", "academicInterests"] },
  { id: "links", title: "Film and coach contact", detail: "Highlights plus a current coach who can be contacted", icon: Video, fields: ["highlightVideo", "coachName", "coachEmail"] }
];

const REQUIRED_PROFILE_FIELDS = PROFILE_STEPS.flatMap((step) => step.fields);

const PROFILE_FIELD_LABELS = {
  name: "Full name", gradYear: "Graduation year", location: "Home region", athleteEmail: "Athlete email", phone: "Athlete phone",
  position: "Primary position", playerRole: "Player role", height: "Height", vertical: "Vertical", standingReach: "Standing reach", approachTouch: "Approach touch / highest touch",
  club: "Club", clubTeam: "Club team", clubRole: "Club role", jersey: "Jersey number", highSchool: "High school", schoolRole: "School role",
  gpaUW: "Unweighted GPA", gpaWeighted: "Weighted GPA", academicInterests: "Academic interests", highlightVideo: "Highlight video", coachName: "Current coach name", coachEmail: "Current coach email"
};

const MATCH_QUESTIONS = [
  {
    id: "division",
    title: "Which competitive levels should be in your search?",
    note: "This directly filters the college directory.",
    options: [
      { label: "Division I only", value: "d1", detail: "Only NCAA Division I programs" },
      { label: "Division II and III", value: "d2d3", detail: "A wider NCAA search" },
      { label: "Division III only", value: "d3", detail: "Academics and DIII volleyball" },
      { label: "NAIA and junior college", value: "naia-jc", detail: "Include alternative pathways" },
      { label: "All levels", value: "all", detail: "Keep every pathway open" }
    ]
  },
  {
    id: "region",
    title: "Where are you genuinely willing to attend college?",
    note: "Programs outside this region will not appear in the first list.",
    options: [
      { label: "West", value: "West", detail: "Pacific, Mountain and Southwest states" },
      { label: "Northeast", value: "Northeast", detail: "New England through the Mid-Atlantic" },
      { label: "Midwest", value: "Midwest", detail: "Great Lakes and central states" },
      { label: "South", value: "South", detail: "Southeast and southern states" },
      { label: "Nationwide", value: "all", detail: "No geographic filter" }
    ]
  },
  {
    id: "contact",
    title: "Should every result have a coach email available?",
    note: "The source sheet is incomplete. This decides whether research-needed programs are included.",
    options: [
      { label: "Yes, email-ready only", value: "email", detail: "At least one listed coach email" },
      { label: "Include every program", value: "all", detail: "Show programs even when contact research is needed" }
    ]
  },
  {
    id: "size",
    title: "How broad should your first list be?",
    note: "This controls the number of actual schools returned.",
    options: [
      { label: "Focused list", value: 12, detail: "12 programs to research deeply" },
      { label: "Balanced list", value: 24, detail: "24 programs with room to compare" },
      { label: "Broad list", value: 40, detail: "40 programs for a wide first pass" }
    ]
  }
];

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local storage is a convenience for the prototype, not a hard dependency.
    }
  }, [key, value]);

  return [value, setValue];
}

function profilePercent(profile) {
  const complete = REQUIRED_PROFILE_FIELDS.filter((key) => String(profile[key] || "").trim()).length;
  return Math.round((complete / REQUIRED_PROFILE_FIELDS.length) * 100);
}

function profileFieldComplete(profile, key) {
  return Boolean(String(profile[key] || "").trim());
}

function profileStepComplete(profile, step) {
  return step.fields.every((key) => profileFieldComplete(profile, key));
}

function firstMissingField(profile, fields = REQUIRED_PROFILE_FIELDS) {
  return fields.find((key) => !profileFieldComplete(profile, key)) || "";
}

function emailCount(school) {
  return school?.coaches?.filter((coach) => coach.email).length || 0;
}

function schoolInitials(name = "") {
  return name.split(/\s+/).filter((word) => word && !["of", "the", "and", "-"].includes(word.toLowerCase())).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function coachGreeting(coaches = []) {
  const names = coaches.map((coach) => coach.lastName).filter(Boolean).filter((name, index, all) => all.indexOf(name) === index);
  if (!names.length) return "Coach [Last Name]";
  if (names.length === 1) return `Coach ${names[0]}`;
  if (names.length === 2) return `Coach ${names[0]} and Coach ${names[1]}`;
  return `${names.slice(0, -1).map((name) => `Coach ${name}`).join(", ")}, and Coach ${names.at(-1)}`;
}

function cleanValue(value, placeholder) {
  return String(value || "").trim() || `[Insert ${placeholder}]`;
}

function conciseSchoolName(school) {
  const fullName = school?.school || "[Insert school name]";
  const abbreviation = fullName.match(/\s-\s([A-Z][A-Z0-9.&-]{1,9})$/)?.[1];
  return abbreviation || fullName;
}

function buildRecruitingEmail(profile, school, researchNote, includeSchedule, includeCoach) {
  const emailSchool = conciseSchoolName(school);
  const division = school?.division || "[Insert division]";
  const conference = school?.conference || "[Insert conference]";
  const name = cleanValue(profile.name, "full name");
  const gradYear = cleanValue(profile.gradYear, "graduation year");
  const position = cleanValue(profile.position, "position");
  const role = profile.playerRole ? `${profile.playerRole} ` : "";
  const clubLine = [profile.club, profile.clubTeam].filter(Boolean).join(" ") || "[Insert club team]";
  const location = cleanValue(profile.location, "location");
  const note = String(researchNote || "").trim() || `[Insert something specific and unique about ${emailSchool} that shows genuine research and interest.]`;
  const bullets = [
    `- Class: ${gradYear}`,
    `- Position: ${role}${position}`,
    `- Height: ${cleanValue(profile.height, "height")}`,
    profile.approachTouch ? `- Approach touch: ${profile.approachTouch}` : null,
    profile.vertical ? `- Vertical: ${profile.vertical}` : null,
    `- GPA: ${cleanValue(profile.gpaUW, "unweighted GPA")}${profile.gpaWeighted ? ` UW (${profile.gpaWeighted} weighted)` : ""}`,
    profile.satScore ? `- SAT: ${profile.satScore}` : profile.satStatus ? `- SAT: ${profile.satStatus}` : null,
    profile.academicInterests ? `- Academic interests: ${profile.academicInterests}` : null,
    `- Club: ${clubLine}${profile.clubRole ? `, ${profile.clubRole}` : ""}`,
    `- School: ${profile.highSchool ? `${profile.schoolRole || "Varsity athlete"} - ${profile.highSchool}` : "[Insert high school and role]"}`,
    profile.awards ? `- Awards: ${profile.awards}` : null
  ].filter(Boolean).join("\n");

  const links = [
    profile.universityProfile ? `University Athlete profile: ${profile.universityProfile}` : null,
    profile.highlightVideo ? `Highlight videos: ${profile.highlightVideo}` : null,
    profile.fullMatchVideo ? `Full-match video: ${profile.fullMatchVideo}` : null
  ].filter(Boolean).join("\n");

  const events = (profile.schedule || []).filter((item) => item.event || item.date || item.location || item.details);
  const scheduleEntries = events.map((event, index) => `${events.length > 1 ? `${index + 1}. ` : ""}${event.event || "[Insert club tournament or school match]"}\n${[event.date, event.location].filter(Boolean).join(" | ") || "[Insert date and location]"}${event.details ? `\n${event.details}` : ""}`).join("\n\n");
  const scheduleSection = includeSchedule && events.length
    ? `\n\nUpcoming schedule:${profile.jersey ? `\nJersey: #${profile.jersey}` : ""}\n\n${scheduleEntries}\n\nIf you will be attending, I would appreciate the opportunity for you to watch me compete. I will send an update if the schedule or court assignments change.`
    : "";

  const coachSection = includeCoach && (profile.coachEmail || profile.coachPhone)
    ? `\n\nMy coach's contact information, if helpful:\n${profile.coachName || "[Insert coach name]"}\n${[profile.coachEmail, profile.coachPhone].filter(Boolean).join(" | ")}`
    : "";

  const conferenceLine = school
    ? `Competing in the ${conference} at the ${division} level while offering the academic environment I am looking for makes ${emailSchool} a program I am serious about exploring.`
    : "[Insert one sentence connecting the program's conference, competitive level, academics, or team culture to what you want.]";

  const subject = `${gradYear} ${position} | ${name} | ${emailSchool}`;
  const body = `${coachGreeting(school?.coaches)}:\n\nMy name is ${name}, and I am a Class of ${gradYear} ${role}${position} with ${clubLine} in ${location}. I am reaching out because ${note}\n\n${conferenceLine}\n\nHere is a quick snapshot of my background:\n${bullets}${scheduleSection}\n\n${links || "[Insert recruiting profile and highlight-video links]"}${coachSection}\n\nI would appreciate the opportunity to learn more about ${emailSchool}'s program and what you look for in future student-athletes. Thank you for your time and consideration. I hope to stay in touch.\n\nBest,\n${name}\nClass of ${gradYear}\n${position} | ${profile.club || "[Insert club]"}`;
  return { subject, body };
}

function Button({ children, icon: Icon, variant = "primary", className = "", ...props }) {
  return <button className={`r-button r-button-${variant} ${className}`} {...props}>{Icon ? <Icon size={17} /> : null}<span>{children}</span></button>;
}

function IconButton({ label, children, className = "", ...props }) {
  return <button className={`r-icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function Tag({ children, tone = "neutral" }) {
  return <span className={`r-tag r-tag-${tone}`}>{children}</span>;
}

function SchoolLogo({ school, size = "md" }) {
  const [failed, setFailed] = useState(false);
  const src = school?.domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(school.domain)}&sz=128` : "";
  return (
    <span className={`school-logo school-logo-${size}`}>
      <span>{schoolInitials(school?.school)}</span>
      {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : null}
    </span>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return <header className="r-page-header"><div><p className="r-eyebrow">{eyebrow}</p><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{action ? <div className="r-page-action">{action}</div> : null}</header>;
}

function Sidebar({ active, navigate, menuOpen, close, profile }) {
  const renderItem = (item) => {
    const Icon = item.icon;
    return <button key={item.id} className={`r-nav-item ${active === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><Icon size={18} /><span>{item.label}</span>{active === item.id ? <i /> : null}</button>;
  };
  return (
    <>
      <button className={`r-sidebar-scrim ${menuOpen ? "open" : ""}`} aria-label="Close navigation" onClick={close} />
      <aside className={`r-sidebar ${menuOpen ? "open" : ""}`}>
        <button className="r-brand" onClick={() => navigate("home")}><span><img src={publicUrl("assets/volleyreach-mark-light.svg")} alt="" /></span><strong>VolleyReach</strong></button>
        <button className="r-profile-switcher" onClick={() => navigate("profile")}>
          <span className="r-avatar">{profile.name ? schoolInitials(profile.name) : <UserRound size={15} />}</span><span><strong>{profile.name || "Your profile"}</strong><small>{profile.gradYear ? `Class of ${profile.gradYear}` : "Start your profile"}</small></span><ChevronRight size={16} />
        </button>
        <nav className="r-nav" aria-label="Main navigation"><p>Recruiting</p>{MAIN_NAV.map(renderItem)}<p className="r-nav-tools-label">Tools</p>{TOOL_NAV.map(renderItem)}</nav>
        <div className="r-directory-status"><ShieldCheck size={17} /><span><strong>293 programs imported</strong><small>Coach directory updated Aug 29</small></span></div>
      </aside>
    </>
  );
}

function SchoolCard({ school, saved, onSave, onEmail, expanded, onExpand }) {
  const contacts = emailCount(school);
  return (
    <article className={`school-card ${expanded ? "expanded" : ""}`}>
      <button className="school-card-main" onClick={onExpand}>
        <SchoolLogo school={school} />
        <span className="school-card-copy"><strong>{school.school}</strong><small><MapPin size={12} />{school.state} <i /> {school.conference || "Conference not listed"}</small></span>
        <span className="school-card-side"><Tag tone={school.division.includes("I") ? "blue" : "neutral"}>{school.division}</Tag><small>{contacts ? `${contacts} email${contacts === 1 ? "" : "s"}` : "Research needed"}</small></span>
        <ChevronDown size={17} />
      </button>
      {expanded ? (
        <div className="school-card-detail">
          <div className="coach-list">
            {school.coaches.map((coach, index) => <div key={`${coach.email}-${coach.lastName}-${index}`}><span className="coach-avatar">{`${coach.firstName?.[0] || ""}${coach.lastName?.[0] || ""}`}</span><span><strong>{[coach.firstName, coach.lastName].filter(Boolean).join(" ") || "Coach name unavailable"}</strong><small>{coach.position || "Coach"}</small></span><span className="coach-contact">{coach.email ? <a href={`mailto:${coach.email}`}>{coach.email}</a> : <small>Email not listed</small>}{coach.phone ? <small>{coach.phone}</small> : null}</span></div>)}
          </div>
          <div className="school-card-actions"><Button variant={saved ? "soft" : "secondary"} icon={saved ? Check : Plus} onClick={onSave}>{saved ? "Saved" : "Add to list"}</Button><Button icon={PenLine} onClick={onEmail}>Create email</Button></div>
        </div>
      ) : null}
    </article>
  );
}

function HomePage({ profile, saved, schoolsById, navigate }) {
  const percent = profilePercent(profile);
  const completedFields = REQUIRED_PROFILE_FIELDS.filter((key) => profileFieldComplete(profile, key)).length;
  const tasks = PROFILE_STEPS.filter((step) => !profileStepComplete(profile, step)).map((step) => ({ label: `Complete ${step.title.toLowerCase()}`, detail: step.detail, field: firstMissingField(profile, step.fields), icon: step.icon })).slice(0, 3);
  const savedSchools = saved.slice(0, 4).map((entry) => schoolsById[entry.schoolId]).filter(Boolean);

  return (
    <div className="r-page">
      <PageHeader eyebrow="Recruiting workspace" title={profile.name ? `Welcome back, ${profile.name.split(" ")[0]}.` : "Build your recruiting profile."} description="Complete your information, research real programs, and turn it into better outreach." action={<Button variant="secondary" icon={UserRound} onClick={() => navigate("profile")}>{percent === 100 ? "View profile" : "Complete profile"}</Button>} />
      <section className="r-home-hero">
        <div className="r-home-photo" />
        <div className="r-home-overlay" />
        <div className="r-home-copy"><Tag tone="light">{profile.gradYear ? `Class of ${profile.gradYear}` : "Profile setup"}</Tag><h2>Your recruiting process, organized from profile to follow-up.</h2><p>We will help write the email for you. First, complete the profile information that powers every factual section.</p><div><Button icon={Target} onClick={() => navigate("matches")}>Find schools</Button><Button variant="glass" icon={MessageSquareText} onClick={() => navigate("email")}>{percent === 100 ? "Build an email" : "See email steps"}</Button></div></div>
        <div className="r-home-progress"><span>Profile completion</span><strong>{percent}%</strong><i><b style={{ width: `${percent}%` }} /></i><small>{completedFields} of {REQUIRED_PROFILE_FIELDS.length} essentials</small></div>
      </section>

      <section className="r-stat-row">
        <div><span>Profile</span><strong>{percent}%</strong><small>essential fields complete</small></div>
        <div><span>Saved schools</span><strong>{saved.length}</strong><small>in your outreach list</small></div>
        <div><span>Emails logged</span><strong>{saved.reduce((sum, item) => sum + Number(item.sent || 0), 0)}</strong><small>sent outside the app</small></div>
        <div><span>Directory</span><strong>293</strong><small>men's programs imported</small></div>
      </section>

      <div className="r-home-grid">
        <section className="r-panel r-next-panel">
          <div className="r-panel-head"><div><p className="r-eyebrow">Next actions</p><h3>Finish the information coaches use</h3></div><Button variant="ghost" onClick={() => navigate("profile")}>Open profile</Button></div>
          <div className="r-task-list">
            {tasks.length ? tasks.map(({ label, detail, field, icon: Icon }) => <button key={field} onClick={() => navigate("profile", field)}><span><Icon size={18} /></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={17} /></button>) : <div className="r-complete-state"><CheckCircle2 size={24} /><div><strong>Your essential profile is complete.</strong><small>Keep links and schedule current before major events.</small></div></div>}
          </div>
        </section>
        <section className="r-panel r-saved-preview">
          <div className="r-panel-head"><div><p className="r-eyebrow">Your list</p><h3>Saved programs</h3></div><button className="r-text-link" onClick={() => navigate("outreach")}>See outreach <ChevronRight size={14} /></button></div>
          {savedSchools.length ? <div className="r-saved-stack">{savedSchools.map((school) => <button key={school.id} onClick={() => navigate("outreach")}><SchoolLogo school={school} size="sm" /><span><strong>{school.school}</strong><small>{school.division} / {school.state}</small></span><ChevronRight size={15} /></button>)}</div> : <div className="r-empty-mini"><Building2 size={24} /><strong>No schools saved yet</strong><small>Use Find Schools or search the directory.</small><Button variant="secondary" onClick={() => navigate("matches")}>Start matching</Button></div>}
        </section>
      </div>
      <section className="r-tool-note"><Activity size={20} /><div><strong>Athletic measurements are supporting evidence, not the product.</strong><p>Height, approach touch and vertical can strengthen a profile. The optional Jump Test helps estimate missing measurements, while the main workflow remains school research and outreach.</p></div><Button variant="secondary" onClick={() => navigate("jump")}>Open optional tool</Button></section>
    </div>
  );
}

function MatchesPage({ schools, savedIds, onSave, onEmail }) {
  const [answers, setAnswers] = useStoredState("vr2-match-answers", {});
  const [step, setStep] = useState(() => Math.min(Object.keys(answers).length, MATCH_QUESTIONS.length - 1));
  const [showResults, setShowResults] = useState(Object.keys(answers).length === MATCH_QUESTIONS.length);
  const [expanded, setExpanded] = useState(null);
  const question = MATCH_QUESTIONS[step];

  const results = useMemo(() => {
    if (!showResults) return [];
    const divisionMap = {
      d1: ["Division I"], d2d3: ["Division II", "Division III"], d3: ["Division III"],
      "naia-jc": ["NAIA", "Junior College", "CCCAA"], all: null
    };
    const allowed = divisionMap[answers.division];
    return schools.filter((school) => !allowed || allowed.includes(school.division))
      .filter((school) => answers.region === "all" || school.region === answers.region)
      .filter((school) => answers.contact !== "email" || emailCount(school) > 0)
      .sort((a, b) => emailCount(b) - emailCount(a) || a.school.localeCompare(b.school))
      .slice(0, Number(answers.size || 12));
  }, [answers, schools, showResults]);

  const choose = (value) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (step === MATCH_QUESTIONS.length - 1) setShowResults(true);
    else window.setTimeout(() => setStep((current) => current + 1), 130);
  };
  const restart = () => { setAnswers({}); setStep(0); setShowResults(false); };

  if (showResults) {
    return <div className="r-page"><PageHeader eyebrow="Find schools" title={`${results.length} actual programs match your filters.`} description="These are directory matches based on level, geography and contact availability. This is not an admissions or roster-opening prediction." action={<Button variant="secondary" icon={RotateCcw} onClick={restart}>Change filters</Button>} />
      <div className="r-filter-summary"><span><strong>Level</strong>{MATCH_QUESTIONS[0].options.find((option) => option.value === answers.division)?.label}</span><span><strong>Region</strong>{MATCH_QUESTIONS[1].options.find((option) => option.value === answers.region)?.label}</span><span><strong>Contacts</strong>{MATCH_QUESTIONS[2].options.find((option) => option.value === answers.contact)?.label}</span><span><strong>List size</strong>{answers.size} programs</span></div>
      <div className="r-school-list">{results.map((school) => <SchoolCard key={school.id} school={school} saved={savedIds.has(school.id)} onSave={() => onSave(school)} onEmail={() => onEmail(school)} expanded={expanded === school.id} onExpand={() => setExpanded(expanded === school.id ? null : school.id)} />)}</div>
      {!results.length ? <div className="r-empty-page"><Search size={30} /><h3>No programs match all four filters.</h3><p>Broaden the region or include schools whose coach email still needs research.</p><Button onClick={restart}>Change filters</Button></div> : null}
    </div>;
  }

  return <div className="r-page"><PageHeader eyebrow="Find schools" title="Only answer questions that change the list." description="Four filters. Every answer directly changes which real programs appear." />
    <section className="r-match-shell">
      <aside><span>{String(step + 1).padStart(2, "0")}<small>/ {String(MATCH_QUESTIONS.length).padStart(2, "0")}</small></span><i><b style={{ height: `${((step + 1) / MATCH_QUESTIONS.length) * 100}%`, "--match-progress": `${((step + 1) / MATCH_QUESTIONS.length) * 100}%` }} /></i><div><strong>{Math.round(((step + 1) / MATCH_QUESTIONS.length) * 100)}%</strong><small>Filters set</small></div></aside>
      <div className="r-match-question"><p className="r-eyebrow">Filter {step + 1}</p><AnimatePresence mode="wait"><motion.div key={question.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><h2>{question.title}</h2><p>{question.note}</p><div className="r-match-options">{question.options.map((option, index) => <button className={answers[question.id] === option.value ? "selected" : ""} key={option.label} onClick={() => choose(option.value)}><span>{String.fromCharCode(65 + index)}</span><span><strong>{option.label}</strong><small>{option.detail}</small></span>{answers[question.id] === option.value ? <Check size={18} /> : <ArrowRight size={18} />}</button>)}</div></motion.div></AnimatePresence><div className="r-match-footer"><Button variant="ghost" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Previous</Button><span>{Object.keys(answers).length} filters saved</span></div></div>
    </section>
  </div>;
}

function DirectoryPage({ schools, savedIds, onSave, onEmail, loading }) {
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const [region, setRegion] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const filtered = useMemo(() => schools.filter((school) => !search || `${school.school} ${school.state} ${school.conference}`.toLowerCase().includes(search.toLowerCase())).filter((school) => division === "all" || school.division === division).filter((school) => region === "all" || school.region === region), [schools, search, division, region]);
  return <div className="r-page"><PageHeader eyebrow="College directory" title="Real programs and the contacts currently available." description="Imported read-only from the shared men's volleyball coach sheet. Missing emails are labeled instead of guessed." action={<Tag tone="green"><ShieldCheck size={13} /> {schools.length || 293} programs</Tag>} />
    <div className="r-directory-toolbar"><label><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search school, state or conference" /></label><select value={division} onChange={(event) => setDivision(event.target.value)}><option value="all">All divisions</option>{["Division I", "Division II", "Division III", "NAIA", "Junior College", "CCCAA"].map((value) => <option key={value}>{value}</option>)}</select><select value={region} onChange={(event) => setRegion(event.target.value)}><option value="all">All regions</option>{["West", "Northeast", "Midwest", "South"].map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="r-directory-count"><span>{filtered.length} programs</span><small>{filtered.filter((school) => emailCount(school)).length} with at least one email</small></div>
    {loading ? <div className="r-empty-page"><RotateCcw className="spin" size={27} /><h3>Loading the directory</h3></div> : <div className="r-school-list">{filtered.slice(0, 60).map((school) => <SchoolCard key={school.id} school={school} saved={savedIds.has(school.id)} onSave={() => onSave(school)} onEmail={() => onEmail(school)} expanded={expanded === school.id} onExpand={() => setExpanded(expanded === school.id ? null : school.id)} />)}</div>}
    {filtered.length > 60 ? <p className="r-result-cap">Showing the first 60 results. Use search or filters to narrow the list.</p> : null}
  </div>;
}

function Field({ id, label, value, onChange, placeholder, hint, optional = false, type = "text", wide = false, textarea = false }) {
  return <label className={`r-field ${wide ? "wide" : ""}`} htmlFor={id}><span>{label}{optional ? <small>Optional</small> : null}</span>{textarea ? <textarea id={id} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /> : <input id={id} type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}{hint ? <small className="r-field-hint">{hint}</small> : null}</label>;
}

function ProfilePage({ profile, setProfile, focus, navigate }) {
  const [tab, setTab] = useState(FIELD_TO_TAB[focus] || "personal");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!focus) return;
    const targetTab = FIELD_TO_TAB[focus] || "personal";
    setTab(targetTab);
    window.setTimeout(() => document.getElementById(focus)?.focus(), 180);
  }, [focus]);
  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const saveFlash = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1500); };
  const percent = profilePercent(profile);
  const tabButton = (item) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><Icon size={16} /><span>{item.label}</span></button>; };

  return <div className="r-page"><PageHeader eyebrow="My profile" title="Enter it once. Use it everywhere." description="Complete the required profile first. It supplies the factual sections of every email we build for you." action={<Button icon={saved ? Check : Clipboard} onClick={saveFlash}>{saved ? "Saved" : "Save profile"}</Button>} />
    <div className="r-profile-progress"><div><span>Essential profile</span><strong>{percent}%</strong></div><i><b style={{ width: `${percent}%` }} /></i><p>{percent === 100 ? "All essential fields are complete." : "Finish the missing essentials before sending outreach."}</p></div>
    <div className="r-profile-tabs">{PROFILE_TABS.map(tabButton)}</div>
    <section className="r-profile-form">
      {tab === "personal" ? <><div className="r-form-heading"><div><p className="r-eyebrow">Personal</p><h2>Basic contact information</h2><p>This makes it possible for a coach to identify you and reply.</p></div></div><div className="r-form-grid"><Field id="name" label="Full name" value={profile.name} onChange={(value) => update("name", value)} placeholder="Raphael Ferrand" /><Field id="gradYear" label="Graduation year" value={profile.gradYear} onChange={(value) => update("gradYear", value)} placeholder="2028" /><Field id="location" label="Home region" value={profile.location} onChange={(value) => update("location", value)} placeholder="Southern California" /><Field id="athleteEmail" label="Athlete email" value={profile.athleteEmail} onChange={(value) => update("athleteEmail", value)} placeholder="athlete@example.com" type="email" /><Field id="phone" label="Athlete phone" value={profile.phone} onChange={(value) => update("phone", value)} placeholder="310-555-0147" /></div></> : null}
      {tab === "athletics" ? <><div className="r-form-heading r-form-heading-action"><div><p className="r-eyebrow">Athletics</p><h2>Playing background and measurable context</h2><p>Use current measurements. The optional Jump Test can help estimate reach and vertical when needed.</p></div><Button variant="secondary" icon={Activity} onClick={() => navigate("jump")}>Optional Jump Test</Button></div><div className="r-form-grid"><Field id="position" label="Primary position" value={profile.position} onChange={(value) => update("position", value)} placeholder="Outside Hitter" /><Field id="playerRole" label="Player role" value={profile.playerRole} onChange={(value) => update("playerRole", value)} placeholder="Six-rotation" /><Field id="height" label="Height" value={profile.height} onChange={(value) => update("height", value)} placeholder={'6\'2"'} /><Field id="vertical" label="Vertical" value={profile.vertical} onChange={(value) => update("vertical", value)} placeholder="35 in" /><Field id="standingReach" label="Standing reach" value={profile.standingReach} onChange={(value) => update("standingReach", value)} placeholder="97 in" /><Field id="approachTouch" label="Approach touch / highest touch" value={profile.approachTouch} onChange={(value) => update("approachTouch", value)} placeholder="132 in" /><Field id="club" label="Club" value={profile.club} onChange={(value) => update("club", value)} placeholder="SMBC Boys Volleyball" /><Field id="clubTeam" label="Club team" value={profile.clubTeam} onChange={(value) => update("clubTeam", value)} placeholder="18-1s" /><Field id="clubRole" label="Club role" value={profile.clubRole} onChange={(value) => update("clubRole", value)} placeholder="Starter" /><Field id="jersey" label="Jersey number" value={profile.jersey} onChange={(value) => update("jersey", value)} placeholder="11" /><Field id="highSchool" label="High school" value={profile.highSchool} onChange={(value) => update("highSchool", value)} placeholder="Beverly Hills High School" /><Field id="schoolRole" label="School role" value={profile.schoolRole} onChange={(value) => update("schoolRole", value)} placeholder="Varsity starter and captain" /><Field id="awards" label="Awards and recognition" value={profile.awards} onChange={(value) => update("awards", value)} placeholder="Team MVP, All-League, Athlete of the Year..." optional wide textarea /></div></> : null}
      {tab === "academics" ? <><div className="r-form-heading"><div><p className="r-eyebrow">Academics</p><h2>Academic profile</h2><p>GPA and academic interests are required. Test information is included only if you have it.</p></div></div><div className="r-form-grid"><Field id="gpaUW" label="Unweighted GPA" value={profile.gpaUW} onChange={(value) => update("gpaUW", value)} placeholder="3.5" /><Field id="gpaWeighted" label="Weighted GPA" value={profile.gpaWeighted} onChange={(value) => update("gpaWeighted", value)} placeholder="4.0" /><Field id="satStatus" label="SAT / ACT plan" value={profile.satStatus} onChange={(value) => update("satStatus", value)} placeholder="Testing in August" hint="Optional if you have not scheduled a test." optional /><Field id="satScore" label="SAT / ACT score" value={profile.satScore} onChange={(value) => update("satScore", value)} placeholder="If taken, enter a score such as 1450" hint="Only enter a score after you have taken the test." optional /><Field id="academicInterests" label="Intended major or academic interests" value={profile.academicInterests} onChange={(value) => update("academicInterests", value)} wide placeholder="Mathematics, engineering, undecided..." /></div></> : null}
      {tab === "links" ? <><div className="r-form-heading"><div><p className="r-eyebrow">Film and links</p><h2>Give coaches a clear next click</h2><p>Highlights and current coach contact complete the required profile. Other recruiting links are optional.</p></div></div><div className="r-form-grid"><Field id="universityProfile" label="University Athlete profile" value={profile.universityProfile} onChange={(value) => update("universityProfile", value)} placeholder="https://universityathlete.com/..." type="url" optional wide /><Field id="highlightVideo" label="Highlight video or account" value={profile.highlightVideo} onChange={(value) => update("highlightVideo", value)} placeholder="https://youtube.com/... or Instagram profile" type="url" wide /><Field id="fullMatchVideo" label="Full-match video" value={profile.fullMatchVideo} onChange={(value) => update("fullMatchVideo", value)} placeholder="https://youtube.com/..." type="url" optional wide /><Field id="coachName" label="Current coach name" value={profile.coachName} onChange={(value) => update("coachName", value)} placeholder="Joshua Marbach" /><Field id="coachEmail" label="Current coach email" value={profile.coachEmail} onChange={(value) => update("coachEmail", value)} placeholder="coach@example.com" type="email" /><Field id="coachPhone" label="Current coach phone" value={profile.coachPhone} onChange={(value) => update("coachPhone", value)} placeholder="818-555-0147" optional /></div></> : null}
      {tab === "schedule" ? <ScheduleForm profile={profile} setProfile={setProfile} /> : null}
    </section>
  </div>;
}

function ScheduleForm({ profile, setProfile }) {
  const schedule = profile.schedule?.length ? profile.schedule : [{ event: "", date: "", location: "", details: "" }];
  const updateItem = (index, key, value) => setProfile((current) => ({ ...current, schedule: schedule.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) }));
  const addItem = () => setProfile((current) => ({ ...current, schedule: [...schedule, { event: "", date: "", location: "", details: "" }] }));
  const removeItem = (index) => setProfile((current) => ({ ...current, schedule: schedule.filter((_, itemIndex) => itemIndex !== index) }));
  return <><div className="r-form-heading r-form-heading-action"><div><p className="r-eyebrow">Optional schedule</p><h2>Upcoming club tournaments or school matches</h2><p>Saved events are included automatically when the email builder unlocks. Only enter events that are still upcoming.</p></div><Button variant="secondary" icon={Plus} onClick={addItem}>Add event</Button></div><div className="r-schedule-list">{schedule.map((item, index) => <div className="r-schedule-item" key={index}><div><strong>Event {index + 1}</strong><small>Optional</small></div><Field id={`schedule-event-${index}`} label="Event name" value={item.event} onChange={(value) => updateItem(index, "event", value)} placeholder="Upcoming club tournament" /><Field id={`schedule-date-${index}`} label="Date and time" value={item.date} onChange={(value) => updateItem(index, "date", value)} placeholder="October 10-12" /><Field id={`schedule-location-${index}`} label="Location" value={item.location} onChange={(value) => updateItem(index, "location", value)} placeholder="Anaheim Convention Center" optional /><Field id={`schedule-details-${index}`} label="Schedule, court or video note" value={item.details} onChange={(value) => updateItem(index, "details", value)} placeholder="Saturday, 9:00 AM, Court 12" optional wide textarea />{schedule.length > 1 ? <IconButton label="Remove event" onClick={() => removeItem(index)}><X size={17} /></IconButton> : null}</div>)}</div></>;
}

function EmailPage({ profile, schools, selectedSchoolId, onSelectSchool, onSaveSchool, savedIds, navigate }) {
  const school = schools.find((item) => item.id === selectedSchoolId) || schools.find((item) => item.school.includes("Massachusetts Institute")) || schools[0];
  const [notes, setNotes] = useStoredState("vr2-school-notes", {});
  const hasSchedule = profile.schedule?.some((item) => item.event || item.date || item.location || item.details);
  const [includeSchedule, setIncludeSchedule] = useState(Boolean(hasSchedule));
  const [includeCoach, setIncludeCoach] = useState(true);
  const [copied, setCopied] = useState("");
  const researchNote = notes[school?.id] || "";
  const email = useMemo(() => buildRecruitingEmail(profile, school, researchNote, includeSchedule, includeCoach), [profile, school, researchNote, includeSchedule, includeCoach]);
  const copy = async (value, type) => { try { await navigator.clipboard.writeText(value); setCopied(type); window.setTimeout(() => setCopied(""), 1400); } catch { setCopied(""); } };
  const missing = REQUIRED_PROFILE_FIELDS.filter((key) => !profileFieldComplete(profile, key));
  const percent = profilePercent(profile);
  useEffect(() => { if (hasSchedule) setIncludeSchedule(true); }, [hasSchedule]);

  if (missing.length) {
    return <div className="r-page"><PageHeader eyebrow="Email builder" title="We will build the email. First, complete your profile." description="The email builder uses your profile for every factual section, so it unlocks when the required information is complete." />
      <section className="r-email-gate">
        <div className="r-email-gate-intro"><span><MessageSquareText size={24} /></span><Tag tone="coral">{percent}% complete</Tag><h2>Your information becomes the email.</h2><p>Complete the steps below once. We will then assemble the coach greeting, athlete snapshot, links, contact details and any saved schedule events for each school.</p><div className="r-gate-progress"><i><b style={{ width: `${percent}%` }} /></i><small>{REQUIRED_PROFILE_FIELDS.length - missing.length} of {REQUIRED_PROFILE_FIELDS.length} required fields complete</small></div><Button icon={ArrowRight} onClick={() => navigate("profile", missing[0])}>Complete my profile</Button></div>
        <div className="r-email-gate-steps"><p className="r-eyebrow">Profile steps</p>{PROFILE_STEPS.map((step, index) => { const complete = profileStepComplete(profile, step); const target = firstMissingField(profile, step.fields) || step.fields[0]; const StepIcon = step.icon; return <button key={step.id} onClick={() => navigate("profile", target)}><span className={complete ? "complete" : ""}>{complete ? <Check size={17} /> : <StepIcon size={17} />}</span><span><small>Step {index + 1}</small><strong>{step.title}</strong><p>{complete ? "Complete" : step.detail}</p></span><ChevronRight size={16} /></button>; })}</div>
      </section>
    </div>;
  }

  return <div className="r-page"><PageHeader eyebrow="Email builder" title="Personalize the reason. Reuse the facts." description="Your profile fills the factual sections. You still write the school-specific sentence that proves genuine interest." action={school ? <Button variant={savedIds.has(school.id) ? "soft" : "secondary"} icon={savedIds.has(school.id) ? Check : Plus} onClick={() => onSaveSchool(school)}>{savedIds.has(school.id) ? "In outreach" : "Add school"}</Button> : null} />
    <div className="r-email-layout">
      <aside className="r-email-controls">
        <section className="r-panel"><p className="r-eyebrow">Recipient school</p><label className="r-select-label"><span>Program</span><select value={school?.id || ""} onChange={(event) => onSelectSchool(event.target.value)}>{schools.map((item) => <option value={item.id} key={item.id}>{item.school}</option>)}</select></label>{school ? <div className="r-selected-school"><SchoolLogo school={school} /><div><strong>{school.school}</strong><span>{school.division} / {school.conference}</span><small>{emailCount(school)} coach email{emailCount(school) === 1 ? "" : "s"} available</small></div></div> : null}</section>
        <section className="r-panel r-research-box"><p className="r-eyebrow">Required personalization</p><h3>Why this school?</h3><p>Use a detail that could not be pasted into an email to another program: a course, coaching philosophy, recent match, roster pattern, research lab or team value.</p><textarea value={researchNote} onChange={(event) => school && setNotes((current) => ({ ...current, [school.id]: event.target.value }))} placeholder={`[Insert something specific and unique about ${school?.school || "the school"} that shows genuine research and interest.]`} /><small>This sentence stays a visible placeholder until you write it.</small></section>
        <section className="r-panel r-email-options"><p className="r-eyebrow">Optional sections</p><label className={!hasSchedule ? "disabled" : ""}><input type="checkbox" checked={includeSchedule} disabled={!hasSchedule} onChange={(event) => setIncludeSchedule(event.target.checked)} /><span className="r-switch" /><span><strong>Upcoming schedule</strong><small>{hasSchedule ? "Saved profile events are included automatically" : "Add an upcoming event in My Profile first"}</small></span></label><label><input type="checkbox" checked={includeCoach} onChange={(event) => setIncludeCoach(event.target.checked)} /><span className="r-switch" /><span><strong>Current coach contact</strong><small>Include only when available</small></span></label></section>
      </aside>
      <section className="r-email-preview">
        <div className="r-email-preview-bar"><div><span>Recruiting introduction</span><Tag tone={researchNote ? "green" : "coral"}>{researchNote ? "Personalized" : "Needs school research"}</Tag></div><Button variant="secondary" icon={copied === "all" ? Check : Clipboard} onClick={() => copy(`Subject: ${email.subject}\n\n${email.body}`, "all")}>{copied === "all" ? "Copied" : "Copy email"}</Button></div>
        <div className="r-subject-row"><span>Subject</span><strong>{email.subject}</strong><IconButton label="Copy subject" onClick={() => copy(email.subject, "subject")}>{copied === "subject" ? <Check size={16} /> : <Clipboard size={16} />}</IconButton></div>
        <pre>{email.body}</pre>
      </section>
    </div>
  </div>;
}

function OutreachPage({ saved, setSaved, schoolsById, onEmail, navigate }) {
  const update = (schoolId, patch) => setSaved((current) => current.map((item) => item.schoolId === schoolId ? { ...item, ...patch } : item));
  const logSent = (entry) => update(entry.schoolId, { sent: Number(entry.sent || 0) + 1, lastSent: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: "Sent" });
  const undoSent = (entry) => {
    const sent = Math.max(0, Number(entry.sent || 0) - 1);
    update(entry.schoolId, { sent, lastSent: sent ? entry.lastSent : "", status: sent || entry.status !== "Sent" ? entry.status : "Saved" });
  };
  const valid = saved.filter((entry) => schoolsById[entry.schoolId]);
  return <div className="r-page"><PageHeader eyebrow="Outreach" title="Know who you contacted and what happens next." description="The app tracks your work. Emails are still sent from your own account." action={<Button icon={Plus} onClick={() => navigate("directory")}>Add schools</Button>} />
    <section className="r-outreach-summary"><div><span>Schools</span><strong>{valid.length}</strong><small>saved programs</small></div><div><span>Emails logged</span><strong>{valid.reduce((sum, item) => sum + Number(item.sent || 0), 0)}</strong><small>sent outside the app</small></div><div><span>Follow-ups due</span><strong>{valid.filter((item) => item.followup).length}</strong><small>scheduled dates</small></div><div><span>Replies</span><strong>{valid.filter((item) => item.status === "Replied").length}</strong><small>manually tracked</small></div></section>
    {valid.length ? <section className="r-outreach-list"><div className="r-outreach-head"><span>Program</span><span>Status</span><span>Emails sent</span><span>Follow-up</span><span>Action</span></div>{valid.map((entry) => { const school = schoolsById[entry.schoolId]; return <div className="r-outreach-row" key={entry.schoolId}><div><SchoolLogo school={school} /><span><strong>{school.school}</strong><small>{school.division} / {school.state}</small></span></div><select value={entry.status || "Saved"} onChange={(event) => update(entry.schoolId, { status: event.target.value })}>{["Saved", "Researching", "Drafting", "Sent", "Followed up", "Replied", "Closed"].map((value) => <option key={value}>{value}</option>)}</select><div className="r-sent-count"><strong>{entry.sent || 0}</strong><small>{entry.lastSent ? `Last ${entry.lastSent}` : "None logged"}</small></div><input type="date" value={entry.followup || ""} onChange={(event) => update(entry.schoolId, { followup: event.target.value })} /><div className="r-row-actions"><Button variant="secondary" onClick={() => logSent(entry)}>Log sent</Button>{entry.sent ? <IconButton label="Undo last sent log" onClick={() => undoSent(entry)}><RotateCcw size={15} /></IconButton> : null}<Button icon={PenLine} onClick={() => onEmail(school)}>Email</Button></div></div>; })}</section> : <div className="r-empty-page"><Building2 size={32} /><h3>Your outreach list is empty.</h3><p>Add real programs from Find Schools or the College Directory.</p><Button onClick={() => navigate("matches")}>Find schools</Button></div>}
  </div>;
}

function TimelinePage({ navigate }) {
  const phases = [
    ["Now", "Build a complete profile", "Profile, film links, academics and contact information", "profile"],
    ["Next 2 weeks", "Create a balanced school list", "Use real directory filters, then research each program", "matches"],
    ["September - November", "Begin personalized outreach", "Write a real school-specific sentence and track every email", "email"],
    ["Before each event", "Send useful updates", "Share upcoming club schedules or new video only when current", "profile"],
    ["Every 10-14 days", "Follow up with purpose", "Add new film, academics, schedule or a direct question", "outreach"],
    ["Spring and summer", "Narrow with evidence", "Compare academics, roster context, communication and campus fit", "outreach"]
  ];
  return <div className="r-page"><PageHeader eyebrow="Recruiting plan" title="A sequence you can actually follow." description="Junior year is not too late. The priority is becoming easy to evaluate, then contacting programs consistently." />
    <section className="r-plan-focus"><div><Tag tone="light">Current phase</Tag><h2>Finish the profile before increasing volume.</h2><p>A smaller number of researched emails with complete information is more useful than sending the same generic message everywhere.</p></div><Button variant="glass" onClick={() => navigate("profile")}>Complete profile</Button></section>
    <div className="r-plan-list">{phases.map(([date, title, detail, route], index) => <button key={title} onClick={() => navigate(route)}><span className={index === 0 ? "active" : ""}>{index + 1}</span><span><small>{date}</small><strong>{title}</strong><p>{detail}</p></span><ArrowUpRight size={18} /></button>)}</div>
  </div>;
}

function JumpPage({ profile, setProfile }) {
  const fileInput = useRef(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [markers, setMarkers] = useState({ floor: .94, reference: .42, standing: .41, peak: .22 });
  const [placing, setPlacing] = useState("");
  const [referenceType, setReferenceType] = useState("net");
  const referenceOptions = {
    net: {
      height: 95.625,
      shortLabel: "Men's net: 7 ft 11 5/8 in",
      markerLabel: "Top of net",
      title: "Estimate reach from a straight-on net clip.",
      description: "Record the athlete and net in the same plane so the known net height can scale the athlete's reach."
    },
    rim: {
      height: 120,
      shortLabel: "Basketball rim: 10 ft",
      markerLabel: "Top of rim",
      title: "Estimate reach beside a basketball rim.",
      description: "Use the regulation 10-foot rim as the known height, with the athlete and rim edge in the same plane."
    }
  };
  const referenceConfig = referenceOptions[referenceType];
  const reference = referenceConfig.height;
  useEffect(() => () => { if (mediaUrl) URL.revokeObjectURL(mediaUrl); }, [mediaUrl]);
  const result = useMemo(() => { const span = Math.abs(markers.floor - markers.reference); if (!span) return null; const scale = reference / span; const stand = Math.abs(markers.floor - markers.standing) * scale; const peak = Math.abs(markers.floor - markers.peak) * scale; return { stand, peak, vertical: peak - stand }; }, [markers, reference]);
  const place = (event) => { if (!placing) return; const rect = event.currentTarget.getBoundingClientRect(); setMarkers((current) => ({ ...current, [placing]: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) })); setPlacing(""); };
  const upload = (event) => { const file = event.target.files?.[0]; if (!file) return; if (mediaUrl) URL.revokeObjectURL(mediaUrl); setMediaUrl(URL.createObjectURL(file)); };
  const save = () => {
    if (!result) return;
    setProfile((current) => ({ ...current, standingReach: `${result.stand.toFixed(1)}\"`, approachTouch: `${result.peak.toFixed(1)}\"`, vertical: `${result.vertical.toFixed(1)}\"` }));
  };
  const selectReference = (type) => {
    setReferenceType(type);
    setMarkers((current) => {
      const { reference: _previousReference, ...remaining } = current;
      return remaining;
    });
    setPlacing("reference");
  };
  const labels = { floor: "Floor", reference: referenceConfig.markerLabel, standing: "Standing reach", peak: "Peak touch" };
  const markerHelp = [
    ["floor", "Pause while standing. Click the court directly under the feet."],
    ["reference", referenceType === "net" ? "Click the top white tape beside the athlete, not farther down the net." : "Click the top edge of the rim beside the athlete. Regulation rim height is 10 feet."],
    ["standing", "Pause at the highest standing reach and click the fingertips."],
    ["peak", "Pause at the jump apex and click the highest fingertips."]
  ];

  return <div className="r-page">
    <PageHeader eyebrow="Optional tool" title={referenceConfig.title} description={referenceConfig.description} action={<Tag tone="blue"><ShieldCheck size={13} /> Beta estimate</Tag>} />
    <section className="r-reference-picker" aria-label="Calibration reference">
      <div><p className="r-eyebrow">Choose your reference</p><strong>What known-height object is visible?</strong></div>
      <div className="r-reference-options">
        <button className={referenceType === "net" ? "active" : ""} onClick={() => selectReference("net")}><Volleyball size={17} /><span><strong>Volleyball net</strong><small>Men's top tape · 7 ft 11 5/8 in</small></span></button>
        <button className={referenceType === "rim" ? "active" : ""} onClick={() => selectReference("rim")}><Circle size={17} /><span><strong>Basketball rim</strong><small>Regulation top edge · 10 ft</small></span></button>
      </div>
    </section>
    <section className="r-recording-guide">
      <div className="r-recording-title"><Video size={20} /><div><p className="r-eyebrow">Before recording</p><h2>Keep the {referenceType === "net" ? "net" : "rim"} level and the camera still.</h2></div></div>
      <div className="r-recording-steps">
        <span><strong>1. Square the camera</strong><small>{referenceType === "net" ? "Use a level phone at 1x and face the net straight on. Move until the top tape looks level, not tilted." : "Use a level phone at 1x from the side of the basket. Move back until the rim edge looks level, not tilted."}</small></span>
        <span><strong>2. Match the plane</strong><small>{referenceType === "net" ? "Stand directly beside the net at the same distance from the camera as the tape." : "Stand safely beside the outer rim edge at the same distance from the camera. Do not jump under the basket."}</small></span>
        <span><strong>3. Record one sequence</strong><small>Show the full body and floor, reach as high as possible, then jump without moving or zooming the phone.</small></span>
      </div>
    </section>
    <div className="r-jump-layout">
      <section className="r-jump-stage-panel">
        <div className="r-jump-toolbar">
          <div className="r-jump-upload"><Button variant="dark" icon={Upload} onClick={() => fileInput.current?.click()}>Upload clip</Button><input hidden ref={fileInput} type="file" accept="video/*" onChange={upload} /><span><Info size={13} /><strong>Reminder:</strong> set all four markers</span></div>
          <span className="r-reference-chip"><Ruler size={14} /> {referenceConfig.shortLabel}</span>
        </div>
        <div className={`r-jump-stage ${placing ? "placing" : ""}`} onClick={place}>
          {mediaUrl ? <video src={mediaUrl} controls /> : <img src={publicUrl("assets/jump-lab-demo.jpg")} alt="Straight-on jump measurement sample beside a volleyball net" />}
          {Object.entries(markers).map(([key, y]) => <span key={key} className={`r-jump-marker ${key}`} style={{ top: `${y * 100}%` }}><small>{labels[key]}</small></span>)}
          {placing ? <div className="r-place-prompt">Pause on the right frame, then click the {labels[placing].toLowerCase()}</div> : null}
        </div>
        <div className="r-marker-guide"><Target size={18} /><span><strong>Set the markers after uploading</strong><small>Select a marker below, pause on the correct frame, then click that exact point in the video.</small></span></div>
        <div className="r-marker-buttons">{Object.keys(labels).map((key) => <button className={placing === key ? "active" : ""} onClick={() => setPlacing(key)} key={key}><CheckCircle2 size={16} /><span><strong>{labels[key]}</strong><small>{placing === key ? "Now click the video" : "Select marker"}</small></span></button>)}</div>
        <div className="r-marker-help">{markerHelp.map(([key, detail]) => <div key={key}><strong>{labels[key]}</strong><p>{detail}</p></div>)}</div>
      </section>
      <aside className="r-jump-result"><p className="r-eyebrow">Estimated vertical</p><strong>{result ? result.vertical.toFixed(1) : "—"}</strong><span>inches</span><Tag tone="coral">Validation pending</Tag><div><span>Standing reach<strong>{result ? `${result.stand.toFixed(1)} in` : "—"}</strong></span><span>Peak touch<strong>{result ? `${result.peak.toFixed(1)} in` : "—"}</strong></span></div><Button icon={Clipboard} onClick={save} disabled={!result}>Save to athletic profile</Button><p><Info size={14} /> Benchmark at least 10 same-day trials against a Vertec before publishing an accuracy range.</p></aside>
    </div>
  </div>;
}

function RecruitApp() {
  const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
  const routeFromHash = () => { const route = window.location.hash.replace(/^#\/?/, ""); return ROUTES.includes(route) ? route : "home"; };
  const [active, setActive] = useState(routeFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [directory, setDirectory] = useState({ schools: [], loading: true });
  const [profile, setProfile] = useStoredState("vr3-profile", DEFAULT_PROFILE);
  const [saved, setSaved] = useStoredState("vr2-outreach", []);
  const [selectedSchoolId, setSelectedSchoolId] = useStoredState("vr2-selected-school", "massachusetts-institute-of-technology-mit");
  const [profileFocus, setProfileFocus] = useState("");

  useEffect(() => {
    try {
      if (demoMode) {
        setProfile(DEMO_PROFILE);
        setSaved([
          { schoolId: "massachusetts-institute-of-technology-mit", status: "Drafting", sent: 1, followup: "2026-10-05", lastSent: "2026-09-26" },
          { schoolId: "university-of-chicago", status: "Researching", sent: 0, followup: "", lastSent: "" }
        ]);
        window.localStorage.setItem("vr-profile-schema", PROFILE_SCHEMA_VERSION);
        return;
      }
      if (window.localStorage.getItem("vr-profile-schema") !== PROFILE_SCHEMA_VERSION) {
        setProfile(DEFAULT_PROFILE);
        window.localStorage.setItem("vr-profile-schema", PROFILE_SCHEMA_VERSION);
      }
    } catch {
      // The prototype still works without local storage persistence.
    }
  }, [demoMode, setProfile, setSaved]);
  useEffect(() => {
    fetch(publicUrl("data/coaches.json")).then((response) => response.json()).then((data) => setDirectory({ schools: data.schools || [], loading: false })).catch(() => setDirectory({ schools: [], loading: false }));
  }, []);
  useEffect(() => { const handler = () => setActive(routeFromHash()); window.addEventListener("hashchange", handler); window.addEventListener("popstate", handler); return () => { window.removeEventListener("hashchange", handler); window.removeEventListener("popstate", handler); }; }, []);

  const schoolsById = useMemo(() => Object.fromEntries(directory.schools.map((school) => [school.id, school])), [directory.schools]);
  const savedIds = useMemo(() => new Set(saved.map((item) => item.schoolId)), [saved]);

  const navigate = (route, focus = "") => {
    const change = () => { window.history.pushState({}, "", `#/${route}`); setActive(route); setProfileFocus(focus); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); };
    if (document.startViewTransition) document.startViewTransition(change); else change();
  };
  const saveSchool = (school) => setSaved((current) => current.some((item) => item.schoolId === school.id) ? current : [...current, { schoolId: school.id, status: "Saved", sent: 0, followup: "", lastSent: "" }]);
  const openEmail = (school) => { saveSchool(school); setSelectedSchoolId(school.id); navigate("email"); };

  const page = () => {
    switch (active) {
      case "matches": return <MatchesPage schools={directory.schools} savedIds={savedIds} onSave={saveSchool} onEmail={openEmail} />;
      case "directory": return <DirectoryPage schools={directory.schools} savedIds={savedIds} onSave={saveSchool} onEmail={openEmail} loading={directory.loading} />;
      case "profile": return <ProfilePage profile={profile} setProfile={setProfile} focus={profileFocus} navigate={navigate} />;
      case "email": return <EmailPage profile={profile} schools={directory.schools} selectedSchoolId={selectedSchoolId} onSelectSchool={setSelectedSchoolId} onSaveSchool={saveSchool} savedIds={savedIds} navigate={navigate} />;
      case "outreach": return <OutreachPage saved={saved} setSaved={setSaved} schoolsById={schoolsById} onEmail={openEmail} navigate={navigate} />;
      case "timeline": return <TimelinePage navigate={navigate} />;
      case "jump": return <JumpPage profile={profile} setProfile={setProfile} />;
      default: return <HomePage profile={profile} saved={saved} schoolsById={schoolsById} navigate={navigate} />;
    }
  };

  return <div className="r-app"><Sidebar active={active} navigate={navigate} menuOpen={menuOpen} close={() => setMenuOpen(false)} profile={profile} /><div className="r-main"><header className="r-mobile-header"><IconButton label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></IconButton><button className="r-mobile-brand" onClick={() => navigate("home")}><img src={publicUrl("assets/volleyreach-mark-light.svg")} alt="" /><strong>VolleyReach</strong></button></header><header className="r-topbar"><div><span>VolleyReach</span><ChevronRight size={13} /><strong>{[...MAIN_NAV, ...TOOL_NAV].find((item) => item.id === active)?.label}</strong></div><button className="r-top-profile" onClick={() => navigate("profile")}><span className="r-avatar">{profile.name ? schoolInitials(profile.name) : <UserRound size={15} />}</span><span><strong>{profile.name || "Your profile"}</strong><small>{profilePercent(profile)}% complete</small></span><ChevronRight size={15} /></button></header><AnimatePresence mode="wait"><motion.main key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .2 }}>{page()}</motion.main></AnimatePresence></div></div>;
}

export default RecruitApp;
