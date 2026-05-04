const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const apiRoutes = require("./routes/api");
const reviewRoutes = require("./routes/reviews");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/api", apiRoutes);
app.use("/reviews", reviewRoutes);

app.listen(PORT, () => {
    console.log(`Web server started and running at http://localhost:${PORT}`);
});
