const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const vendors = await Vendor.find({ isVerified: false });
    console.log('Unverified Vendors Count:', vendors.length);
    vendors.forEach((v, i) => {
      console.log(`Vendor ${i + 1}:`);
      console.log(`- ID: ${v._id}`);
      console.log(`- Name: ${v.name}`);
      console.log(`- Category: ${v.category}`);
      console.log(`- Images: ${v.images?.length || 0}`);
      console.log(`- Story: ${v.culturalStory?.substring(0, 50)}...`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
