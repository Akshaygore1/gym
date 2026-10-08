# Experience-aware gym planning: research findings

**Researched/accessed:** 8 October 2026. **Status:** research only; proposed product choices need approval before implementation. No application code, configuration, or build was changed.

Scope: general adult workout planning and mobile interfaces, not medical advice, rehabilitation, or a guaranteed training prescription. The existing `README.md` describes a beginner trainer using localStorage and an offline PWA. Detailed Stitch/app comparison is outside this note.

## 1. What the primary sources support

- **Individualize, rather than equate experience with difficulty.** ACSM's new **2026 position stand updates the 2009 guidance**. It recommends tailoring resistance training to goals, needs, experience, adherence, enjoyment, and safety. Many forms of resistance training produce benefits; complicated programming and training to failure are not prerequisites. Most included evidence concerns inexperienced trainees, though trained participants are also represented. [1]
- **Goal changes programming priorities.** The 2026 stand finds that load influences strength adaptations and weekly set volume influences hypertrophy. These are group-level findings, not permission to prescribe heavy loads to every beginner or automatically add volume to every advanced user. The paper explicitly notes uncertainty about exact effort/RIR targets. [1] (Discussion and Table 6)
- **Schedule and recovery matter independently of the label.** NSCA's first-party guidance considers training status, fitness, exercise selection, volume/intensity, work/family commitments, other exercise, and physical/psychological stress when setting frequency. It describes nonconsecutive full-body sessions for novices and split routines as an option for experienced trainees. This is a **2017 textbook excerpt**, not the latest ACSM stand; its higher-frequency examples should not become mandatory tier rules. [2]
- **Available equipment is a real constraint, not an experience test.** ACSM recognizes bands and home-based resistance training as effective options; machines versus free weights did not alter strength outcomes in the included comparisons. An advanced user need not use barbells, and a beginner need not be barred from them solely by a badge. Equipment-specific technique and suitability still require consideration. [1] (Results and Discussion)
- **Public-health activity targets are not workout-session quotas.** CDC describes at least 150 minutes of moderate-intensity aerobic activity, or 75 minutes vigorous/equivalent combination, plus muscle-strengthening activity involving major muscle groups on at least two days weekly. Activity can be divided into smaller chunks. These numbers do **not** define one gym visit's duration or prove that every visit needs a finisher. [3]
- **Starting smaller is legitimate.** CDC advises starting slowly, building gradually, choosing enjoyable activities and times, and considering professional guidance for chronic conditions. WHO emphasizes that some activity is better than none, all activity counts, and less sedentary time matters. Walking is a first-party-supported way to become more active. [4], [5]

**Advanced-programming uncertainty:** ACSM 2026 could not determine periodization's impact on strength overall and found no hypertrophy advantage in the included comparisons. It also acknowledges understudied ordering/peaking questions. This does not establish that periodization is useless for athletes, nor substantiate a particular block length, deload schedule, or percentage-based progression algorithm for this app. [1] (Table 4 and Discussion)

## 2. Proposed app choices — not scientific classifications

The reviewed guidance does not validate a universal three-tier onboarding classifier. Use editable, plain-language descriptions of support needs and current training history, not a strength leaderboard or automatic promotion after a fixed number of visits. These choices apply the individualization principle, but the exact interface is a product proposal. [1], [2]

| Experience | Meaningful onboarding difference | Meaningful ongoing experience |
| --- | --- | --- |
| Beginner | “New to lifting, returning, or want step-by-step help.” Ask about equipment familiarity and confidence; allow “not sure.” Explain sets, reps, and loading without requiring prior numbers. | Guided setup and exercise cues, straightforward session order, easy substitutions, simple effort feedback, and visible help. Progress emphasizes learning and actual logged sessions. |
| Intermediate | “Comfortable with familiar exercises and regular training.” Ask about current routine, preferred exercises, and recent working loads if known. | Quicker logging with help available on demand, previous-session context, editable substitutions, and actual load/repetition trends. Offer schedule-appropriate routine choices rather than merely heavier beginner defaults. |
| Advanced | “Manage an established routine and want programming control.” Ask about specific priorities, existing routine, and relevant training history; keep detailed inputs optional. | Compact set logging, editable exercise order/sets/targets, history and weekly workload review. Optional program organization, not compulsory complexity, maximal testing, or automatically generated peaking plans. |

