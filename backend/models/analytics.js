const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    totalVendors: {
        count: { type: Number, default: 0 },
        growth: { type: String, default: "+0 this month" }
    },
    verifiedListings: {
        count: { type: Number, default: 0 },
        verificationRate: { type: String, default: "0% verification rate" }
    },
    mostVisitedSpot: {
        name: { type: String, default: "N/A" },
        views: { type: String, default: "0 views this week" }
    },
    trendingDish: {
        name: { type: String, default: "N/A" },
        searches: { type: String, default: "0 searches this week" }
    },
    userEngagement: [{ // For the chart
        day: String, // e.g., "Mon", "Tue"
        visits: Number,
        saves: Number
    }],
    topDishes: [{ // Trending Dishes list
        name: String,
        searchCount: String, // e.g., "1,240 searches"
        growthPercentage: String // e.g., "+18%"
    }],
    culturalImpact: {
        heritageEateriesListed: {
            percentage: { type: String, default: "0%" },
            description: { type: String, default: "of listings are family-owned or heritage-based" }
        },
        culturalStoriesShared: {
            count: { type: Number, default: 0 },
            description: { type: String, default: "unique stories from local vendors" }
        },
        communityEngagement: {
            percentage: { type: String, default: "0%" },
            description: { type: String, default: "of verified listings have user reviews" }
        },
        kapampanganDishesFeatured: {
            count: { type: String, default: "0+" },
            description: { type: String, default: "traditional recipes represented on the platform" }
        }
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);