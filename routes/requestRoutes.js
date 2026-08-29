const express = require("express");
const Request = require("../models/Request");
const authMiddleware = require("../middleware/auth");
const { requireRole } = authMiddleware;
const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { requestType, schoolName, studentCount, contactNumber, email } = req.body;

    const newRequest = new Request({
      requestType,
      schoolName,
      studentCount: Number(studentCount),
      contactNumber,
      email,
    });

    await newRequest.save();
    res.status(201).json({ message: "Дані успішно збережено!" });
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});

router.get("/all", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});

module.exports = router;
