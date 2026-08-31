import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { verifyNeo4jConnection } from "./config/neo4j";

async function bootstrap() {
  try {
    await connectDatabase();
  } catch (error) {
    console.warn(
      "PostgreSQL unavailable; starting without database features.",
      error instanceof Error ? error.message : error
    );
  }

  try {
    await verifyNeo4jConnection();
  } catch (error) {
    console.warn(
      "Neo4j unavailable; starting without graph features.",
      error instanceof Error ? error.message : error
    );
  }

  app.listen(env.PORT, () => {
    console.log(`Sentinel backend running on http://localhost:${env.PORT}`);
    console.log(`AI proxy target: ${env.AI_SERVICE_URL}`);
  });
}

void bootstrap();

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});
