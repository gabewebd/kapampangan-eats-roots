const Vendor = require('../models/Vendor');
const User = require('../models/User');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../config/cloudinary');

// POST: Join Angeles Eats & Roots
exports.createVendor = async (req, res) => {
    try {
        const { name, yearsInOperation, category, culturalStory, address, latitude, longitude, historicalSignificance, yearEstablished } = req.body;

        // Backend Validation Audit
        if (!name || !category || !address) {
            return res.status(400).json({ success: false, error: 'Name, category, and address are required fields.' });
        }

        // Upload vendor images via upload_stream (Promise.all)
        const vendorImageFiles = req.files['images'] || [];
        const menuImageFiles = req.files['menuItemImages'] || [];

        const vendorImagePromises = vendorImageFiles.map(f =>
            uploadToCloudinary(f.buffer, 'angeles-eats-roots/vendors')
        );

        const menuImagePromises = menuImageFiles
            .filter(f => f.buffer && f.buffer.length > 0)
            .map(f =>
                uploadToCloudinary(f.buffer, 'angeles-eats-roots/menu-items')
            );

        const [vendorResults, menuResults] = await Promise.all([
            Promise.all(vendorImagePromises),
            Promise.all(menuImagePromises)
        ]);

        const vendorImages = vendorResults.map(r => r.secure_url);
        const menuImages = menuResults.map(r => r.secure_url);

        let menuHighlights = [];
        if (req.body.menuHighlights) {
            try {
                menuHighlights = typeof req.body.menuHighlights === 'string'
                    ? JSON.parse(req.body.menuHighlights)
                    : req.body.menuHighlights;

                // Map uploaded menu images to items
                let menuImageIndex = 0;
                menuHighlights = menuHighlights.map((item) => {
                    if (menuImageIndex < menuImages.length) {
                        item.image = menuImages[menuImageIndex];
                        menuImageIndex++;
                    }
                    return item;
                });
            } catch (e) {
                console.error("Menu Highlights Parse Error:", e);
            }
        }

        let authenticityTraits = [];
        if (req.body.authenticityTraits) {
            try {
                authenticityTraits = typeof req.body.authenticityTraits === 'string'
                    ? JSON.parse(req.body.authenticityTraits)
                    : req.body.authenticityTraits;
            } catch (e) {
                console.error("Traits Parse Error:", e);
            }
        }

        const newVendor = new Vendor({
            name,
            yearsInOperation,
            category,
            culturalStory,
            location: {
                address,
                type: 'Point',
                coordinates: [
                    !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 120.5887,
                    !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 15.1449
                ]
            },
            images: vendorImages,
            menuHighlights,
            authenticityTraits,
            historicalSignificance: historicalSignificance || '',
            yearEstablished: yearEstablished || '',
            isVerified: false,
            isAuthentic: false,
            submittedBy: req.user ? req.user.id : null
        });

        await newVendor.save();

        // Push to user's submissions array if user is logged in
        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, {
                $push: { submissions: newVendor._id }
            });
        }

        // Immediate 201 Created Response — only after Cloudinary + MongoDB persistence
        return res.status(201).json({
            success: true,
            message: 'Vendor submission received and pending verification.',
            vendorId: newVendor._id
        });

    } catch (err) {
        console.error('Submission Audit Failure:', err);
        return res.status(500).json({
            success: false,
            error: 'Server failed to process submission.',
            details: err.message
        });
    }
};

// GET: Trending Local Spots (Verified only)
exports.getTrending = async (req, res) => {
    try {
        const trending = await Vendor.find({ isVerified: true, category: 'Local Eatery' }).sort({ rating: -1 }).limit(8);
        return res.status(200).json(trending);
    } catch (err) {
        console.error('Audit: getTrending failed:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch trending spots' });
    }
};

// GET: Single Vendor
exports.getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Vendor ID format' });
        }

        const vendor = await Vendor.findById(id);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        // Non-blocking view increment
        Vendor.findByIdAndUpdate(id, { $inc: { views: 1 } }, { returnDocument: 'after' }).exec().catch(() => { });

        return res.status(200).json(vendor);
    } catch (err) {
        console.error('Audit: getVendorById failed:', err);
        return res.status(500).json({ success: false, error: 'Database query failed' });
    }
};

