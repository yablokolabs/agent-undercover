# Run and replay data

## Public report

`packages/schemas/public-report.schema.json` defines the export. `toPublicReport` emits:

- identity: `schemaVersion`, `runId`, `createdAt`, `missionId`, `scenarioVersion`, `configVersion`;
- provenance: `executionSource`, `runtimeCommit`, `upstreamCommit`, `specVersion`, `targetOrigin`, `networkName`, `networkHash`, `routerOrigin`, `modelId`;
- test definition: `attackPlanId`, `attackPlanHash`, `attackRequests`, `scenarioSetup`, `requestedLimits`, `observedUsage`;
- evidence: `events`, `result`, `replay`, `attackSource`;
- handling: `redactions` and `limitations`.

Provider keys, canary values and URL query strings are removed. `assertNoSecret` refuses to export if a supplied secret still appears. Only bounded event payloads are exported; raw runtime state and private invocation context are not.

## Internal record

`packages/schemas/run-record.schema.json` defines the sanitized IndexedDB record. It includes the target hashes and configuration version, the attack request strings, bounded events, observed synthetic effects, host confirmations, oracle result and requested limits.

`apps/workbench/src/data/runStore.ts` refuses records that match a concrete canary pattern or a bearer credential. The browser has no server database; records stay in the local browser and can be deleted from the Compare view.

## Events

The bounded event log uses `seq`, `atMs`, `type` and a sanitized payload. Types include:

`runStarted`, `spyContext`, `consentRequested`, `consent`, `peerFetch`, `targetArtifact`, `runtimeCompile`, `runtimeLoaded`, `spyRequest`, `targetReply`, `actionProposed`, `businessApproved`, `actionApplied`, `actionRejected`, `hostConfirmationRequested`, `hostConfirmed`, `hostConfirmationDenied`, `oracle`, `budgetExceeded`, `cancelled`, `error`, `runCompleted`.

Observed effects are separate from assistant text. A host write confirmation is separate from a target business approval.

## Replay

Replay uses the exact saved `attackRequests` and the recorded target origin, network name and hash. `verifyReplayPlan` and the mission runner refuse a changed hash rather than silently switching target versions. A repaired run is an explicit new configuration (`configVersion: 2`), not a prompt rewrite. The paired canary is regenerated per side; comparability depends on both sides being configured with the new value and is stated in the report.

A replay of a live-model run uses the currently selected execution source. The UI states this rather than implying the same model call. Repeated-run variability and provider errors are reported as observed; timeouts and errors are inconclusive.
