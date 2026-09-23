from __future__ import annotations

from typing import Any


TEST_REGISTRY: dict[str, Any] = {}


def normalize_test_code(code: str | None) -> str:
    return (code or "").strip().lower().replace("-", "_")


def register_test_module(code: str, module: Any) -> None:
    TEST_REGISTRY[normalize_test_code(code)] = module


def get_test_module(code: str | None) -> Any | None:
    return TEST_REGISTRY.get(normalize_test_code(code))


def registered_test_codes() -> list[str]:
    return sorted(TEST_REGISTRY.keys())
