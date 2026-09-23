class TestModuleError(Exception):
    """Base exception for instrument module errors."""


class TestValidationError(TestModuleError):
    """Raised when raw input cannot be validated."""


class TestScoringError(TestModuleError):
    """Raised when scoring cannot be completed."""
