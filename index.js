const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express(); // Initialize app first

app.set('view engine', 'ejs'); // Set the view engine to ejs

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

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
    fphone: String,
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
});

const User = mongoose.model('User', userSchema);

app.post("/sign_up", async (req, res) => {
    console.log("Received request body:", req.body);

    const { LifeScopeID, fphone, role, email, Mpassword, Cpassword } = req.body;

    if (!email) {
        return res.status(400).send("Email is required");
    }

    if (Mpassword !== Cpassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const hashedPassword = await bcrypt.hash(Mpassword, 10);
        const newUser = new User({ LifeScopeID, fphone, role, email, password: hashedPassword });
        await newUser.save();
        console.log("Record Inserted Successfully");

        // Redirect to the login page
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

        // Store user information in session
        req.session.user = user;

        // Check if user has filled out the form
        const isFormFilled = user.fullName && user.firstName && user.lastName;

        // Redirect based on form completion and role
        if (isFormFilled) {
            return res.redirect('/profile');
        } else {
            if (user.role === 'Patient') {
                return res.redirect('/Patient_Detail_Form.html');
            } else if (user.role === 'Physician') {
                return res.redirect('/physician_form.html'); // Adjust paths as needed
            } else if (user.role === 'Pharmacist') {
                return res.redirect('/pharmacist_form.html'); // Adjust paths as needed
            } else {
                return res.status(400).send("Invalid role");
            }
        }
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

        // Update session with new user data
        req.session.user = updatedUser;

        res.redirect('/profile');
    } catch (err) {
        console.error("Error submitting patient details", err);
        res.status(500).send("Error submitting patient details");
    }
});

app.get("/profile", async (req, res) => {
    const { user } = req.session;

    if (!user) {
        return res.redirect('/');
    }

    try {
        const userProfile = await User.findById(user._id).lean();

        res.render('profile', { user: userProfile });
    } catch (err) {
        console.error("Error retrieving user profile", err);
        res.status(500).send("Error retrieving user profile");
    }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*"
    });
    return res.redirect('Home Page.html');
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});