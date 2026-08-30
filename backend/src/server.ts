// import app from './app';

// const port = Number(process.env.PORT || 4000);
// app.listen(port, () => console.log(`Sentinel API listening on http://localhost:${port}/api/v1`));





import app from "./app";
import { env } from "./config/env";
import {
  connectDatabase,
  disconnectDatabase
} from "./config/database";
import { verifyNeo4jConnection } from "./config/neo4j";

async function bootstrap() {

  try {

    await connectDatabase();

    await verifyNeo4jConnection();

    app.listen(env.PORT, () => {
      console.log(
        `🚀 Sentinel backend running on port ${env.PORT}`
      );
    });

  } catch (error) {

    console.error(
      "❌ Failed to start backend:",
      error
    );

    process.exit(1);
  }
}

bootstrap();

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});