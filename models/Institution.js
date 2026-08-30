const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // Short slug used to build teacher login handles (e.g. "kievuniversity").
    slug: { type: String, required: true, unique: true, index: true },
    // IANA timezone (e.g. "Europe/Kyiv") — all week windows resolve in this zone.
    timezone: { type: String, required: true, default: 'Europe/Kyiv' },
    // Secret token for the public teacher self-registration link.
    registrationToken: { type: String, required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);
