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

        const heritageCount = await Vendor.countDocuments({ category: 'Heritage Site', isVerified: true });
        const eateryCount = await Vendor.countDocuments({ category: 'Local Eatery', isVerified: true });
        const heritageEateriesPercentage = verifiedCount > 0 ? Math.round((heritageCount / verifiedCount) * 100) : 0;

        const realStats = {
            totalVendors: { count: totalVendors, growth: `+${totalVendors} total` },
            verifiedListings: { count: verifiedCount, verificationRate: `${verificationRate}% verification rate` },
            mostVisitedSpot: topSpots.length > 0 ? { name: topSpots[0].name, views: `${topSpots[0].views} views` } : { name: "N/A", views: "0 views" },
            trendingDish: { name: "N/A", searches: "Real-time search tracking coming soon" },
            culturalImpact: {
                heritageEateriesListed: { percentage: `${heritageEateriesPercentage}%`, description: "of listings are Heritage Sites" },
                culturalStoriesShared: { count: verifiedCount, description: "unique stories from local vendors" },
                communityEngagement: { percentage: "100%", description: "Authenticity Verified" },
                kapampanganDishesFeatured: { count: `${eateryCount}`, description: "Local Eateries represented" }
            }
        };

        return res.status(200).json(realStats);
    } catch (err) {
        console.error('Audit: getDashboardMetrics failed:', err);
        return res.status(500).json({ error: 'Server Error Fetching Metrics' });
    }
};

// GET: Pending Vendors (Needs Approval)
exports.getPendingVendors = async (req, res) => {
    try {
        const pending = await Vendor.find({ isVerified: false })
            .select('name category images createdAt yearsInOperation culturalStory')
            .sort({ createdAt: -1 });
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
            { isVerified: true },
            { returnDocument: 'after' }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        return res.status(200).json({ message: 'Vendor approved successfully', vendor });
    } catch (err) {
        console.error('Audit: approveVendor failed:', err);
        return res.status(500).json({ error: 'Failed to approve vendor' });
    }
};

// DELETE: Reject a Vendor
exports.rejectVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        return res.status(200).json({ message: 'Vendor rejected and deleted successfully' });
    } catch (err) {
        console.error('Audit: rejectVendor failed:', err);
        return res.status(500).json({ error: 'Failed to reject vendor' });
    }
};
