#!/usr/bin/env python3
"""
Launch the Crystord Platform development server.

Usage:
    python run_server.py
    python run_server.py --mode dev
    python run_server.py --mode preview
    python run_server.py --port 4321

This script runs the corresponding npm script from the repository root.
"""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_command(command: str) -> int:
    print(f"Running: {command}")
    try:
        return subprocess.run(command, shell=True, check=True, cwd=ROOT).returncode
    except subprocess.CalledProcessError as exc:
        print(f"Command failed with exit code {exc.returncode}.")
        return exc.returncode


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Start the Crystord Platform Astro server.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_server.py
  python run_server.py --mode dev
  python run_server.py --mode preview
  python run_server.py --mode dev --port 4321
""",
    )

    parser.add_argument(
        "--mode",
        choices=["dev", "preview"],
        default="dev",
        help="Server mode to run: dev (default) or preview.",
    )
    parser.add_argument(
        "--port",
        type=int,
        help="Optional port number for the server.",
    )

    args = parser.parse_args()

    npm_script = "dev" if args.mode == "dev" else "preview"
    command = f"npm run {npm_script}"

    if args.port:
        command += f" -- --port {args.port}"

    exit_code = run_command(command)
    if exit_code != 0:
        sys.exit(exit_code)


if __name__ == "__main__":
    main()
