from abc import ABC, abstractmethod
from typing import Optional

from .types import ClassificationResult, ComputedScore, InterpretationResult


class ICalculator(ABC):
    @abstractmethod
    def calculate(
        self,
        raw_data: dict,
        age: int,
        education: Optional[int] = None,
    ) -> ComputedScore:
        pass


class IClassifier(ABC):
    @abstractmethod
    def classify(self, computed: ComputedScore) -> ClassificationResult:
        pass


class IInterpreter(ABC):
    @abstractmethod
    def interpret(
        self,
        computed: ComputedScore,
        classification: ClassificationResult,
    ) -> InterpretationResult:
        pass


class IValidator(ABC):
    @abstractmethod
    def validate(self, raw_data: dict, age: int) -> tuple[bool, list[str]]:
        pass
