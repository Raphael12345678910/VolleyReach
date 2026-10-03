# VolleyReach Thought Process Report

## Starting Point

I started this project as **Spike Analyzer**, a tool that would let a volleyball player upload a hitting video and get automatic feedback on their form. The main idea was to use MediaPipe to track the player's body, calculate angles, and point out possible problems with the approach, arm swing, contact point, and landing.

I chose this idea because private coaching and advanced video analysis can be expensive. I wanted to make a free tool that could help players who do not have the same coaching resources as larger or better-funded programs.

## Checkpoint 1: Building the First Video Analyzer

The first versions could upload a video and detect body landmarks. I also built calculations for arm and body angles and experimented with an AI coaching section.

The main problem was that detecting a person was not the same as accurately analyzing a volleyball swing. Fast arm movement caused landmarks to jump around or disappear. A different camera angle could also change the result, even when the athlete used the same technique.

One obvious error happened when the AI Coach expected a JSON response but received an HTML error page instead. The app displayed raw code beginning with `<!DOCTYPE html>` instead of useful feedback. I fixed parts of the connection, but it also made me realize that adding AI text did not solve the unreliable measurements underneath it.

## Checkpoint 2: Realizing Accuracy Was the Real Problem

I originally thought I could improve the analyzer by adjusting formulas and adding more rules. Testing showed that the larger problem was the quality of the input data.

To identify the exact moment of contact, the app would need reliable ball tracking as well as body tracking. It would also need to handle different phones, frame rates, lighting, distances, and camera angles. Without a large set of labeled volleyball videos and comparison testing with coaches, I could not honestly claim that the feedback was accurate.

This was an important realization. A form analyzer that looks advanced but gives inconsistent advice could be less useful than a simpler product that works reliably.

## Checkpoint 3: Choosing to Pivot

With about a month left, I decided not to make automatic form analysis the center of the project. I looked at other problems volleyball players deal with and focused on recruiting.

Men's volleyball recruiting information is spread across school websites, spreadsheets, emails, highlight links, and recruiting services. Players who do not have a recruiting coordinator or paid platform may not know which schools have programs, what information a coach needs, or how to organize follow-ups.

The project became **VolleyReach**, a free recruiting workspace for boys' volleyball players. This kept the original community-service goal, but moved it toward a problem I could solve and test more responsibly.

## Checkpoint 4: Learning From Existing Platforms Without Copying Them

I reviewed existing recruiting platforms, including My Recruit Path, to understand what made them useful and visually strong. I liked the idea of a clear sidebar, separate work areas, and a guided recruiting process.

I did not want to copy another site's branding, wording, layout, or paid features. VolleyReach uses its own name, colors, logo, page structure, and workflow. Its focus is helping an athlete build a complete profile, research real programs, prepare personalized outreach, and track that outreach in one free tool.

## Checkpoint 5: Rebuilding the App Around a Real Workflow

The first recruiting version still had sections that looked good but did not do enough. Some buttons did not open anything, profile fields contained information that looked like it already belonged to the user, and the jump feature was emphasized too heavily.

I reorganized the app into separate pages with a permanent left navigation. I also removed vague promotional sections and made the main workflow clearer:

1. Complete an athlete profile.
2. Find and save college programs.
3. Research a specific school.
4. Build a personalized coach email.
5. Record the email and follow-up status.

This made the app feel less like a demonstration and more like a tool someone could actually use.

## Checkpoint 6: Making the Profile the Source of Truth

At first, the profile and email builder behaved like separate features. That created repeated work and made it possible for an email to contain incomplete information.

I changed the system so the email builder pulls from the athlete's saved profile. Required fields include information coaches regularly use, such as graduation year, position, height, jersey number, GPA, vertical, standing reach, and approach touch. Fields such as SAT score and upcoming tournament schedule are marked optional when they may not apply yet.

Example information is now shown as light placeholder text instead of saved user data. The email builder also tells the athlete to finish the profile first, so the relationship between the two pages is clear.

## Checkpoint 7: Improving the Email Builder

My own MIT recruiting email became the starting reference for the email format. I turned it into a reusable structure instead of hard-coding my personal information.

