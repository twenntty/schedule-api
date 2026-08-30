const express = require("express");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/auth");
const { requireRole } = authMiddleware;
const canManage = [authMiddleware, requireRole("admin", "institution")];
const router = express.Router();

router.post("/", canManage, async (req, res) => {
  try {
    let { name } = req.body;
    if (!name) return res.status(400).json({ message: "Вкажіть номер аудиторії" });
    if (!name.startsWith("Каб.")) name = `Каб. ${name}`;

    const newRoom = new Room({ name, institution: req.user.institution });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.get("/", canManage, async (req, res) => {
  try {
    const rooms = await Room.find({ institution: req.user.institution });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.delete("/:roomId", canManage, async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.roomId, institution: req.user.institution });
    if (!room) return res.status(404).json({ message: "Кабінет не знайдено" });
    res.json({ message: "Кабінет видалено" });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

module.exports = router;
