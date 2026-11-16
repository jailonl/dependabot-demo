# Dependabot Demo: 10-Minute Walkthrough

**Main point:** Dependabot matches the package **versions** in your manifest and lockfile against the GitHub Advisory Database. It does not read or run your code.

---

## 1. package.json and package-lock.json (1 min)

Open `package.json`. There are three exact pins:

| Package | Version | Why it's here |
|---|---|---|
| lodash | 4.17.15 | direct, vulnerable |
| minimist | 1.2.0 | direct, vulnerable |
| mkdirp | 0.5.1 | direct; it pulls in **minimist 0.0.8** (vulnerable) **transitively** |

Open `package-lock.json` and search for `node_modules/mkdirp/node_modules/minimist`. It shows `"version": "0.0.8"`, and mkdirp's own `dependencies` pin it as `"minimist": "0.0.8"`.

> Say: "The lockfile is the source of truth. It records every resolved version, including ones we never asked for."

## 2. Insights → Dependency graph (1 min)

Go to **Insights → Dependency graph → Dependencies**.
- lodash, minimist and mkdirp appear, read from the manifest and lockfile.
- Expand **mkdirp** to see minimist 0.0.8 nested under it.
- Open the **Dependabot** tab here to see the last time `dependabot.yml` was checked and the update jobs.

## 3. Security tab → Dependabot alerts (1.5 min)

Go to **Security → Dependabot**. Expect about 7 alerts (the exact count depends on how GitHub de-duplicates advisories):
- lodash: 5 (2 high, plus moderate/high ones)
- minimist: critical and moderate, from both the direct 1.2.0 and the transitive 0.0.8

Open the **minimist critical** alert (GHSA-xvch-5gv4-984h). Show:
- **Manifest/lockfile** location
- **Vulnerable versions** compared with **Patched version**
- Whether the dependency is direct or transitive

## 4. GHSA advisory page (1 min)

From the alert, click through to the advisory (e.g. https://github.com/advisories/GHSA-xvch-5gv4-984h). Show:
- **Affected versions:** the ranges are exactly what Dependabot matches on
- **CVE-2021-44906**, CVSS score, CWE
- References and the patched version

> Say: "This advisory is all Dependabot compares against: a package name plus a version range."

## 5. The security update PR (1.5 min)

Go to **Pull requests** and open a Dependabot PR titled like "Bump lodash from 4.17.15 to 4.17.21" (or 4.18.x). Show:
- **Minimum patched version:** Dependabot picks the lowest version that clears the alerts, not the latest
- **Release notes / changelog / commits** sections, pulled from the upstream repo
- **Compatibility score** badge: the share of other repos' CI runs that passed this exact update
- The diff touches **only** `package.json` and `package-lock.json`
- The linked alert(s) close automatically when the PR merges

Then open the **mkdirp** security PR (0.5.1 → 0.5.6). For the transitive minimist 0.0.8, the fix is to **bump the parent**. That is why the PR targets mkdirp, not minimist.

## 6. dependabot.yml and the version update PRs (1.5 min)

Open `.github/dependabot.yml`:
- `schedule: weekly`: version updates run once a week (and once right after the file is added)
- `groups.minor-and-patch`: all minor and patch bumps arrive together in **one PR**
- `ignore`: mkdirp major versions are skipped (v1+ changed the API). This blocks **version** updates only; the **security** PR in step 5 still fixed mkdirp.
- `open-pull-requests-limit: 5`: the cap for version-update PRs (security PRs have their own fixed limit)
- `cooldown`: waits N days after a release before proposing it. It applies to version updates only and never delays a security fix.

Open the grouped version-update PR ("Bump the minor-and-patch group with N updates").

> Say: "Security updates react to advisories. Version updates follow the schedule. They are two separate mechanisms that use the same bot."

## 7. index.js: an alert without reachability (1 min)

Open `index.js`. It only calls `_.chunk`. None of the functions named in the lodash advisories (`template`, `zipObjectDeep`, `trim`, `toNumber`, `unset`, `omit`, `pullAt`) is ever called.

Go back to the lodash alerts: they are all still open.

> Say: "Dependabot never parsed this file. As far as it knows, `require('lodash')` might as well not exist. It saw `lodash@4.17.15` in the lockfile, matched the range `< 4.17.21`, and raised the alert. That is version matching, not reachability analysis."

## 8. The transitive case (1 min)

Return to the minimist 0.0.8 alert:
- We never installed minimist 0.0.8. It came in through `mkdirp@0.5.1`, which pins it exactly.
- Dependabot found it only because it appears in the **lockfile**.
- The fix is in the parent (mkdirp 0.5.6 depends on `minimist ^1.2.6`).

> Say: "Transitive vulnerabilities are usually where most of your exposure is, and you can't see them unless you check the lockfile."

**Wrap-up (30 s):** Dependabot gives you broad, automatic coverage that requires nothing from your code. Its tradeoff is noise: it raises alerts with no idea whether the vulnerable code path can be reached.
