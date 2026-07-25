const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_USERS_PATH = path.join(DB_DIR, 'users.json');
const DB_TRANSACTIONS_PATH = path.join(DB_DIR, 'transactions.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper functions for Users
function readUsers() {
  try {
    if (!fs.existsSync(DB_USERS_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_USERS_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
}

// Helper functions for Transactions
function readTransactions() {
  try {
    if (!fs.existsSync(DB_TRANSACTIONS_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_TRANSACTIONS_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function writeTransactions(transactions) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_TRANSACTIONS_PATH, JSON.stringify(transactions, null, 2), 'utf8');
}

module.exports = {
  readUsers,
  writeUsers,
  readTransactions,
  writeTransactions,
};
