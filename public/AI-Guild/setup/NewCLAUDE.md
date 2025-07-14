# the COMMAND STARTUP will exiecute on these steps

# AI GUILD — System Overview

The **AI GUILD** is a structured, role-driven development system that integrates AI agents and human contributors to deliver high-quality software efficiently. It is organized around three core concepts:

## Commands

## Roles
Roles define the AI-Guilds (and indeed your) personas. Roles ahve resposnbilites and certian things 

## Lifecycles

## Applcations
 
## Guild Summary
-- The AI GUILD and (therefore YOU) system enforces clarity, accountability, and best practices through Playbooks, structured Roles, modular Applications, documented lifecycels.and robust Tracking. This enables scalable, maintainable, and collaborative software development—whether by humans, AI, or both.  You are to follow the guidles of the guild and know the full contents of the configured guild at all time. 

# Starting up
-- with the startup commend 
-- You must execute of all the following 
-- Make your TODO list from the set of instuactions
-- Acklnowldgedd you role and goals.
-- keep the user informred of the todos 

## Step 1  you are to tell the user what version of the GUUILD we are loading
-- the contents of 'public/AI-Guild/version.md' tell use ther version

## Step 2 : read the Guild Config
-- read /.guild-config
-- STOP if you cannot see them.
-- Explain what .<>-config files are use public/AI-Guild/Setup for the exmaple config files.

## Step 3 : search for the Reconcatnetion Triggers
-- 3a. You can Skip step 3b if you do not see the file : "./.TriggerFullGuild".  Do not search for any other file.
-- 3b. if you see "./.TriggerConcatenated" then read and comply with the instructions on "public/AI-Guild/Startup/ReconcatGuild.md"
-- 3c. You can Skip step 3c if you do not see the file : "./.TriggerFullApplicaitons".  Do not search for any other file.
-- 3b. if you see "./.TriggerConcatenated" then read and comply with the instructions on "public/AI-Guild/Startup/ReconcatApplications.md"

## Step 4 : Read the Concatenated Startup files
-- Read comply with "public/AI-Guild/Startup/FullPlaybooksGuild.md"
-- Read and comply with "public/AI-Guild/Startup/FullPlaybooksApplicatons.md"


## Step 5 : Configure JIRA CLI.
-- important : We are using jira-cli, not go-jira
-- Jira Important : if there is a local ./jira.d directtory then every jira command just be in the --config form :
--> jira --config ./.jira.d/config.yml <commands sets>
-- do not use the  --config if the ./jira.d folder is not presetent but warn the user if that fact. 
-- get the evnriemrent varables with the exeucting the following command :  source ~/bin/load-jira-env.sh
-- then get the list of in prpcess tickets with :
--> jira --config ./.jira.d/config.yml issue list -q 'assignee = currentUser() AND status = "In Progress"' 


## Step 6 : LOCAL CODE Quick Version Check**
- Run: `git fetch origin && git status -uno`
- Tell user simply: "Your REPO is up to date" or "Updates available from repository"

## Step 7. Notifiations
- Inform user: "AI-Guild v[VERSION] ready.
- Inform user: the Appliction playbooks read
- If there are no playbooks, the train the user what they could do.
- List commands,
 SNR.
 - Final Step is to do a self SNR