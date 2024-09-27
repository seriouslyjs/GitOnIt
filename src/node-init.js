#!/usr/bin/env node

import { execSync } from 'child_process';
import { basename, resolve } from 'path';
import { existsSync } from 'fs';
import yargs from 'yargs';
import readline from 'readline';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .command('init', 'Initialize a new project', (yargs) => {
    yargs.option('yes', {
      alias: 'y',
      type: 'boolean',
      describe: 'Automatically create the repository with default options',
    });
  })
  .help()
  .parse();

const originalCmd = argv.$0;
const originalCmdPath = execSync(`command -v ${originalCmd}`).toString().trim();
const dirName = basename(process.cwd());

// Check if --help is passed, pass control to the original command
if (argv.help) {
  execSync(`${originalCmdPath} init --help`, { stdio: 'inherit' });
  process.exit();
}

const isGitRepo = existsSync(resolve(process.cwd(), '.git'));
let hasRemoteOrigin = false;

if (isGitRepo) {
  try {
    execSync('git remote get-url origin', { stdio: 'ignore' });
    hasRemoteOrigin = true;
  } catch (error) {
    hasRemoteOrigin = false;
  }
}

// If a .git folder exists and has a gh origin, just run the original command
if (isGitRepo && hasRemoteOrigin) {
  execSync(`${originalCmdPath} init`, { stdio: 'inherit' });
  process.exit();
}

const ghUsername = execSync('gh api /user --jq \'.login\'').toString().trim();

// If init is called with --yes or -y, automatically create the gh repo and default to the user's gh username
if (argv.yes) {
  createRepo(ghUsername, dirName);
} else if (isGitRepo && !hasRemoteOrigin) {
  // If the current folder has a .git folder and not gh origin, prompt to ask if a gh repo should be created
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('No GitHub origin detected. Would you like to create a GitHub repository? (Y/n) ', (answer) => {
    if (answer.toLowerCase().startsWith('y')) {
      promptForOrgAndCreateRepo(ghUsername, dirName);
    } else {
      execSync(`${originalCmdPath} init`, { stdio: 'inherit' });
    }
    rl.close();
  });
} else {
  promptForOrgAndCreateRepo(ghUsername, dirName);
}

function promptForOrgAndCreateRepo(username, directory) {
  const orgs = execSync('gh api -X GET /user/orgs --paginate --jq \'.[].login\'').toString().trim().split('\n');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Available organizations:');
  orgs.forEach((org, index) => console.log(`${index + 1}. ${org}`));
  rl.question('Please select the number above (or press Enter for your username): ', (orgChoice) => {
    const selectedOrg = orgs[parseInt(orgChoice, 10) - 1] || username;
    createRepo(selectedOrg, directory);
    rl.close();
  });
}

function createRepo(org, directory) {
  execSync(`gh repo create ${org}/${directory} --private -g Node`, { stdio: 'inherit' });
  execSync(`gh repo clone ${org}/${directory} .`, { stdio: 'inherit' });
  execSync(`${originalCmdPath} init`, { stdio: 'inherit' });
  execSync('git add package.json', { stdio: 'inherit' });
  execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
  execSync('git push -u origin main', { stdio: 'inherit' });
}