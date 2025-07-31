const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

dotenv.config();

const app = express(); // ✅ Must come BEFORE any app.use()
const PORT = 3000;

// ✅ Session middleware
app.use(session({
    secret: 'opticare_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true only if HTTPS
}));

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Routes
app.use('/', require('./routes/routes'));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB connection error:", err));

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
