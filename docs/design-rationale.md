# Why this design direction works for Vinden

Oct 21, 2026 · @Oli & Hue

The new Vinden screens borrow Tripadvisor's interface patterns because both products do the same job: they turn evidence from real people into trust, so someone can make a decision quickly. We take the proven patterns, not the identity. The logo, palette and type are Vinden's own, and the brand colours are used with the restraint agreed in the branding meeting.

## Same job, proven patterns

Tripadvisor helps travellers decide where to go, using reviews from people who have been there. Vinden helps recruiters and peers judge a student, using work that has been checked and vouched for. Because the job is the same, the patterns that make Tripadvisor easy to trust carry over almost one for one.

| Tripadvisor pattern | Vinden equivalent | Why it matters for Vinden |
| --- | --- | --- |
| A place page: photos, details, reviews | A Proof of Work page: the work itself, its verification, its vouches | The unit of the product is a piece of work, not a list of claims |
| Rating bubbles and review count, e.g. 4.6 ●●●●◐ (63) | Vouch weight dots and vouch count, e.g. 8.6 ●●●●◐ (14) | One glance tells a recruiter how strongly the work is backed |
| "Recommended by 93% of travellers" | "Verified by AI and club review" | Says which checks the work has passed |
| Reviews shown with the reviewer's credentials | Vouches ranked by weight, with the voucher's role and years | Makes weighted vouching visible: a Growth Lead's 9.4 sits above a peer's 3.4 |
| Bookable listings with a price, e.g. "from $79 per adult" | Problem statements with the fee, e.g. "₹35,000 to your club" | Puts the club economy on the home screen |
| Saves and Trips | Saved work and saved briefs | Recruiters shortlist, students bookmark |
| Contributor profile with badges | Profile with milestones and a journey timeline | Rewards the habit of posting work |
| Floating tab bar, filter chips, carousels | The same on phones; top navigation and grids on desktop | Familiar to every 18–30 user, so there is nothing to learn |

## The work is the hero

Vinden's promise is "Proof of Work is the new résumé", so the work has to be the first thing anyone sees. Tripadvisor's layout is built for exactly that: big visuals, quiet surfaces, and text that stays out of the way.

- Every card opens with a large cover showing the work itself: the chart from a report, the screens from a design, the funnel from a brief.
- On a Proof of Work page, the work fills the top of the screen. On desktop the dataset and the deck sit beside it.
- Titles, scores and names sit under the work, never on top of it.

A résumé shrinks a project to one line of text. Here a recruiter sees what was made before reading who made it. In the demo the covers are drawn previews; in the product they would be generated from the files people upload.

## Trust at a glance

The hiring problem you described is volume: too many applications, and keyword filters that can't tell good work from good wording. Tripadvisor handles a similar overload with signals people read in a second. The design applies that to the trust layers you described in our meeting.

- **Vouch weight.** A score out of 10 and five dots on every card and page. Each vouch raises it, and a vouch from someone with a strong profile raises it more, so it rewards credible support, not popularity.
- **Verification.** "AI checked · Club verified" on every card. The work page shows the AI check, the club review and the company sign-off, each with its date.
- **Who did what.** A bar splits a team project by contribution, and each teammate confirms the split. This solves the first candidate problem you named: a résumé can't show one person's part in team work.
- **Experience.** Each role is marked "Manager confirmed" or "Offer letter verified · private", the two paths agreed in the meeting.

A recruiter can screen a page of candidates by these signals before opening a single profile.

## Brand colours, used with restraint

In the meeting you worried that the bright palette would feel jarring in the product, and that the logo read like a yoga or healthcare app. Tripadvisor shows that a vivid signature colour can live in a calm, professional interface: its bright green appears in small doses on a mostly white page. We follow the same rule, which is the brand-system and design-system split we agreed.

