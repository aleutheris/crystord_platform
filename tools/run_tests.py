#!/usr/bin/env python3
"""
Run all tests for the crystord_platform project.

Usage:
    python run_tests.py --help
    python run_tests.py --unit
    python run_tests.py --e2e
    python run_tests.py --all
    python run_tests.py --unit --watch
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_command(command, description):
    print(f"Running {description}...")
    try:
        subprocess.run(command, shell=True, check=True, cwd=ROOT)
        print(f"{description} completed successfully.")
        return True
    except subprocess.CalledProcessError as exc:
        print(f"{description} failed with exit code {exc.returncode}.")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Run tests for crystord_platform",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py --unit          # Run Vitest once
  python run_tests.py --unit --watch  # Run Vitest in watch mode
  python run_tests.py --e2e           # Run Playwright E2E tests
  python run_tests.py --all           # Run unit + E2E tests
"""
    )

    parser.add_argument(
        "--unit",
        action="store_true",
        help="Run unit/component tests (Vitest)",
    )
    parser.add_argument(
        "--e2e",
        action="store_true",
        help="Run end-to-end tests (Playwright)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run all tests (unit + E2E)",
    )
    parser.add_argument(
        "--watch",
        action="store_true",
        help="Run unit tests in watch mode (only with --unit)",
    )

    args = parser.parse_args()

    if not any([args.unit, args.e2e, args.all]):
        parser.print_help()
        sys.exit(1)

    success = True

    if args.all:
        print("Running full test suite (--all)...")
        if not run_command("npm run test", "unit/component tests"):
            success = False
        if success and not run_command("npm run test:e2e", "E2E tests"):
            success = False
    elif args.unit:
        if args.watch:
            print("Running unit tests in watch mode...")
            subprocess.run("npm run test:watch", shell=True, cwd=ROOT)
            return
        success = run_command("npm run test", "unit/component tests")
    elif args.e2e:
        success = run_command("npm run test:e2e", "E2E tests")

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
