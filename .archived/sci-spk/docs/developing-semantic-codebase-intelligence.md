# Developing Semantic Codebase Intelligence (SCI)

When a team member opens a code file, they perceive vastly more information than what is represented in the syntax of the file. The act of opening the file triggers all sorts of contextual awareness and memories. They are aware of the file's purpose, it's history, where it sits in the project, what is does in the system, individuals they can reach out to for assistance, etc. GPTs do not have the opportunity or ability to access this information, leading to their limitation in successfully completing tasks autonomously.

One first step to enabling an AI system to successfully complete tasks in a codebase could be for humans to open various files and begin building a labeled syntactic description of this context. Once the process and required items are known, it is likely we can automate some of the information generation through scripting and use of LLMs when applied to repos and corporate systems to gather and organize this information.

## Information Composition

SCI is developed from:

1. Repository Information
2. Source Code
3. Git History
4. PRs & Issues
5. Documentation

### Repository Information

- Project Structure
- Workflows
- Scripts
- Tools
- Configuration Files
- Project Dependencies
- README
- CONTRIBUTING
- Style Guide, etc.

### Source Code

On a per-file and per-package basis:

- Static Analysis
  - path
  - imports
  - exports
  - definitions
  - used by
  - contributors
  - git history summary
  - changelog
- Natural Language Analysis
  - Why: Summary (1-2 sentences)
  - Why: Description (~200-300 words)
  - How: Summary of logic (functional description)
  - Meaningful contributors
- Churn

Source code files include:

- Product Code
- Documentation Code
- Tests & Fixtures
- Images & Assets
- Data Files

### Git History

- Users
- Commit Messages
- Ownership Areas
- Changed together

### PRs & Issues

- Users
- Purpose or Initiative (OKR)
- Description & Comments
- Labels

**PRs**

- File List
- Diffs
- Status (merged, open, closed)
- Age
- Size
- Complexity
