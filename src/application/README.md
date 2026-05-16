# Application layer

Use cases, commands and queries that orchestrate domain modules and
infrastructure adapters. No React or HTTP code lives here.

- `commands/` mutating use cases.
- `queries/` read-only projections.
- `use-cases/` higher level orchestrations that combine commands and queries.
