const express = require("express");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "institution") {
      return res.status(403).json({ message: "Нет доступа" });
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
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "institution") {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const rooms = await Room.find({ institution: req.user.institution });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.delete("/:roomId", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "institution") {
        return res.status(403).json({ message: "Нет доступа" });
      }
  
      const room = await Room.findById(req.params.roomId);
      if (!room) {
        return res.status(404).json({ message: "Кабинет не найден" });
      }
  
      await room.deleteOne();
      res.json({ message: "Кабинет удалён" });
    } catch (error) {
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  });
  

module.exports = router;
