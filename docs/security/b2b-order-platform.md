# Security and Privacy Controls

## Controls

- Tenant scope required for every API action.
- Role-based access checks on protected routes.
- Security headers middleware enabled.
- PII redaction utility for structured logs.

## Abuse Cases

- Missing tenant header.
- Role escalation attempts.
- Cross-tenant access attempts.
- Duplicate submission replay attempts.

## Operational Guidance

- Keep all sync failures visible and actionable.
- Never log raw secrets or API keys.
