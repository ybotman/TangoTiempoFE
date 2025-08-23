#!/usr/bin/env node
/**
 * Secure Jira Connection
 * Reads API token from macOS keychain
 */

import axios from 'axios';
import { Buffer } from 'buffer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration (safe to commit)
const JIRA_URL = 'https://tobybalsley.atlassian.net';
const EMAIL = 'toby.balsley@gmail.com';
const PROJECT_KEY = 'TIEMPO';

class SecureJira {
  constructor() {
    this.api = null;
  }

  async getApiToken() {
    try {
      const { stdout } = await execAsync('security find-generic-password -s "JIRA_API_TOKEN" -w');
      return stdout.trim();
    } catch (error) {
      console.error('Failed to retrieve API token from keychain');
      console.error('Run: security add-generic-password -a "your-email" -s "JIRA_API_TOKEN" -w "your-token"');
      throw error;
    }
  }

  async initialize() {
    const apiToken = await this.getApiToken();
    const authHeader = `Basic ${Buffer.from(`${EMAIL}:${apiToken}`).toString('base64')}`;
    
    this.api = axios.create({
      baseURL: `${JIRA_URL}/rest/api/3`,
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async getIssue(issueKey) {
    if (!this.api) await this.initialize();
    
    try {
      const response = await this.api.get(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch issue ${issueKey}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async searchIssues(jql, maxResults = 50) {
    if (!this.api) await this.initialize();
    
    try {
      const response = await this.api.get('/search', {
        params: {
          jql,
          maxResults
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async addComment(issueKey, comment) {
    if (!this.api) await this.initialize();
    
    try {
      const response = await this.api.post(`/issue/${issueKey}/comment`, {
        body: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: comment
            }]
          }]
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add comment to ${issueKey}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async updateIssue(issueKey, fields) {
    if (!this.api) await this.initialize();
    
    try {
      const response = await this.api.put(`/issue/${issueKey}`, {
        fields
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update ${issueKey}:`, error.response?.data || error.message);
      throw error;
    }
  }
}

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const jira = new SecureJira();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const issueKey = args[1];
  
  async function main() {
    try {
      switch(command) {
        case 'get':
          if (!issueKey) {
            console.error('Usage: jira-secure.js get <issue-key>');
            process.exit(1);
          }
          const issue = await jira.getIssue(issueKey);
          console.log(JSON.stringify(issue, null, 2));
          break;
          
        case 'search':
          if (!issueKey) {
            console.error('Usage: jira-secure.js search "<JQL query>"');
            process.exit(1);
          }
          const results = await jira.searchIssues(issueKey);
          console.log(`Found ${results.total} issues:`);
          results.issues.forEach(issue => {
            console.log(`${issue.key}: ${issue.fields.summary} [${issue.fields.status.name}]`);
          });
          break;
          
        case 'comment':
          const comment = args.slice(2).join(' ');
          if (!issueKey || !comment) {
            console.error('Usage: jira-secure.js comment <issue-key> <comment text>');
            process.exit(1);
          }
          await jira.addComment(issueKey, comment);
          console.log(`Comment added to ${issueKey}`);
          break;
          
        default:
          console.log('Usage:');
          console.log('  jira-secure.js get <issue-key>        - Get issue details');
          console.log('  jira-secure.js search "<JQL query>"   - Search issues');
          console.log('  jira-secure.js comment <issue-key> <text> - Add comment');
      }
    } catch (error) {
      console.error('Operation failed:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

export default SecureJira;