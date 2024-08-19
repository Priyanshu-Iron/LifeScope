const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const UserModel = require('./model/medicineSchema')
const app = express();

// For Notification Alert "VITALS"
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Database', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error("Error in Connecting Database", error));
db.once('open', () => console.log("Connected to Database"));

// User schema and model
const userSchema = new mongoose.Schema({
    LifeScopeID: Number,
    contactNumber: String,
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

// Vital schema and model
const vitalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    heartRate: { type: Number, required: true },
    bloodPressure: { type: String, required: true },
    date: { type: Date, default: Date.now },
    time: { type: String, required: true },
    warnings: { type: String }
});

const Vital = mongoose.model('Vital', vitalSchema);

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

// Routes

// Home route
app.get("/", (req, res) => {
    res.redirect('Home Page.html'); 
});

// Sign-up route
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

// Login route
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

// Dashboard route
app.get("/dashboard", (req, res) => {
    const { user } = req.session;

    if (!user) {
        return res.redirect('/');
    }

    res.render('dashboard', { user });
});

// Dynamic profile route
app.get("/profile/:userId", async (req, res) => {
    const { userId } = req.params;
    const { user } = req.session;

    if (!user) {
        return res.redirect('/');
    }

    try {
        const profileUser = await User.findById(userId);

        if (!profileUser) {
            return res.status(404).send("User not found");
        }

        // Determine which profile to render based on role
        if (profileUser.role === 'Patient') {
            res.render('patient_profile', { user: profileUser });
        } else if (profileUser.role === 'Physician') {
            res.render('physician_profile', { user: profileUser });
        } else if (profileUser.role === 'Pharmacist') {
            res.render('pharmacist_profile', { user: profileUser });
        } else {
            res.status(400).send("Invalid role");
        }
    } catch (err) {
        console.error("Error fetching user profile", err);
        res.status(500).send("Error fetching user profile");
    }
});

// Submit patient details route
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

// Submit physician details route
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

// Submit pharmacist details route
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

// Route for physicians to view all patients
app.get("/view_patients", async (req, res) => {
    const { user } = req.session;

    if (!user || (user.role !== 'Physician' && user.role !== 'Pharmacist')) {
        return res.redirect('/');
    }

    try {
        const patients = await User.find({ role: 'Patient' });
        res.render('view_patients', { user, patients });
    } catch (err) {
        console.error("Error fetching patients", err);
        res.status(500).send("Error fetching patients");
    }
});

// Dynamic patient profile route (for physicians to view individual patient profiles)
app.get("/patient_profile/:patientId", async (req, res) => {
    const { patientId } = req.params;
    const { user } = req.session;

    if (!user || (user.role !== 'Physician' && user.role !== 'Pharmacist')) {
        return res.redirect('/');
    }

    try {
        const patient = await User.findById(patientId);

        if (!patient) {
            return res.status(404).send("Patient not found");
        }

        res.render('patient_profile', { user: patient, viewer: user });
    } catch (err) {
        console.error("Error fetching patient profile", err);
        res.status(500).send("Error fetching patient profile");
    }
});


// Route for physicians to view a specific patient's vitals
app.get('/patient_vitals/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const { user } = req.session;

    if (!user || (user.role !== 'Physician' && user.role !== 'Pharmacist')) {
        return res.redirect('/');
    }

    try {
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).send("Patient not found");
        }

        const vitals = await Vital.find({ userId: patientId });
        res.render('patient_vitals', { user, patient, vitals });
    } catch (err) {
        console.error("Error fetching patient vitals", err);
        res.status(500).send("Error fetching patient vitals");
    }
});

// Route to display the vitals form
app.get('/vitals', (req, res) => {
    const { user } = req.session;

    if (!user || user.role !== 'Patient') {
        return res.redirect('/');
    }

    res.render('vitals');
});

// Route to handle vitals submission
app.post('/submit_vitals', async (req, res) => {
    const { user } = req.session;
    const { heartRate, bloodPressure, date, time, warnings } = req.body;

    if (!user || user.role !== 'Patient') {
        return res.redirect('/');
    }

    try {
        const newVital = new Vital({
            userId: user._id,
            heartRate,
            bloodPressure,
            date,
            time,
            warnings
        });

        await newVital.save();

        // Check for abnormal vitals and notify physicians and pharmacists
        if (heartRate > 100 || bloodPressure === 'high') { // Example conditions
            const usersToNotify = await User.find({
                $or: [{ role: 'Physician' }, { role: 'Pharmacist' }]
            });

            usersToNotify.forEach(u => {
                io.emit('vitalAlert', {
                    userId: user._id,
                    heartRate,
                    bloodPressure,
                    warnings,
                    role: u.role
                });
            });
        }

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error submitting vitals", err);
        res.status(500).send("Error submitting vitals");
    }
});


// Route to view vitals
app.get('/view_vitals', async (req, res) => {
    const { user } = req.session;

    if (!user || user.role !== 'Patient') {
        return res.redirect('/');
    }

    try {
        const vitals = await Vital.find({ userId: user._id });
        res.render('view_vitals', { user, vitals });
    } catch (err) {
        console.error("Error fetching vitals", err);
        res.status(500).send("Error fetching vitals");
    }
});

// // new medicine route;

// Route to render medicine form for a specific patient
app.get('/MD/:patientId', (req, res) => {
    const { patientId } = req.params;

    res.render('add_Md', { patientId }); // Pass patientId to the view
});



app.get('/view', async (req,res)=>{
    //res.render('patient_medicine')
    let info = await UserModel.find();
    console.log(info)
    res.render("patient_medicine.ejs",{user:info});
})

// Route to view medicine information for a specific patient
app.get('/view/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        let info = await UserModel.find({ userId: patientId }); // Filter by the specific patient's ID
        res.render('patient_medicine.ejs', { user: info });
    } catch (error) {
        res.status(500).send('Error fetching medicine information');
    }
});

// POST route to save medicine information for a specific patient
const Medicine = require('./model/medicineSchema'); // Use the correct model for medicine

app.post('/medicine/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const { name, programName, duration, time } = req.body;

    try {
        let medicineInfo = await Medicine.create({
            name,
            programName,
            duration,
            time,
            userId: patientId // Associate medicine with the specific patient
        });

        res.redirect(`/view/${patientId}`); // Redirect to view the patient's medicine
    } catch (error) {
        console.error('Error saving medicine information:', error);
        res.status(500).send('Error saving medicine information');
    }
});

// Route to view medicine information for a specific patient
app.get('/view_medicines', async (req, res) => {
    const { user } = req.session;

    if (!user || user.role !== 'Patient') {
        return res.redirect('/');
    }

    try {
        let info = await UserModel.find({ userId: user._id }); // Filter by the logged-in patient’s ID
        res.render('patient_medicine.ejs', { user: info });
    } catch (error) {
        console.error('Error fetching medicine information:', error);
        res.status(500).send('Error fetching medicine information');
    }
});


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect('/');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});