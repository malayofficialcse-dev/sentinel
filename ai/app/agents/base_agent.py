from abc import ABC, abstractmethod
from typing import Any


class BaseAgent(ABC):

    name: str = "base-agent"

    @abstractmethod
    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Execute the agent and return
        a state update.
        """
        raise NotImplementedError