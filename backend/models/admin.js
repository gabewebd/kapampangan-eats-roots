const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Editor' }, // Roles like 'SuperAdmin' or 'Editor'
    lastLogin: { type: Date }
});

module.exports = mongoose.model('Admin', AdminSchema);