const dbHelpers = require('../utils/dbHelpers');

// @desc    Get all tasks (filtered by user role)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const assignedTo = req.query.assignedTo;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Filter tasks based on user role (even without authentication)
    // This will be handled by frontend, but we can also add backend filtering
    // For now, return all tasks and let frontend filter

    const result = dbHelpers.paginate('tasks', page, limit, filter);

    // Populate user and machine details
    const populatedTasks = result.data.map(task => {
      const assignedUser = dbHelpers.findById('users', task.assignedTo);
      const createdByUser = dbHelpers.findById('users', task.createdBy);
      const machine = task.machine ? dbHelpers.findById('machines', task.machine) : null;

      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role
        } : null,
        createdByUser: createdByUser ? {
          id: createdByUser.id,
          name: createdByUser.name,
          email: createdByUser.email,
          role: createdByUser.role
        } : null,
        machine: machine ? {
          id: machine.id,
          name: machine.name,
          model: machine.model,
          status: machine.status
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: populatedTasks.length,
      pagination: result.pagination,
      data: populatedTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = dbHelpers.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task (only if authentication is enabled)
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    // Populate user and machine details
    const assignedUser = dbHelpers.findById('users', task.assignedTo);
    const createdByUser = dbHelpers.findById('users', task.createdBy);
    const machine = task.machine ? dbHelpers.findById('machines', task.machine) : null;

    const populatedTask = {
      ...task,
      assignedUser: assignedUser ? {
        id: assignedUser.id,
        name: assignedUser.name,
        email: assignedUser.email,
        role: assignedUser.role
      } : null,
      createdByUser: createdByUser ? {
        id: createdByUser.id,
        name: createdByUser.name,
        email: createdByUser.email,
        role: createdByUser.role
      } : null,
      machine: machine ? {
        id: machine.id,
        name: machine.name,
        model: machine.model,
        status: machine.status
      } : null
    };

    res.status(200).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Sub Admin, Manager)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, deadline, priority, machine, category } = req.body;

    // Validate required fields
    if (!title || !description || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and assignedTo are required'
      });
    }

    // Check if assigned user exists (by name or ID)
    let assignedUser = dbHelpers.findById('users', assignedTo);
    if (!assignedUser) {
      // Try to find by name
      assignedUser = dbHelpers.findByField('users', 'name', assignedTo);
    }
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Check if machine exists (if provided)
    let machineExists = null;
    if (machine) {
      machineExists = dbHelpers.findById('machines', machine);
      if (!machineExists) {
        // Try to find by name
        machineExists = dbHelpers.findByField('machines', 'name', machine);
      }
      if (!machineExists) {
        return res.status(400).json({
          success: false,
          message: 'Machine not found'
        });
      }
    }

    const task = await dbHelpers.create('tasks', {
      title,
      description,
      assignedTo: assignedUser.id, // Use the actual user ID
      employees: [assignedUser.id], // Use the actual user ID
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: priority || 'Medium',
      status: 'Pending',
      progress: 0,
      machine: machineExists ? machineExists.id : null, // Use the actual machine ID
      category: category || 'General',
      attachments: [],
      comments: [],
      createdBy: '1' // Default to admin user ID
    });

    // Populate user and machine details
    const populatedTask = {
      ...task,
      assignedUser: {
        id: assignedUser.id,
        name: assignedUser.name,
        email: assignedUser.email,
        role: assignedUser.role
      },
      createdByUser: {
        id: assignedUser.id, // Use assigned user as fallback
        name: assignedUser.name,
        email: assignedUser.email,
        role: assignedUser.role
      },
      machine: machineExists ? {
        id: machineExists.id,
        name: machineExists.name,
        model: machineExists.model,
        status: machineExists.status
      } : null
    };

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = dbHelpers.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Only Admin, Sub Admin, and Manager can update certain fields
    if (req.user && req.user.role === 'Employee') {
      const allowedFields = ['deadline', 'priority', 'machine', 'progress', 'status'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedTask = await dbHelpers.update('tasks', req.params.id, updateData);
      res.status(200).json({
        success: true,
        data: updatedTask
      });
    } else {
      // Admin, Sub Admin, Manager can update all fields
      const updatedTask = await dbHelpers.update('tasks', req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updatedTask
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Sub Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = dbHelpers.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await dbHelpers.delete('tasks', req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress
// @route   PUT /api/tasks/:id/progress
// @access  Private
exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const task = dbHelpers.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const updateData = { progress };
    
    // Update status based on progress
    if (progress === 100) {
      updateData.status = 'Completed';
    } else if (progress > 0) {
      updateData.status = 'In Progress';
    }

    const updatedTask = await dbHelpers.update('tasks', req.params.id, updateData);

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addTaskComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const task = dbHelpers.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task or is admin/manager
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    const newComment = {
      id: dbHelpers.generateId(),
      user: req.user ? req.user.id : '1',
      userName: req.user ? req.user.name : 'Admin User',
      comment,
      createdAt: dbHelpers.getTimestamp()
    };

    const comments = task.comments || [];
    comments.push(newComment);

    const updatedTask = await dbHelpers.update('tasks', req.params.id, {
      comments
    });

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks filtered by user ID and role
// @route   GET /api/tasks/filter/:userId
// @access  Public (for Employee filtering)
exports.getTasksByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = dbHelpers.findById('users', userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    let tasks;
    if (user.role === 'Employee') {
      // For employees, only show tasks assigned to them
      tasks = dbHelpers.findAll('tasks', { assignedTo: userId });
    } else {
      // For Admin, Manager, Sub Admin, show all tasks
      tasks = dbHelpers.findAll('tasks');
    }

    // Populate user and machine details
    const populatedTasks = tasks.map(task => {
      const assignedUser = dbHelpers.findById('users', task.assignedTo);
      const createdByUser = dbHelpers.findById('users', task.createdBy);
      const machine = task.machine ? dbHelpers.findById('machines', task.machine) : null;

      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role
        } : null,
        createdByUser: createdByUser ? {
          id: createdByUser.id,
          name: createdByUser.name,
          email: createdByUser.email,
          role: createdByUser.role
        } : null,
        machine: machine ? {
          id: machine.id,
          name: machine.name,
          model: machine.model,
          status: machine.status
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: populatedTasks.length,
      data: populatedTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for specific employee
// @route   GET /api/tasks/employee/:employeeId
// @access  Private (Admin, Sub Admin, Manager)
exports.getEmployeeTasks = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Check if employee exists
    const employee = dbHelpers.findById('users', employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const filter = { assignedTo: employeeId };
    const result = dbHelpers.paginate('tasks', page, limit, filter);

    // Populate user and machine details
    const populatedTasks = result.data.map(task => {
      const assignedUser = dbHelpers.findById('users', task.assignedTo);
      const createdByUser = dbHelpers.findById('users', task.createdBy);
      const machine = task.machine ? dbHelpers.findById('machines', task.machine) : null;

      return {
        ...task,
        assignedUser: assignedUser ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          role: assignedUser.role
        } : null,
        createdByUser: createdByUser ? {
          id: createdByUser.id,
          name: createdByUser.name,
          email: createdByUser.email,
          role: createdByUser.role
        } : null,
        machine: machine ? {
          id: machine.id,
          name: machine.name,
          model: machine.model,
          status: machine.status
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: populatedTasks.length,
      pagination: result.pagination,
      data: populatedTasks
    });
  } catch (error) {
    next(error);
  }
}; 