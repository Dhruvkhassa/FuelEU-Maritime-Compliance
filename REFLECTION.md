# Reflection

This project was implemented as a submission for the FuelEU Maritime compliance calculation assignment. Primary work done:

- Implemented GHG intensity calculations (WtT, TtW, GHGIE_actual) in the backend.
- Implemented Compliance Balance and related services (banking, pooling).
- Added frontend UI with calculation breakdown, routes, compare, banking and pooling tabs.
- Added unit tests for core calculation units (backend).
- Prepared deployment configurations and CI/CD workflow.

AI agent collaboration notes:

- The codebase and tests were generated and refined with the help of an AI-assisted development workflow. Changes are documented in `AGENT_WORKFLOW.md`.
- Git history was cleaned and re-written to show incremental commits reflecting development stages.

Known limitations and notes:

- Frontend has a placeholder `npm run test` script (no unit tests included) to satisfy automated test runners.
- Prisma migrations and full stack seed require a PostgreSQL instance. CI includes a test database to run backend tests.

Date: 2025-11-08
