// Supabase Service Layer for Zalo Group Automation
// This handles all database operations using Supabase

class SupabaseService {
  constructor() {
    this.supabase = null;
    this.initialized = false;
  }

  // Initialize Supabase client
  async init(config) {
    try {
      // Check if running in browser or Node.js
      if (typeof window !== 'undefined') {
        // Browser environment
        if (!window.supabase) {
          console.error('Supabase client not loaded. Please include Supabase script.');
          return false;
        }
        this.supabase = window.supabase.createClient(config.url, config.anonKey);
      } else {
        // Node.js environment
        const { createClient } = require('@supabase/supabase-js');
        this.supabase = createClient(config.url, config.serviceRoleKey);
      }
      
      this.initialized = true;
      console.log('✅ Supabase initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      return false;
    }
  }

  // Check if Supabase is initialized
  checkInit() {
    if (!this.initialized || !this.supabase) {
      console.error('Supabase not initialized. Call init() first.');
      return false;
    }
    return true;
  }

  // Hash password using bcrypt (browser-compatible)
  async hashPassword(password) {
    try {
      // Simple hash for demo - in production use proper bcrypt
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'zalo_salt_2025');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Error hashing password:', error);
      return password; // Fallback
    }
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    const hashed = await this.hashPassword(password);
    return hashed === hashedPassword;
  }

  // === USER OPERATIONS ===

