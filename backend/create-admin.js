const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    dbName: 'angeles_eats_roots'
})
.then(async () => {
    console.log('✅ Connected to MongoDB to create admin');
    
    const username = 'admin';
    const password = 'admin123';
    
    const existing = await Admin.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (existing) {
        existing.password = hashedPassword;
        await existing.save();
        console.log('✅ Admin password updated');
    } else {
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            role: 'SuperAdmin'
        });
        await newAdmin.save();
        console.log('🚀 New Admin created');
    }
    console.log(`🚀 Admin created successfully: \nUsername: ${username}\nPassword: ${password}`);
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
});
