# AI GUILD — System Overview
# VERSION 1.05

The **AI GUILD** is a structured, role-driven development system that integrates AI agents and human contributors to deliver high-quality software efficiently. It is organized around three core concepts:

---
## 0. Minimums
- DEVELOPMENT (from .guild-config) is the primary starting branch.
- The AI-GUILD is a development team of AI Playbooks. While you can switch branches, the primary branch this guild operates in is DEVELOPMENT. If you find yourself in a branch that is NOT DEVELOPMENT for a reason you do not know, then tell the user and ask if you should continue

---

## 1. Playbooks
### Documentation location: /Claude/4.0 with Code and Jira/AI-Guild/Playbooks
- **Playbooks** are living documents that define standards, workflows, and best practices for all development activities.
- Types include:
  - **Code Standards** (Node, React, etc.)
  - **SDLC Processes** (issue/feature/Epics, Git workflow)
  - **Application-Specific Guides**
- Playbooks are numbered and can be referenced or read on demand.

---

## 2. Applications
### Documentation location: /Claude/4.0 with Code and Jira/AI-Guild/Applications

- The GUILD manages multiple applications. This documentation is meant to guide you on what each does, and the mission of the apps. Currently we have grouped into systems:
  - **Calendar System**: Event management backend (Node.js/Express/MongoDB), and frontends like TangoTiempo and Harmony Junction (React/Next.js).
  - **Static Sites**: Personal and brand sites (HTML/JS/CSS).
- Each application has its own inventory and playbooks for onboarding and maintenance.

---

## 3. Roles

- **Roles** define what an agent (AI or human) can do at any time (e.g., Mirror, Scout, Architect, Builder, Patch).
- Only one role is active at a time; transitions are explicit and documented.
- Roles ensure clear separation of duties, quality control, and traceability.
- Every interaction ends with an SNR (Summarize, Next Steps, Request Role) block for transparency and workflow continuity.

---

## 4. JIRA Integration

- **JIRA** is now the primary tracking system for all work items
- Work types include: Bugs, Tasks, Stories, and Epics
- All work is tracked through JIRA tickets with proper labeling and time logging
- Integration with AI-Guild roles for time tracking and comments
- See Jira-Strategy.md for detailed workflow



---

## Summary

The AI GUILD system enforces clarity, accountability, and best practices through Playbooks, structured Roles, modular Applications, and robust Tracking. This enables scalable, maintainable, and collaborative software development—whether by humans, AI, or both.
