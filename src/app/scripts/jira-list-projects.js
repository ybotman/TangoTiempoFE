#!/usr/bin/env node

import SecureJira from './jira-secure.js';

async function listProjects() {
  const jira = new SecureJira();
  await jira.initialize();
  
  try {
    // Get all projects
    const response = await jira.api.get('/project');
    
    console.log('Available Projects:');
    console.log('==================');
    
    if (response.data.length === 0) {
      console.log('No projects found or no access to any projects');
      return;
    }
    
    response.data.forEach(project => {
      console.log(`\nProject: ${project.name}`);
      console.log(`  Key: ${project.key}`);
      console.log(`  ID: ${project.id}`);
      console.log(`  Type: ${project.projectTypeKey}`);
      if (project.description) {
        console.log(`  Description: ${project.description}`);
      }
    });
    
    // Try to get permissions
    console.log('\n\nChecking Permissions...');
    console.log('======================');
    
    const perms = await jira.api.get('/mypermissions', {
      params: { 
        permissions: 'BROWSE_PROJECTS,CREATE_ISSUES,EDIT_ISSUES,ADMINISTER_PROJECTS' 
      }
    });
    
    const permissions = perms.data.permissions;
    Object.keys(permissions).forEach(key => {
      console.log(`${key}: ${permissions[key].havePermission ? '✅' : '❌'}`);
    });
    
    // Get current user info
    console.log('\n\nCurrent User:');
    console.log('=============');
    const user = await jira.api.get('/myself');
    console.log(`Name: ${user.data.displayName}`);
    console.log(`Email: ${user.data.emailAddress}`);
    console.log(`Account ID: ${user.data.accountId}`);
    console.log(`Account Type: ${user.data.accountType}`);
    
  } catch (error) {
    console.error('Failed to list projects:', error.response?.data || error.message);
  }
}

listProjects();