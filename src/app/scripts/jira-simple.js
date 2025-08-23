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
      // TIEMPO-276: Security cleanup - removed token logging
      
      // First, let's try a simple serverInfo endpoint that doesn't require auth
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        await axios.get(`${JIRA_URL}/rest/api/3/serverInfo`);
        // TIEMPO-276: Security cleanup - removed debug logging
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed debug logging
      }
      
      // Test projects first
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        const projects = await this.api.get('/project');
        // TIEMPO-276: Security cleanup - removed debug logging
        if (projects.data.length > 0) {
          // TIEMPO-276: Security cleanup - removed project details logging
        }
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed error details logging
      }
      
      // Try different project endpoints
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        await this.api.get('/project/search');
        // TIEMPO-276: Security cleanup - removed debug logging
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed error logging
      }
      
      // Check user info
      try {
        await this.api.get('/myself');
        // TIEMPO-276: Security cleanup - removed user info logging
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed auth header and error details logging
      }

      // List all available projects is now handled above

      // Try to get your user permissions
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        await this.api.get('/mypermissions', {
          params: { permissions: 'BROWSE_PROJECTS,CREATE_ISSUES,ADMINISTER_PROJECTS' }
        });
        // TIEMPO-276: Security cleanup - removed permissions logging
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed error logging
      }
      
      // TIEMPO-276: Security cleanup - removed debug logging
      
      // Try to search for all issues first
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        await this.api.get('/search?maxResults=10');
        // TIEMPO-276: Security cleanup - removed issue details logging
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed error logging
      }

      // Try creating a test issue instead
      // TIEMPO-276: Security cleanup - removed debug logging
      try {
        const testIssue = await this.createIssue(
          'API Test Issue', 
          'This is a test issue created via API to verify connectivity',
          'Task'
        );
        if (testIssue) {
          // TIEMPO-276: Security cleanup - removed issue creation logging
        }
      } catch (_) {
        // TIEMPO-276: Security cleanup - removed error logging
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
      // TIEMPO-276: Security cleanup - removed project creation logging
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create project:', error.response?.data || error.message);
      // TIEMPO-276: Security cleanup - removed debug logging
      throw error;
    }
  }

  async listIssues() {
    try {
      await this.api.get(`/search?jql=project=${PROJECT_KEY}&maxResults=20`);
      // TIEMPO-276: Security cleanup - removed issue listing
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
      // TIEMPO-276: Security cleanup - removed issue creation logging
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
    // TIEMPO-276: Security cleanup - removed config logging
    process.exit(1);
  }

  jira.test().then(connected => {
    if (connected) {
      jira.listIssues();
    }
  });
}

export default SimpleJira;