# VolleyReach Development and Decision Report

## Project Summary

VolleyReach is a free web-based recruiting workspace for boys' volleyball athletes. It helps an athlete build a complete recruiting profile, discover real college programs, organize coach contacts, draft personalized outreach emails, and track follow-ups. An optional Jump Test helps athletes estimate supporting measurements such as standing reach, approach touch, and vertical.

The project is designed for athletes and school or club programs that may not have access to paid recruiting platforms or dedicated recruiting support.

## How the Project Evolved

The original concept focused on volleyball hitting-form analysis using MediaPipe pose detection. The goal was to upload a hitting video and receive automatic technique feedback. Early prototypes exposed several problems:

- Fast arm movement produced unstable body landmarks.
- Camera angle and distance changed calculated joint angles.
- Detecting ball contact accurately required reliable ball tracking.
- The tool risked presenting approximate computer-vision output as precise coaching advice.
- A credible biomechanics product would require a much larger labeled-video dataset and extensive validation.

Rather than continuing to add features to an unreliable analysis system, the project pivoted toward a problem that could be solved responsibly within the available timeline: organizing the men's volleyball recruiting process.

This pivot preserved the community-service purpose. Athletes with fewer recruiting resources can use the core workflow without paying for access to basic information or organization tools.

## Problem Definition

College volleyball recruiting information is fragmented. Athletes often manage profile details, highlight links, college research, coach contacts, email drafts, and follow-up dates across separate documents and websites. Players who are the first in their family or program to pursue college volleyball may not know what information coaches expect or how to begin outreach.

VolleyReach addresses four practical needs:

1. Knowing which profile information is incomplete.
2. Finding real men's college volleyball programs.
3. Writing a personal email without inventing school-specific interest.
4. Remembering who was contacted and when to follow up.

## Product Decisions

### Profile first

The email builder depends on the athlete profile. Users are therefore directed to complete essential personal, athletic, academic, film, and coach-contact fields before generating outreach. This prevents incomplete or contradictory information from appearing in an email.

Optional information, such as a tournament schedule or full-match video, is clearly labeled. Measurements and contact fields that coaches consistently use are treated as required.

### Real programs instead of fictional recommendations

The directory contains 293 men's college volleyball programs and 722 grouped coach or staff contacts imported from the project source sheet. Missing information is labeled as needing research instead of being guessed.

The Find Schools questionnaire uses only answers that change the output: competitive level, geographic region, coach-email availability, and preferred list size. The results are research leads, not admissions predictions or claims about roster openings.

### Personalization remains the athlete's responsibility

The email builder reuses factual profile information, coach names, program level, and conference details. It deliberately leaves a required school-specific research prompt visible. The athlete must add a detail that demonstrates genuine interest, such as a course, laboratory, team value, coaching philosophy, or recent match.

VolleyReach prepares and organizes an email, but the athlete sends it from their own account.

### Measurement as a supporting tool

Vertical jump information can strengthen an athletic profile, but it is not the main product. The Jump Test uses a known-height men's volleyball net or regulation basketball rim as a visual reference. The athlete manually marks the floor, reference height, standing reach, and peak touch.

The result is labeled as an estimate with validation pending. The interface does not claim medical, biomechanical, or official combine-level accuracy.

## Technical Approach

The current MVP uses:

- React for the interface and reusable page components
- Vite for local development and production builds
- Framer Motion for restrained page transitions
- Lucide icons for consistent interface controls
- JSON for the read-only college and coach directory
- Browser local storage for prototype profile and outreach persistence
- GitHub Pages for public hosting

Hash-based routing allows every major section to behave like a separate page while remaining compatible with static hosting. The app is responsive across laptop and phone layouts.

No athlete account system or cloud database is included in this prototype. Data entered by a user stays in that browser. This reduces setup complexity for initial testing, but cross-device accounts are an important future feature.

## Visual and Brand Direction

The visual system uses forest green, coral, mist blue, warm paper, and dark ink. The interface is designed to feel calm and credible rather than like a generic AI product.

The logo was revised after feedback that an earlier circular volleyball mark resembled OpenAI branding. The final mark combines a volleyball-net baseline, an upward reach path, and a ball endpoint. The product uses original volleyball imagery and does not copy the layout, wording, colors, or branding of another recruiting platform.

## Development Challenges

### Data normalization

The source coach sheet included repeated schools, inconsistent conference names, and incomplete contact fields. The data was grouped into program records while preserving listed contacts. Empty or unverifiable fields are shown honestly.

### Useful personalization

Automatically generated recruiting emails can sound generic. The solution was to automate reusable facts while forcing a visible school-research step. This balances convenience with authenticity.

### Scope control

The earlier computer-vision concept created accuracy claims that could not be validated in the project timeline. Moving to recruiting workflow software produced a more testable MVP with lower risk and clearer user outcomes.

### Public deployment

The app uses generated asset and data paths that work both locally and under the GitHub Pages project prefix. The production build is deployed separately from development files so temporary artifacts are not exposed.

## Testing and Evaluation Plan

The first structured test gives each participant three tasks:

1. Complete or review an athlete profile.
2. Find at least one relevant college program.
3. Build a coach email.

The published feedback form measures task completion, navigation ease, professional appearance, feature usefulness, likelihood of weekly use, recommendation intent, confusion points, and the highest-priority improvement.

Initial pilot targets are:

- 20 athletes onboarded
- 12 completed profiles
- 60 programs saved
- 25 coach emails drafted or sent
- 3 school or club partners

These are proposed targets, not current results. Actual impact will be reported only after user testing.

## Responsible Use and Limitations

VolleyReach does not guarantee admission, recruitment, coach responses, scholarships, or roster availability. Directory details can become outdated and should be verified against official athletics websites before outreach.

The Jump Test is an estimate and should be benchmarked against a Vertec or another accepted measurement method before an accuracy range is published.

## Next Steps

The next development cycle will prioritize evidence from real users:

1. Observe at least five athletes or coaches completing the core tasks.
2. Categorize confusion points and requested improvements.
3. Fix the highest-frequency workflow problems.
4. Record a second walkthrough showing before-and-after changes.
5. Add optional accounts and cloud synchronization only after the local workflow is validated.
6. Begin school and club outreach using the prepared social and media materials.

## Current Evidence

- Public MVP: https://raphael12345678910.github.io/VolleyReach/
- Published feedback form: https://docs.google.com/forms/d/e/1FAIpQLScaz1iEH-XhrXnl5kZaMHCllueFKvqbT4UcYdCB7X2wOU2W5A/viewform
- Source code and documentation: https://github.com/Raphael12345678910/VolleyReach

