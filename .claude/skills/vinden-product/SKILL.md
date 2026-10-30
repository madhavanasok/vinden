---
name: vinden-product
description: Vinden's product requirements, roles, permissions, the 10 core UX flows (incl. communities and club recruitment) and the business rules (vouch score, verification, club economics). Use before designing or building any Vinden feature, screen or API, and whenever a question is about who can do what or what happens next in a flow.
---

# Vinden: requirements, roles and UX flows

Vinden is a proof-of-work professional network for 18 to 30 year olds in India. People post real work (Proof of Work), the work gets checked, other people vouch for it, and that evidence replaces the résumé. Brand line: "Proof of Work is the new résumé." Profile line: "Not a profile. A journey."

Full sources in this repo:
- `docs/roles-and-flows.md`: version 2 of the roles, the permissions table, the 10 flows and the open questions. The client-facing copy is the Notion page "Vinden roles and flows (v2, for review)".
- `docs/design-rationale.md`: why the interface looks the way it does.

The feature backlog is the Notion feature map. Every feature there names its flow, roles, priority and the components it uses.

## Who it serves

| Group | Roles | Main jobs |
|---|---|---|
| Without signing in | Recruiter or HR, Hiring manager, Founder (esp. early-stage) | View and search public work, profiles and club portfolios; managers confirm a past role by email link. Save, shortlist, contact and vouch need sign-in (our proposal) |
| Account holders | Student (launch audience), Early-career professional (1–4 yrs), Founder or freelancer, Alumni and industry professionals | Post Proof of Work, get it verified, collect vouches, follow communities, find briefs and openings, verify past roles; alumni vouch with high weight |
| Vinden Club | Applicant, Member (~30 a year, usually 2nd-year), President, Learning & Development (3–4), Industry & Outreach (2), Proof of Work & Quality (2), Community & Events (2), Partnerships & Strategy (1), Social Media & Communications (1) | Learn in cohorts, do club tasks and paid briefs, review members' work, run the club and its community |
| Communities | Follower, Approved member (closed communities), Community admin | Follow updates and events; admins post and approve join requests |
| Companies | Company admin, Recruiter with a company account | Admin: submit problem statements, sign off delivered work, pay the club. Recruiter: shortlist, contact, post openings |
| Vinden | Central team | Run the platform and platform communities, approve new clubs, audit reviews, check offer letters, set revenue guidelines |

One person can hold several roles, for example a Member who is also on the Core Team and follows five communities. The Vinden Club is **exclusive** (about 30 members, strict selection), so following a club's community never makes someone a member. A club usually belongs to one college but can be an independent body serving several colleges. College administration needs no account. The AI verification service is a system, not a role.

## Permissions (our proposal; not yet confirmed by the client)

| Action | Visitor (not signed in) | Students and pros | Core Team | Company | Vinden |
|---|---|---|---|---|---|
| View and search public work, profiles, club portfolios | Yes | Yes | Yes | Yes | Yes |
| Save, shortlist, contact | Sign in first | Save only | Save only | Recruiters | — |
| Post Proof of Work | — | Yes | Yes, as members | — | — |
| Verify work in club review | — | — | PoW & Quality, own club only | — | Audits |
| Vouch | — | Yes, weighted | Yes | Yes, as professionals | — |
| Verify own experience | Managers confirm by link | Yes | Yes | — | Checks offer letters |
| Join an open community / request a closed one | — | Yes | Yes | Yes | Yes |
| Post and approve requests in a community | — | Admins only | Their club's community | — | Platform communities |
| Apply to a club | — | Eligible students, while recruitment is open | — | — | — |
| Select members / survey / courses / tasks | — | — | Core Team / L&D | — | Shares templates |
| Submit a problem statement | — | — | Outreach, for a company | Company admin | — |
| Accept a brief, staff it | — | Members join when picked | Outreach and President (open) | — | — |
| Sign off and pay for a brief | — | — | — | Company admin, own briefs | — |
| Approve a new club | — | — | — | — | Yes |

## The 10 flows

Flows 1, 5, 6 and 8 changed and 9 and 10 are new after the review call with Harsh (version 2).

1. **Sign up and onboarding (short, skippable).**
   1. Email.
   2. Pick a type: student, early-career professional, founder or freelancer. The only step that can't be skipped.
   3. About you (skippable): students add college and year; others add role and organisation.
   4. Communities (skippable): suggestions by college and interests; the college's Vinden Club community first ("Follow for updates, events and the next recruitment").
   5. Land on Home. Profile strength collects everything else later: skills and interests, past roles (Flow 4), résumé, then a first Proof of Work (Flow 2).

   Never offer to join or apply to a Vinden Club during sign-up. Companies sign up separately on the website. Under review with the client.
