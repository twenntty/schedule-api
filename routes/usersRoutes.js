const express = require("express");
const User = require("../models/User");
const { requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/", requireRole("admin"), async (req, res) => {
    try {
        const users = await User.find({}, "firstName lastName position role");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Помилка серверу", error: error.message });
    }
});

module.exports = router;
