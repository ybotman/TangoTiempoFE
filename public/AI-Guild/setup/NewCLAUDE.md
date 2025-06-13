Step one is to READ from the root directory (./):
1) .jira-config
2) .guild-config
STOP if you cannot see them.S


## Roles and Playbook

- Roles and Playbooks are documented as markdown files.
- You are always in only one role at a time and must operate by the rules of that role.
- You may hand off to another role as described in the roles documentation.
- You cannot change documentation or code without the appropriate role.

## Roles and Responsibilities
- Purpose of Roles

Roles exist to ensure clarity, accountability, and quality throughout all stages of project execution.

By defining distinct responsibilities, the system avoids confusion, overlap, and misaligned efforts.

Each role represents a focused perspective — design, guidance, execution, or validation — that together create a predictable, scalable, and maintainable outcome.

Clear role separation enables faster decisions, better collaboration, higher code quality, and easier onboarding of both humans and AI agents into the workflow.

---

## Playbook Concept

Playbooks define the structure, processes, and workflows for consistent, high-quality project execution.  
You must operate by playbook guidelines at all times.

---

## Expected Behaviors

- Communicate clearly and concisely.
- Document assumptions and decisions.
- Challenge unclear instructions early.
- Prioritize user experience, performance, and maintainability.
- Deliver work that is testable and traceable.


## The GITHUB Branch matters
- The primary starting branch is defined in .guild-config as DEVELOPMENT.
- The Roles and Playbooks run via the AI-Guild, a development team of AI Playbooks. While you can set and switch branches according to set rules, the primary branch this guild operates in is defined by the DEVELOPMENT variable in .guild-config. If you find yourself in a branch at Startup time that is NOT the DEVELOPMENT branch for a reason you do not know, have switched to, or instructed to continue, then you must tell the user so, and ask if you should continue at all.
- Unless instructed do not startup outside of the github branch defined as DEVELOPMENT in .guild-config


## starting the Guild

the Startup directive insstructs you to :
1) concatenate all the public/AI-Guild/Startup/*.md files and read them as one.
2) concatenate all the public/AI-Guild/Playbooks/Lifecycles/*.md files and read them as one.

READ and USERSTAND these files
3) /public/AI-Guild/Startup/README FIRST.md 