| Colour | Role in the interface | Where you see it |
| --- | --- | --- |
| Night Navy | Text and primary buttons | Headings, "Start task", the selected filter |
| Morning Cream | Page background | Every screen |
| Horizon Blue | Trust signals | Vouch dots, verified ticks, profile strength |
| Dawn Orange, as a lighter tint | The one main action on a screen | "Vouch for this work", "View brief" |
| Sun Gold, as tints | Milestones and highlights | Icon tiles, the For companies band |
| Dusk Lavender, as tints | Club and community | The club card |

Three things keep it from reading as a wellness app. Navy and cream dominate every screen. The layouts are dense with real information: scores, fees, dates and names. The soft gradients appear only in the logo, the profile ring and one editorial banner.

Only navy and blue are used for text on light backgrounds; orange, gold and lavender are fills. Every text colour meets the WCAG AA contrast standard.

## Clearly not LinkedIn

You want Vinden to look more modern than LinkedIn and to feel different in use. Choosing a discovery pattern instead of a social-feed pattern does most of that work.

- **A catalogue, not a feed.** LinkedIn is a stream of posts ordered by time. Vinden is browsed like a catalogue: cards of verified work and live briefs, filtered by category and searched by skill.
- **Evidence, not endorsements.** A LinkedIn endorsement is one click and counts the same from anyone. A Vinden vouch is weighted by who gives it, and shows their role and years.
- **A journey, not a résumé.** The profile leads with verified work and a timeline of milestones, in line with the brand line "Not a profile. A journey."
- **Modern by default.** Rounded cards, generous spacing, a floating tab bar and confident type put it a generation apart from LinkedIn's text-heavy layout.

## Built for both sides

Tripadvisor serves two audiences on one screen: travellers who choose, and businesses that want to be chosen. Vinden has the same two-sided shape, with clubs in between.

- **Students** see their next step on Home: this week's club task, their profile strength and the vouch requests waiting for them.
- **Clubs** see paid problem statements as listings with the fee shown, the way Tripadvisor shows a price. The club model depends on members wanting these briefs, so the fee to the club is on every card.
- **Companies and recruiters** get what they scan for: a score, the checks passed and who did what. On the website, a For companies band invites them to submit a problem, which is how companies join the Vinden network.

## One system for web and mobile

Vinden launches as a website and a mobile web app. Tripadvisor uses the same components across its iPhone app and its website, which made it a safe base for both.

| Element | Phone | Desktop |
| --- | --- | --- |
| Navigation | Floating tab bar at the bottom | Top bar with search, menu and Post work |
| Work and briefs | Swipeable carousels | Grids, four across |
| Proof of Work page | Full-width hero and a sticky vouch bar | Gallery, with a side panel for vouching |
| Profile | One column | Sidebar for identity, main area for work |

It is one responsive app, not two designs: the layout switches at 768 pixels wide. A working version with sample data runs now and is ready to demo.

## What we borrowed and what is Vinden's own

We took Tripadvisor's interaction patterns, which millions of people already know how to use. We did not take its identity.

**Borrowed patterns**

- Card layout, a rating-style score, filter chips, saves
- The floating tab bar and the sticky action bar
- The detail page: gallery, trust line, reviews ranked by credibility
- Contributor badges

**Vinden's own**

- The Sunrise logo, the wordmark and the palette
- Typography: Plus Jakarta Sans for headings, DM Sans for text, Instrument Serif for the journey line
- Weighted vouches, three-step verification, the contribution split and paid-brief listings, none of which Tripadvisor has
- The drawn work covers and the sunrise artwork

No one will mistake Vinden for Tripadvisor. It simply feels easy to use from the first visit.

## What still needs your decision

The direction is ready to refine. Three decisions will shape the next round.

- [ ] **The trust model.** The score, the three checks and the contribution split are our proposal. Confirm how AI checks, club review, vouches and experience checks combine, and what a recruiter should see first.
- [ ] **Confidential work.** Company briefs may involve private data. Decide whether work can stay private or recruiter-only, and whether the company approves it before it goes public. The design already has a Company sign-off step for this.
- [ ] **Testing with real users.** Before building further, put the working demo in front of five students and three recruiters, to check that the score and the checks read the way we intend.
