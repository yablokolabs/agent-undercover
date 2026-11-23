# Built with

Shipped in this repository:

- TypeScript 5.7
- React 19.0
- Vite 6.0
- HTML5 and CSS3
- JSON Schema with Ajv 8
- IndexedDB for sanitized local run records
- Web Crypto SHA-256 for artifact and replay hashes
- Open Agentic Web MVP Profile 0.2
- The reference browser runtime from `cognizant-ai-labs/agentic-web`, bundled nsDeploy runtime `53a787c`
- Vitest 2.1 for deterministic tests
- Playwright 1.49 with Chromium for browser verification
- Remotion 4.0.534 with React 18.3 and Fontsource fonts for the silent demo cut; the app itself uses React 19
- An OpenAI-compatible BYOK client path, with the Hugging Face Router as the default suggested route

The live-model path is implemented but not proven in this build because the default route failed browser CORS preflight. Fixture mode is deterministic and labeled.

Not used and not claimed: Otari, NANDA discovery, A2A, MCP, WebMCP, production hosting. Add a technology only after it is actually exercised.
