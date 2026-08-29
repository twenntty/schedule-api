const express = require("express");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "institution") {
      return res.status(403).json({ message: "Немає доступу" });
    }

    let { name } = req.body;

    if (!name.startsWith("Каб.")) {
      name = `Каб. ${name}`;
    }

    const newRoom = new Room({
      name
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "institution") {
      return res.status(403).json({ message: "Немає доступу" });
    }

    const rooms = await Room.find({ institution: req.user.institution });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.delete("/:roomId", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "institution") {
        return res.status(403).json({ message: "Немає доступу" });
      }
  
      const room = await Room.findById(req.params.roomId);
      if (!room) {
        return res.status(404).json({ message: "Кабінет не знайдено" });
      }
  
      await room.deleteOne();
      res.json({ message: "Кабінет видалено" });
    } catch (error) {
      res.status(500).json({ message: "Помилка сервера" });
    }
  });
  

module.exports = router;
