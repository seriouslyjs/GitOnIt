#!/bin/zsh

# Exit if no command is provided
if [ -z "$1" ]; then
    echo "No command provided. Exiting."
    exit 1
fi

# should be npm, bun, pnpm or yarn
ORIGINAL_CMD="$1"
shift

# get the bin path
ORIGINAL_CMD_PATH="$(which "$ORIGINAL_CMD")"

# to populate later in the script
ORG_CHOICE=""


# Function to initialize Git and set the default branch to 'main'
initialize_git_and_set_main() {
    git init
    # Make an initial commit to ensure HEAD is not ambiguous
    git commit --allow-empty -m "Initial commit"    
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        git branch -m "$CURRENT_BRANCH" "main"
    fi
    echo "Initialised git repository and set default branch to 'main'"
}

# Function to update package.json with the repository URL
update_package_json() {
    REPO_URL="https://github.com/$ORG_CHOICE/$DIR_NAME.git"
    jq '.repository = {"type": "git", "url": "'$REPO_URL'"}' package.json > temp.json && mv temp.json package.json
    echo "Package.json updated with repository URL: $REPO_URL"
}

# Function for the initial commit and push
initial_commit_and_push() {
    git add .

    # Check if there is only one commit in the repository
    if [ $(git rev-list --count HEAD) -eq 1 ]; then
        # Amend the initial commit if it's the only one
        git commit --amend -m "Initial commit: Setup project with package manager and linked GitHub repository"
    else
        # Make a new commit if there are already other commits
        git commit -m "Initial commit: Setup project with package manager and linked GitHub repository"
    fi

    git push -u origin main --force-with-lease
    echo "Initial commit and push complete"
}

# Function to fetch GitHub username and available organizations, then select one
fetch_and_select_org() {
    if ! GH_USERNAME=$(gh api /user --jq '.login'); then
        echo "Error fetching GitHub username. Make sure you're logged in with 'gh auth login'."
        exit 1
    fi

    echo "Fetching available organizations..."
    if ! ORGS=$(gh api -X GET /user/orgs --paginate --jq '.[].login' | tr '\n' ' '); then
        echo "Error fetching organizations. Make sure you're logged in with 'gh auth login'."
        exit 1
    fi

    echo "Available organizations:"
    i=1
    ORGS_ARRAY=($ORGS)
    for org in "${ORGS_ARRAY[@]}"; do
        echo "$i) $org\n"
        let i++
    done

    echo "Please enter the number of the organization to use"
    echo "Or Press Enter for $GH_USERNAME:"
    read ORG_NUMBER

    if [[ -z "$ORG_NUMBER" ]]; then
        ORG_CHOICE="$GH_USERNAME"
        echo "Defaulting to: $ORG_CHOICE"
    elif [[ "$ORG_NUMBER" =~ ^[0-9]+$ ]]; then
        ARRAY_INDEX=$((ORG_NUMBER - 1))
        if [ "$ARRAY_INDEX" -ge 0 ] && [ "$ARRAY_INDEX" -lt "${#ORGS_ARRAY[@]}" ]; then
            ORG_CHOICE="${ORGS_ARRAY[$ARRAY_INDEX]}"
            echo "Selected organization: $ORG_CHOICE"
        else
            echo "Invalid selection. Exiting."
            exit 1
        fi
    else
        echo "Invalid input. Exiting."
        exit 1
    fi
}


# Function to check package.json and run package manager init if necessary
check_and_run_package_init() {
    if [ -f "package.json" ]; then
        if jq -e '.name' package.json > /dev/null; then
            echo "package.json already initialized. Skipping package manager init."
        else
            echo "package.json exists but is missing a 'name'. Proceeding with init."
            if ! "$ORIGINAL_CMD_PATH" init "$@"; then
                echo "Initialization with '$ORIGINAL_CMD' failed. Exiting."
                SCRIPTEXIT
                exit 1
            fi
        fi
    else
        echo "No package.json found. Proceeding with init."
        if ! "$ORIGINAL_CMD_PATH" init "$@"; then
            echo "Initialization with '$ORIGINAL_CMD' failed. Exiting."
            SCRIPTEXIT
            exit 1
        fi
    fi
}


# Check if the first argument is 'init'
if [ "$1" != "init" ]; then
    # If the first argument is not 'init', run the original command directly
    "$ORIGINAL_CMD_PATH" "$@"
    exit 0;
fi    
    check_and_run_package_init

    # Get the GitHub username or org, ensuring error handling if the `gh` command fails
    fetch_and_select_org

    # Get the directory name, ensuring it's quoted to handle spaces or special characters
    DIR_NAME="$(basename "$(pwd)")"    

    # set git up
    initialize_git_and_set_main

    # Create the GitHub repository from the current directory as the source
    echo "Creating GitHub repository from the current directory..."
    if ! gh repo create "$ORG_CHOICE/$DIR_NAME" --private --source .; then
        echo "Failed to create repository with the current directory as source."
        exit 1
    fi

    # fetch the Node gitignore template
    wget -O .gitignore https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore


    # update package.json with the repository URL
    update_package_json

    #finally, initial commit and push
    initial_commit_and_push

    echo "All Done! Project & Repo initialised & pushed to GitHub. Happy coding!"