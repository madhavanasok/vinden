---
name: vinden-product
description: Vinden's product requirements, roles, permissions, the 8 core UX flows and the business rules (vouch score, verification, club economics). Use before designing or building any Vinden feature, screen or API, and whenever a question is about who can do what or what happens next in a flow.
---

# Vinden: requirements, roles and UX flows

Vinden is a proof-of-work professional network for 18 to 30 year olds in India. People post real work (Proof of Work), the work gets checked, other people vouch for it, and that evidence replaces the résumé. Brand line: "Proof of Work is the new résumé." Profile line: "Not a profile. A journey."

Full sources in this repo:
- `docs/roles-and-flows.md`: all 18 roles, the permissions table, flows and gaps.
- `docs/design-rationale.md`: why the interface looks the way it does.

The feature backlog is the Notion feature map. Every feature there names its flow, roles, priority and the components it uses.

## Who it serves

| Group | Roles | Main jobs |
|---|---|---|
| Account holders | Student (launch audience), Early-career professional (1–4 yrs), College founder or freelancer | Post Proof of Work, get it verified, collect vouches, find briefs and openings, verify past roles |
| Companies | Company admin, Recruiter or hiring manager | Admin: submit problem statements, sign off delivered work, pay the club. Recruiter: search verified work, shortlist, contact |
| Vinden Club (per college) | Applicant, Member (~30), President, Learning & Development (3–4), Industry & Outreach (2), Proof of Work & Quality (2), Community & Events (2), Partnerships & Strategy (1), Social Media & Communications (1) | Learn, do club tasks and paid briefs, review members' work, run the chapter |
| Outside the platform | Manager (no account), Alumni and industry professionals (account only to vouch), College administration | Confirm a past role by email link; vouch with high weight; support the chapter |
| Vinden | Central team | Run the platform, audit reviews, check offer letters, start chapters, set revenue guidelines |

One person can hold several roles, for example a Member who is also on the Core Team. The AI verification service is a system, not a role.

## Permissions (our proposal; not yet confirmed by the client)

| Action | Students and pros | Core Team | Company | Vinden |
|---|---|---|---|---|
| Post Proof of Work | Yes | Yes, as members | — | — |
| Verify work in club review | — | PoW & Quality, own club only | — | Audits |
| Vouch | Yes, weighted | Yes | Yes, as professionals | — |
| Verify own experience | Yes | Yes | — | Checks offer letters |
| Apply to a club | Students at a chapter college | — | — | — |
| Select members / publish tasks | — | Core Team / L&D | — | Shares templates |
| Submit a problem statement | — | Outreach, for a company | Company admin | — |
| Accept a brief, form its team | — | Outreach and President | — | — |
| Sign off and pay for a brief | — | — | Company admin, own briefs | — |
| Search and contact students | Search only | Search only | Recruiters | — |

## The 8 flows

1. **Sign up and onboarding.** Email, then pick a type (student, early-career, founder or freelancer). Students add their college and see its club if it has one. Pick skills and interests, which shape Home. Add past roles (Flow 4), then post a first piece of work (Flow 2). Onboarding ends with posted work, because an empty profile has nothing to verify. Companies sign up separately on the website.
2. **Post and verify Proof of Work.**
   1. Describe the work: title, kind (Club task, Paid brief, Internship, Independent project), category, what you did, files and links.
   2. Add teammates, their roles and their shares. Shares add up to 100%. Solo work skips this step.
   3. Teammates confirm their shares.
   4. AI check of the files and claims, which takes minutes.
   5. Club review by the Proof of Work & Quality team. This applies to club work only.
   6. Company sign-off. This applies to paid briefs only, and the company also decides whether the work is public or private.
   7. Published: the checks appear on the work, and vouching opens.

   Any failed check returns the work to its author with a reason, and resubmitted work goes through every check again.
3. **Vouch.**
   1. Open a work and choose "Vouch for this work".
   2. Pick the skills you're vouching for, with an optional note.
   3. See your vouch weight before you confirm.
   4. The vouch appears on the work, the score rises and the author is notified.
   5. You can undo it later.

   Authors can ask specific people for a vouch by link. Teammates can't vouch for their own team's work (the demo blocks it). Rules to stop vouch-trading are still open.
4. **Verify experience.** Two paths:
   - Manager email: the manager clicks a link, with no account needed.
   - Private offer letter: only Vinden's reviewers see the letter.

   The profile shows only the badge: "Manager confirmed" or "Offer letter verified · private". If the manager doesn't reply after a reminder, the person can switch paths. If the manager declines, the role stays unverified.
5. **Join a club.** Motivation form, screening, interview, practical task (which can become the applicant's first Proof of Work), then final selection of about 30 members. There's never a fee. Every stage can decline, and the applicant hears back at each one. The Core Team needs an applications board.
6. **Club learning loop.** Learn, work, create Proof of Work, get it verified, build a portfolio, access opportunities. Posting Proof of Work is how a club task gets marked done, not an extra step. L&D publish tasks with due dates; the Quality team works through a review queue.
7. **Paid problem statement.** There are four lanes: Company, Club (Outreach and President), Student team, Vinden.
   1. The company admin, or Outreach on the company's behalf, submits a problem with scope, timeline and fee.
   2. The club accepts it and forms a team.
   3. The team works, and the Quality team reviews the work before it's delivered.
   4. The company signs off.
   5. Then two things happen at once: the company pays the club, and the team posts the work through Flow 2.

   100% of the fee stays with the club; Vinden takes nothing. The company stays in the network and can hire from the work.
8. **Recruiter discovery.**
   1. Search by skill, or browse by category, college or club.
   2. Filter by vouch weight and by the checks passed.
   3. Scan the cards.
   4. Open the work to see who did what.
   5. Open the profile.
   6. Shortlist, then message or invite to an opening.

## Business rules (implemented in the demo; keep them consistent)

- **Vouch score:** `score = round(10 × (1 − e^(−Σweights / 25)), 1)` (apps/api/src/score.ts). A voucher's weight comes from their profile: a professional with verified work weighs about 9, a new peer about 3.
- **Dots:** dots = score ÷ 2. Below .25 rounds down, .25 to .74 shows a half dot, and .75 and up rounds up. Always show the number next to the dots.
- **Checks** always appear in a fixed order: AI check, Club review, Company sign-off. Cards list only the checks that passed.
- **Contribution split:** teammates' shares sum to 100% and show as unconfirmed until each teammate confirms.
- **Money:** in rupees with Indian grouping (₹1,20,000). The fee on a brief always says where it goes: "to your club".
- **Club:** about 30 members and a Core Team of 12 or 13. Students never pay.

## Open decisions (don't invent answers; flag them)

Check these before designing anything in these areas:
- How trust signals combine into what a recruiter sees.
- Who reviews the reviewers.
- Confidential company work (private or recruiter-only Proof of Work).
- How a brief's team is chosen.
- Payments: whether companies pay through Vinden, and whether a club can hold money.
- How Vinden earns (likely on the company side).
- Whether the club is separate from hiring.
- Core Team size (12 or 13).
- What happens when a manager never replies.

When a feature depends on one of these, design the most reversible option and record it in the Notion feature's Notes.

## Glossary

Use these words exactly as written:
- **Proof of Work** (capitalised): one piece of posted work.
- **vouch**: never "endorse".
- **brief** or **problem statement**: paid company work for a club.
- **Core Team**: the club's student leadership.
- **chapter**: one college's club.
- **checks**: the verification steps.
- **split**: the contribution shares.

Related skills: vinden-information-architecture, vinden-visual-guidelines, vinden-build-feature.
