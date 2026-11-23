# Day 5 — Explain

Outcome: document the design, review a teammate, and present the store. Swap repos with a review partner first thing so both reviews finish the same day.

## D5-1 Architecture (3 pts)

Write `docs/ARCHITECTURE.md` with the folder structure, a data-flow diagram, and where server, client, and URL state live.

Done when: it matches the code, and the engineer can defend one choice.

## D5-2 Design patterns (2 pts)

In `ARCHITECTURE.md`, show three patterns used in the store (for example container/presentational, custom hooks, adapter).

Done when: each pattern lists where it is used and why.

## D5-3 Queues / microservices (2 pts)

Design the order flow in `docs/orders.md`: an order service places jobs on a queue for payment, inventory, and email workers.

Done when: it includes a diagram and explains why a queue helps, what happens if email is down, and how D3-2 prevents double charges.

## D5-4 Architecture vocabulary (2 pts)

In `docs/glossary.md`, define latency, idempotency, horizontal scaling, CDN, cache invalidation, and eventual consistency in your own words, with an example from the store.

Done when: the engineer can explain any two terms the evaluator picks at random.

## D5-5 Architecture review (2 pts)

Review your partner's `ARCHITECTURE.md`.

Done when: the review names two strengths, two risks, and one recommendation.

## D5-6 Code review (2 pts)

Review your partner's pull request, and respond to the comments on your own.

Done when: you leave at least 5 useful comments covering correctness, readability, and accessibility, plus one piece of praise.

## D5-7 AI workflow and AI notes (3 pts)

Complete `docs/ai-notes.md`.

Done when: it logs three AI uses with the prompt, what you kept, and what you changed and why, plus one AI mistake and how you caught it, and one thing you would not hand to AI.

## D5-8 Assessment (2 pts)

Write `docs/reflection.md`.

Done when: it rates each topic out of 10 and names two gaps, each with one specific next step.

## D5-9 Submission (3 pts)

Open the pull request and give a 10-minute walkthrough: demo the full shopping flow, then explain one hard bug and one trade-off.

Done when: CI passes, the README is complete, and each task has its own commit.
