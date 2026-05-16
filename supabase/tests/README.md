# Supabase Tests

## RLS Matrix (pgTAP)

File: rls_isolation.pgtap.sql

Purpose:
- Validate RLS helper function presence.
- Validate baseline false behavior for anonymous/unknown membership.
- Validate owner, technician, viewer and outsider isolation behavior.
- Validate cross-tenant write denial for tenant-scoped tables.

Prerequisites:
- Local Supabase/Postgres with migrations applied.
- pgTAP extension available.

Example run:

```bash
supabase db reset
npm run test:db:rls
```

Notes:
- The suite runs inside a transaction and rolls back its fixture data.
- Expand with table-specific deny assertions as new RLS policies land.
