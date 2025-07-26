const dbHelpers = require('../utils/dbHelpers');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const users = dbHelpers.findAll('users');
    const tasks = dbHelpers.findAll('tasks');
    const machines = dbHelpers.findAll('machines');

    // Overall counts
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const totalMachines = machines.length;

    // Task distribution by status
    const taskStatusDistribution = {
      'Pending': tasks.filter(task => task.status === 'Pending').length,
      'In Progress': tasks.filter(task => task.status === 'In Progress').length,
      'Completed': tasks.filter(task => task.status === 'Completed').length,
      'Cancelled': tasks.filter(task => task.status === 'Cancelled').length
    };

    // Task distribution by priority
    const taskPriorityDistribution = {
      'Low': tasks.filter(task => task.priority === 'Low').length,
      'Medium': tasks.filter(task => task.priority === 'Medium').length,
      'High': tasks.filter(task => task.priority === 'High').length,
      'Urgent': tasks.filter(task => task.priority === 'Urgent').length
    };

    // Machine status distribution
    const machineStatusDistribution = {
      'Operational': machines.filter(machine => machine.status === 'Operational').length,
      'Maintenance': machines.filter(machine => machine.status === 'Maintenance').length,
      'Repair': machines.filter(machine => machine.status === 'Repair').length,
      'Offline': machines.filter(machine => machine.status === 'Offline').length
    };

    // User role distribution
    const userRoleDistribution = {
      'Admin': users.filter(user => user.role === 'Admin').length,
      'Sub Admin': users.filter(user => user.role === 'Sub Admin').length,
      'Manager': users.filter(user => user.role === 'Manager').length,
      'Employee': users.filter(user => user.role === 'Employee').length
    };

    // Recent activities (last 10 tasks)
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Machine efficiency average
    const machineEfficiency = machines.length > 0 
      ? machines.reduce((sum, machine) => sum + (machine.efficiency || 0), 0) / machines.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalTasks,
          totalMachines,
          machineEfficiency: Math.round(machineEfficiency)
        },
        taskStatusDistribution,
        taskPriorityDistribution,
        machineStatusDistribution,
        userRoleDistribution,
        recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task analytics
// @route   GET /api/analytics/tasks
// @access  Private
exports.getTaskAnalytics = async (req, res, next) => {
  try {
    const tasks = dbHelpers.findAll('tasks');

    // Task completion rate
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // Average task progress
    const averageProgress = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length 
      : 0;

    // Tasks by category
    const tasksByCategory = {};
    tasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      tasksByCategory[category] = (tasksByCategory[category] || 0) + 1;
    });

    // Tasks by assigned user
    const tasksByUser = {};
    tasks.forEach(task => {
      const assignedTo = task.assignedTo || 'Unassigned';
      tasksByUser[assignedTo] = (tasksByUser[assignedTo] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        completionRate: Math.round(completionRate),
        averageProgress: Math.round(averageProgress),
        tasksByCategory,
        tasksByUser,
        totalTasks: tasks.length,
        completedTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get machine analytics
// @route   GET /api/analytics/machines
// @access  Private
exports.getMachineAnalytics = async (req, res, next) => {
  try {
    const machines = dbHelpers.findAll('machines');

    // Machine efficiency statistics
    const efficiencies = machines.map(machine => machine.efficiency || 0);
    const averageEfficiency = efficiencies.length > 0 
      ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length 
      : 0;

    // Machines by department
    const machinesByDepartment = {};
    machines.forEach(machine => {
      const department = machine.department || 'Unassigned';
      machinesByDepartment[department] = (machinesByDepartment[department] || 0) + 1;
    });

    // Maintenance frequency
    const maintenanceFrequency = {};
    machines.forEach(machine => {
      const maintenanceCount = machine.maintenanceHistory ? machine.maintenanceHistory.length : 0;
      maintenanceFrequency[machine.name] = maintenanceCount;
    });

    // Operational machines percentage
    const operationalMachines = machines.filter(machine => machine.status === 'Operational').length;
    const operationalPercentage = machines.length > 0 
      ? (operationalMachines / machines.length) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        averageEfficiency: Math.round(averageEfficiency),
        machinesByDepartment,
        maintenanceFrequency,
        operationalPercentage: Math.round(operationalPercentage),
        totalMachines: machines.length,
        operationalMachines
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const users = dbHelpers.findAll('users');
    const tasks = dbHelpers.findAll('tasks');

    // User status distribution
    const userStatusDistribution = {
      'Active': users.filter(user => user.status === 'Active').length,
      'Inactive': users.filter(user => user.status === 'Inactive').length,
      'Suspended': users.filter(user => user.status === 'Suspended').length
    };

    // Users by department
    const usersByDepartment = {};
    users.forEach(user => {
      const department = user.department || 'Unassigned';
      usersByDepartment[department] = (usersByDepartment[department] || 0) + 1;
    });

    // Task assignment per user
    const tasksPerUser = {};
    tasks.forEach(task => {
      const assignedTo = task.assignedTo || 'Unassigned';
      tasksPerUser[assignedTo] = (tasksPerUser[assignedTo] || 0) + 1;
    });

    // Recent user registrations (last 10)
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        userStatusDistribution,
        usersByDepartment,
        tasksPerUser,
        recentUsers,
        totalUsers: users.length,
        activeUsers: userStatusDistribution.Active
      }
    });
  } catch (error) {
    next(error);
  }
}; 