const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    totalVisits: { type: Number, default: 0 },
    topDishes: [{
        name: String,
        searchCount: Number,
        growthPercentage: String // e.g., "+18%"
    }],
    culturalImpact: {
        storiesShared: { type: Number, default: 0 }, //
        heritageEateries: { type: Number, default: 0 } //
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);