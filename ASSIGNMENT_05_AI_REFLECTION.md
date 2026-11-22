# AI reflection — draft for student review and personalization

The first-person draft below describes my use of assistance, not a claim that I personally
ran the assistant's commands. Review and personalize it before submission. Only the draft
between the markers counts toward the required 200–300 words.

<!-- REFLECTION START -->
I used Codex to help examine and improve my existing Smart Campus repository. The Codex model used was GPT-6.1 Sol. I supplied the repository, assignment branch, baseline commit, Phase 1 commit, preservation requirements, and instructions to separate observations from assumptions. This context helped keep the work focused on the existing application.

The most useful suggestion was to test the explanation fallbacks against the same response validator used for normal output. This exposed a concrete inconsistency: unavailable fallbacks contained three sentences although the contract allowed only two. A small wording change resolved it without changing availability decisions.

I also learned to question plausible findings. A delayed explanation could overwrite newer state in controlled tests, but the default mock resolves immediately. I should not describe this as a manually reproduced browser failure. Similarly, critical development dependency advisories do not automatically prove that the deployed browser application is exploitable.

The assistant ran focused failing regressions, focused checks after each fix, dependency audits, and the final automated verification commands. I have not independently repeated those checks or completed screenshots. Seeing failures before changes made the evidence stronger than accepting a confident code suggestion alone.

AGENTS.md helped establish architecture, safe commands, scope limits, and human review responsibilities. It also made clear that written instructions do not enforce tool permissions. For future work, I would prioritize reviewed dependency maintenance, configuration type checking, CI enforcement, and independent browser checks. Before submission, I need to inspect the diff, personalize this reflection, and verify the reported behavior myself.
<!-- REFLECTION END -->
