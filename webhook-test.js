// Webhook Integration Test
// This file helps test webhook functionality with user-specific configurations

class WebhookTester {
  constructor() {
    this.testResults = [];
  }

  // Test all webhooks for a user
  async testUserWebhooks(user) {
    console.log(`🧪 Testing webhooks for user: ${user.username}`);
    
    const tests = [
      this.testScanWebhook(user),
      this.testSendWebhook(user),
      this.testInviteWebhook(user)
    ];

    const results = await Promise.allSettled(tests);
    
    results.forEach((result, index) => {
      const webhookTypes = ['scan', 'send', 'invite'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${webhookTypes[index]} webhook: OK`);
      } else {
        console.log(`❌ ${webhookTypes[index]} webhook: FAILED`, result.reason);
      }
    });

    return results;
  }

  // Test scan webhook
  async testScanWebhook(user) {
    const webhookUrl = this.buildWebhookUrl(user.scanWebhook);
    const testData = {
      action: 'scan_groups',
      nick: user.nicks[0] || 'test_nick',
      user_id: user.id
    };

    return this.sendTestRequest(webhookUrl, testData, 'Scan Groups');
  }

  // Test send message webhook
  async testSendWebhook(user) {
    const webhookUrl = this.buildWebhookUrl(user.sendWebhook);
    const testData = {
      action: 'send_message',
      nick: user.nicks[0] || 'test_nick',
      user_id: user.id,
      group_id: 'test_group_123',
      message: 'Test message from Zalo Automation',
      images: []
    };

    return this.sendTestRequest(webhookUrl, testData, 'Send Message');
  }

  // Test invite webhook
  async testInviteWebhook(user) {
    const webhookUrl = this.buildWebhookUrl(user.inviteWebhook);
    const testData = {
      action: 'invite_members',
      nick: user.nicks[0] || 'test_nick',
      user_id: user.id,
      source_groups: ['group_1'],
      target_groups: ['group_2'],
      max_invites: 1
    };

    return this.sendTestRequest(webhookUrl, testData, 'Invite Members');
  }

  // Build full webhook URL
  buildWebhookUrl(webhookPath) {
    // If it's already a full URL, return as is
    if (webhookPath.startsWith('http')) {
      return webhookPath;
    }

    // Otherwise, build with current host
    const baseUrl = window.location.origin;
    return `${baseUrl}${webhookPath}`;
  }

  // Send test request to webhook
  async sendTestRequest(url, data, description) {
    try {
      console.log(`🔄 Testing ${description}...`);
      console.log(`📡 URL: ${url}`);
      console.log(`📤 Data:`, data);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Zalo-Automation-Test/1.0'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.text();
      
      if (response.ok) {
        console.log(`✅ ${description} - Success:`, responseData);
        return { success: true, data: responseData };
      } else {
        console.log(`⚠️ ${description} - HTTP ${response.status}:`, responseData);
        return { success: false, error: `HTTP ${response.status}: ${responseData}` };
      }
    } catch (error) {
      console.error(`❌ ${description} - Error:`, error);
      return { success: false, error: error.message };
    }
  }

  // Test webhook connectivity
  async testWebhookConnectivity(webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Zalo-Automation-Ping/1.0'
        }
      });

      return {
        reachable: true,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        reachable: false,
        error: error.message
      };
    }
  }

  // Generate test report
  generateTestReport(user, results) {
    const report = {
      user: user.username,
      timestamp: new Date().toISOString(),
      webhooks: {
        scan: {
          url: this.buildWebhookUrl(user.scanWebhook),
          status: results[0]?.status || 'failed',
          error: results[0]?.reason?.message
        },
        send: {
          url: this.buildWebhookUrl(user.sendWebhook),
          status: results[1]?.status || 'failed',
          error: results[1]?.reason?.message
        },
        invite: {
          url: this.buildWebhookUrl(user.inviteWebhook),
          status: results[2]?.status || 'failed',
          error: results[2]?.reason?.message
        }
      },
      nicks: user.nicks,
      overall_status: results.every(r => r.status === 'fulfilled') ? 'PASS' : 'FAIL'
    };

    return report;
  }
}

// Webhook URL Validator
class WebhookValidator {
  static validateWebhookUrl(url) {
    const errors = [];

    // Check if URL is provided
    if (!url || url.trim() === '') {
      errors.push('Webhook URL is required');
      return { valid: false, errors };
    }

    // Check URL format
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://localhost${url}`);
      
      // Check for common issues
      if (urlObj.pathname === '/') {
        errors.push('Webhook path should not be root (/)');
      }

      if (!urlObj.pathname.includes('webhook')) {
        console.warn('Webhook URL should typically contain "webhook" in the path');
      }

    } catch (error) {
      // If it's a relative path, that's OK for internal APIs
      if (!url.startsWith('/')) {
        errors.push('Invalid URL format. Should be absolute URL or start with /');
      }
    }

    // Check for placeholder values
    const placeholders = ['YOUR_', 'REPLACE_', 'CHANGE_', 'UPDATE_'];
    if (placeholders.some(placeholder => url.includes(placeholder))) {
      errors.push('Webhook URL contains placeholder values');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: errors.length === 0 ? [] : ['Please update webhook URL with actual endpoint']
    };
  }

  static validateNicks(nicks) {
    const errors = [];

    if (!nicks || !Array.isArray(nicks)) {
      errors.push('Nicks should be an array');
      return { valid: false, errors };
    }

    if (nicks.length === 0) {
      errors.push('At least one nick is required');
    }

    const emptyNicks = nicks.filter(nick => !nick || nick.trim() === '');
    if (emptyNicks.length > 0) {
      errors.push('All nicks must have a name');
    }

    const duplicateNicks = nicks.filter((nick, index) => nicks.indexOf(nick) !== index);
    if (duplicateNicks.length > 0) {
      errors.push('Duplicate nicks found: ' + duplicateNicks.join(', '));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.WebhookTester = WebhookTester;
  window.WebhookValidator = WebhookValidator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WebhookTester, WebhookValidator };
} 