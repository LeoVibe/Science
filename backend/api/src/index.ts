/**
 * JOB-020 migration entrypoint:
 * backend/api is now the canonical API project location.
 * The runtime logic is temporarily delegated to the legacy path
 * to avoid behavior changes during directory migration.
 */
export { default } from '../../../scripts/workers/api/src/index';
