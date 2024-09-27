import { execSync } from 'child_process';
import { basename, resolve } from 'path';
import { existsSync } from 'fs';
import yargs, { Arguments } from 'yargs';
import readline from 'readline';
import { hideBin } from 'yargs/helpers';

// Utility functions
/**
 * Runs a command synchronously and inherits the stdio.
 * 
 * @param {string} command - The command to be executed.
 * @returns The output of the command.
 */
const runCommand = (command: string, args: Array<string | number> = []) => {
  const fullCommand = `${command} ${args.join(' ')}`;
  execSync(fullCommand, { stdio: 'inherit' });
};

/**
 * Get the URL of the remote origin of the git repository.
 * 
 * @returns {string} The URL of the remote origin.
 */
const getGitRemoteOrigin = (): string => {
  // Execute the command to get the remote origin URL of the git repository
  return execSync('git remote get-url origin', { stdio: 'ignore' }).toString()
};

/**
 * This function retrieves the GitHub username by making a request to the GitHub API.
 * @returns The GitHub username as a string.
 */
const getGitHubUsername = (): string => {
  // Execute the 'gh' command to make a request to the GitHub API and retrieve the username.
  return execSync('gh api /user --jq \'.login\'').toString().trim();
};

/**
 * Retrieves a list of available organizations for the current user.
 * 
 * @returns An array of strings representing the organization names.
 */
const getAvailableOrgs: () => string[] = () => {
  const orgsRaw: string = execSync('gh api -X GET /user/orgs --paginate --jq \'.[].login\'').toString().trim();
  return orgsRaw.split('\n');
};

// Pure functions
/**
 * Checks if the current git repository has a remote origin.
 * 
 * @returns {boolean} True if the repository has a remote origin, false otherwise.
 */
const hasGitRemoteOrigin = (): boolean => {
  try {
    return !!getGitRemoteOrigin();
  } catch (error) {
    return false;
  }
};


const displayOrgs = (orgs: string[]) => {
  console.log('Available organizations:');
  orgs.forEach((org, index) => console.log(`${index + 1}. ${org}`));
};

/**
 * Prompts the user to select an organization from a list of options.
 * 
 * @param orgs - An array of organizations to choose from.
 * @returns A promise that resolves to the selected organization.
 */
const getOrgSelection = async (orgs: string[], username: string): Promise<string> => {

  displayOrgs(orgs)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(
      `Please select the number above (or press Enter for '${username}'): `,
      (answer: string) => {
        const selectedOrg = orgs[parseInt(answer, 10) - 1] || '';
        rl.close();
        resolve(selectedOrg);
      }
    );
  });
};

/**
 * Get command line arguments using yargs.
 * @returns {Arguments} - Parsed command line arguments.
 */
const getArgs = (): Arguments => {
  const argv = yargs(hideBin(process.argv))
    .command<Arguments>('init', 'Initialize a new project', (yargs) => {
      yargs.option('yes', {
        alias: 'y',
        type: 'boolean',
        describe: 'Automatically create the repository with default options',
      });
    })
    .help()
    .parse();
  return argv as Arguments;
}

function createRepo(org: string, directory: string) {
  runCommand('gh', ['repo', 'create', `${org}/${directory}`, '--private', '-g', 'Node']);
  runCommand('gh', ['repo', 'clone', `${org}/${directory}`, '.']);
  runCommand('git', ['add', 'package.json']);
  runCommand('git', ['commit', '-m', 'Initial commit']);
  runCommand('git', ['push', '-u', 'origin', 'main']);
}

function createGHOrigin(org: string, directory: string) {
  runCommand('gh', ['repo', 'create', `${org}/${directory}`, '--private', '-g', 'Node']);
  runCommand('git', ['remote', 'add', 'origin', `https://github.com/${org}/${directory}.git`]);
  runCommand('git', ['add', 'package.json']);
  runCommand('git', ['commit', '-m', 'Initial commit']);
  runCommand('git', ['push', '-u', 'origin', 'main']);  
}



const getOriginalCmd = (args: Arguments) => {
  const { help, yes, $0, _: commandArgs, ...restArgs } = args;
  const originalCmdPath = execSync(`command -v ${$0}`).toString().trim();
  if (help) {
    // Pass the --help flag and any additional flags
    runCommand(`${originalCmdPath} init --help`);
    process.exit(0);
  }
    // Create an array of additional flags to pass, including --yes if present
    const additionalFlags = Object.entries(restArgs).reduce((flags, [key, value]) => {
      if (typeof value === 'boolean') {
        // For boolean flags, add just the flag itself
        flags.push(value ? `-${key.length > 1 ? '-' : ''}${key}` : '');
      } else if (value !== false) {
        // For flags with values, add the flag and its value
        flags.push(`-${key.length > 1 ? '-' : ''}${key}`, String(value));
      }
      return flags;
    }, [] as Array<string | number>);  
    // If the --yes flag is present, include it in the additional flags
    if (yes) {
      additionalFlags.push('-y');
    }
    additionalFlags.push(...commandArgs);
    return runCommand.bind(null, `${originalCmdPath} init`, additionalFlags)
}

const main = async (args: Arguments) => {
  const { yes } = args;
  const originalCmd = getOriginalCmd(args);
  const dirName = basename(process.cwd());
  const isGitRepo = existsSync(resolve(process.cwd(), '.git'));
  const ghUsername = getGitHubUsername();  
  originalCmd()
  if (isGitRepo) {
    if(hasGitRemoteOrigin()) return;
    const orgs = getAvailableOrgs();
    const selectedOrg = yes ? ghUsername : await getOrgSelection(orgs, ghUsername);
    createGHOrigin(selectedOrg, dirName)    
  }
  if (!isGitRepo || !hasGitRemoteOrigin()) {
    const orgs = getAvailableOrgs();
    const selectedOrg = yes ? ghUsername : await getOrgSelection(orgs, ghUsername);
    createRepo(selectedOrg, dirName)
  }
}