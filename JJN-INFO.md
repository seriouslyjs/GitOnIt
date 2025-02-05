# JJN-INFO: GITONIT  
_(Because if I start one more project without Git, I will fight myself.)_  

## What Was I Thinking?  
I got sick of rogue projects. **Sick.** Of. Them.  
You know the ones—random directories scattered across my drive, half-baked ideas with no version control, and the occasional `"final-final-v2-REAL"` folder.  

So I made **GitOnIt**:  
✔ **Hijacks `npm init`, `bun init`, `pnpm init`, or `yarn init`** and forces Git setup.  
✔ **Creates a GitHub repo** (because local-only projects are just procrastination).  
✔ **Auto-commits and pushes** (so I can pretend I have discipline).  
✔ **Downloads a `.gitignore`** (because I **will** forget to do this).  
✔ **Updates `package.json` with the repo URL** (so it doesn’t look like an orphan).  

Basically, if I ever start a new project without version control, **this script will slap me into compliance**.  

---

## Folder Structure (aka Where Things Live)  
```plaintext
/Users/jasonnathan/Repos/GitOnIt
├── LICENSE                    # Because MIT license makes everything official.
├── LICENSE.md                 # Why is this here twice? No idea.
├── README.md                  # Public-facing doc that is **not this file**.
├── install.sh                 # The installer that makes this script work globally.
└── node-init-wrapper.sh        # The script that does all the work.
```

---

## How It Works (So I Don't Forget Later)  

### 🚀 **Step 1: Install It (or Reinstall When I Screw Things Up)**
```sh
git clone https://github.com/seriouslyjs/GitOnIt.git
cd GitOnIt
bash install.sh
```
Then restart the terminal, or just be lazy and run:  
```sh
source ~/.zshrc  # Or ~/.bashrc if I made poor life choices
```
Now, whenever I run `npm init`, `bun init`, `pnpm init`, or `yarn init`, this script **takes over**.  

---

### 🛠 **Step 2: Start a Project (a.k.a. Let It Do Its Thing)**
```sh
npm init  # Or any other package manager init command
```
Behind the scenes, **GitOnIt** will:  
1. **Run the normal package manager init process** (so I don’t suspect anything).  
2. **Set up Git** immediately—no excuses.  
3. **Ask me which GitHub org to use** (or default to my personal account).  
4. **Create the repo on GitHub** like a responsible adult.  
5. **Update `package.json` with the GitHub URL**.  
6. **Commit everything and push it** to `main`.  

By the time it’s done, my project is **fully version-controlled, online, and ready to go**.  

---

## Key Components (a.k.a. What I Actually Wrote)  

### 🏗 **The Workhorse (`node-init-wrapper.sh`)**  
- **Intercepts `npm init` and friends** before they run wild.  
- **Initializes Git and renames `master` to `main`** (because we're civilized).  
- **Creates a GitHub repo** using the `gh` CLI.  
- **Updates `package.json`** with the repo link (because why would I do that manually?).  
- **Commits and pushes automatically** (so I don’t “forget” to do it later).  

🛑 **Gotchas:**  
- **Requires `gh` CLI authentication** (`gh auth login` if I’m not logged in).  
- **Defaults to private repos** (because I don’t trust myself with public code).  
- **Forces `main` as the default branch** (deal with it).  

---

### 🛠 **The Installer (`install.sh`)**  
- **Downloads the script** and makes it executable.  
- **Adds aliases** for `npm`, `bun`, `pnpm`, and `yarn` so they all route through `GitOnIt`.  
- Supports **Zsh, Bash, and Fish**, because future-me **might** change shells.  

💡 **If something stops working:**  
- Check `~/.zshrc` (or `~/.bashrc`) to make sure the aliases are still there.  
- Run `which npm` to confirm it’s using the wrapper.  

---

## Cool Things It Does (That I Will Take for Granted)  
✔ **Instant Git setup**—No more “I’ll do it later.”  
✔ **Forces me to use GitHub from the start**—No more half-baked local projects.  
✔ **Saves me from forgetting `.gitignore`**—Because Node modules **don’t belong in commits**.  
✔ **Pushes everything immediately**—So I can’t procrastinate version control.  

---

## Where I Screwed Up (a.k.a. Fix This Later)  
🔴 **No fallback for failed GitHub repo creation**—Right now, if `gh` chokes, the whole process stops.  
🔴 **Hardcoded private repos**—I might want an option for public repos.  
🔴 **Needs better error handling**—If `npm init` fails, it should clean up gracefully.  

🚀 **Future Features (If I Ever Get Around to It)**  
1. **GitLab & Bitbucket Support**—Because not everything belongs on GitHub.  
2. **Make the alias opt-in**—Some days, I might not want every project to have a repo.  
3. **Interactive mode**—Let me choose repo settings before auto-committing.  
4. **Better logs & debug mode**—So I can tell where it breaks without crying.  

---

## Notes to Future Me  
📌 **If the repo doesn’t get created, check if I’m logged into `gh` (`gh auth status`).**  
📌 **Aliases live in `~/.zshrc`, `~/.bashrc`, or `~/.config/fish/config.fish`**—fix them there if they break.  
📌 **If I need to uninstall this, just delete `node-init-wrapper.sh` and remove the aliases.**  
📌 **Yes, this was a great idea. No, I don’t regret it.**  

---

## Final Thoughts (Future Me, Read This)
This thing **just works**. It’s the **best thing I’ve done to my workflow** since I switched to Bun.  
If I ever start a new project without Git after writing this… I deserve **a full system reboot**.  

---

🎤 **Mic Drop:** **GitOnIt** is my **project initiation bodyguard**.  
If I ever forget about it, **slap myself, reinstall, and move on**. 😎