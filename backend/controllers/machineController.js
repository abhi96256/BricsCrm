const dbHelpers = require('../utils/dbHelpers');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const department = req.query.department;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const result = dbHelpers.paginate('machines', page, limit, filter);

    res.status(200).json({
      success: true,
      count: result.data.length,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
exports.getMachine = async (req, res, next) => {
  try {
    const machine = dbHelpers.findById('machines', req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new machine
// @route   POST /api/machines
// @access  Private
exports.createMachine = async (req, res, next) => {
  try {
    const machine = await dbHelpers.create('machines', {
      ...req.body,
      status: req.body.status || 'Operational',
      efficiency: req.body.efficiency || 100,
      alerts: req.body.alerts || [],
      maintenanceHistory: req.body.maintenanceHistory || []
    });

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private
exports.updateMachine = async (req, res, next) => {
  try {
    const machine = dbHelpers.findById('machines', req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const updatedMachine = await dbHelpers.update('machines', req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private
exports.deleteMachine = async (req, res, next) => {
  try {
    const machine = dbHelpers.findById('machines', req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    await dbHelpers.delete('machines', req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update machine status
// @route   PUT /api/machines/:id/status
// @access  Private
exports.updateMachineStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Operational', 'Maintenance', 'Repair', 'Offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Operational, Maintenance, Repair, Offline'
      });
    }

    const machine = dbHelpers.findById('machines', req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const updatedMachine = await dbHelpers.update('machines', req.params.id, { status });

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add maintenance record
// @route   POST /api/machines/:id/maintenance
// @access  Private
exports.addMaintenanceRecord = async (req, res, next) => {
  try {
    const { type, description, cost, technician } = req.body;

    const machine = dbHelpers.findById('machines', req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const maintenanceRecord = {
      id: dbHelpers.generateId(),
      type,
      description,
      cost: cost || 0,
      technician: technician || req.user.id,
      technicianName: req.user.name,
      date: dbHelpers.getTimestamp(),
      status: 'Completed'
    };

    const maintenanceHistory = machine.maintenanceHistory || [];
    maintenanceHistory.push(maintenanceRecord);

    const updatedMachine = await dbHelpers.update('machines', req.params.id, {
      maintenanceHistory,
      status: 'Operational'
    });

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error) {
    next(error);
  }
}; 