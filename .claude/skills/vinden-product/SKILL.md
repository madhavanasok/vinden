---
name: vinden-product
description: Vinden's product requirements from the feature register, covering the roles, the 10 user flows (sign-up, Proof of Work, vouching, experience, communities, club recruitment and training, paid problem statements, finding talent, showcasing), the business rules and the open questions. Use before designing or building any Vinden feature, screen or API, and whenever a question is about who does what or what happens next in a flow.
---

# Vinden: requirements, roles and flows

Vinden is a proof-of-work professional network for 18 to 30 year olds in India. People post real work (Proof of Work), the work gets verified, experienced people vouch for it, and that evidence replaces the résumé. Brand line: "Proof of Work is the new résumé." Profile line: "Not a profile. A journey."

## The spec, and which source wins

- **The spec:** `docs/vinden-feature-register-v0.1.html`, the feature register shared with the client.
  - It has 12 features (FN-01 to FN-12) and 36 screens, each with a numbered "Must contain" list.
  - It also has 10 flows (FL-01 to FL-10), 25 roles and 40 open questions (R-01 to R-40).
  - Build every "Must contain" item.
- **For the Vinden Club, the client PDF "Vinden Club: Proposed Structure and Operating Model" is the authority.** Where a call says something different, the register lists it as an open question, never as a fact. These include:
  - second-year-only recruitment (R-27);
  - seniors designing courses (R-28);
  - an interest survey and cohorts (R-29);
  - a central course library (R-30);
  - clubs serving several colleges (R-31).
- **Areas the PDF doesn't cover come from the meetings:**
  - sign-up, communities, vouching and experience verification;
  - Harsh's direction that sign-up asks no questions.
- **Don't invent rules.** When a screen depends on an open question, build the most reversible behaviour and comment `// Open question R-xx`.

## Roles

| Group | Roles | What they do |
|---|---|---|
| Account holders | Student, Early-career professional (1–4 years), Founder, Freelancer, Experienced user | Post work, follow communities, verify past roles; experienced users vouch (who counts is open, R-13) |
| Vinden Club (one per college) | Club applicant, Club member (about 30), Core Team (about 10–12): Club President / Chapter Lead 1, Learning & Development 4 (3 in the PDF's closing summary, R-21), Industry & Outreach 2, Proof of Work & Quality 2, Community & Events 2, Partnerships & Strategy 1, Social Media & Communications 1 | Selection, training, verifying members' work, outreach, revenue |
| Communities | Member, Admin (closed communities), Creator | Updates and events; admins approve requests |
| Companies | Company (one account across the website and app) | Submit problem statements, pay the club; could eventually track projects and evaluate solutions (R-20) |
| Without signing in | HR, Manager, early-stage company Founder | Find talent through work; managers confirm a past role from an email link |
| Others | Alumni and industry professionals, College administration, Vinden central team | Sessions and real problems; college relations; platform communities |

One person can hold several roles. AI verification is a system, not a role. Permissions per role aren't set (R-26); the build gates screens by what the sources say each role does.

## The 10 flows

1. **Sign up and complete the profile (FL-01).**
   - Sign-up asks for an email address only and lands straight on Home.
   - The completion bar on Home then asks the rest, each step skippable: what describes you, college and year (students), join communities (the college's club community first), and skills and experience.
   - The order isn't decided (R-02).
   - Never offer club membership in sign-up.
2. **Post and verify work (FL-02).**
   - The post: title and description; kind (project, task, case study, real-world assignment) and area (business problems, market research, product analysis, case studies, data analysis, design, technical, entrepreneurship, research); the files, with images optional (without them, a generated card).
   - Solo or team, with teammates and what each did.
   - Club members link the club task.
   - Then the AI check, and club review by the Core Team (led by Proof of Work & Quality) for club work. The order of the two is open (R-09).
3. **Vouch (FL-03).** Open the work, vouch, and the weight comes from the voucher's profile strength. Skills, notes, undo and requesting vouches are not in the sources (R-38).
4. **Verify experience (FL-04).** The manager confirms by an emailed link, or the person uploads the offer letter privately. Who checks letters, and what happens without a reply, is open (R-08).
5. **Join a community (FL-05).** Open communities: Join. Closed ones: Request to join, and the admin approves. Following a club's community is not membership.
6. **Club recruitment (FL-06).**
   - Selection can include: motivation form, screening, interview, practical task or project, final selection.
   - About 30 members are chosen, on eight factors, not academic performance alone.
   - Open to the whole college, with no fee.
7. **Club learning loop (FL-07).**
   - Learn, work, Proof of Work, verification, portfolio, opportunities.
   - The Core Team's training program: projects, tasks and challenges, alumni sessions, industry sessions, curated learning paths.
8. **A paid problem statement (FL-08).**
   - Company, then problem, student team, solution, Proof of Work.
   - Outreach collects problems and follows up on outcomes; the Core Team manages projects.
   - The company pays the club and Vinden takes no share.
   - Who picks the team, the price and payment are open (R-19).
9. **Find talent (FL-09).** The work repository works without signing in. Search, open the work, open the person or their club. What happens next is open (R-25).
10. **Showcase at three levels (FL-10).** A person (profile), a team (the work page) and a club (its portfolio).

## Business rules

- **Vouch score:** `score = round(10 × (1 − e^(−Σweights / 25)), 1)` (apps/api/src/features/work.ts uses score.ts). A voucher's weight comes from their profile.
- **Dots:** dots = score ÷ 2. Always show the number next to the dots.
- **Checks:** AI check, Club review, and Company sign-off on older paid work. Cards list only the checks that passed.
- **Money:** rupees with Indian grouping (₹1,20,000). Problem statements carry no fee until pricing is decided (R-19).
- **Club:**
  - One per college: a Core Team of about 10–12 and about 30 selected members.
  - Students never pay.
  - The club keeps all project revenue, and the Core Team decides its use within club guidelines.
- **Communities:** following one never grants club membership. Closed communities need the admin's approval.
- **Sign-up:** an email only. Profile completion collects the rest.

## Glossary

Use these words exactly as written:
- **Proof of Work** (capitalised): one piece of posted work. Never "PoW".
- **vouch**: never "endorse".
- **problem statement**: a company's real problem for a club. The code calls these briefs.
- **Core Team**: the club's student leadership.
- **community**: an open or closed group people follow for updates and events. A **club community** is a club's open community; its followers aren't members.
- **training program**: the club's projects, tasks, sessions and learning paths.
- **completion bar**: Home's "Complete your profile" panel.

Related skills: vinden-information-architecture, vinden-visual-guidelines, vinden-build-feature.
