# Operations Runbook

## Runtime and ownership

The repository uses Next.js, Drizzle with Neon Postgres, Upstash Redis, and a
Cloudflare Worker for the iTunes proxy. Application hosting and provider
configuration are not defined as infrastructure-as-code here. Confirm the
production project, deployment branch, environment variables, and access owners
in the relevant provider dashboards.

## Database changes

1. Generate migrations with `bun run db:generate` and review the SQL under
   `drizzle/` before merging.
2. Apply development migrations with `bun run db:migrate:dev` and verify the
   application against the development database.
3. Apply production migrations with `bun run db:migrate:prod` using the
   production `DATABASE_URL`. Prefer backward-compatible schema changes when an
   application rollout and migration cannot be atomic.
4. Do not use schema push for production; migration history is the reviewed
   deployment record.

Before a production migration, confirm that the Neon project has a current,
usable backup or point-in-time recovery option and that an operator with access
can restore it. Backup retention and recovery permissions are provider-side
settings and are not verifiable from this repository.

## Database recovery

1. Identify the incident window and choose a recovery point that limits data
   loss. Do not restore over the active database before validating the restore.
2. Restore to a separate database or branch using the Neon provider controls.
3. Validate connectivity, schema version, and representative application reads
   against the restored database.
4. Update the production `DATABASE_URL` to the validated target, deploy or
   restart the application as required by the hosting provider, and verify
   sign-in, search, and database-backed pages.
5. Record the incident, recovery point, data loss, and follow-up actions.

Recovery time and recovery point objectives are not specified in the
repository. Set them with the service owner and test a restore periodically.

## Scheduled jobs

- `refresh-trending` runs every 15 minutes and can also be started manually
  from GitHub Actions. It refreshes the trending materialized views.
- `scraper-alert` runs hourly and sends configured alerts to Telegram.
- Both workflows require the GitHub Actions `CRON_SECRET` secret to match the
  deployed application's `CRON_SECRET`.

For a failed or stale job, inspect its GitHub Actions run first. Check that the
secret is present and current, then verify the app deployment, database, Redis,
and Telegram configuration. Retry the workflow manually after correcting the
cause. GitHub scheduled workflows can be delayed, so confirm the last
successful run rather than assuming the cron fired on time.

## Monitoring and load tests

Use the hosting provider's application logs and the enabled Vercel Analytics
and Speed Insights for request and performance investigation. Scraper and
service alerts are delivered through Telegram when its credentials are
configured. The repository does not currently define a centralized
exception-monitoring integration.

Run the k6 profiles described in `scripts/stress/README.md` against local or
staging environments before production changes. The rate-limit drill and
vendor probes generate real requests and should not be run against production
without an explicit operational need.
