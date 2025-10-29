"""Netlify Function entry point that proxies to the FastAPI application."""

from __future__ import annotations

import os
import sys
from typing import Any

# Ensure the FastAPI application package is importable when bundled by Netlify.
CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import handler as fastapi_handler  # type: ignore  # noqa: E402


def handler(event: Any, context: Any) -> Any:
    """Delegate the Lambda invocation to the Mangum-wrapped FastAPI handler."""

    return fastapi_handler(event, context)
