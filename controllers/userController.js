const bcrypt = require('bcryptjs');
const { readUsers, writeUsers } = require('../config/db');

// Helper to remove password from user object
function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// 1. READ ALL USERS (GET /api/users)
async function getAllUsers(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint untuk mengambil semua data pengguna.'
  try {
    const users = readUsers();
    const sanitizedUsers = users.map(sanitizeUser);

    res.json({
      status: 'success',
      message: 'Berhasil mengambil daftar pengguna',
      data: sanitizedUsers
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// 2. READ USER BY ID (GET /api/users/:id)
async function getUserById(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint untuk mengambil detail pengguna berdasarkan ID.'
  /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID Pengguna',
        required: true,
        type: 'integer'
  } */
  try {
    const userId = Number(req.params.id);
    const users = readUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      message: 'Berhasil mengambil detail pengguna',
      data: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// 3. CREATE USER (POST /api/users)
async function createUser(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint untuk membuat/menambahkan pengguna baru.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Data pengguna baru (name, username, email, password)',
        required: true,
        schema: {
            name: '',
            username: '',
            email: '',
            password: ''
        }
  } */
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua kolom (name, username, email, password) wajib diisi'
      });
    }

    const users = readUsers();

    // Check duplicate username or email
    const userExists = users.some(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Username atau Email sudah terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name,
      username,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
      data: sanitizeUser(newUser)
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// 4. UPDATE USER (PUT /api/users/:id)
async function updateUser(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint untuk memperbarui data pengguna berdasarkan ID.'
  /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID Pengguna',
        required: true,
        type: 'integer'
  } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Data perbaruan pengguna (name, username, email, password opsional)',
        required: true,
        schema: {
            name: '',
            username: '',
            email: '',
            password: ''
        }
  } */
  try {
    const userId = Number(req.params.id);
    const { name, username, email, password } = req.body;

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan'
      });
    }

    // Check if updated username/email is taken by another user
    if (username || email) {
      const isTaken = users.some(
        u => u.id !== userId && (
          (username && u.username.toLowerCase() === username.toLowerCase()) ||
          (email && u.email.toLowerCase() === email.toLowerCase())
        )
      );

      if (isTaken) {
        return res.status(400).json({
          status: 'error',
          message: 'Username atau Email sudah digunakan pengguna lain'
        });
      }
    }

    const existingUser = users[userIndex];
    const updatedUser = {
      ...existingUser,
      name: name || existingUser.name,
      username: username || existingUser.username,
      email: email || existingUser.email,
      updated_at: new Date().toISOString()
    };

    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }

    users[userIndex] = updatedUser;
    writeUsers(users);

    res.json({
      status: 'success',
      message: 'Data pengguna berhasil diperbarui',
      data: sanitizeUser(updatedUser)
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// 5. DELETE USER (DELETE /api/users/:id)
async function deleteUser(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint untuk menghapus pengguna berdasarkan ID.'
  /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID Pengguna yang akan dihapus',
        required: true,
        type: 'integer'
  } */
  try {
    const userId = Number(req.params.id);
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan'
      });
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsers(users);

    res.json({
      status: 'success',
      message: 'Pengguna berhasil dihapus',
      data: sanitizeUser(deletedUser)
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
