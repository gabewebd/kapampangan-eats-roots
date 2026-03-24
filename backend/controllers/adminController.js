const Analytics = require('../models/analytics');
const Vendor = require('../models/Vendor');

// GET: Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
    try {
        const totalVendors = await Vendor.countDocuments();
        const verifiedCount = await Vendor.countDocuments({ isVerified: true });
        const unverifiedCount = totalVendors - verifiedCount;
        const verificationRate = totalVendors > 0 ? Math.round((verifiedCount / totalVendors) * 100) : 0;
        
        // Most visited spots
        const topSpots = await Vendor.find({ isVerified: true })
            .sort({ views: -1 })
            .limit(5)
            .select('name views category');

        // Trending Dish: Pick a menu highlight from the most viewed verified vendor
        const mostViewedWithMenu = await Vendor.findOne({ 
            isVerified: true, 
            'menuHighlights.0': { $exists: true } 
        }).sort({ views: -1 });

        const trendingDish = mostViewedWithMenu && mostViewedWithMenu.menuHighlights.length > 0
            ? { 
                name: mostViewedWithMenu.menuHighlights[0].name, 
                searches: `${mostViewedWithMenu.views} views total` 
              }
            : { name: "N/A", searches: "Real-time tracking active" };

        const heritageCount = await Vendor.countDocuments({ category: 'Heritage Site', isVerified: true });
        const eateryCount = await Vendor.countDocuments({ category: 'Local Eatery', isVerified: true });
        
        const heritagePercentage = verifiedCount > 0 ? Math.round((heritageCount / verifiedCount) * 100) : 0;
        const eateryPercentage = verifiedCount > 0 ? Math.round((eateryCount / verifiedCount) * 100) : 0;

        const realStats = {
            totalVendors: { count: totalVendors, growth: `+${totalVendors} total` },
            verifiedListings: { count: verifiedCount, verificationRate: `${verificationRate}% verification rate` },
            mostVisitedSpot: topSpots.length > 0 ? { name: topSpots[0].name, views: `${topSpots[0].views} views` } : { name: "N/A", views: "0 views" },
            trendingDish: trendingDish,
            culturalImpact: {
                heritageSitesListed: { 
                    percentage: `${heritagePercentage}%`, 
                    count: `${heritageCount} sites`,
                    description: "of verified listings are Heritage Sites" 
                },
                culturalStoriesShared: { 
                    percentage: `${eateryPercentage}%`, 
                    count: `${eateryCount} stories`,
                    description: "of verified listings are Cultural Stories" 
                }
            }
        };

        return res.status(200).json(realStats);
    } catch (err) {
        console.error('Audit: getDashboardMetrics failed:', err);
        return res.status(500).json({ error: 'Server Error Fetching Metrics' });
    }
};

// GET: All Vendors by Status
exports.getVendorsByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        
        // Special case: if they want "verified authentic", filter for isAuthentic: true
        if (status === 'verified') {
            query.status = 'approved';
            query.isAuthentic = true;
        }

        const vendors = await Vendor.find(query).sort({ createdAt: -1 });
        return res.status(200).json(vendors);
    } catch (err) {
        console.error('Audit: getVendorsByStatus failed:', err);
        return res.status(500).json({ error: 'Failed to fetch vendors by status' });
    }
};

// GET: Pending Vendors (Needs Approval)
exports.getPendingVendors = async (req, res) => {
    try {
        // Removed .select() so the admin gets EVERYTHING (menu, significance, etc.)
        const pending = await Vendor.find({ 
            $or: [
                { status: 'pending' },
                { status: { $exists: false }, isVerified: false } // Sustainability for old data
            ]
        }).sort({ createdAt: -1 });
        
        return res.status(200).json(pending);
    } catch (err) {
        console.error('Audit: getPendingVendors failed:', err);
        return res.status(500).json({ error: 'Failed to fetch pending vendors' });
    }
};

// PUT: Approve a Vendor
exports.approveVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { isVerified: true, status: 'approved' },
            { returnDocument: 'after' }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        return res.status(200).json({ message: 'Vendor approved successfully', vendor });
    } catch (err) {
        console.error('Audit: approveVendor failed:', err);
        return res.status(500).json({ error: 'Failed to approve vendor' });
    }
};

// PUT: Update a Vendor (Edit)
exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        return res.status(200).json({ message: 'Vendor updated successfully', vendor });
    } catch (err) {
        console.error('Audit: updateVendor failed:', err);
        return res.status(500).json({ error: 'Failed to update vendor' });
    }
};

// DELETE: Reject a Vendor (Soft rejection - moves to rejected status)
exports.rejectVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isVerified: false },
            { new: true }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        return res.status(200).json({ message: 'Vendor moved to rejected list' });
    } catch (err) {
        console.error('Audit: rejectVendor failed:', err);
        return res.status(500).json({ error: 'Failed to reject vendor' });
    }
};

// DELETE: Permanent Delete
exports.deleteVendorPermanent = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        return res.status(200).json({ message: 'Vendor permanently deleted' });
    } catch (err) {
        console.error('Audit: deleteVendorPermanent failed:', err);
        return res.status(500).json({ error: 'Permanent deletion failed' });
    }
};
