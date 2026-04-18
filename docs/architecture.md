<!-- /**
  * Records architecture decisions for the Aqua Lab simulator platform.
  */ -->
# ADR-0001: Foundational Architecture for Aqua Lab

## Status
Accepted

## Date
2026-04-17

## Context
Aqua Lab requires a production-ready architecture for an interactive 3D chemistry simulator, with clear separation of concerns across rendering, domain modeling, physics behavior, and reusable libraries. The platform must support long-term extensibility and independent package evolution while keeping developer workflows fast and consistent.

## Decision
1. 3D Rendering Library: React Three Fiber + Three.js.
2. State Management: Zustand for lightweight, composable global state.
3. Physics Approach: Custom physics engine in a dedicated workspace package.
4. Chemistry Model: Molar stoichiometry-first model in a dedicated chemistry package.
5. Monorepo Tooling: Turborepo with npm workspaces for task orchestration and cache-aware pipelines.

## Rationale
1. React Three Fiber provides declarative React ergonomics while keeping direct access to Three.js capabilities.
2. Zustand minimizes boilerplate and supports modular store slices suitable for simulation state.
3. A custom physics engine allows domain-specific behavior tuning for virtual liquid interactions.
4. Molar stoichiometry is transparent, deterministic, and scientifically aligned with titration workflows.
5. Turborepo improves build throughput and dependency-aware execution across app and packages.

## Consequences
1. The simulator app consumes shared package APIs rather than embedding engine logic directly.
2. Engine packages can be versioned and published independently.
3. Type-safe boundaries are enforced through strict TypeScript configurations.
4. CI can validate each workspace with consistent lint, typecheck, and build stages.

## Alternatives Considered
1. Rendering alternatives: raw Three.js without React abstraction.
2. State alternatives: Redux Toolkit and XState.
3. Physics alternatives: third-party general-purpose rigid body engines.
4. Monorepo alternatives: Nx and pnpm recursive scripts.

## Follow-up
1. Define package-level public API contracts in Stage 2.
2. Add architecture diagrams and data-flow sequence diagrams in Stage 3.
