// "Alert WITHOUT reachability" example.
//
// lodash 4.17.15 has published advisories against specific functions:
//   _.template (GHSA-35jh-r3h4-6jhm, GHSA-r5fr-rjxr-66jc)
//   _.zipObjectDeep / set-style paths (GHSA-p6mc-m468-83gw)
//   _.trim / _.trimEnd / _.toNumber (GHSA-29mw-wpgm-hmr9)
//   _.unset / _.omit / _.pullAt (GHSA-xxjr-mmjv-4gpg)
// This file calls NONE of them. It only uses _.chunk.
//
// Dependabot still raises alerts, because it matches the version in
// package-lock.json against the GitHub Advisory Database. It does not read
// this file or check whether the vulnerable function is ever called.

const _ = require('lodash');

console.log(_.chunk([1, 2, 3, 4, 5, 6], 2)); // [[1,2],[3,4],[5,6]]
