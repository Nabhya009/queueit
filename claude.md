# QueueIt — Project Instructions for Claude Code

## Context

This is a MERN Stack course final project. It will be evaluated by a **live demo with technical Q&A**, where I must explain the architecture, justify implementation decisions, and answer questions about any file in this repo.

**I did not write most of this code. I have to be able to defend all of it.**
That constraint outranks speed, cleverness, and completeness.

Timeline: 3 days.

---

## Non-negotiable working rules

### 1. Explain before you write

Before creating or modifying any file, state in the chat:
- What this file is responsible for
- Why it lives at this path rather than somewhere else
- What would break if it didn't exist

Two or three sentences. Not a paragraph per file.

### 2. No unexplained dependencies

Every time you add a package to `package.json`, tell me:
- What problem it solves
- What I would have to write by hand without it
- One sentence I could say if an evaluator asks "why did you use this?"

If a dependency isn't strictly needed for a required feature, don't add it.

### 3. Boring code over clever code

I have to read this under pressure. Prefer:
- Explicit over implicit — no clever destructuring chains, no one-liner ternary stacks
- Named intermediate variables over deeply nested expressions
- Long, obvious function names
- `async/await` consistently — never mix in `.then()` chains

If there is a fancy way and a plain way, use the plain way and say that you did.

### 4. Comment the *why*, not the *what*

Bad: `// loop through the queue`
Good: `// tokenNumber is assigned from queue.length + 1, not the array index, because skipped users stay in the array`

Comment every non-obvious decision, every place where the naive approach would be wrong, and every piece of logic I would struggle to reconstruct.

### 5. Stop at checkpoints

After each milestone below, **stop and wait**. Do not continue to the next milestone on your own. At each stop, give me:
- A 3-sentence summary of what now works
- One instruction for how to test it manually
- **Two questions an evaluator might ask about what you just built**, with the answers

I will read the code before saying continue.

### 6. Never invent scope

Build only what is in the spec. If you think something is missing or wrong in the spec, say so and ask — do not silently add it. If you are unsure between two approaches, present both with a one-line tradeoff and let me choose.

### 7. Flag anything I must write myself

If you are about to write something that is central to the evaluation — core queue logic, the data model, auth middleware — say so first, so I can choose to write it myself and have you review it instead.

---

## Architecture decisions already made (do not change these)

The data model follows the instructor's spec document exactly. Do not "improve" it into a normalized design.

- **Queue** holds an embedded array `queue: [userQueueObject]` — tokens live inside the queue document, not in a separate tickets collection
- **User** holds an embedded `history` array
- **Venue** holds `queues: [ObjectId]` — references, not embeds

If you believe a normalized design would be better, you may note it once, in one sentence, as a "future improvement" — that's slide 6 material. Then implement the spec version.

---

## Build order

Work through these in order. Stop after each.

1. **Backend skeleton** — Express server, folder structure, MongoDB connection, health-check route
2. **Mongoose models** — User, Venue, Queue (with the embedded subdocument)
3. **Core queue endpoints** — join, status, leave
4. **Admin endpoints** — serve, skip, pause/resume
5. **Auth + role middleware** — protecting admin routes
6. **React frontend: user flow** — home, join queue, live status
7. **React frontend: admin dashboard** — queue controls, live viewer list
8. **Live updates** — polling or WebSocket (present the tradeoff to me before choosing)
9. **Deployment** — frontend and backend, with environment variables explained
10. **Analytics** — only if time remains

---

## Folder structure

Keep the backend split into `models/`, `routes/`, `controllers/`, `middleware/`, `config/`. Keep the frontend split into `pages/`, `components/`, `services/` (API calls), `hooks/`. Code quality and folder structure are explicitly on the evaluation rubric — say out loud when a file placement is driven by that.

---

## Things I will be asked in the demo

Keep these answerable at all times. If a change makes one of them harder to answer, tell me.

- Why embedded subdocuments instead of a separate tickets collection?
- How is the token number generated, and what happens with concurrent joins?
- What happens to positions in the queue when someone leaves from the middle?
- Polling vs WebSocket — why did you pick what you picked?
- How does the admin route know the requester is actually an admin?
- What happens if the server restarts while people are in a queue?