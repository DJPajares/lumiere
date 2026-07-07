import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

export type PostgresClient = ReturnType<typeof postgres>;
export type PostgresClientOptions = NonNullable<Parameters<typeof postgres>[1]>;

export const createPostgresClient = (databaseUrl: string, options?: PostgresClientOptions) =>
  postgres(databaseUrl, options);

export const createDatabase = (client: PostgresClient) => drizzle(client, { schema });

export const createDatabaseFromUrl = (databaseUrl: string, options?: PostgresClientOptions) =>
  createDatabase(createPostgresClient(databaseUrl, options));

export type Database = ReturnType<typeof createDatabase>;
