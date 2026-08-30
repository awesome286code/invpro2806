# Git Commit Convention Template

To maintain a clean and readable history, our team follows the **Conventional Commits** specification.

## 📝 Format
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

---

## 🏗 Types
| Type | Description |
| :--- | :--- |
| `feat` | A new feature for the user |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, etc.) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies (e.g. npm, docker) |
| `ci` | Changes to our CI configuration files and scripts (e.g. GitHub Actions) |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

---

## 💡 Examples

### Feature
`feat(auth): add google oauth2 integration`

### Bug Fix
`fix(api): resolve memory leak in transaction service`

### CI/CD Update
`ci(deploy): update nginx host configuration script`

### Documentation
`docs(readme): add vps deployment steps`

---

## 🛠 Guidelines
1. **Lowercase**: The subject line should be in lowercase.
2. **Imperative**: Use "add" instead of "added" or "adds".
3. **Concise**: Keep the subject line under 50-72 characters.
4. **Scope**: Mention the component affected (e.g., `auth`, `api`, `ui`, `db`).