**Shared personalization inputs:** goal, realistic training days, equipment available, preferred session time, and relevant movement limitations/need for professional guidance. Explain what each answer changes; allow later editing. Time should constrain exercise selection and workload, not silently compress rest or promise an exact completion time. Goals/schedule/equipment have source support; the particular input sequence and time-budget behavior are proposed UX choices. [1], [2], [4]

### Proposed safety and honesty guardrails

- **No universal starting kilograms/pounds.** Let users select a suitable starting load with clear technique/setup guidance; distinguish previous logged load from a recommendation. Do not require a one-repetition-max test during onboarding. ACSM discusses relative loading, variability, and individualization; it does not supply universal absolute starting weights. [1]
- **No hidden guaranteed progression.** Keep targets editable and distinguish plans from results. A “too easy” response alone should not be presented as proof of technique, readiness, or a safe automatic increase. Exact progression rules need a separately reviewed specification; no formula is established here.
- **No fabricated calories or outcomes.** These sources do not validate calories burned from a simple sets/reps log. Prefer recorded work and elapsed time; show empty states without invented trends. Avoid “fat-burn finisher” as a universal requirement or claims of predictable fat loss.
- **No punitive streaks.** Rest, missed visits, and skipped optional activity should not erase training history or trigger catch-up heavy sessions. Use neutral weekly activity/history instead. This is a proposed product ethic, not a claim that the reviewed sources studied streak mechanics; it aligns with recovery and sustainable participation. [1], [2]
- **Do not present the app as medical clearance.** Make pause/stop and seeking appropriate professional guidance available without diagnosing symptoms or asserting all listed exercises are safe for everyone. Healthy-adult evidence cannot be silently generalized to rehabilitation or special populations. [1], [4]

## 3. “Homework” — clarified as Home Workout mode

The user confirmed during research that “homework” means the **Home Workout mode in the reference screens**, not between-visit assignments. A separate homework checklist is therefore outside the proposed scope.

Home-based resistance training is an evidence-supported option, not merely a lesser version of gym training. [1] The proposed app should use routines matched to actual home equipment, the user's goals, experience/support needs, and available time. Bodyweight and dumbbell options are product choices; the exact routines and progression rules require an implementation specification rather than an unsupported universal prescription.

Switching from gym to home should substitute an appropriate planned session, not automatically add heavy “make-up” work. Record home sessions honestly and include them in training history; explain equipment limitations rather than inventing equivalent results. Workload/recovery considerations still apply. [1], [2]

## 4. Mobile interface requirements

Target WCAG 2.2 A/AA across **complete onboarding and workout processes**, not just isolated buttons. The following are relevant checks, not a complete conformance audit. [6]

| Concern | Source-supported requirement and proposed application |
| --- | --- |
| Onboarding structure | WAI advises logical smaller steps, progress information, recognizable optional stages, and retaining answers when reviewing earlier steps. Show accurate branch-dependent progress and explicit Back/Continue; do not make users re-enter unchanged answers within the same process (WCAG 3.3.7, A). [7], [6] |
| Labels and errors | Provide labels/instructions and identify input errors in text (3.3.1/3.3.2, A). Give choice controls programmatic names, roles, and states (4.1.2, A); selecting a card must not be only a visual border change. [6] |
| Touch targets | 2.5.8 (AA) requires at least **24 × 24 CSS px**, subject to its specified spacing/equivalent/inline/other exceptions. **44 × 44 CSS px** is the enhanced AAA criterion (2.5.5), proposed here for prominent logging/timer controls—not an AA minimum. [6] |
| Legibility | Normal text contrast at least **4.5:1**, large text **3:1**, subject to defined exceptions (1.4.3, AA). Necessary control/state graphics need **3:1** against adjacent colors (1.4.11, AA). Selection/completion must not rely on color alone (1.4.1, A). Check actual Stitch-derived colors rather than assuming neon-on-dark passes. [6] |
| Small screens and zoom | Support 200% text resizing without lost content/functionality (1.4.4, AA) and reflow at **320 CSS px** width, except inherently two-dimensional content (1.4.10, AA). Avoid forced portrait orientation (1.3.4, AA); logging fields and help must remain reachable. [6] |
| Keyboard and focus | All functionality keyboard-operable (2.1.1, A), meaningful focus order (2.4.3, A), visible focus (2.4.7, AA), and focused controls not entirely obscured by author-created content (2.4.11, AA). Apply especially to drawers and sticky bottom workout actions. [6] |
| Timers and feedback | Time limits require the applicable turn-off/adjust/extend mechanism or a valid exception (2.2.1, A). Proposed rest timers are advisory: pause/extend/skip without expiring a logging task or forcing the next set. Programmatically expose saved/error status without moving focus (4.1.3, AA); avoid announcing every countdown tick. [6] |
| Exercise media and motion | Supply appropriate text alternatives and media accessibility, including captions/audio description where applicable (1.1.1 and 1.2). Preserve usable text cues when media is unavailable offline—an app requirement, not a WCAG offline mandate. Avoid unnecessary animation; honoring reduced motion is proposed beyond the A/AA baseline (2.3.3 is AAA). [6] |

