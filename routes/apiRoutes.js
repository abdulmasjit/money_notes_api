const express = require('express');

// Import Controllers
const { registerUser, loginUser } = require('../controllers/authController');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const {
  syncTransactionsBulk,
  getAllTransactions,
  deleteTransactionById
} = require('../controllers/transactionController');

const router = express.Router();

// ==========================================
// Auth Routes
// ==========================================
router.post('/register', registerUser);
router.post('/login', loginUser);

// ==========================================
// User Routes
// ==========================================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ==========================================
// Transaction Routes
// ==========================================
router.get('/transactions', getAllTransactions);
router.post('/transactions/sync', syncTransactionsBulk);
router.delete('/transactions/:id', deleteTransactionById);

module.exports = router;
