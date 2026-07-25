const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readUsers, writeUsers } = require('../config/db');

const JWT_SECRET = 'supersecretkeyformoneyapp';

async function registerUser(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Endpoint untuk mendaftarkan pengguna baru.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Data registrasi pengguna baru (contoh: name, username, email, password)',
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

    // Simple validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua kolom (name, username, email, password) wajib diisi'
      });
    }

    const users = readUsers();

    // Check if username or email already exists
    const userExists = users.some(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Username atau Email sudah terdaftar'
      });
    }

    // Encrypt password
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

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

async function loginUser(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Endpoint untuk login pengguna.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Kredensial login pengguna (contoh: username : budi, password : 12345678)',
        required: true,
        schema: {
            username: '',
            password: ''
        }
  } */
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan Password wajib diisi'
      });
    }

    const users = readUsers();

    // Find user
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Username atau Password salah'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Username atau Password salah'
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      data: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
