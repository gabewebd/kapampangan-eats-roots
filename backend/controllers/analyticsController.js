const Vendor = require('../models/Vendor');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
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

        // Heritage Impact
        const heritageCount = await Vendor.countDocuments({ category: 'Heritage Site', isVerified: true });
        const eateryCount = await Vendor.countDocuments({ category: 'Local Eatery', isVerified: true });
        
        const heritageEateriesPercentage = verifiedCount > 0 ? Math.round((heritageCount / verifiedCount) * 100) : 0;

        return res.status(200).json({
            success: true,
            stats: {
                totalVendors,
                verifiedCount,
                unverifiedCount,
                verificationRate: `${verificationRate}% verification rate`,
                mostVisitedSpot: topSpots.length > 0 ? { name: topSpots[0].name, views: `${topSpots[0].views} total views` } : { name: "N/A", views: "0 views" },
                topSpots,
                culturalImpact: {
                    heritageEateriesListed: `${heritageEateriesPercentage}%`,
                    eateryCount,
                    heritageCount
                }
            }
        });
    } catch (err) {
        console.error('Audit: getDashboardStats failed:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
};
