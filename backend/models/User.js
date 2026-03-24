const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    memberSince: { type: Date, default: Date.now },
    savedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    visited: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    bio: { type: String, default: 'Local Explorer' }
});

module.exports = mongoose.model('User', UserSchema);
