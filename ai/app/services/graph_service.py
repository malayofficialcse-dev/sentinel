class GraphService:

    async def build_relationships(
        self,
        entities: list[dict]
    ) -> list[dict]:

        relationships = []

        for index in range(
            len(entities) - 1
        ):

            source = entities[index]
            target = entities[index + 1]

            relationships.append({
                "source": source.get("value"),
                "target": target.get("value"),
                "type": "CONNECTED_TO"
            })

        return relationships