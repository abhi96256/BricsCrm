const dbHelpers = require('../utils/dbHelpers');
const crypto = require('crypto');

// @desc    Get all users (filtered by role if specified)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { role, department, status } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (status) filter.status = status;

    const users = dbHelpers.findAll('users', filter);
    
    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      count: usersWithoutPassword.length,
      data: usersWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees only
// @route   GET /api/users/employees
// @access  Private (Admin, Sub Admin, Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = dbHelpers.findAll('users', { role: 'Employee' });
    
    // Remove password from response
    const employeesWithoutPassword = employees.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      count: employeesWithoutPassword.length,
      data: employeesWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = dbHelpers.findByField('users', 'email', email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await dbHelpers.hashPassword(password);

    const user = await dbHelpers.create('users', {
      name,
      email,
      password: hashedPassword,
      role,
      status: 'Active',
      avatar: '',
      department: department || 'General',
      phone: phone || '',
      address: address || '',
      lastLogin: null,
      emailVerified: false,
      twoFactorEnabled: false
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash password if provided
    let updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await dbHelpers.hashPassword(updateData.password);
    }

    const updatedUser = await dbHelpers.update('users', req.params.id, updateData);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has assigned tasks
    const userTasks = dbHelpers.findAll('tasks', { assignedTo: req.params.id });
    if (userTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with assigned tasks. Please reassign tasks first.'
      });
    }

    await dbHelpers.delete('users', req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = dbHelpers.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new password
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await dbHelpers.hashPassword(newPassword);
    
    await dbHelpers.update('users', req.params.id, {
      password: hashedPassword
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      newPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, Sub Admin)
exports.getUserStats = async (req, res, next) => {
  try {
    const users = dbHelpers.findAll('users');
    const tasks = dbHelpers.findAll('tasks');

    // Count by role
    const roleStats = {
      Admin: users.filter(user => user.role === 'Admin').length,
      'Sub Admin': users.filter(user => user.role === 'Sub Admin').length,
      Manager: users.filter(user => user.role === 'Manager').length,
      Employee: users.filter(user => user.role === 'Employee').length
    };

    // Count by status
    const statusStats = {
      Active: users.filter(user => user.status === 'Active').length,
      Inactive: users.filter(user => user.status === 'Inactive').length,
      Suspended: users.filter(user => user.status === 'Suspended').length
    };

    // Count by department
    const departmentStats = {};
    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // Tasks per user
    const tasksPerUser = {};
    tasks.forEach(task => {
      const assignedTo = task.assignedTo || 'Unassigned';
      tasksPerUser[assignedTo] = (tasksPerUser[assignedTo] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users.length,
        roleStats,
        statusStats,
        departmentStats,
        tasksPerUser
      }
    });
  } catch (error) {
    next(error);
  }
}; 