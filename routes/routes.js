const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcrypt'); 

// Home
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/welcome.html'));
});

// ======== SIGNUP =========
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
});

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        const user = await User.create({ fullName, email, password });
        req.session.user = user;  // This line logs the user in
        res.redirect('/appointment');
    } catch (err) {
        res.status(500).send('Error during signup');
    }
});


// ======== LOGIN =========
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.send('<h3>❌ Invalid email or password</h3><a href="/login">Try again</a>');
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            req.session.user = user;
            res.redirect('/appointment');
        } else {
            res.send('<h3>❌ Invalid email or password</h3><a href="/login">Try again</a>');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ======== APPOINTMENT PAGE =========
router.get('/appointment', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.sendFile(path.join(__dirname, '../views/appointment.html'));
});

// ======== APPOINTMENT POST =========
router.post('/appointments', async (req, res) => {
    const { fullName, email, date, time, type } = req.body;

    try {
        await Appointment.create({ fullName, email, date, time, type });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Appointment Confirmed</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f8f9fa;
                    }
                    .card {
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        padding: 30px;
                        border-radius: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="card text-center">
                    <h3 class="mb-3 text-success">✅ Thank You for Your Booking!</h3>
                    <p>Your appointment has been successfully scheduled.</p>
                    <a href="/appointment" class="btn btn-primary mt-3">Book Another</a>
                    <a href="/logout" class="btn btn-outline-danger mt-3">Logout</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Failed to book');
    }
});

// ======== RECEPTIONIST LOGIN =========
const VALID_RECEPTION_ID = "1234";

router.get('/reception-login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/reception-login.html'));
});

router.post('/reception-login', (req, res) => {
    const { receptionId } = req.body;
    if (receptionId === VALID_RECEPTION_ID) {
        req.session.receptionist = true;
        res.redirect('/reception');
    } else {
        res.send('<h3>❌ Invalid ID</h3><a href="/">Return to Home</a>');
    }
});

// ======== RECEPTIONIST PAGE =========
router.get('/reception', (req, res) => {
    if (!req.session.receptionist) return res.redirect('/reception-login');
    res.sendFile(path.join(__dirname, '../views/receptionist.html'));
});

router.get('/all-appointments', async (req, res) => {
    if (!req.session.receptionist) return res.status(401).json({ error: "Unauthorized" });
    const appointments = await Appointment.find();
    res.json(appointments);
});

// ======== LOGOUT ROUTE =========
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/');
    });
});

module.exports = router;
