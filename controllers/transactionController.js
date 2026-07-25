const { readTransactions, writeTransactions } = require('../config/db');

// 1. BULK SYNC TRANSACTIONS (POST /api/transactions/sync)
async function syncTransactionsBulk(req, res) {
  // #swagger.tags = ['Transactions']
  // #swagger.description = 'Endpoint untuk mentransfer/menyingkronkan data catatan keuangan secara bulk (massal) dari SQLite Flutter.'
  /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Daftar transaksi yang disinkronkan dari aplikasi offline',
        required: true,
        schema: [
          {
            id: 1,
            tanggal: '2026-07-25 16:08:00',
            nominal: 2500000,
            keterangan: 'Uang Saku Bulanan',
            jenis: 'Pemasukan'
          }
        ]
  } */
  try {
    let incomingItems = [];
    if (Array.isArray(req.body)) {
      incomingItems = req.body;
    } else if (req.body && Array.isArray(req.body.transactions)) {
      incomingItems = req.body.transactions;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Format data tidak valid. Harus berupa Array transaksi atau Object { transactions: [...] }'
      });
    }

    if (incomingItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tidak ada data transaksi yang dikirim'
      });
    }

    const currentTransactions = readTransactions();
    const nowFormatted = formatDateTime(new Date());

    const syncedItems = [];

    incomingItems.forEach((item, index) => {
      // Basic validation
      const nominal = Number(item.nominal);
      const jenis = item.jenis;
      const tanggal = formatDateTime(item.tanggal);
      const keterangan = item.keterangan || '';

      // Skip invalid entries without nominal or jenis
      if (isNaN(nominal) || !jenis) {
        return;
      }

      // Check existing by ID if ID is provided
      const existingIndex = item.id !== undefined && item.id !== null
        ? currentTransactions.findIndex(t => t.id === Number(item.id))
        : -1;

      let savedRecord;

      if (existingIndex !== -1) {
        // Update existing record
        savedRecord = {
          ...currentTransactions[existingIndex],
          tanggal,
          nominal,
          keterangan,
          jenis,
          synced_at: nowFormatted
        };
        currentTransactions[existingIndex] = savedRecord;
      } else {
        // Add new record
        savedRecord = {
          id: item.id ? Number(item.id) : (Date.now() + index),
          tanggal,
          nominal,
          keterangan,
          jenis,
          synced_at: nowFormatted
        };
        currentTransactions.push(savedRecord);
      }

      syncedItems.push(savedRecord);
    });

    writeTransactions(currentTransactions);

    res.status(200).json({
      status: 'success',
      message: 'Sinkronisasi data transaksi berhasil',
      data: syncedItems
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server saat sinkronisasi data'
    });
  }
}

// 2. GET ALL TRANSACTIONS WITH DATE FILTERING (GET /api/transactions)
async function getAllTransactions(req, res) {
  // #swagger.tags = ['Transactions']
  // #swagger.description = 'Endpoint untuk mengambil seluruh data catatan keuangan yang tersimpan di server dengan opsi filter tanggal awal dan tanggal akhir.'
  /* #swagger.parameters['start_date'] = {
        in: 'query',
        description: 'Filter tanggal awal (Format YYYY-MM-DD, contoh: 2026-07-25)',
        required: false,
        type: 'string'
  } */
  /* #swagger.parameters['end_date'] = {
        in: 'query',
        description: 'Filter tanggal akhir (Format YYYY-MM-DD, contoh: 2026-07-25)',
        required: false,
        type: 'string'
  } */
  try {
    const { start_date, end_date } = req.query;

    let transactions = readTransactions();

    if (start_date) {
      const trimmedStart = String(start_date).trim();
      const startDateObj = trimmedStart.length === 10
        ? new Date(`${trimmedStart}T00:00:00`)
        : parseToDate(trimmedStart);

      const startTime = startDateObj ? startDateObj.getTime() : NaN;
      if (!isNaN(startTime)) {
        transactions = transactions.filter(t => {
          const itemDate = parseToDate(t.tanggal);
          return itemDate && itemDate.getTime() >= startTime;
        });
      }
    }

    if (end_date) {
      const trimmedEnd = String(end_date).trim();
      const endDateObj = trimmedEnd.length === 10
        ? new Date(`${trimmedEnd}T23:59:59.999`)
        : parseToDate(trimmedEnd);

      const endTime = endDateObj ? endDateObj.getTime() : NaN;
      if (!isNaN(endTime)) {
        transactions = transactions.filter(t => {
          const itemDate = parseToDate(t.tanggal);
          return itemDate && itemDate.getTime() <= endTime;
        });
      }
    }

    res.json({
      status: 'success',
      message: 'Berhasil mengambil daftar transaksi',
      total: transactions.length,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// 3. DELETE TRANSACTION BY ID (DELETE /api/transactions/:id)
async function deleteTransactionById(req, res) {
  // #swagger.tags = ['Transactions']
  // #swagger.description = 'Endpoint untuk menghapus 1 data transaksi berdasarkan ID.'
  /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID Transaksi yang akan dihapus',
        required: true,
        type: 'integer'
  } */
  try {
    const transactionId = Number(req.params.id);
    const transactions = readTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan'
      });
    }

    const deletedTransaction = transactions.splice(index, 1)[0];
    writeTransactions(transactions);

    res.json({
      status: 'success',
      message: 'Data transaksi berhasil dihapus',
      data: deletedTransaction
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan internal server'
    });
  }
}

// Helper function to format Date object or date string into 'YYYY-MM-DD HH:mm:ss'
function formatDateTime(input) {
  let date;
  if (!input) {
    date = new Date();
  } else if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input)) {
    return input;
  } else {
    date = new Date(input);
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Helper function to safely parse date string to Date object
function parseToDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string') {
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
      return new Date(trimmed.replace(' ', 'T'));
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00`);
    }
  }
  return new Date(dateStr);
}

module.exports = {
  syncTransactionsBulk,
  getAllTransactions,
  deleteTransactionById
};
