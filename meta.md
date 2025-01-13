# META: NPM-GIT-INIT

## Folder Structure

```plaintext
/Users/jasonnathan/Repos/NpmGitInit
├── LICENSE
├── LICENSE.md
├── README.md
├── install.sh
└── node-init-wrapper.sh

1 directory, 5 files
```
## File: README.md

# NpmGitInit

## Description

NpmGitInit is a powerful shell script designed to streamline the process of initializing Node.js projects. It integrates the creation and configuration of GitHub repositories directly into your project setup workflow. Perfect for developers looking to automate their initial setup tasks for Node.js projects, this script simplifies the process to a single command execution.

## Features

- **Automated GitHub Repository Creation**: Creates a GitHub repository for your Node.js project with ease.
- **Project Directory Initialization**: Sets up your project directory with essential Node.js configurations.
- **Choice of GitHub Organization**: Allows selection of a GitHub organization for your repository, defaulting to your personal account.
- **Compatibility with npm, yarn, and pnpm**: Seamlessly integrates with popular Node.js package managers.
- **Open Source Contribution**: Open to community contributions and improvements.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed and configured on your system.
- [GitHub CLI](https://cli.github.com/manual/installation) installed and authenticated.
- [`jq`](https://stedolan.github.io/jq/download/) command-line JSON processor installed.
- A GitHub account for repository creation and management. [Sign up here](https://github.com/join) if you don't have one.

### Installation

Execute the following command in your terminal to install:

```bash
curl -sSL https://raw.githubusercontent.com/seriouslyjs/NpmGitInit/master/install.sh | bash
```

This command will download and execute the `install.sh` script, which in turn will set up `node-init-wrapper.sh` and the required aliases.

### Usage

Initiate a new Node.js project using:

```bash
npm init
```

Or with yarn:

```bash
yarn init
```

Or with pnpm:

```bash
pnpm init
```

Then follow the interactive prompts to select an organization and configure your repository.

## Contributing

We welcome contributions from the community. To contribute:

1. Fork the project.
2. Create a new feature branch (`git checkout -b feature/YourAmazingFeature`).
3. Commit your changes (`git commit -m 'Add some YourAmazingFeature'`).
4. Push to the branch (`git push origin feature/YourAmazingFeature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/seriouslyjs/NpmGitInit/blob/main/LICENSE) file for details.

## Contact

Jason Nathan - [@jason_nathan](https://twitter.com/jason_nathan)

Project Link: [https://github.com/seriouslyjs/NpmGitInit](https://github.com/seriouslyjs/NpmGitInit)

---

## File: install.sh
```bash
#!/bin/bash

# Download and store the script
SCRIPT_URL="https://raw.githubusercontent.com/seriouslyjs/NpmGitInit/master/node-init-wrapper.sh"
INSTALL_DIR="$HOME"
SCRIPT_NAME="node-init-wrapper.sh"

# Determine which shell the user is using
case $SHELL in
  */zsh)
    # If Zsh
    ALIAS_FILE="$HOME/.zshrc"
    ;;
  */fish)
    # If Fish
    ALIAS_FILE="$HOME/.config/fish/config.fish"
    ;;
  *)
    # Default to .bashrc if shell is unknown
    ALIAS_FILE="$HOME/.bashrc"
    echo "Defaulting to bash settings."
    ;;
esac

# Download the script
curl -o "$INSTALL_DIR/$SCRIPT_NAME" "$SCRIPT_URL"

# Make the script executable
chmod +x "$INSTALL_DIR/$SCRIPT_NAME"

# Add aliases to the shell configuration
if [ "$SHELL" = "*/fish" ]; then
    # Fish shell syntax for alias
    if ! grep -q "function npm;" "$ALIAS_FILE"; then
        echo "function npm; $INSTALL_DIR/$SCRIPT_NAME npm \$argv; end" >> "$ALIAS_FILE"
        echo "function yarn; $INSTALL_DIR/$SCRIPT_NAME yarn \$argv; end" >> "$ALIAS_FILE"
        echo "function pnpm; $INSTALL_DIR/$SCRIPT_NAME pnpm \$argv; end" >> "$ALIAS_FILE"
    fi
else
    # Bash/Zsh syntax for alias
    if ! grep -q "alias npm=" "$ALIAS_FILE"; then
        echo "alias npm=\"$INSTALL_DIR/$SCRIPT_NAME npm\"" >> "$ALIAS_FILE"
        echo "alias yarn=\"$INSTALL_DIR/$SCRIPT_NAME yarn\"" >> "$ALIAS_FILE"
        echo "alias pnpm=\"$INSTALL_DIR/$SCRIPT_NAME pnpm\"" >> "$ALIAS_FILE"
    fi
fi

echo "Installation complete. Please restart your terminal or source your $ALIAS_FILE file."
```

## File: node-init-wrapper.sh
```bash
#!/bin/bash

# The original command (npm, yarn, or pnpm)
ORIGINAL_CMD=$1
# Find the path of the original command. This works correctly even when alias is set
ORIGINAL_CMD_PATH=$(which "$ORIGINAL_CMD")

# Shift the arguments so $1 becomes the first argument of the original command
shift

# Get the directory name
DIR_NAME=$(basename "$(pwd)")

# Get the GitHub username
GH_USERNAME=$(gh api /user --jq '.login')

# Check if the first argument is 'init'
if [ "$1" = "init" ]; then
    # 1. Get the directory it was called in
    echo "Current directory: $DIR_NAME"
    echo "Fetching available organizations..."
    ORGS=$(gh api -X GET /user/orgs --paginate --jq '.[].login' | tr '\n' ' ')

    echo "Available organizations:"
    PS3="Please select the number above (or press Enter for $GH_USERNAME): "
    select ORG_CHOICE in $ORGS; do
        ORG_CHOICE=${ORG_CHOICE:-$GH_USERNAME}
        break
    done
    # 2. Run 'gh repo create'
    gh repo create $ORG_CHOICE/$DIR_NAME --private -g Node

    # 3. Clone the repo into the current directory
    # Assuming you want to clone into the current directory
    gh repo clone $ORG_CHOICE/$DIR_NAME .

    # 4. Run the original init command
    "$ORIGINAL_CMD_PATH" "$@"

    # 5. Stage and commit the files
    git add package.json
    git commit -m "Initial commit"
    git push -u origin main
else
    # Pass all arguments to the original command
    "$ORIGINAL_CMD_PATH" "$@"
fi
```

## Git Repository

```plaintext
origin	https://github.com/seriouslyjs/NpmGitInit.git (fetch)
origin	https://github.com/seriouslyjs/NpmGitInit.git (push)
```
