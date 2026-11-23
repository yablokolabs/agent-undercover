# Public deployment

**Verified:** 17 November 2026, 19:40 UTC  
**State:** Live on GitHub Pages over trusted HTTPS. Both custom domains resolve publicly, present certificates for their exact hostnames, and redirect HTTP to HTTPS.

## Public origins

| Role | URL | GitHub Pages source |
| --- | --- | --- |
| Workbench | <https://agent-undercover.yablokolabs.com/> | `yablokolabs/agent-undercover`, `gh-pages` |
| Synthetic target | <https://undercover-target.yablokolabs.com/> | `yablokolabs/undercover-target`, `gh-pages` |

Both repositories contain only the built static artifact on `gh-pages`; no application source was pushed. Each build has a `CNAME` file and a `.nojekyll` file.

The workbench was built with `VITE_TARGET_ORIGIN=https://undercover-target.yablokolabs.com`. The target was built with `VITE_WORKBENCH_ORIGIN=https://agent-undercover.yablokolabs.com`.

| Site | Pages build commit | Build status | Certificate | HTTPS enforced |
| --- | --- | --- | --- | --- |
| Workbench | `d68bef6ed5658b5cb274459c5e1ce929d5ec0924` | `built` | approved | yes |
| Target | `19b345984324ac3e421b0cd5c57384f758a05d55` | `built` | approved | yes |

## DNS and certificates

Both records exist in the `yablokolabs.com` Cloudflare zone and are DNS-only, not proxied:

| Type | Name | Target | Proxy status |
| --- | --- | --- | --- |
| CNAME | `agent-undercover` | `yablokolabs.github.io` | DNS only |
| CNAME | `undercover-target` | `yablokolabs.github.io` | DNS only |

Public DNS resolves both names through `yablokolabs.github.io` to the GitHub Pages addresses `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.

Both sites present a Let's Encrypt certificate with the exact custom hostname as its subject and sole subject alternative name. The certificates are valid from 17 November 2026 to 15 February 2027. GitHub Pages reports both certificate states as `approved`.

Plain HTTP returns `301 Moved Permanently` to the HTTPS URL for both hostnames.

## Final public checks

These checks used normal public DNS and normal certificate validation. No `--resolve`, `-k` or ignored certificate errors were used.

### Root documents and artifacts

| Request | Result |
| --- | --- |
| `GET /` on both hostnames | HTTP 200, `text/html`, `access-control-allow-origin: *` |
| Workbench `/agent-manifest.json` | HTTP 200, `application/json`, ACAO `*`, SHA-256 `728a685834307e87aaf532a191870fcccb4f4a0c608a815a238bc458c083b117` |
| Target `/agent-manifest.json` | HTTP 200, `application/json`, ACAO `*`, SHA-256 `321be62f67c573ba02f4df74532b534428f98f66dda90b0c246a607aeac74486` |
| Target six `*.network.json` files | HTTP 200 each; each declares one tool |
| Workbench `/case_explainer.network.json` | HTTP 200; declares two tools |
| Both `/runtime/index.js`, `/runtime/runner.js`, `/runtime/sandbox-worker.js` | HTTP 200, `application/javascript`, ACAO `*` |
| Target `/links.json` | HTTP 200, `application/json`, ACAO `*` |

A `GET` with `Origin: https://agent-undercover.yablokolabs.com` returned `access-control-allow-origin: *`. An `OPTIONS` preflight returns 405, but the public artifact fetch is a simple credentialed-free GET and sends no preflight; the browser run below confirms the actual path.

### Cross-origin browser run

A headless Chromium run used the live HTTPS hostnames with default certificate validation:

```text
page URL:               https://agent-undercover.yablokolabs.com/
page title:             Agent Undercover
target field:           https://undercover-target.yablokolabs.com
consent:                shown before target contact; allowed for the session
observed outcome:       Confirmed disclosure
target resources:       /agent-manifest.json
                        /undercover_secret_v1.network.json
                        /links.json
console/page errors:    none
```

The target-resource list is from the browser's Performance API and shows that the workbench loaded the manifest and exact network from the second origin. The run exercised the consent dialog and the vendored runtime in the caller tab.

A separate page entered `public-check-not-a-real-key` into the masked key field, then checked browser storage:

```text
localStorage keys:      []
sessionStorage keys:    []
key in page text:       false
after "Clear key":      No key in memory
```

No request was made with that fake key. The test confirms the key is held in React session state, not browser storage.

## Acceptance commands

```bash
for host in agent-undercover.yablokolabs.com undercover-target.yablokolabs.com; do
  curl -4 -sS -o /dev/null -w "$host %{http_code} verify=%{ssl_verify_result}\n" "https://$host/"
  curl -4 -sS -o /dev/null -w "$host http %{http_code}\n" "http://$host/"
done
```

Expected:

```text
agent-undercover.yablokolabs.com 200 verify=0
agent-undercover.yablokolabs.com http 301
undercover-target.yablokolabs.com 200 verify=0
undercover-target.yablokolabs.com http 301
```

## Limits

- The public run used deterministic fixture mode. No live-model request was made.
- The target is an owned synthetic fixture. A public URL alone grants no permission to test an external target.
- The deployment uses static GitHub Pages; no target server executes the mission and no provider key is sent to either origin.
- This is a deployment and conformance record, not a security certification.
