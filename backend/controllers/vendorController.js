const Vendor = require('../models/Vendor');

// POST: Join Angeles Eats & Roots
exports.createVendor = async (req, res) => {
    try {
        const imageUrls = req.files.map(file => file.path); // Extract Cloudinary URLs

        const newVendor = new Vendor({
            name: req.body.name,
            yearsInOperation: req.body.yearsInOperation,
            culturalStory: req.body.culturalStory,
            isHeritageBased: req.body.isHeritageBased === 'true', // Handle checkbox
            images: imageUrls,
            location: { address: req.body.address },
            isVerified: false // Default to unverified for Admin Approval
        });

        await newVendor.save();
        res.status(201).json({ message: 'Submission successful!', vendor: newVendor });
    } catch (err) {
        res.status(500).json({ error: 'Database or Upload Error', details: err.message });
    }
};

// GET: Trending Local Spots
exports.getTrending = async (req, res) => {
    try {
        const trending = await Vendor.find({ isVerified: true }).limit(5);
        res.status(200).json(trending);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// GET: Single Vendor Details
exports.getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.status(200).json(vendor);
    } catch (err) {
        res.status(500).json({ error: 'Invalid ID or Server Error' });
    }
};

// GET: Heritage Sites
exports.getHeritageSites = async (req, res) => {
    try {
        const sites = await Vendor.find({ isVerified: true, category: 'Heritage Site' }).limit(10);
        res.status(200).json(sites);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// GET: Local Eateries
exports.getEateries = async (req, res) => {
    try {
        const eateries = await Vendor.find({ isVerified: true, category: 'Local Eatery' }).limit(10);
        res.status(200).json(eateries);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// GET: All Vendors for Map
exports.getAllVendors = async (req, res) => {
    try {
        // Minimal data for map markers to optimize payload
        const vendors = await Vendor.find({ isVerified: true })
            .select('name category location rating images');
        res.status(200).json(vendors);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};