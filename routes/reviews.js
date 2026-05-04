const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({ createdAt: -1 });
        res.render("savedReviews", { reviews: reviews, error: null });
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.render("savedReviews", { reviews: [], error: "Could not load reviews." });
    }
});

router.get("/new", (req, res) => {
    const { name, address, city, cuisine } = req.query;
    res.render("reviewForm", {
        restaurantName: name || "",
        restaurantAddress: address || "",
        city: city || "",
        cuisine: cuisine || "",
        error: null
    });
});

router.post("/", async (req, res) => {
    const { restaurantName, restaurantAddress, city, cuisine, rating, notes } = req.body;

    if (!restaurantName || !rating) {
        return res.render("reviewForm", {
            restaurantName: restaurantName || "",
            restaurantAddress: restaurantAddress || "",
            city: city || "",
            cuisine: cuisine || "",
            error: "Restaurant name and rating are required."
        });
    }

    try {
        const review = new Review({
            restaurantName,
            restaurantAddress,
            city,
            cuisine,
            rating: parseInt(rating),
            notes
        });

        await review.save();

        res.render("reviewConfirmation", { review: review });
    } catch (err) {
        console.error("Error saving review:", err);
        res.render("reviewForm", {
            restaurantName,
            restaurantAddress,
            city,
            cuisine,
            error: "Could not save review. Please try again."
        });
    }
});

router.post("/delete/:id", async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
    } catch (err) {
        console.error("Error deleting review:", err);
    }
    res.redirect("/reviews");
});

router.post("/deleteAll", async (req, res) => {
    try {
        await Review.deleteMany({});
    } catch (err) {
        console.error("Error deleting all reviews:", err);
    }
    res.redirect("/reviews");
});

module.exports = router;
