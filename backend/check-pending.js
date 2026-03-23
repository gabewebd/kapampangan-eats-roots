const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    dbName: 'angeles_eats_roots'
})
.then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const pending = await Vendor.find({ isVerified: false });
    console.log(`Found ${pending.length} pending vendors:`);
    pending.forEach(v => {
        console.log(`- ID: ${v._id}, Name: "${v.name}", Category: ${v.category}, Images: ${v.images.length}`);
    });
    process.exit(0);
})
.catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
