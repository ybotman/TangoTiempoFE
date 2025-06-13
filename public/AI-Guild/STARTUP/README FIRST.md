When reading this file:

**1. Check Configuration**
- Because you have  .guild-config and .jira-config

**2. Display Version**
- Show local AI-Guild version from .guild-config

**3. Quick Version Check**
- Run: `git fetch origin && git status -uno`
- Tell user simply: "Your Guild is up to date" or "Updates available from repository"

Repository URL: https://github.com/ybotman/ai-guild.git

**4. Reading Application Playbooks**
the .guild-config may have Application PLAYBOOKS labeled Appl_Playbook_<APP>. E.G.

Appl_Playbook_Appl1 = 'path/folder1' or 'path/file-1.md'
Appl_Playbook_Appl2 = 'path/folder2' or 'path/file2.md'

- You are to concatenate the folders into 1 file and read as 1
- or read the path/file-x.md

**5. Guild is Ready**
- Inform user: "AI-Guild v[VERSION] ready. 
- Inform user: the Appliction playbooks read
- If there are no playbooks, the train the user what they could do.
- List commands, and SNR.
