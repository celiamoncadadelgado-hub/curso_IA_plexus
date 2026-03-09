# PowerShell script to configure branch protection rules using GitHub CLI (`gh`).
# Prerequisites:
#   - Install GitHub CLI and authenticate (`gh auth login`).
#   - Run from repository root (gestor-tareas-ice) or set GITHUB_REPOSITORY env.

$owner = "celiamoncadadelgado-hub"
$repo = "curso_IA_plexus"

Write-Host "Configuring protection for dev branch..."

gh api repos/$owner/$repo/branches/dev/protection --method PUT --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

Write-Host "Configuring protection for main branch..."

gh api repos/$owner/$repo/branches/main/protection --method PUT --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": {
    "users": [],
    "teams": []
  },
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

Write-Host "Branch protection rules applied."
