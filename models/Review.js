const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true
    },
    restaurantAddress: {
        type: String,
        default: "N/A"
    },
    city: {
        type: String,
        default: ""
    },
    cuisine: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    notes: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Review", reviewSchema);
