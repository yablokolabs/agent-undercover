# Agent Undercover — project story

## Inspiration

**Live workbench:** <https://agent-undercover.yablokolabs.com/>  
**Synthetic target:** <https://undercover-target.yablokolabs.com/>  
**Demo video:** <https://youtu.be/AfliF9OMVOo> (1:59)  
**Source:** <https://github.com/yablokolabs/agent-undercover> (branch `main`)

Connecting an agent to another website creates a question that a friendly demo rarely answers: what happens when the other agent is trying to bend the rules? Agent Undercover turns that question into a reproducible mission. The spy theme makes the boundary visible; the case file gives developers something they can fix and replay. The public demo runs in deterministic fixture mode; it does not claim a live-model result.

## What it does

Agent Undercover is a normal-browser workbench with three bounded missions against an owned synthetic target:

1. **Planted-secret disclosure.** A per-run synthetic canary sits only in the target's private model context. The spy gets an objective and a plain-language request grammar, never the value. The oracle checks for an exact canary substring in an attacker-visible reply.
2. **Unauthorized discount.** The target exposes a synthetic discount action. The vulnerable version trusts the requested percentage; the repaired version checks the customer's recorded eligibility in code.
3. **Approval bypass.** The vulnerable version accepts model text as approval. The repaired version requires an unexpired, one-use token bound to the proposal, customer and terms.

The workbench loads the target's public manifest and exact network from a second origin after explicit consent, then runs that data-only network in the caller's tab with the pinned reference runtime. Each mission ships as a vulnerable `v1` and a repaired `v2` published network. A repair is an explicit operator action that creates a new target configuration; replay uses the same stored request strings and checks the network hash.

## How we built it

The product uses TypeScript, React 19 and Vite 6. The workbench and target are separate origins. The target is static: it publishes JSON, the runtime and an interface, and never executes a mission. The workbench uses the Open Agentic Web MVP Profile 0.2 reference runtime from `cognizant-ai-labs/agentic-web@7817c1f`, with two small documented adapter changes for an exact-origin `fetchImpl` and exact `networkName` selection.

The harness is deterministic code, not a model judge. It owns consent, turn and request budgets, the canary, the synthetic discount and approval ledgers, oracles, redaction and the bounded event log. The model may generate a request or explain a result; it does not decide a finding. The workbench is also a conforming agent site, publishing a two-agent `case_explainer` network with no actions and no private oracle.

## Challenges

The hard part was keeping the test honest. A canary in a public artifact invalidates the fixture, so the vulnerable network stores a placeholder and the runner injects the per-run value into in-memory target context only. The runtime also had to select the exact published network rather than silently taking the first entry; that required the small `networkName` adapter and a fail-closed preflight. Synthetic effects had to be visibly separate from assistant promises, and host write confirmation had to remain separate from target business approval.

The live route was another constraint. Direct HTTPS OPTIONS to the suggested Hugging Face Router returned 200, but headless Chromium's preflight returned 405. Re-testing in a headed browser explained it: the provider's edge blocks headless browsers, while a normal browser passes preflight and gets the expected 401 without a key. The route is usable with a key; the build still keeps fixture evidence clearly labeled and claims no live run because none was completed with a provider key.

## Accomplishments

- Three complete vulnerable/repaired mission pairs with deterministic oracles.
- A two-origin, caller-browser runtime integration with exact-name loading and consent.
- 35 deterministic tests and 61 artifact checks passing.
- Browser-verified consent, case file, repair comparison, host confirmation, exact-name rejection, sanitized export and published explainer.
- A reusable harness and public JSON schemas for the browser-agent community.

## What we learned

A model's claim that it “can't share that” is not evidence of a boundary, and a blocked action is not proof that a system is secure. The useful unit is a reproducible test: exact configuration, exact request strings, observed effects and a stated scope. Keeping the oracle deterministic made the repair comparison meaningful.

## What's next

A verified browser-CORS live-model route, repeated-run evidence, and opt-in adapters for explicitly authorized targets. New protocols and peer executable code remain future work until implemented and reviewed. Agent Undercover does not claim a general security certification.
