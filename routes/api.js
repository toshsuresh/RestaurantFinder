const express = require("express");
const router = express.Router();

router.get("/results", async (req, res) => {
    const { city, cuisine } = req.query;

    if (!city) {
        return res.render("results", { restaurants: [], city: "", cuisine: "", error: "Please enter a city." });
    }

    try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${process.env.GEOAPIFY_GEOCODING_KEY}`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            return res.render("results", {
                restaurants: [],
                city: city,
                cuisine: cuisine || "any",
                error: "Could not find that city. Please try again."
            });
        }

        const geoData = await geoResponse.json();

        if (!geoData.features || geoData.features.length === 0) {
            return res.render("results", {
                restaurants: [],
                city: city,
                cuisine: cuisine || "any",
                error: "City not found. Please check the spelling and try again."
            });
        }

        const lon = geoData.features[0].properties.lon;
        const lat = geoData.features[0].properties.lat;

        let category = "catering.restaurant";
        if (cuisine && cuisine !== "any") {
            const cuisineMap = {
                "Italian": "catering.restaurant.italian",
                "Mexican": "catering.restaurant.mexican",
                "Chinese": "catering.restaurant.chinese",
                "Japanese": "catering.restaurant.japanese",
                "Indian": "catering.restaurant.indian",
                "American": "catering.restaurant.american",
                "Thai": "catering.restaurant.thai",
                "Korean": "catering.restaurant.korean",
                "Mediterranean": "catering.restaurant.mediterranean",
                "Vietnamese": "catering.restaurant.vietnamese"
            };
            category = cuisineMap[cuisine] || "catering.restaurant";
        }

        const placesUrl = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},5000&limit=10&apiKey=${process.env.GEOAPIFY_PLACES_KEY}`;
        const placesResponse = await fetch(placesUrl);

        if (!placesResponse.ok) {
            return res.render("results", {
                restaurants: [],
                city: city,
                cuisine: cuisine || "any",
                error: "Could not fetch restaurants. Please try again."
            });
        }

        const placesData = await placesResponse.json();
        const restaurants = (placesData.features || []).map(feature => {
            const p = feature.properties;
            const cats = p.categories || [];
            let categoryName = "Restaurant";
            if (cats.length > 0) {
                const specific = cats.find(c => c.startsWith("catering.restaurant.") && c !== "catering.restaurant");
                if (specific) {
                    categoryName = specific.split(".").pop();
                    categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
                }
            }

            return {
                name: p.name || "Unnamed Restaurant",
                address: p.formatted || p.address_line1 || "No address",
                category: categoryName,
                city: p.city || city
            };
        });

        res.render("results", {
            restaurants: restaurants,
            city: city,
            cuisine: cuisine || "any",
            error: null
        });
    } catch (err) {
        console.error("Search error:", err);
        res.render("results", {
            restaurants: [],
            city: city,
            cuisine: cuisine || "any",
            error: "Something went wrong. Please try again."
        });
    }
});

module.exports = router;