// GET: Related Vendors (Contextual Heritage Linking)
exports.getRelatedVendors = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Vendor ID format' });
        }

        const currentVendor = await Vendor.findById(id);
        if (!currentVendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        const oppositeCategory = currentVendor.category === 'Heritage Site' ? 'Local Eatery' : 'Heritage Site';
        const coordinates = currentVendor.location.coordinates;
        
        // GeoJSON [lng, lat] format is required for $near
        const [lng, lat] = Array.isArray(coordinates) ? coordinates : [coordinates.lng, coordinates.lat];

        // Fetch the 3 closest verified vendors of the opposite category.
        const related = await Vendor.find({
            isVerified: true,
            category: oppositeCategory,
            _id: { $ne: currentVendor._id },
            'location.coordinates': {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).limit(3);

        return res.status(200).json(related);
    } catch (err) {
        console.error('Audit: getRelatedVendors failed:', err);
        return res.status(500).json({ success: false, error: 'Database query failed' });
    }
};

// GET: Filtered Lists
exports.getHeritageSites = async (req, res) => {
    try {
        const sites = await Vendor.find({ isVerified: true, category: 'Heritage Site' });
        return res.status(200).json(sites);
    } catch (err) {
        console.error('Audit: getHeritageSites failed:', err);
        return res.status(500).json({ success: false, error: 'Fetch failed' });
    }
};

exports.getEateries = async (req, res) => {
    try {
        const eateries = await Vendor.find({ isVerified: true, category: 'Local Eatery' });
        return res.status(200).json(eateries);
    } catch (err) {
        console.error('Audit: getEateries failed:', err);
        return res.status(500).json({ success: false, error: 'Fetch failed' });
    }
};

// GET: Search Vendors
exports.searchVendors = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        const searchRegex = new RegExp(q, 'i');
        const results = await Vendor.find({
            isVerified: true,
            $or: [
                { name: searchRegex },
                { category: searchRegex },
                { culturalStory: searchRegex },
                { 'location.address': searchRegex }
            ]
        }).limit(20);

        return res.status(200).json(results);
    } catch (err) {
        console.error('Audit: searchVendors failed:', err);
        return res.status(500).json({ success: false, error: 'Search failed' });
    }
};

// GET: All Vendors (for Explore Map)
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ isVerified: true })
            .select('name category location images rating isAuthentic');
        return res.status(200).json(vendors);
    } catch (err) {
        console.error('Audit: getAllVendors failed:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch map data' });
    }
};

// Admin Logic
exports.getUnverifiedVendors = async (req, res) => {
    try {
        const unverified = await Vendor.find({ isVerified: false }).sort({ createdAt: -1 });
        return res.status(200).json(unverified);
    } catch (err) {
        console.error('Audit: getUnverifiedVendors failed:', err);
        return res.status(500).json({ success: false, error: 'Admin fetch failed' });
    }
};

exports.verifyVendor = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Vendor ID format' });
        }

        const vendor = await Vendor.findByIdAndUpdate(id, { isVerified: true }, { new: true });
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        return res.status(200).json({ success: true, message: 'Vendor published to live feed.', vendor });
    } catch (err) {
        console.error('Audit: verifyVendor failed:', err);
        return res.status(500).json({ success: false, error: 'Verification update failed' });
    }
};

exports.rejectVendor = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Vendor ID format' });
        }

        const vendor = await Vendor.findByIdAndDelete(id);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        return res.status(200).json({ success: true, message: 'Submission rejected and deleted.' });
    } catch (err) {
        console.error('Audit: rejectVendor failed:', err);
        return res.status(500).json({ success: false, error: 'Deletion failed' });
    }
};

// PATCH: Mark vendor as Authentic (yellow badge) with ASF Scores
exports.authenticateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { asfScores } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Vendor ID format' });
        }

        let updateData = { isAuthentic: true };

        if (asfScores) {
            const totalScore =
                (Number(asfScores.historicalContinuity) || 0) +
                (Number(asfScores.culturalAuthenticity) || 0) +
                (Number(asfScores.communityRelevance) || 0) +
                (Number(asfScores.heritageDocumentation) || 0) +
                (Number(asfScores.digitalNarrativeQuality) || 0);

            updateData.asfScores = {
                ...asfScores,
                totalScore
            };
        }

        const vendor = await Vendor.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        return res.status(200).json({ success: true, message: 'Vendor marked as Verified Authentic with ASF Scores.', vendor });
    } catch (err) {
        console.error('Audit: authenticateVendor failed:', err);
        return res.status(500).json({ success: false, error: 'Authentication update failed' });
    }
};
