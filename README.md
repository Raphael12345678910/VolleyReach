# VolleyReach

VolleyReach is a men's volleyball recruiting workspace. Athletes build one complete profile, find real college programs, write school-specific coach emails, and track outreach without needing a paid recruiting platform.

The current build is a polished interactive prototype designed for testing with athletes and teams.

**Live site:** https://raphael12345678910.github.io/VolleyReach/

Read the full [`THOUGHT_PROCESS_REPORT.md`](THOUGHT_PROCESS_REPORT.md) for the project evolution, product decisions, technical approach, testing plan, limitations, and next steps.

## Current Experience

- **Home** shows profile completion, saved programs, sent-email totals, and useful next actions.
- **Find Schools** asks four questions that directly filter the real directory by division, region, contact availability, and list size.
- **College Directory** contains 293 programs and 722 grouped coach/contact entries imported from the shared men's volleyball contact sheet.
- **My Profile** stores personal, athletic, academic, film, coach-contact, and optional schedule information.
- **Email Builder** unlocks after the required profile steps are complete, then uses those facts, current coach names, and a required school-research field to generate a personal recruiting email.
- **Outreach** tracks saved programs, status, sent emails, follow-up dates, and replies.
- **Recruiting Plan** turns the workflow into a realistic junior-year sequence.
- **Jump Test** is an optional supporting tool for estimating standing reach, approach touch, and vertical.

The app never presents directory matches as admissions predictions or roster openings. Missing coach emails are labeled instead of guessed.

## MVP Status

| Area | Current MVP evidence |
| --- | --- |
| Athlete profile | Required academic, athletic, film, coach-contact, and schedule fields save locally in the browser. |
| Program discovery | Four recruiting-fit questions filter the imported men's college volleyball directory. |
| College research | Athletes can review program details and save schools for follow-up. |
| Coach email builder | Completed profile details flow into a school-specific email draft with a required research sentence. |
| Outreach tracking | Saved programs support status, sent-email totals, follow-up dates, and reply tracking. |
| Athletic measurements | The optional Jump Test estimates standing reach, approach touch, and vertical using a men's net or regulation basketball rim. |
| Responsive interface | The primary recruiting workflow is usable on laptop and phone layouts. |

The MVP is ready for a first structured athlete and coach pilot. The next development decisions will be based on observed task completion and written user feedback rather than adding features without evidence.

## Coach Data

`public/data/coaches.json` is a read-only grouped import of the publicly shared Google Sheet provided for this project. The sheet contains 726 source rows; after excluding blank or unusable entries, the app contains 293 programs and 722 grouped coach/contact entries as of August 29, 2026.

The source is incomplete and may become outdated. Contact details should be verified against each program's official athletics site before outreach.

## Recruiting Email

The email builder is based on Raphael's MIT outreach structure. It:

1. Greets every listed coach by last name.
2. Reuses factual profile details.
3. Leaves a visible `[Insert ...]` prompt until the athlete writes genuine school-specific research.
4. Includes schedule and current-coach details only when available and selected.
5. Omits optional profile fields when they are blank.

Emails are copied from VolleyReach and sent from the athlete's own email account.

## Jump Test Method

The jump demo uses manual visual calibration rather than claiming automatic computer-vision accuracy:

1. Choose either a men's volleyball net (7 ft 11 5/8 in) or a regulation basketball rim (10 ft) as the known-height reference.
2. Record square to the reference so its top edge appears level, with the athlete safely beside it in the same visual plane.
3. Keep the phone fixed, show the full body and floor, record a maximum standing reach, and then record the jump without zooming.
4. Upload the clip and mark the floor plus the top of the selected reference.
5. Pause on the correct frames and mark standing reach and peak touch.
6. Convert the pixel differences into inches.

The app supports the men's 7 ft 11 5/8 in net height and a regulation 10 ft basketball rim. It deliberately labels accuracy as **validation pending**. Benchmark at least 10 same-day trials against a Vertec before publishing an error range.

## User Testing and Evaluation

Each tester receives three tasks: complete or review an athlete profile, find one relevant college program, and build a coach email. The test then measures:

- completion of each task
- navigation ease and professional appearance on a 1–5 scale
- the most useful feature
- confidence contacting college coaches after using the product
- likelihood of weekly use and recommendation
- one confusing point and one requested improvement

The first pilot targets 20 athletes, 12 completed profiles, 60 saved programs, 25 coach emails drafted or sent, and 3 school or club partners. These are goals, not current results. The response tracker is available in [`deliverables/VolleyReach_User_Testing.xlsx`](deliverables/VolleyReach_User_Testing.xlsx).

## Project Evidence

- [Live VolleyReach website](https://raphael12345678910.github.io/VolleyReach/)
- [Thought process report](THOUGHT_PROCESS_REPORT.md) — a checkpoint-by-checkpoint account of the errors, decisions, pivot, and lessons from the project
- [75-second MVP walkthrough](https://github.com/Raphael12345678910/VolleyReach/releases/tag/mvp-walkthrough-v1)
- [`deliverables/VolleyReach_Brand_Media_and_Growth_Strategy.pptx`](deliverables/VolleyReach_Brand_Media_and_Growth_Strategy.pptx) — brand system, product screenshots, content plan, and 30-day growth strategy
- [`deliverables/VolleyReach_Capstone_One_Pager.docx`](deliverables/VolleyReach_Capstone_One_Pager.docx) — revised capstone concept and technical feasibility
- [`deliverables/brand/VolleyReach_Logo_Primary.svg`](deliverables/brand/VolleyReach_Logo_Primary.svg) — differentiated VolleyReach logo system

## Technology

- React
- Vite
- Framer Motion
- Lucide icons
- Local browser storage for prototype data

The volleyball imagery in `public/assets/` was created specifically for this project. The interface does not copy My Recruit Path branding, layout, or text.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

Create a production build with:

```bash
npm run build
```

## Project Structure

```text
VolleyReach/
|-- public/assets/          # Original volleyball imagery
|-- public/data/            # Grouped coach-directory import
|-- src/RecruitApp.jsx      # Recruiting pages and interactions
|-- src/recruit.css         # Responsive visual system
|-- src/main.jsx            # React entry point
|-- index.html
|-- vite.config.js
`-- package.json
```

The earlier MediaPipe spike-analysis files remain as legacy research and are not loaded by the current app.

## Responsible Use

VolleyReach is an educational recruiting organization tool. It does not guarantee recruiting outcomes, evaluate athlete talent, replace official school research, or provide an official jump measurement.
