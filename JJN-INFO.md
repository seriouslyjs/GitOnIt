# JJN-INFO: NPM-GIT-INIT

## **Why I Love This**
- Automates the **entire** Node.js project setup, including GitHub repo creation.  
- I barely need to think about the process anymore—just `npm init` and watch magic happen.  
- Works seamlessly with `npm`, `yarn`, or `pnpm` thanks to the wrapper script and aliases.  
- One of those "small script, big impact" tools that makes life easier every single time.

---

## **Folder Layout**

```plaintext
/Users/jasonnathan/Repos/npm-git-init
├── LICENSE                 # MIT License details
├── LICENSE.md              # Duplicate license file (can probably remove?)
├── README.md               # General documentation for public reference
├── install.sh              # Installs the wrapper script and sets up aliases
└── node-init-wrapper.sh    # The core script that handles the project and repo setup
```

---

## **Key Features**

1. **GitHub Integration**
   - Fetches my GitHub username or orgs using `gh cli` and auto-creates a repo.  
   - The `gh repo create` command defaults to private repos with a Node template.

2. **Shell Integration**
   - Aliases (`npm`, `yarn`, `pnpm`) are automatically configured during install.  
   - Detects the shell (`bash`, `zsh`, or `fish`) and appends aliases accordingly.

3. **Default Workflow**
   - Clones the new repo into the current directory.  
   - Initializes `package.json` and makes the first commit/push to `main`.

---

## **How It Works**

### Installation

Run the one-liner:
```bash
curl -sSL https://raw.githubusercontent.com/seriouslyjs/npm-git-init/master/install.sh | bash
```

- The `install.sh` script:
  - Downloads the `node-init-wrapper.sh` file to `$HOME`.  
  - Makes the script executable.  
  - Adds aliases for `npm`, `yarn`, and `pnpm` to `.bashrc`, `.zshrc`, or `config.fish`.  

### Usage

1. Navigate to a project directory:
   ```bash
   mkdir my-awesome-project && cd my-awesome-project
   ```

2. Use your preferred package manager to initialize:
   ```bash
   npm init
   # Or:
   yarn init
   pnpm init
   ```

3. Follow the interactive prompts:
   - Select a GitHub organization (or use your personal account by default).  
   - Watch the repo get created, cloned, and pushed to GitHub automatically.  

---

## **Highlights of the Core Script**

### **node-init-wrapper.sh**
- Checks the first argument (`npm`, `yarn`, or `pnpm`) and whether it’s `init`.  
- Fetches the directory name and available GitHub orgs.  
- Creates a private GitHub repo and clones it locally.  
- Executes the `init` command and stages, commits, and pushes files automatically.  
- If no `init` command is detected, it just passes the arguments to the original package manager.

Example flow for `npm init`:
```bash
npm init
# Output:
# Current directory: my-awesome-project
# Fetching available organizations...
# Available organizations: [org1] [org2] [org3]
# Please select the number above (or press Enter for default username):
```

---

## **Improvements for Later**
1. **Error Handling**  
   - Could add better error reporting for when `gh` CLI isn’t authenticated or `jq` isn’t installed.

2. **Custom Repo Templates**  
   - Support for cloning specific repo templates instead of just the Node default.

3. **Org Defaults**  
   - Save a preferred GitHub org and skip the selection step.

4. **Compatibility for Other Shells**  
   - Double-check if shells like `fish` need extra tweaks for aliasing.

---

## **Quick Commands**
- **Installation:**
  ```bash
  curl -sSL https://raw.githubusercontent.com/seriouslyjs/npm-git-init/master/install.sh | bash
  ```

- **Reset Shell Aliases:**  
  Manually source your shell config if aliases don’t seem to work:
  ```bash
  source ~/.bashrc    # or ~/.zshrc or config.fish
  ```

---

## **Repo Link**
```plaintext
origin	https://github.com/seriouslyjs/npm-git-init.git
```

---

## **Final Thoughts**
Every time I use this, it saves me a ridiculous amount of manual setup. I love how it just works, and it's one of those tools that makes me feel more productive without much effort. Definitely something I'll keep refining when I have spare time!

