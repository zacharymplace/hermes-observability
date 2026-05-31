# Hermes Langfuse Ecosystem Report

Generated: 2026-05-31T05:47:34.648Z
Source standard version: 0.1.0

## Summary

- Repos: 6
- Pass: 6
- Watch: 0
- Hold: 0
- Stale standards: 0
- Dirty working trees: 0

## Repo Health

| Repo | Health | Recommendation | Readiness | Risk | Branch | Commit | Standard | Metadata | CI | Clean |
|---|---:|---:|---:|---:|---|---|---:|---:|---:|---:|
| ops-clarity-sprint | pass | promote | 1 | 0 | main | fbe7828 | pass | pass | pass | pass |
| ufc-decision-service | pass | promote | 1 | 0 | main | 89977a5 | pass | pass | pass | pass |
| civic-league | pass | promote | 1 | 0 | main | bc9a546 | pass | pass | pass | pass |
| host-aware-abundance | pass | promote | 1 | 0 | main | 994220f | pass | pass | pass | pass |
| mirrorwall | pass | promote | 1 | 0 | main | 815a221 | pass | pass | pass | pass |
| ai-ops-console | pass | promote | 1 | 0 | main | 086c162 | pass | pass | pass | pass |

## Review Outcomes

| Repo | Trace Review | Recommendation | Readiness | Risk | Confidence |
|---|---:|---:|---:|---:|---:|
| ops-clarity-sprint | pass | promote | 1 | 0 | 1 |
| ufc-decision-service | pass | promote | 1 | 0 | 1 |
| civic-league | pass | promote | 1 | 0 | 1 |
| host-aware-abundance | pass | promote | 1 | 0 | 1 |
| mirrorwall | pass | promote | 1 | 0 | 1 |
| ai-ops-console | pass | promote | 1 | 0 | 1 |

## Reason Code Rollup

- all_checks_passed: 6
- ci_summary_available: 5
- repo_check_passed: 3
- baseline_health_json_available: 1
- baseline_json_available: 1
- classifier_eval_passed: 1
- doctrine_validation_passed: 1
- exposure_json_available: 1
- fixtures_passed: 1
- lint_passed: 1
- mirrorwall_validate_passed: 1
- policy_readiness_passed: 1
- product_readiness_passed: 1
- release_check_passed: 1
- release_ready_passed: 1
- release_verify_passed: 1
- review_generation_passed: 1
- risk_explain_available: 1
- season_readiness_passed: 1
- sensitivity_passed: 1
- simulation_compare_passed: 1
- simulation_run_passed: 1
- status_json_available: 1
- threshold_fixtures_passed: 1

## Trace Review Parse Diagnostics

| Repo | Dependency Action | Dependency Status | Command | Command Status | Parse Status | Output Tail |
|---|---|---:|---|---:|---:|---|
| ops-clarity-sprint | already_present | pass | npm run trace:review | pass | parsed | r>> node scripts/langfuse-review-trace.js<br><br>{<br>  "trace": "hermes-review-run",<br>  "repo": "ops-clarity-sprint",<br>  "branch": "main",<br>  "commit": "fbe7828",<br>  "status": "pass",<br>  "passed": 4,<br>  "failed": 0,<br>  "total": 4,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "release_check_passed",<br>      "repo_check_passed"<br>    ]<br>  }<br>} |
| ufc-decision-service | already_present | pass | npm run trace:review | pass | parsed | n-service",<br>  "branch": "main",<br>  "commit": "89977a5",<br>  "status": "pass",<br>  "passed": 5,<br>  "failed": 0,<br>  "total": 5,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "threshold_fixtures_passed",<br>      "fixtures_passed",<br>      "review_generation_passed",<br>      "policy_readiness_passed",<br>      "ci_summary_available"<br>    ]<br>  }<br>} |
| civic-league | already_present | pass | npm run trace:review | pass | parsed | ivic-league",<br>  "branch": "main",<br>  "commit": "bc9a546",<br>  "status": "pass",<br>  "passed": 5,<br>  "failed": 0,<br>  "total": 5,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "repo_check_passed",<br>      "release_verify_passed",<br>      "product_readiness_passed",<br>      "season_readiness_passed",<br>      "ci_summary_available"<br>    ]<br>  }<br>} |
| host-aware-abundance | already_present | pass | npm run trace:review | pass | parsed | ndance",<br>  "branch": "main",<br>  "commit": "994220f",<br>  "status": "pass",<br>  "passed": 5,<br>  "failed": 0,<br>  "total": 5,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "doctrine_validation_passed",<br>      "simulation_run_passed",<br>      "simulation_compare_passed",<br>      "sensitivity_passed",<br>      "ci_summary_available"<br>    ]<br>  }<br>} |
| mirrorwall | npm ci | pass | npm run trace:review | pass | parsed | br>  "passed": 8,<br>  "failed": 0,<br>  "total": 8,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "mirrorwall_validate_passed",<br>      "status_json_available",<br>      "exposure_json_available",<br>      "risk_explain_available",<br>      "baseline_json_available",<br>      "baseline_health_json_available",<br>      "ci_summary_available"<br>    ]<br>  }<br>} |
| ai-ops-console | already_present | pass | npm run trace:review | pass | parsed | >  "repo": "ai-ops-console",<br>  "branch": "main",<br>  "commit": "086c162",<br>  "status": "pass",<br>  "passed": 5,<br>  "failed": 0,<br>  "total": 5,<br>  "score": {<br>    "readiness": 1,<br>    "risk": 0,<br>    "confidence": 1,<br>    "recommendation": "promote",<br>    "reason_codes": [<br>      "all_checks_passed",<br>      "lint_passed",<br>      "classifier_eval_passed",<br>      "repo_check_passed",<br>      "release_ready_passed",<br>      "ci_summary_available"<br>    ]<br>  }<br>} |

## Latest CI

- ops-clarity-sprint: Check #408 | completed | success | fbe7828 | Release Hermes lifecycle operator report v0.1
- ufc-decision-service: Policy Regression #68 | completed | success | 89977a5 | Emit standard metadata in UFC review trace
- civic-league: CI #793 | completed | success | bc9a546 | Emit standard metadata in Civic review trace (#146)
- host-aware-abundance: CI #181 | completed | success | 994220f | Emit standard metadata in Host-Aware review trace
- mirrorwall: Mirrorwall Release Check #47 | completed | success | 815a221 | Add Mirrorwall trace review script
- ai-ops-console: CI #36 | completed | success | 086c162 | Emit standard metadata in AI Ops review trace