  // Get all users with their nicks
  async getAllUsers() {
    if (!this.checkInit()) return { data: [], error: 'Not initialized' };

    try {
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select(`
          *,
          user_nicks (
            id,
            nick_name,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Transform data for compatibility with existing code
      const transformedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        scanWebhook: user.scan_webhook,
        sendWebhook: user.send_webhook,
        postWebhook: user.post_webhook,
        inviteWebhook: user.invite_webhook,
        scanMembersWebhook: user.scan_members_webhook,
        status: user.status,
        isAdmin: user.is_admin,
        nicks: user.user_nicks.filter(n => n.is_active).map(n => n.nick_name),
        createdAt: user.created_at
      }));

      return { data: transformedUsers, error: null };
    } catch (error) {
      console.error('Error getting users:', error);
      return { data: [], error: error.message };
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    if (!this.checkInit()) return { data: null, error: 'Not initialized' };

    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select(`
          *,
          user_nicks (
            id,
            nick_name,
            is_active
          )
        `)
        .eq('username', username)
        .limit(1);

      if (error) throw error;
      if (!users || users.length === 0) return { data: null, error: 'User not found' };

      const user = users[0];
      const transformedUser = {
        id: user.id,
        username: user.username,
        password: user.password,
        fullName: user.full_name,
        scanWebhook: user.scan_webhook,
        sendWebhook: user.send_webhook,
        postWebhook: user.post_webhook,
        inviteWebhook: user.invite_webhook,
        scanMembersWebhook: user.scan_members_webhook,
        status: user.status,
        isAdmin: user.is_admin,
        nicks: user.user_nicks.filter(n => n.is_active).map(n => n.nick_name),
        createdAt: user.created_at
      };

      return { data: transformedUser, error: null };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return { data: null, error: error.message };
    }
  }

  // Authenticate user
  async authenticate(username, password) {
    try {
      // Check admin credentials first
      if (username === 'admin' && password === 'admin@123') {
        return {
          success: true,
          user: {
            id: 'admin',
            username: 'admin',
            fullName: 'Administrator',
            isAdmin: true,
            scanWebhook: '/webhook/zalo-automation',
            sendWebhook: '/webhook/zalo-sent-text-image',
            postWebhook: '/webhook/zalo-post-group',
            inviteWebhook: '/webhook/zalo-invite-member',
            scanMembersWebhook: '/webhook/zalo-scan-members',
            nicks: ['Admin']
          }
        };
      }

      const { data: user, error } = await this.getUserByUsername(username);
      if (error || !user) {
        return { success: false, message: 'Invalid username or password' };
      }

      if (user.status !== 'active') {
        return { success: false, message: 'Account is blocked' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Remove sensitive data
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  // Create new user
  async createUser(userData) {
    if (!this.checkInit()) return { success: false, message: 'Not initialized' };

    try {
      // Check if username exists
      const { data: existingUser } = await this.getUserByUsername(userData.username);
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Insert user
      const { data: newUser, error: userError } = await this.supabase
        .from('users')
        .insert([{
          username: userData.username,
          password: hashedPassword,
          full_name: userData.fullName || null,
          scan_webhook: userData.scanWebhook || '/webhook/zalo-automation',
          send_webhook: userData.sendWebhook || '/webhook/zalo-sent-text-image',
          post_webhook: userData.postWebhook || '/webhook/zalo-post-group',
          invite_webhook: userData.inviteWebhook || '/webhook/zalo-invite-member',
          scan_members_webhook: userData.scanMembersWebhook || '/webhook/zalo-scan-members',
          status: userData.status || 'active',
          is_admin: userData.isAdmin || false
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Insert nicks if provided
      if (userData.nicks && userData.nicks.length > 0) {
        const nickData = userData.nicks.map(nick => ({
          user_id: newUser.id,
          nick_name: nick,
          is_active: true
        }));

        const { error: nicksError } = await this.supabase
          .from('user_nicks')
          .insert(nickData);

        if (nicksError) {
          console.error('Error inserting nicks:', nicksError);
        }
      }

      // Log activity
      await this.logActivity(newUser.id, 'USER_CREATED', {
        created_by: 'admin',
        username: userData.username
      });

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: error.message };
    }
  }

  // Update user
  async updateUser(userId, userData) {
    if (!this.checkInit()) return { success: false, message: 'Not initialized' };

    try {
      // Prepare update data
      const updateData = {
        full_name: userData.fullName,
        scan_webhook: userData.scanWebhook,
        send_webhook: userData.sendWebhook,
        post_webhook: userData.postWebhook,
        invite_webhook: userData.inviteWebhook,
        scan_members_webhook: userData.scanMembersWebhook,
        status: userData.status
      };

      // Hash password if provided
      if (userData.password) {
        updateData.password = await this.hashPassword(userData.password);
      }

      // Check username change
      if (userData.username) {
        const { data: existingUser } = await this.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, message: 'Username already exists' };
        }
        updateData.username = userData.username;
      }

      // Update user
      const { data: updatedUser, error: updateError } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update nicks
      if (userData.nicks) {
        // Delete existing nicks
        await this.supabase
          .from('user_nicks')
          .delete()
          .eq('user_id', userId);

        // Insert new nicks
        if (userData.nicks.length > 0) {
          const nickData = userData.nicks.map(nick => ({
            user_id: userId,
            nick_name: nick,
            is_active: true
          }));

          const { error: nicksError } = await this.supabase
            .from('user_nicks')
            .insert(nickData);

          if (nicksError) {
            console.error('Error updating nicks:', nicksError);
          }
        }
      }

      // Log activity
      await this.logActivity(userId, 'USER_UPDATED', {
        updated_by: 'admin',
        changes: Object.keys(updateData)
      });

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: error.message };
    }
  }

  // Delete user
  async deleteUser(userId) {
    if (!this.checkInit()) return { success: false, message: 'Not initialized' };

    try {
      // Log activity before deletion
      await this.logActivity(userId, 'USER_DELETED', {
        deleted_by: 'admin'
      });

      // Delete user (CASCADE will handle related records)
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.message };
    }
  }

  // Get user statistics
  async getUserStats() {
    if (!this.checkInit()) return { total: 0, active: 0, blocked: 0 };

    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('status');

      if (error) throw error;

      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        blocked: users.filter(u => u.status === 'blocked').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { total: 0, active: 0, blocked: 0 };
    }
  }

  // === ACTIVITY LOGGING ===
  async logActivity(userId, action, details = {}) {
    if (!this.checkInit()) return;

    try {
      await this.supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action: action,
          details: details,
          ip_address: null, // Can be added if needed
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // === POSTS OPERATIONS (for future use) ===
  
  // Save scheduled post
  async saveScheduledPost(postData) {
    if (!this.checkInit()) return { success: false, message: 'Not initialized' };

    try {
      const { data, error } = await this.supabase
        .from('scheduled_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving scheduled post:', error);
      return { success: false, message: error.message };
    }
  }

  // Save post for reuse
  async savePostForReuse(postData) {
    if (!this.checkInit()) return { success: false, message: 'Not initialized' };

    try {
      const { data, error } = await this.supabase
        .from('saved_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving post for reuse:', error);
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
const supabaseService = new SupabaseService();

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = supabaseService;
}

// For browser
if (typeof window !== 'undefined') {
  window.supabaseService = supabaseService;
} 