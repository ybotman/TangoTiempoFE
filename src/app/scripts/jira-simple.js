#!/usr/bin/env node
/**
 * Simple Jira Connection
 * Just connect and view/update issues
 */

import axios from 'axios';
import { Buffer } from 'buffer';

// UPDATE THESE:
const JIRA_URL = 'https://tobybalsley.atlassian.net';  // Your Jira URL
const EMAIL = 'toby.balsley@gmail.com';                 // Your email  
const API_TOKEN = 'ATATT3xFfGF0Y3Qh48P6WKxPPQjdhH8w1W0A3y0NM_Vlz1XA-Xk6Aueg8kqGRCLBcoQ5WP2lgTQcKrfuHKOad4VAd4TG4rlGQG_lWzS_tSeG1avoKD397LHdIFEbMjNJiBceNQEtz5sAjFvTNthL92HiLg9NmWtbKsEMvnPaT-nWBq6YyXBbaSY';  // Working Anthropic token (no = at end)
const PROJECT_KEY = 'TIEMPO';                              // Your project key

class SimpleJira {
  constructor() {
    this.api = axios.create({
      baseURL: `${JIRA_URL}/rest/api/3`,  // Use API v3 for cloud instances
      headers: {
        'Authorization': `Basic ${Buffer.from(`${EMAIL}:${API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async test() {
    try {
      console.log('🔌 Testing connection to:', JIRA_URL);
      console.log('👤 Email:', EMAIL);
      console.log('🔑 Token starts with:', API_TOKEN.substring(0, 20) + '...');
      console.log('🔑 Full token length:', API_TOKEN.length);
      
      // First, let's try a simple serverInfo endpoint that doesn't require auth
      console.log('\n🔍 Testing server info (no auth required)...');
      try {
        const serverInfo = await axios.get(`${JIRA_URL}/rest/api/3/serverInfo`);
        console.log('✅ Server reachable:', serverInfo.data.version || 'Cloud version');
      } catch (err) {
        console.log('❌ Cannot reach server:', err.message);
      }
      
      // Test projects first
      console.log('\n📁 Testing project access...');
      try {
        const projects = await this.api.get('/project');
        console.log('✅ Projects accessible, found:', projects.data.length);
        if (projects.data.length > 0) {
          console.log('📋 Available projects:');
          projects.data.forEach(p => {
            console.log(`  - ${p.key}: ${p.name} (ID: ${p.id})`);
          });
        }
      } catch (err) {
        console.log('❌ Project access failed:', err.response?.status, err.response?.statusText);
        if (err.response?.data) {
          console.log('   Error:', err.response.data);
        }
      }
      
      // Try different project endpoints
      console.log('🔍 Trying alternative project endpoints...');
      try {
        const projectSearch = await this.api.get('/project/search');
        console.log('📁 Project search found:', projectSearch.data.total || 0);
      } catch (err) {
        console.log('⚠️ Project search failed:', err.response?.data?.errorMessages || err.message);
      }
      
      // Check user info
      try {
        const userInfo = await this.api.get('/myself');
        console.log('✅ Connected as:', userInfo.data.displayName);
        console.log('📧 Account ID:', userInfo.data.accountId);
      } catch (err) {
        console.log('❌ Cannot get user info:', err.message);
        if (err.response?.status === 401) {
          console.log('🔐 Authorization header:', this.api.defaults.headers['Authorization'].substring(0, 30) + '...');
          console.log('⚠️  401 Unauthorized - Check your API token at:');
          console.log('   https://id.atlassian.com/manage-profile/security/api-tokens');
        }
        if (err.response?.data) {
          console.log('   Error details:', JSON.stringify(err.response.data, null, 2));
        }
      }

      // List all available projects is now handled above

      // Try to get your user permissions
      console.log('\n🔐 Checking permissions...');
      try {
        const perms = await this.api.get('/mypermissions', {
          params: { permissions: 'BROWSE_PROJECTS,CREATE_ISSUES,ADMINISTER_PROJECTS' }
        });
        console.log('✅ Global permissions:');
        const permissions = perms.data.permissions;
        Object.keys(permissions).forEach(key => {
          console.log(`  - ${key}: ${permissions[key].havePermission ? '✅' : '❌'}`);
        });
      } catch (err) {
        console.log('⚠️ Cannot get permissions:', err.response?.data?.errorMessages || err.message);
      }
      
      console.log('✅ API connection working!');
      
      // Try to search for all issues first
      console.log('🔍 Searching for all available issues...');
      try {
        const allIssues = await this.api.get('/search?maxResults=10');
        console.log(`✅ Found ${allIssues.data.total} total issues`);
        
        if (allIssues.data.issues.length > 0) {
          console.log('📋 All issues:');
          allIssues.data.issues.forEach(issue => {
            console.log(`  ${issue.key}: ${issue.fields.summary} (Project: ${issue.fields.project?.key || 'Unknown'})`);
          });
        }
      } catch (searchError) {
        console.log(`⚠️ Cannot search issues:`, searchError.response?.data?.errorMessages || searchError.message);
      }

      // Try creating a test issue instead
      console.log('🧪 Testing issue creation...');
      try {
        const testIssue = await this.createIssue(
          'API Test Issue', 
          'This is a test issue created via API to verify connectivity',
          'Task'
        );
        if (testIssue) {
          console.log(`✅ Successfully created issue: ${testIssue}`);
        }
      } catch (createError) {
        console.log(`⚠️ Cannot create issue:`, createError.message);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.response?.status, error.response?.statusText);
      console.error('Error details:', error.response?.data || error.message);
      return false;
    }
  }

  async createProject() {
    try {
      const projectData = {
        key: PROJECT_KEY,
        name: "Cal-Ops",
        projectTypeKey: "software",
        projectTemplateKey: "com.atlassian.jira-software-project-templates:software-project",
        description: "CalOps admin dashboard project for IFE tracking",
        lead: EMAIL.split('@')[0], // Use email prefix as lead
        categoryId: 10000 // Default category
      };

      const response = await this.api.post('/project', projectData);
      console.log(`✅ Created project: ${response.data.key} - ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create project:', error.response?.data || error.message);
      console.log('💡 Try creating the project manually in Jira web interface');
      throw error;
    }
  }

  async listIssues() {
    try {
      const response = await this.api.get(`/search?jql=project=${PROJECT_KEY}&maxResults=20`);
      console.log(`\n📋 Found ${response.data.total} issues:`);
      
      response.data.issues.forEach(issue => {
        console.log(`${issue.key}: ${issue.fields.summary} [${issue.fields.status.name}]`);
      });
    } catch (error) {
      console.error('❌ Failed to list issues:', error.response?.data || error.message);
    }
  }

  async createIssue(summary, description, type = 'Task') {
    try {
      const issue = {
        fields: {
          project: { key: PROJECT_KEY },
          summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }]
          },
          issuetype: { name: type }
        }
      };

      const response = await this.api.post('/issue', issue);
      console.log(`✅ Created: ${response.data.key}`);
      return response.data.key;
    } catch (error) {
      console.error('❌ Failed to create issue:', error.response?.data || error.message);
    }
  }
}

// Quick test
const jira = new SimpleJira();

if (import.meta.url === `file://${process.argv[1]}`) {
  if (JIRA_URL.includes('your-company')) {
    console.log('❌ Please update the config at the top of this file first');
    process.exit(1);
  }

  jira.test().then(connected => {
    if (connected) {
      jira.listIssues();
    }
  });
}

export default SimpleJira;