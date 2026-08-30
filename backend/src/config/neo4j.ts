import neo4j from "neo4j-driver";
import { env } from "./env";

export const neo4jDriver = neo4j.driver(
  env.NEO4J_URI,
  neo4j.auth.basic(
    env.NEO4J_USERNAME,
    env.NEO4J_PASSWORD
  )
);

export async function verifyNeo4jConnection(): Promise<void> {
  const session = neo4jDriver.session();

  try {
    await session.run("RETURN 1");
    console.log("✅ Neo4j connected");
  } finally {
    await session.close();
  }
}