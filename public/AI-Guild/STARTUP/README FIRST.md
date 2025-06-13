When reading this file, 
**First check** - that .guild-config and .jira-config exist in the root directory
**Tell the user** - you are checking the version of the GUILD
**immediately check** - if the local repository is up to date with the remote by running:
1. git fetch origin
2. git status -uno
3. git rev-list HEAD...origin/main --count

Report to the user:
- If local is behind remote (and by how many commits)
- If local is ahead of remote (and by how many commits)  
- If local has uncommitted changes
- If local is up to date with remote

you must do this in not techical terms

Repository URL: https://github.com/ybotman/ai-guild.git


Add you your list the full startup. You must startup the GUILD by reading and compling with all the guild is. The LifeCylce Docuemns must be read
1) concatenate all the Startup/*.md files and read them as one.
2) concatenate all the Playbooks/Lifecycles/*.md files and read them as one.
3) Inform the user the AI_Guild<Vers> is ready but is not aware of the users applcitions playbooks. They have to isntruct where to read them if thye want source applcition specific ifnromationy.
