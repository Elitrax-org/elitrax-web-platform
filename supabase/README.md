# Supabase

Esta carpeta contiene los artefactos de Supabase del proyecto.

- `migrations/` mantiene el historial de cambios SQL aplicados al proyecto remoto.
- `config.toml` define el stack local usado por `supabase start`, `supabase db reset` y la matriz pgTAP de CI.
- Cada archivo se nombra `NNNN_descripcion.sql` con NNNN incremental de 4 digitos.
- Ningun archivo debe contener secretos ni claves; se aplican via `supabase db push` o el editor SQL del proyecto.
- El proyecto remoto actual ya fue actualizado con `supabase db push`. Mantener las migraciones versionadas como fuente de verdad.

## Migraciones actuales

- `migrations/0001_init_enums_and_core_tables.sql`
- `migrations/0002_rls_helpers_and_policies.sql`
- `migrations/0003_telemetry_partitioning_and_storage.sql`
- `migrations/0004_composite_uniques_and_constraints.sql`
- `migrations/0005_seed_plans.sql`
- `migrations/0006_account_profile_fields.sql`
- `migrations/0007_teams_sport_type_enum.sql`
- `migrations/0008_telemetry_derived_materialized_views.sql`

## Flujo de cambios

1. Crear una migracion nueva en `migrations/NNNN_descripcion.sql`.
2. Ejecutar `supabase db push` contra el entorno objetivo.
3. Regenerar tipos con `supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/infrastructure/supabase/types/database.ts`.
4. Si cambia una tabla usada por Prisma, ejecutar `npm run db:pull` y `npm run db:generate`.
5. Validar `npm run typecheck` y las suites Vitest/Playwright afectadas.

## Pendiente de hardening

1. Documentar URLs finales de redirect/callback y plantillas de email de Supabase Auth.
2. Confirmar backups/snapshots antes de migraciones destructivas.
