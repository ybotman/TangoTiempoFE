# AI GUILD — System Overview
# VERSION 1.02

The **AI GUILD** is a structured, role-driven development system that integrates AI agents and human contributors to deliver high-quality software efficiently. It is organized around three core concepts:

---

## 1. Playbooks
### the .md's are held in /pubic/AI-Guild/Playbooks
- **Playbooks** are living documents that define standards, workflows, and best practices for all development activities.
- Types include:
  - **Code Standards** (Node, React, etc.)
  - **SDLC Processes** (issue/feature/Epics, Git workflow)
  - **Application-Specific Guides**
- Playbooks are numbered and can be referenced or read on demand.

---

## 2. Applications
### the .md's are held in /pubic/AI-Guild/Applications

- The GUILD manages multiple applications. This doucmentetiokn is meant to guild you on what each does, and the mission fo the apps.  CUrrently we grouped into systems:
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

## 4. IFE Tracking
### (I) Issues bugs and problems , 
### (F) Features - net new, 
### (E) Epic - the biggies multi phase
### are documeted as .md's and the the .md's are held in /public/IFE-Tracking/<Issues>|<Features>|<Epics><docuement>

- **Tracking** provides the standards and rules for managing Issues, Features, and Epics (I/F/E) across the system.
- It defines naming conventions, branch structure, and workflow for traceable, high-quality development.
- All tracking documentation and policies are maintained in this directory for reference and enforcement.



---

## Summary

The AI GUILD system enforces clarity, accountability, and best practices through Playbooks, structured Roles, modular Applications, and robust Tracking. This enables scalable, maintainable, and collaborative software development—whether by humans, AI, or both.