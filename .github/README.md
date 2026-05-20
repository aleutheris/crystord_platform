# projecter

`projecter` is a source library of reusable generic GitHub Copilot instruction assets for software projects.

## Repository Layout

### Meta Governance
- `.github/copilot-instructions.md`
  - **What**: Governance rules and scope routing for maintaining this meta repository.
  - **Why**: Ensures the instruction library is developed consistently and distinguishes meta vs. target changes.

### Target Root Instruction
- `copilot-instructions.md`
  - **What**: Root instruction file defining AI behavior, scope routing, and hierarchy for target software projects.
  - **Why**: Provides top-level governance for how AI interacts with and manages changes in software projects.

### Generic Process Files
These are reusable instruction files for software projects, defining principles, behaviors, and workflows.

- `generic/process/framework.md`
  - **What**: Abstract framework outlining software engineering values, architectural governance, and quality rules.
  - **Why**: Establishes stack-agnostic principles for readable, maintainable, and contract-stable software.

- `generic/process/framework-reference.md`
  - **What**: Detailed companion guidance for framework heuristics, taxonomy details, and quality-check depth.
  - **Why**: Keeps always-on governance lean while preserving deep reference material for complex tasks.

- `generic/process/llm-software-execution.md`
  - **What**: Guidance on LLM behavior, collaboration style, and delivery rules in software projects.
  - **Why**: Ensures AI challenges assumptions constructively and prioritizes quality over speed.

- `generic/process/product-backlog.md`
  - **What**: User-outcome-oriented backlog for planning future work and tracking decisions.
  - **Why**: Focuses development on user value, risk reduction, and strategic fit rather than implementation convenience.

- `generic/process/project-instructions.md`
  - **What**: Template for instantiating project-specific instructions from the framework.
  - **Why**: Allows customization of governance for individual projects while maintaining consistency.

### Generic Templates
These are reusable templates for common software project artifacts.

- `generic/templates/adr.template.md`
  - **What**: Template for documenting Architecture Decision Records.
  - **Why**: Captures why key decisions were made, enabling future rationale and change tracking.

- `generic/templates/backlog-item.template.md`
  - **What**: Template for defining product backlog items with user value and effort estimates.
  - **Why**: Structures backlog entries for prioritization and clear implementation planning.

- `generic/templates/backlog-status-template.md`
  - **What**: Template for backlog status tracking as an index of item states and links.
  - **Why**: Provides a single source of truth for what is done, in progress, and planned.

- `generic/templates/interface-change-request.template.md`
  - **What**: Template for proposing changes to APIs, schemas, or contracts.
  - **Why**: Enforces human-in-the-loop approval for interface changes to maintain stability.

- `generic/templates/requirements-log-template.md`
  - **What**: Template for logging requirement changes and taxonomy.
  - **Why**: Tracks functional, quality, operational, and compliance requirements with stable IDs.

- `generic/templates/learnings-index-template.md`
  - **What**: Lightweight index template for learnings with summaries and links to detailed entries.
  - **Why**: Enables on-demand retrieval of lessons learned without overloading always-on context.

- `generic/templates/learning-entry-template.md`
  - **What**: Detailed template for a single learning record (mistake, impact, prevention).
  - **Why**: Captures actionable knowledge to avoid repeating errors.

## Copy Model

Bootstrap a software project by copying:

- `copilot-instructions.md` -> target `.github/copilot-instructions.md`
- `generic/process/*.md` -> target `.github/generic/*.md`
- `generic/templates/*.md` -> target `.github/generic/templates/*.md`

After that, project-specific instructions belong in the target repository's `.github/project/`.

## Concepts

- `meta`: governance of this source-library repository.
- `target`: reusable instruction assets intended to be copied into a software project.

This repository does not generate or maintain project-specific target outputs.

## Use

1. Maintain generic guidance in `generic/process/`.
2. Maintain reusable templates in `generic/templates/`.
3. Keep copied assets self-contained and target-local.
4. Fine-tune project-specific behavior inside each software project's own `.github/project/`.
