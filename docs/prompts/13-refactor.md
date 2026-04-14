Review the entire Employee Management Platform codebase.

Fix:
- Bad patterns or anti-patterns
- Code repetition (DRY violations)
- Tight coupling between modules
- Naming inconsistencies
- Missing error handling
- Security gaps (exposed data, missing auth checks)

Ensure:
- Clean architecture (routes → services → repositories)
- Consistent response formats across all endpoints
- Proper TypeScript typing (no `any`)
- Access control on every board/attendance/message operation
- Personal messages never leak to public channels
- Attendance data is private per employee
- Code is readable and maintainable

Refactor where needed. Do not break existing functionality.
