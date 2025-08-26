// Supabase Service Layer for Zalo Group Automation
// This file is designed to be universal (isomorphic) - running in both Node.js and the browser.

// Universal module definition
(function(exports) {
  'use strict';

  class SupabaseService {
    constructor() {
      this.supabase = null;
      this.supabaseAdmin = null; // Admin client, only for Node.js
      this.initialized = false;
    }

    // Initialize Supabase client based on the environment
    async init(config) {
      if (!config || !config.url || !config.anonKey) {
        console.error('Supabase config is missing or incomplete.');
        this.initialized = false;
        return false;
      }

      try {
        // --- Environment-specific client creation ---
        let createClient;

        // Browser environment
        if (typeof window !== 'undefined' && window.supabase) {
          createClient = window.supabase.createClient;
        
        // Node.js environment
        } else if (typeof require !== 'undefined') {
          createClient = require('@supabase/supabase-js').createClient;
        
        } else {
          throw new Error('Could not find a way to create a Supabase client in this environment.');
        }
        // --- End environment-specific logic ---

        // Public client (for both browser and server)
        this.supabase = createClient(config.url, config.anonKey);
        
        // Admin client (only for server-side tasks)
        if (typeof require !== 'undefined' && config.serviceRoleKey) {
          this.supabaseAdmin = createClient(config.url, config.serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });
          console.log('Supabase admin client initialized successfully.');
        } else if (typeof window !== 'undefined' && config.serviceRoleKey) {
            console.warn('serviceRoleKey found in browser environment. It will NOT be used for security reasons.');
        }

        this.initialized = true;
        console.log('Supabase initialized successfully');
        return true;
      } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
      }
    }

    // Check if Supabase is initialized
    checkInit() {
      if (!this.initialized) {
        console.error('Supabase has not been initialized. Call init() first.');
      }
      return this.initialized;
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
            scan_webhook: userData.scanWebhook,
            send_webhook: userData.sendWebhook,
            post_webhook: userData.postWebhook,
            invite_webhook: userData.inviteWebhook,
            scan_members_webhook: userData.scanMembersWebhook,
            status: userData.status || 'active',
            is_admin: userData.isAdmin || false
          }])
          .select()
          .single();

        if (userError) throw userError;

        // Insert nicks if provided
        if (userData.nicks && userData.nicks.length > 0) {
          console.log('Inserting nicks for user:', newUser.id, 'nicks:', userData.nicks);
          
          const nickData = userData.nicks.map(nick => ({
            user_id: newUser.id,
            nick_name: nick,
            is_active: true
          }));

          console.log('Nick data to insert:', nickData);

          const { data: insertedNicks, error: nicksError } = await this.supabase
            .from('user_nicks')
            .insert(nickData)
            .select();

          if (nicksError) {
            console.error('Error inserting nicks:', nicksError);
            return { success: false, message: 'User created but failed to add nicks: ' + nicksError.message };
          }

          console.log('Successfully inserted nicks:', insertedNicks);
        } else {
          console.log('No nicks to insert for user:', newUser.id);
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
        if (typeof userData.nicks !== 'undefined') {
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
              // Even if nicks fail, we don't want to fail the whole user update
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

    // Use the ADMIN client to bypass RLS for uploads (SERVER-SIDE ONLY)
    async uploadFile(file) {
      if (!this.checkInit() || !this.supabaseAdmin) {
        const errorMessage = !this.supabaseAdmin 
            ? 'Supabase admin client not initialized (running in browser or serviceRoleKey is missing)' 
            : 'Supabase client not initialized';
        console.error(errorMessage);
        return { error: { message: errorMessage } };
      }
    
      const fileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      
      const { data, error } = await this.supabaseAdmin.storage
        .from('images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });
    
      if (error) {
        console.error('Error uploading file to Supabase:', error);
        return { error };
      }
    
      // Use the PUBLIC client to get the public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('images')
        .getPublicUrl(data.path);
    
      console.log('Successfully uploaded file and got public URL:', publicUrlData.publicUrl);
      return { publicURL: publicUrlData.publicUrl, error: null };
    }
  }

  // --- Universal export ---
  const supabaseService = new SupabaseService();

  // For Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseService;
  }
  // For browser
  if (typeof window !== 'undefined') {
    window.supabaseService = supabaseService;
  }

}(typeof exports === 'undefined' ? this.supabase_service_module = {} : exports)); 