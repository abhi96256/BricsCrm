const express = require('express');
const {
  getUsers,
  getEmployees,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(protect);

// Routes accessible by Admin and Sub Admin
router.route('/')
  .get(getUsers) // Temporarily remove authorization
  .post(createUser); // Temporarily remove authorization

// Get employees only (Admin, Sub Admin, Manager)
router.get('/employees', getEmployees); // Temporarily remove authorization

// Get user statistics (Admin, Sub Admin)
router.get('/stats', getUserStats); // Temporarily remove authorization

router.route('/:id')
  .get(getUser) // Temporarily remove authorization
  .put(updateUser) // Temporarily remove authorization
  .delete(deleteUser); // Temporarily remove authorization

router.put('/:id/reset-password', resetUserPassword); // Temporarily remove authorization

module.exports = router; 