2. **Post and verify Proof of Work.**
   1. Describe the work: title, kind (Club task, Paid brief, Internship, Independent project), category, what you did, files and links. Work without images gets a generated cover (kind, title, file type; tone assigned from the work).
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
5. **Vinden Club: starting a club and yearly recruitment.**
   - Starting: a founding Core Team applies; the Vinden team approves a club for one college, a group of colleges or as an independent body; its page and community open.
   - Recruitment (yearly): Community & Events announce it in the club community (followers notified); eligible students apply while it is open; motivation form, screening, interview, practical task (can become the first Proof of Work), final selection of about 30, usually second-year students; new members get the interest survey.

   There's never a fee. Every stage can decline, and the applicant hears back at each one. Applicants who aren't selected stay followers and can reapply next year. The Core Team needs an applications board.
6. **Learning and development (club learning loop).**
   1. After recruitment, L&D send new members an interest survey.
   2. Top interests set the course plan and the number of cohorts, following the college's focus (e.g. AI and design, not web development).
   3. Seniors (third-years) design the courses: lessons, tasks, projects, resources, plus alumni and industry sessions.
   4. Members join cohorts by interest; not every member takes every course.
   5. Posting Proof of Work is how a task gets marked done, not an extra step.
   6. The Quality team works through a review queue; progress shows on the club page and each member's journey.
7. **Paid problem statement.** There are four lanes: Company, Club (Outreach and President), Student team, Vinden.
   1. The company admin, or Outreach on the company's behalf, submits a problem with scope, timeline and fee.
   2. The club accepts it and forms a team.
   3. The team works, and the Quality team reviews the work before it's delivered.
   4. The company signs off.
   5. Then two things happen at once: the company pays the club, and the team posts the work through Flow 2. The work joins the club portfolio (Flow 10).

   100% of the fee stays with the club; Vinden takes nothing. The company stays in the network and can hire from the work. Who manages, schedules and staffs a paid project inside the club is open.
8. **Finding talent, with or without signing in.** Recruiters and HR, hiring managers and founders.
   1. Open a shared link, or search by skill, category, college or club. No account needed to view.
   2. Filter by vouch weight and by the checks passed.
   3. Scan the cards.
   4. Open the work to see who did what.
   5. Open the profile or the club portfolio.
   6. Sign in to save, shortlist, message or invite to an opening (recruiters use a company account).
9. **Communities.** Three types: platform communities (Vinden, open), a club community per Vinden Club (open, run by Community & Events; following ≠ membership) and closed communities (join by admin approval).
   - Open: Join → updates and events → notifications.
   - Closed: Request to join → Requested → admin approves or declines → notified either way.

   Every community is shown as a Community card: name, type, followers, latest update, and one action (Join, Joined, Request to join, Requested). A club community carries announcements, events, sessions, showcases and recruitment news.
10. **Showcasing at three levels.** A person (profile: all verified work, with their part in team work), a team (the Proof of Work page plus each teammate's profile, with roles and shares) and a club (portfolio of every club task and paid brief, with totals: work verified, earned, companies).

## Business rules (implemented in the demo; keep them consistent)

- **Vouch score:** `score = round(10 × (1 − e^(−Σweights / 25)), 1)` (apps/api/src/score.ts). A voucher's weight comes from their profile: a professional with verified work weighs about 9, a new peer about 3.
- **Dots:** dots = score ÷ 2. Below .25 rounds down, .25 to .74 shows a half dot, and .75 and up rounds up. Always show the number next to the dots.
- **Checks** always appear in a fixed order: AI check, Club review, Company sign-off. Cards list only the checks that passed.
- **Contribution split:** teammates' shares sum to 100% and show as unconfirmed until each teammate confirms.
- **Money:** in rupees with Indian grouping (₹1,20,000). The fee on a brief always says where it goes: "to your club".
- **Club:** exclusive. About 30 members a year (usually second-year students, chosen in a yearly recruitment) and a Core Team of 12 or 13. Students never pay. A club can serve one college, several, or be independent.
- **Communities:** following a community (including a club's) never grants club membership. Closed communities need admin approval.
- **Sign-up:** only "What describes you" is required; everything else is skippable and resurfaces in profile strength.

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

New after the review call (version 2), in priority order:
- Which sign-up fields are required (we suggest only "What describes you").
- Who can create communities (we suggest the Vinden team and clubs at launch).
- Who can post in a community (we suggest admins post; followers react and RSVP).
- Which students can apply to a club, and how their college is checked (we suggest club-set years, second year by default; college email at application).
- Who oversees independent and multi-college clubs.
- Who manages, schedules and staffs paid projects inside a club.
- Club-made courses only, or also a central course library.
- What people can do without signing in (we suggest view and search).
- How private paid work appears in a club portfolio.

When a feature depends on one of these, design the most reversible option and record it in the Notion feature's Notes.

## Glossary

Use these words exactly as written:
- **Proof of Work** (capitalised): one piece of posted work.
- **vouch**: never "endorse".
- **brief** or **problem statement**: paid company work for a club.
- **Core Team**: the club's student leadership.
- **chapter**: one club (usually one college's).
- **community**: an open or closed group people follow for updates and events. A **club community** is a club's open community; its followers are not members.
- **recruitment**: a club's yearly selection of members.
- **cohort**: the members taking one course together.
- **checks**: the verification steps.
- **split**: the contribution shares.

Related skills: vinden-information-architecture, vinden-visual-guidelines, vinden-build-feature.