**Design proposal, not a research fact:** each screen should prioritize its real task—understand today's plan, learn a movement, log a set, or review history. Remove placeholder stats, repetitive motivational cards, decorative badges, and jargon where they compete with that task. Experience differences should change guidance and control, not readability or access to help.

## 5. Sources and access notes

All links below were accessed **8 October 2026**. Only primary publications, organizational guidance, and W3C material are used; no third-party fitness summaries support the findings.

1. **ACSM, 2026 position stand:** *Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews*. Online 5 March 2026; April 2026 journal issue; DOI [10.1249/MSS.0000000000003897](https://doi.org/10.1249/MSS.0000000000003897). [Full original publication, open access via PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/). Abstract, Methods, Tables 4/6, and Discussion reviewed. Evidence search current to October 2024; predominantly novice, healthy-adult evidence limits advanced/special-population conclusions. [ACSM's first-party announcement, 17 March 2026](https://acsm.org/resistance-training-guidelines-update-2026/) corroborates the update but does not replace the paper.
2. **NSCA, May 2017:** [Determination of Resistance Training Frequency](https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/). Official excerpt from *NSCA's Essentials of Personal Training*, second edition; guidance rather than a newly published systematic review. Use for contextual schedule/recovery considerations, not rigid higher-tier frequency requirements.
3. **CDC, 20 December 2023:** [Adult Activity: An Overview](https://www.cdc.gov/physical-activity-basics/guidelines/adults.html). Official public-health guidance; not an individualized lifting prescription.
4. **CDC, 4 December 2025:** [Steps for Getting Started With Physical Activity](https://www.cdc.gov/healthy-weight-growth/physical-activity/getting-started.html). First-party gradual-start, enjoyment, schedule, walking, and professional-guidance advice.
5. **WHO, 26 June 2024:** [Physical activity fact sheet](https://www.who.int/news-room/fact-sheets/detail/physical-activity). First-party summary linking WHO's 2020 activity guidelines; supports “some is better than none” and inclusive activity messaging, not a homework dose.
6. **W3C, 12 December 2024 Recommendation:** [WCAG 2.2, dated version](https://www.w3.org/TR/2024/REC-WCAG22-20241212/); [current published URL](https://www.w3.org/TR/WCAG22/). Normative success criteria and conformance requirements. A/AA requirements and optional AAA enhancements are distinguished above; full conformance still needs testing.
7. **W3C WAI, updated 27 July 2019:** [Multi-page Forms tutorial](https://www.w3.org/WAI/tutorials/forms/multi-page/). Informative implementation guidance, not a separate normative standard.

[1]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/
[2]: https://www.nsca.com/education/articles/kinetic-select/determination-of-resistance-training-frequency/
[3]: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html
[4]: https://www.cdc.gov/healthy-weight-growth/physical-activity/getting-started.html
[5]: https://www.who.int/news-room/fact-sheets/detail/physical-activity
[6]: https://www.w3.org/TR/2024/REC-WCAG22-20241212/
[7]: https://www.w3.org/WAI/tutorials/forms/multi-page/
