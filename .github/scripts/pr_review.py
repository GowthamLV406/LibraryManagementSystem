"""
Automated C# PR Code Review using Azure OpenAI.
Posts inline review comments on GitHub PRs via the GitHub Review API.
 
Environment variables required:
  GITHUB_TOKEN       - GitHub Actions token (automatic)
  GITHUB_REPOSITORY  - owner/repo (automatic)
  PR_NUMBER          - pull request number (set in workflow)
  AOAI_ENDPOINT      - Azure OpenAI endpoint URL
  AOAI_API_KEY       - Azure OpenAI API key
  AOAI_DEPLOYMENT    - Model deployment name (e.g. gpt-4.1-mini)
"""
 
import os
import sys
import json
import requests
 
# --------------------------------------------------------------------------- #
# Configuration                                                                #
# --------------------------------------------------------------------------- #
 
GITHUB_TOKEN = os.environ["GITHUB_TOKEN"]
GITHUB_REPO = os.environ["GITHUB_REPOSITORY"]
PR_NUMBER = os.environ["PR_NUMBER"]
AOAI_ENDPOINT = os.environ["AOAI_ENDPOINT"].rstrip("/")
AOAI_API_KEY = os.environ["AOAI_API_KEY"]
AOAI_DEPLOYMENT = os.environ["AOAI_DEPLOYMENT"]
 
GITHUB_API = "https://api.github.com"
GITHUB_HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
}
 
AOAI_URL = f"{AOAI_ENDPOINT}/openai/deployments/{AOAI_DEPLOYMENT}/chat/completions?api-version=2024-02-01"
AOAI_HEADERS = {
    "api-key": AOAI_API_KEY,
    "Content-Type": "application/json",
}
 
# Only review these file types
REVIEW_EXTENSIONS = {".cs", ".csproj", ".sln", ".razor", ".cshtml"}
 
# Max characters of diff to send per file (avoid token limits)
MAX_DIFF_CHARS = 8000
 
REVIEW_PROMPT = """You are a senior C# .NET code reviewer. Review the following git diff for a C# file.
 
Focus ONLY on real issues:
- Bugs or logic errors
- Security vulnerabilities (SQL injection, XSS, hardcoded secrets, etc.)
- Null reference risks or unhandled exceptions
- Performance problems (N+1 queries, unnecessary allocations, etc.)
- Incorrect async/await usage
- Resource leaks (undisposed IDisposable objects)
- Thread-safety issues
 
Do NOT comment on:
- Code style or formatting
- Naming conventions
- Missing documentation
- Minor refactoring suggestions
 
Respond ONLY as a JSON array. Each element must have:
  "line": the line number in the new file (integer, from the diff)
  "severity": "bug" | "security" | "performance" | "warning"
  "comment": a concise, actionable comment (1-2 sentences max)
 
If there are no real issues, return an empty array: []
 
Diff:
"""
 
 
# --------------------------------------------------------------------------- #
# GitHub helpers                                                               #
# --------------------------------------------------------------------------- #
 
def get_pr_files():
    """Returns list of changed files with their patches (diffs)."""
    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/pulls/{PR_NUMBER}/files"
    resp = requests.get(url, headers=GITHUB_HEADERS, timeout=30)