The builder can insert the athlete's facts, coach names, program information, video links, coach contact, and upcoming events. However, it does not pretend to research a school automatically. The athlete must add a real school-specific detail, such as an academic program, team value, coach philosophy, or recent result.

This decision was intentional. A generated email should save time, but it should not send fake or generic interest to a coach.

## Checkpoint 8: Adding Real College Data

The college directory was built from a source spreadsheet of men's volleyball programs and coach contacts. The source had repeated schools, inconsistent labels, and missing fields, so the information had to be grouped and cleaned before it could be used.

The current directory includes **293 programs and 722 grouped coach or staff contacts**. Missing information is left blank or marked for research instead of being invented. The school-fit questions use answers that actually change the results, including competitive level, region, contact availability, and number of schools requested.

The results are possible schools to research. They are not promises of admission, roster openings, scholarships, or coach interest.

## Checkpoint 9: Redefining the Jump Test

I kept a measurement tool because vertical and approach touch are useful on a recruiting profile, but it is no longer the main purpose of the app.

An earlier idea used the top of a volleyball antenna as a reference. That was not universal enough, so I changed the reference to a regulation men's net or a basketball rim. The user uploads one continuous video, keeps the camera still and the reference straight, and manually marks the floor, known reference height, standing reach, and peak touch.

This is described as a **video-calibrated estimate**, not an official measurement. Camera tilt, depth, motion blur, and an incorrect marker can all change the result. The next accuracy step is to compare repeated app measurements against a Vertec or another accepted measurement method.

## Checkpoint 10: Visual Design and Usability

The early app looked too much like a generic dark AI dashboard. I replaced that direction with an original visual system using forest green, coral, light blue, warm white, and dark text. I also replaced the earlier circular logo with a collegiate pennant built from volleyball-court geometry. The coral marker represents an athlete finding a place in the college system, giving the brand its own meaning and silhouette without resembling ChatGPT's mark.

Page transitions, school logos, progress states, clearer forms, and responsive layouts were added to make the product feel smoother and more complete. I tried to keep the design modern without making every section decorative or hiding the actual tasks.

## Checkpoint 11: Publishing the Website

The project originally ran only on localhost, which meant nobody else could open it. Moving it to GitHub Pages created another issue: some file paths worked locally but failed when the website was hosted inside a repository path.

I updated the build and routing so assets and page links work both locally and online. I also created a clean repository under the VolleyReach name so the final project is separate from the older Spike Analyzer experiments.

The MVP now runs publicly and stores prototype profile and outreach data in the user's browser. It does not yet have accounts or a cloud database, so information does not automatically move between devices.

## Checkpoint 12: Testing and Measuring Impact

The next stage is not adding random features. It is watching real players and coaches use the main workflow.

The first user test asks participants to complete or review a profile, find a relevant program, and build an email. A feedback form measures whether they completed the tasks, where they became confused, which feature was most useful, and whether they would use or recommend the app.

My initial pilot goals are:

- 20 athletes onboarded
- 12 completed profiles
- 60 programs saved
- 25 coach emails drafted or sent
- 3 school or club partners

These are goals, not results I have already achieved. I will only report real numbers after testing.

## What I Learned

The biggest lesson was that a complicated idea is not automatically a better one. The original computer-vision concept sounded impressive, but I could not validate it well enough to make responsible coaching claims. The pivot made the project more useful, testable, and realistic within the timeline.

I also learned that design does not fix a weak workflow. The app improved most when every page was connected to a real task: entering information once, finding schools, writing a stronger email, and remembering the next step.

VolleyReach is still an MVP. Coach information can change, users should verify details on official school sites, and the Jump Test still needs formal accuracy testing. The current version is a working foundation that can now be improved using real feedback instead of guesses.

## Project Links

- **New GitHub repository:** https://github.com/Raphael12345678910/VolleyReach
- **Live website:** https://raphael12345678910.github.io/VolleyReach/
- **MVP walkthrough:** https://github.com/Raphael12345678910/VolleyReach/releases/tag/mvp-walkthrough-v1
- **Feedback form:** https://docs.google.com/forms/d/e/1FAIpQLScaz1iEH-XhrXnl5kZaMHCllueFKvqbT4UcYdCB7X2wOU2W5A/viewform
