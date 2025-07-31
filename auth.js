// auth.js - Authentication and User Management API
// This is a demo implementation using localStorage
// In production, replace with actual backend API calls

class AuthAPI {
  constructor() {
    this.initializeDefaultData();
  }

  // Initialize default admin user if not exists
  initializeDefaultData() {
    const users = this.getAllUsers();
    if (users.length === 0) {
      // Create default admin
      const adminUser = {
        id: 'admin',
        username: 'admin',
        password: 'admin@123',
        fullName: 'Administrator',
        scanWebhook: '/api/webhook/zalo-automation',
        sendWebhook: '/api/webhook/zalo-sent-text-image',
        inviteWebhook: '/api/webhook/zalo-invite-member',
        nicks: ['Admin'],
        status: 'active',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      // Create sample user
      const sampleUser = {
        id: Date.now().toString(),
        username: 'demo',
        password: 'demo123',
        fullName: 'Demo User',
        scanWebhook: '/api/webhook/zalo-automation',
        sendWebhook: '/api/webhook/zalo-sent-text-image',
        inviteWebhook: '/api/webhook/zalo-invite-member',
        nicks: ['test', 'Dương Nguyễn', 'Đức Phòng', 'Khánh Duy'],
        status: 'active',
        isAdmin: false,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('users', JSON.stringify([sampleUser]));
    }
  }

  // Get all users
  getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId);
  }

  // Get user by username
  getUserByUsername(username) {
    const users = this.getAllUsers();
    return users.find(user => user.username === username);
  }

  // Authenticate user
  authenticate(username, password) {
    // Check admin login
    if (username === 'admin' && password === 'admin@123') {
      return {
        success: true,
        user: {
          id: 'admin',
          username: 'admin',
          fullName: 'Administrator',
          isAdmin: true,
          scanWebhook: '/api/webhook/zalo-automation',
          sendWebhook: '/api/webhook/zalo-sent-text-image',
          inviteWebhook: '/api/webhook/zalo-invite-member',
          nicks: ['Admin']
        }
      };
    }

    // Check regular user login
    const users = this.getAllUsers();
    const user = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.status === 'active'
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword
      };
    }

    return {
      success: false,
      message: 'Invalid username or password'
    };
  }

  // Create user
  createUser(userData) {
    const users = this.getAllUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
      return {
        success: false,
        message: 'Username already exists'
      };
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      user: newUser
    };
  }

  // Update user
  updateUser(userId, userData) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Check if new username already exists (if username is being changed)
    if (userData.username && userData.username !== users[index].username) {
      if (users.find(u => u.username === userData.username)) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }
    }

    users[index] = {
      ...users[index],
      ...userData,
      id: userId // Ensure ID doesn't change
    };

    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      user: users[index]
    };
  }

  // Delete user
  deleteUser(userId) {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (users.length === filteredUsers.length) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    localStorage.setItem('users', JSON.stringify(filteredUsers));

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  // Get user statistics
  getUserStats() {
    const users = this.getAllUsers();
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      blocked: users.filter(u => u.status === 'blocked').length
    };
  }
}

// Export for use in other files
const authAPI = new AuthAPI();

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authAPI;
} 