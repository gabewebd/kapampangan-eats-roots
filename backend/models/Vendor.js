const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    yearsInOperation: { type: String }, // Optional for Heritage Sites
    category: { 
        type: String, 
        enum: ['Local Eatery', 'Heritage Site'], 
        required: true 
    },
    culturalStory: { type: String }, // Optional for Heritage Sites
    location: {
        address: { type: String, required: true },
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { 
            type: [Number], 
            default: [120.5887, 15.1449], // Angeles City [lng, lat]
            index: '2dsphere' 
        }
    },
    images: [String], // Array of Cloudinary URLs
    authenticityTraits: [String], // e.g., "Original family recipe"
    menuHighlights: [{
        name: { type: String },
        description: { type: String },
        price: { type: Number },
        image: { type: String } // Cloudinary URL
    }],
    // Heritage Site specific fields
    historicalSignificance: { type: String },
    yearEstablished: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }, // For Admin Approval
    isAuthentic: { type: Boolean, default: false }, // Special yellow badge
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    asfScores: {
        historicalContinuity: { type: Number, default: 0, min: 0, max: 10 },
        culturalAuthenticity: { type: Number, default: 0, min: 0, max: 10 },
        communityRelevance: { type: Number, default: 0, min: 0, max: 10 },
        heritageDocumentation: { type: Number, default: 0, min: 0, max: 10 },
        digitalNarrativeQuality: { type: Number, default: 0, min: 0, max: 10 },
        totalScore: { type: Number, default: 0 }
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', VendorSchema);
