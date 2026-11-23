# Product and implementation

## Audience and core journey
Developers preparing agentic sites for visitors and peer networks need to see whether conversational manipulation produces a data leak or an unauthorized effect. Spy styling makes the tests legible. The useful deliverable is a reproducible harness and case file.

Mission → approved target → actual model exchange → tool/result evidence → owner-reviewed repair → exact replay. Show disclosure/blocked/inconclusive or authorized/unauthorized effect outcomes in plain language. No aggregate security score in v1.

## Stack and topology
React, TypeScript, Vite, standard browser APIs and the pinned nsDeploy/official agentify browser runtime. JSON Schema validation for manifest/action data and typed runtime validation for app records. IndexedDB stores sanitized run records, never provider keys. No backend agent orchestrator. A static host serves the workbench and an independent static origin serves the demo target artifacts. For local development, two loopback ports are distinct origins. Public proof uses two HTTPS origins with scoped CORS.

Suggested monorepo layout: apps/workbench, apps/demo-target, packages/test-harness, packages/scenarios, public published artifacts as required by the chosen runtime, tests, docs, assets. Use pnpm or npm consistently and pin dependencies. Choose an open-source license with compatible upstream notice handling.

The browser harness coordinates bounded spy turns and target invocation via the actual reference runtime. Map the chosen seam before implementation. If it lacks the needed event hooks, create a small upstream-compatible adapter and document it. Do not fabricate runtime methods or silently patch global behavior.

## Product surfaces
- Home with sample missions, expected costs/limits and BYOK setup.
- Setup with destination, allowed origins, model, budget and explicit test authorization.
- Case file with numbered messages, tool requests, actual effects, oracle evidence and execution source.
- Compare with target version and exact replay versus adaptive retest clearly distinguished.
- Export with redacted JSON, human-readable report and reproduction instructions.

Use navy, teal and amber accents from the provided assets. Light mode first, 16px+ body, visible focus and readable contrast. Spy language is restrained. No fake terminal activity, fabricated traces or overwhelming network animations.

## Deliverables and milestones
M0: real two-origin reference runtime peer loading + BYOK. M1: secret mission and deterministic oracle. M2: discount and approval missions. M3: repair/replay, reports and meaningful tests. M4: security/conformance review and public free-to-use demo. M5: screenshots, entrant-voiced video under two minutes and submission.

The first complete demo should involve the owned target only. Generic target import is stretch work and requires compatible harness configuration; arbitrary chatbots and embedded website browsing are outside the initial scope.
