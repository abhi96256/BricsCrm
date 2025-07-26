const express = require('express');
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
  addMaintenanceRecord,
  updateMachineStatus
} = require('../controllers/machineController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(protect);

// Routes accessible by all authenticated users
router.route('/')
  .get(getMachines)
  .post(createMachine); // Temporarily remove authorization

router.route('/:id')
  .get(getMachine)
  .put(updateMachine) // Temporarily remove authorization
  .delete(deleteMachine); // Temporarily remove authorization

// Machine specific operations
router.put('/:id/status', updateMachineStatus); // Temporarily remove authorization
router.post('/:id/maintenance', addMaintenanceRecord); // Temporarily remove authorization

module.exports = router; 