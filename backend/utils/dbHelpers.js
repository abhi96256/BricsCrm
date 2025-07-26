const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Helper functions for database operations
const dbHelpers = {
  // Generate unique ID
  generateId: () => uuidv4(),

  // Get current timestamp
  getTimestamp: () => new Date().toISOString(),

  // Get database safely
  getDBSafe: () => {
    try {
      return getDB();
    } catch (error) {
      console.error('Database not initialized:', error.message);
      return null;
    }
  },

  // Find by ID
  findById: (collection, id) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data || !db.data[collection]) return null;
    
    // Convert both to strings for comparison
    const searchId = String(id);
    const user = db.data[collection].find(item => String(item.id) === searchId);
    
    console.log(`Looking for user with ID: ${searchId}, found:`, user ? user.name : 'NOT FOUND');
    return user;
  },

  // Find by field
  findByField: (collection, field, value) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data || !db.data[collection]) return null;
    return db.data[collection].find(item => item[field] === value);
  },

  // Find all with optional filter
  findAll: (collection, filter = {}) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data || !db.data[collection]) return [];
    
    let items = db.data[collection];
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (filter[key] !== undefined && filter[key] !== null) {
        if (typeof filter[key] === 'object' && filter[key].$gt) {
          // Handle date comparisons
          const compareDate = new Date(filter[key].$gt);
          items = items.filter(item => new Date(item[key]) > compareDate);
        } else {
          items = items.filter(item => item[key] === filter[key]);
        }
      }
    });
    
    return items;
  },

  // Create new item
  create: async (collection, data) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data) {
      throw new Error('Database not initialized');
    }
    
    if (!db.data[collection]) {
      db.data[collection] = [];
    }
    
    const newItem = {
      id: dbHelpers.generateId(),
      ...data,
      createdAt: dbHelpers.getTimestamp(),
      updatedAt: dbHelpers.getTimestamp()
    };
    
    db.data[collection].push(newItem);
    await db.write();
    return newItem;
  },

  // Update item
  update: async (collection, id, data) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data || !db.data[collection]) {
      return null;
    }
    
    const index = db.data[collection].findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    db.data[collection][index] = {
      ...db.data[collection][index],
      ...data,
      updatedAt: dbHelpers.getTimestamp()
    };
    
    await db.write();
    return db.data[collection][index];
  },

  // Delete item
  delete: async (collection, id) => {
    const db = dbHelpers.getDBSafe();
    if (!db || !db.data || !db.data[collection]) {
      return false;
    }
    
    const index = db.data[collection].findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    db.data[collection].splice(index, 1);
    await db.write();
    return true;
  },

  // Count items
  count: (collection, filter = {}) => {
    const items = dbHelpers.findAll(collection, filter);
    return items.length;
  },

  // Paginate results
  paginate: (collection, page = 1, limit = 10, filter = {}) => {
    const items = dbHelpers.findAll(collection, filter);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      data: items.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: items.length,
        pages: Math.ceil(items.length / limit)
      }
    };
  },

  // Hash password
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // Compare password
  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  }
};

module.exports = dbHelpers; 