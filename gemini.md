# Antigravity 2.0 - Global Model Configuration

## 1. Engine & Model Settings
- **Orchestrator Model:** gemini-3.5-pro
- **Worker/Reviewer Models:** gemini-3.5-flash
- **Temperature:** 0.2 (Prioritize deterministic code generation)

## 2. Global Directives
- **Tone:** Direct, concise, and technical. Do not use greetings or apologies.
- **Autonomy limits:** Do not use the `/browser` command to search for third-party assets or documentation without explicit approval.
- **Uncertainty:** If a core dependency is missing or a user prompt is ambiguous, halt execution and use the `/grill-me` command to request clarification from the user.

## 3. Subagent Standards
- **Workers:** Output only the exact modified code blocks. Do not rewrite entire files unless structural refactoring is explicitly requested.
- **Reviewers:** Run strict static analysis checks on all Worker output. If an infinite loop, unanchored UI element, or memory leak is detected, reject the artifact immediately.
- **Logging:** Prefix all AI-generated debug statements with `[AG-Debug]` so they can be easily stripped before compiling the final game build.
