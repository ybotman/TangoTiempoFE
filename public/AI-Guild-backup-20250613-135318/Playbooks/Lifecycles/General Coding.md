# Local Development Environment & Coding Guidelines

## Must meet or exceed the Success Critrea
found in the .md '/AI-Guild/SuccessCriteria.md'

## Always-Running Services and Ports


## Refreshing & Resetting

When you need to update data, refresh the terminal with `npm run` and reset the application as needed.

## Port Conflicts

If you (via the Lifecycle) need to do a build or run in development mode and encounter a port conflict, you must use a different port.

For all your npm run build, and npm run dev you must use ports greater the 3019
so npm run dev -- -p 3020, to npm run dev -- -p 3030) are for you.

## Commit & Merge Requirements

- **Before committing to git:**  
  You must pass a successful `npm run dev` test (ignoring port conflict issues).

- **Before merging to the DEVELOPMENT branch (as defined in .guild-config):**  
  You must pass:
  - A successful `npm run build` and `npm run` test (ignoring port conflict issues).
  - A successful ESLint test.

---