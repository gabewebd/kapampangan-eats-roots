const Analytics = require('../models/analytics');
const Vendor = require('../models/Vendor');

// GET: Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
    try {
        let analytics = await Analytics.findOne().sort({ lastUpdated: -1 });

        // If no analytics data exists yet, create a dummy document for UI display
        if (!analytics) {
            analytics = new Analytics({
                totalVendors: { count: 127, growth: "+12 this month" },
                verifiedListings: { count: 94, verificationRate: "74% verification rate" },
                mostVisitedSpot: { name: "Aling Lucing's", views: "2,340 views this week" },
                trendingDish: { name: "Sisig", searches: "1,240 searches this week" },
                userEngagement: [
                    { day: "Mon", visits: 310, saves: 90 },
                    { day: "Tue", visits: 450, saves: 120 },
                    { day: "Wed", visits: 380, saves: 100 },
                    { day: "Thu", visits: 520, saves: 150 },
                    { day: "Fri", visits: 620, saves: 180 },
                    { day: "Sat", visits: 810, saves: 230 },
                    { day: "Sun", visits: 710, saves: 200 }
                ],
                topDishes: [
                    { name: "Sisig", searchCount: "1,240 searches", growthPercentage: "+18%" },
                    { name: "Kare-Kare", searchCount: "890 searches", growthPercentage: "+12%" },
                    { name: "Bringhe", searchCount: "670 searches", growthPercentage: "+25%" },
                    { name: "Tocino", searchCount: "540 searches", growthPercentage: "+8%" },
                    { name: "Tibok-Tibok", searchCount: "420 searches", growthPercentage: "+32%" }
                ],
                culturalImpact: {
                    heritageEateriesListed: { percentage: "67%", description: "of listings are family-owned or heritage-based" },
                    culturalStoriesShared: { count: 148, description: "unique stories from local vendors" },
                    communityEngagement: { percentage: "92%", description: "of verified listings have user reviews" },
                    kapampanganDishesFeatured: { count: "85+", description: "traditional recipes represented on the platform" }
                }
            });
            await analytics.save();
        }

        res.status(200).json(analytics);
    } catch (err) {
        res.status(500).json({ error: 'Server Error Fetching Metrics' });
    }
};

// GET: Pending Vendors (Needs Approval)
exports.getPendingVendors = async (req, res) => {
    try {
        const pending = await Vendor.find({ isVerified: false })
            .select('name category images createdAt yearsInOperation culturalStory')
            .sort({ createdAt: -1 });
        res.status(200).json(pending);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending vendors' });
    }
};

// PUT: Approve a Vendor
exports.approveVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ message: 'Vendor approved successfully', vendor });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve vendor' });
    }
};

// DELETE: Reject a Vendor
exports.rejectVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        res.status(200).json({ message: 'Vendor rejected and deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject vendor' });
    }
};
