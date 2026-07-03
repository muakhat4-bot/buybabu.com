# Villex Monorepo

Welcome to the Villex Monorepo containing customer-marketplace, vendor-portal, and admin-portal apps powered by TurboRepo and Next.js.

---

## 🚀 One-Click Deployment System

A professional deployment automation script is provided to manage the end-to-end integration and verification pipeline.

### Entry Points

You can deploy the entire monorepo by using either of the following methods:

1. **Terminal Command**:
   ```bash
   npm run deploy
   ```

2. **Windows Shortcut**:
   * Double-click the `deploy.bat` file in the root directory of the project.

---

### Deployment Workflow (10 Steps)

The deployment script executes the following stages sequentially:

1. **Verify Git**: Ensures `git` is available in PATH.
2. **Verify Node/npm**: Checks that `node` and `npm` are installed.
3. **Dependency Check**: Runs `npm install` to ensure workspace modules are fully synchronized.
4. **Project Build**: Runs `npm run build` to verify TurboRepo builds compile successfully.
   * *Safe Guard*: If compilation fails, the script aborts immediately without committing or pushing broken code.
5. **Stage Changes**: Stages modified files (`git add .`).
6. **Commit Message Prompt**: Prompts the developer to enter a commit message (defaults to `"Update project"` on empty input).
7. **Commit changes**: Commits changes locally (`git commit -m "<message>"`).
8. **Push to Remote**: Pushes changes to the main repository branch (`git push origin main`).
9. **Status Display**: Prints `✓ GitHub Push Successful`.
10. **Deployment Notice**: Displays `Vercel deployment has started automatically.` (reflecting Vercel's automatic hook pipeline on main branch updates).
