from typing import Any

from .base_agent import BaseAgent
from ..services.graph_service import GraphService


class GraphAgent(BaseAgent):

    name = "graph-agent"

    def __init__(self):

        self.graph = GraphService()

    async def run(
        self,
        state: dict[str, Any]
    ) -> dict[str, Any]:

        entities = state.get(
            "entities",
            []
        )

        relationships = (
            await self.graph.build_relationships(
                entities
            )
        )

        return {
            "relationships": relationships
        }