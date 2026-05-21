#!/usr/bin/env python3
"""Ship-to-market validation checks for TheAltText."""

from pathlib import Path
import subprocess
import sys


REPO_ROOT = Path(__file__).resolve().parent

REQUIRED_FILES = [
    "README.md",
    "CHANGELOG.md",
    "DEPLOYMENT_GUIDE.md",
    "GO_TO_MARKET.md",
    "BRAND_GUIDELINES.md",
    "SECURITY.md",
    ".env.example",
    ".github/workflows/ci.yml",
]

REQUIRED_DIRS = ["backend", "frontend", "extension"]


def fail(message: str) -> None:
    print(f"❌ {message}")
    raise SystemExit(1)


def check_required_files() -> None:
    missing = [path for path in REQUIRED_FILES if not (REPO_ROOT / path).exists()]
    if missing:
        fail(f"Missing required files: {', '.join(missing)}")


def check_required_dirs() -> None:
    missing = [path for path in REQUIRED_DIRS if not (REPO_ROOT / path).is_dir()]
    if missing:
        fail(f"Missing required directories: {', '.join(missing)}")


def check_git_submodules() -> None:
    result = subprocess.run(
        ["git", "submodule", "status"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    if result.stdout.strip():
        fail("Repository contains git submodules. Expected none for this product.")


def main() -> None:
    check_required_files()
    check_required_dirs()
    check_git_submodules()
    print("✅ Validation passed: revvel-standards docs and core automation are in place.")


if __name__ == "__main__":
    main()
