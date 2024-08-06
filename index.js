const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

mongoose.connect('mongodb://localhost:27017/Database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on('error', (error) => console.error("Error in Connecting Database", error));
db.once('open', () => console.log("Connected to Database"));

// Define a schema and model
const userSchema = new mongoose.Schema({
    LifeScopeID: Number,
    contactNumber: String, // Ensure only one mobile number field
    role: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: String,
    firstName: String,
    lastName: String,
    age: Number,
    dob: Date,
    weight: String,
    height: String,
    bloodGroup: String,
    gender: String,
    chronicIllness: String,
    medicalHistory: String,
    address: String,
    license: String,
    specialization: String,
    experience: String,
    availableDays: String,
    availabilityStartTime: String,
    availabilityEndTime: String,
});

const User = mongoose.model('User', userSchema);

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post("/sign_up", async (req, res) => {
    const { LifeScopeID, role, email, Mpassword, Cpassword } = req.body;

    if (!email) {
        return res.status(400).send("Email is required");
    }

    if (Mpassword !== Cpassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const hashedPassword = await bcrypt.hash(Mpassword, 10);
        const newUser = new User({ LifeScopeID, role, email, password: hashedPassword });
        await newUser.save();
        console.log("Record Inserted Successfully");

        return res.redirect('/Home Page.html');
    } catch (err) {
        console.error("Error inserting record:", err);
        return res.status(500).send("Error inserting record");
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password are required");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("No user found with that email");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        req.session.user = user;
        return res.redirect('/dashboard');
    } catch (err) {
        console.error("Error during login", err);
        return res.status(500).send("Error during login");
    }
});

app.post("/submit_patient_details", async (req, res) => {
    const { user } = req.session;
    const {
        full_name, first_name, last_name, age, dob, weight, height,
        blood_group, gender, chronic_illness, medical_history
    } = req.body;

    if (!user) {
        return res.status(401).send("User not logged in");
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            fullName: full_name,
            firstName: first_name,
            lastName: last_name,
            age,
            dob,
            weight,
            height,
            bloodGroup: blood_group,
            gender,
            chronicIllness: chronic_illness,
            medicalHistory: medical_history,
        }, { new: true });

        req.session.user = updatedUser;

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error submitting patient details", err);
        res.status(500).send("Error submitting patient details");
    }
});

app.post("/submit_pharmacist_details", upload.single('profile_pic'), async (req, res) => {
    const { user } = req.session;
    const { first_name, last_name, dob, contact_number, gender, address, license } = req.body;

    if (!user) {
        return res.status(401).send("User not logged in");
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            firstName: first_name,
            lastName: last_name,
            dob,
            contactNumber: contact_number,
            gender,
            address,
            license,
        }, { new: true });

        req.session.user = updatedUser;

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error submitting pharmacist details", err);
        res.status(500).send("Error submitting pharmacist details");
    }
});

app.post("/submit_physician_details", upload.single('profile_pic'), async (req, res) => {
    const { user } = req.session;
    const { first_name, last_name, dob, contact_number, gender, address, specialization, experience, available_days, availability_start_time, availability_end_time } = req.body;

    if (!user) {
        return res.status(401).send("User not logged in");
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            firstName: first_name,
            lastName: last_name,
            dob,
            contactNumber: contact_number,
            gender,
            address,
            specialization,
            experience,
            availableDays: available_days,
            availabilityStartTime: availability_start_time,
            availabilityEndTime: availability_end_time,
        }, { new: true });

        req.session.user = updatedUser;

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error submitting physician details", err);
        res.status(500).send("Error submitting physician details");
    }
});

// Profile view routes
app.get("/patient_profile", (req, res) => {
    const { user } = req.session;
    if (!user || user.role !== 'Patient') {
        return res.redirect('/');
    }
    res.render('patient_profile', { user });
});

app.get("/physician_profile", (req, res) => {
    const { user } = req.session;
    if (!user || user.role !== 'Physician') {
        return res.redirect('/');
    }
    res.render('physician_profile', { user });
});

app.get("/pharmacist_profile", (req, res) => {
    const { user } = req.session;
    if (!user || user.role !== 'Pharmacist') {
        return res.redirect('/');
    }
    res.render('pharmacist_profile', { user });
});

// Dashboard route
app.get("/dashboard", (req, res) => {
    const { user } = req.session;

    if (!user) {
        return res.redirect('/');
    }

    res.render('dashboard', { user });
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
