// Local-demo-only helper: runs a real Postgres server without Docker/Homebrew
// by downloading a self-contained Postgres binary (via the `embedded-postgres`
// dev dependency). Not used in production - production should point
// DATABASE_URL at a real Postgres instance (see docker-compose.yml).
import EmbeddedPostgres from "embedded-postgres";
import path from "path";

const pg = new EmbeddedPostgres({
  databaseDir: path.resolve(__dirname, "../.demo-pgdata"),
  user: "tshirts",
  password: "tshirts",
  port: 5544,
  persistent: true,
});

async function main() {
  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase("tshirts_wholesale");
  } catch {
    // already exists
  }
  console.log("Demo Postgres running on port 5544 (database: tshirts_wholesale)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await pg.stop();
  process.exit(0);
});
