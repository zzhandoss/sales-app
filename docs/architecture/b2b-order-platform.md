# B2B Order Platform Architecture

## Contexts

- tenant
- identity
- catalog
- orders
- sync

## Boundary Rules

- BC services and repos stay local to BC.
- Cross-BC writes only via usecases.
- Cross-BC reads only via query ports.
- External ERP integration through adapter registry.

## Extension Hooks

- Add ERP adapter by implementing `ErpAdapter` and registering in registry.
- Add new channel handlers under channel app without BC internals leakage.
