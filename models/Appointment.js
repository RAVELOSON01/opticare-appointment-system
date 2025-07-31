const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    date: String,
    time: String,
    type: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
