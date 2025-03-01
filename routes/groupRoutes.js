const express = require('express');
const Group = require('../models/Group');
const router = express.Router();

router.get('/', async (req, res) => {
    const groups = await Group.find().populate('specialty');
    res.json(groups);
});

router.post('/', async (req, res) => {
    const newGroup = new Group(req.body);
    await newGroup.save();
    res.json({ message: 'Группа добавлена', group: newGroup });
});

module.exports = router;7