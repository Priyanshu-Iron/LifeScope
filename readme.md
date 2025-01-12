Lifescope Health Management System

The **Lifescope Health Management System** is a web-based platform designed to streamline real-time health monitoring, automate patient data analysis, and improve communication between patients, physicians, and pharmacists.

Table of Contents
- [Project Summary](project-summary)
- [Features](features)
- [Technology Stack](technology-stack)
- [Use Case Scenarios](use-case-scenarios)
- [Installation](installation)
- [Future Work](future-work)
- [Acknowledgements](acknowledgements)

Project Summary

Lifescope was developed during the Galgotias University Internship Program to address the challenges of real-time patient health monitoring. It allows patients to input critical health data such as blood pressure and symptoms. The system:
- Sends automatic alerts to physicians when abnormal health data is detected.
- Ensures timely prescription of medications, validated by pharmacists.
- Proposes future integration of wearable health-monitoring devices for continuous, automated data collection.

Features
- **Patient Health Data Input**: Patients can log critical health metrics (e.g., blood pressure).
- **Automated Notifications**: Real-time alerts for physicians when patient data exceeds critical thresholds.
- **Medication Workflow**: Physicians can prescribe medications; pharmacists validate them before reaching patients.
- **Future Wearable Device Integration**: Seamless connection with smart devices for automated health data collection.

Technology Stack
Frontend
- **HTML/CSS**: For structured and styled web pages.
- **JavaScript**: To enable dynamic interactivity.

Backend
- **Node.js**: Manages server-side operations and data flow.
- **MongoDB**: NoSQL database for storing patient, physician, and pharmacist data.

Hosting and Tools
- **AWS**: Provides scalable and high-performance hosting.
- **GitHub**: For version control and collaborative development.

Use Case Scenarios
Scenario 1: High Blood Pressure Alert
1. A patient logs their blood pressure reading in the system.
2. If the reading exceeds a critical threshold, an alert is sent to the physician.
3. The physician reviews the data and prescribes medication.
4. The pharmacist validates the prescription before the patient receives the medication.

Scenario 2: Wearable Device Integration
1. A smartwatch monitors a patient’s blood pressure continuously.
2. The readings are automatically sent to the Lifescope system.
3. The system alerts the physician if critical levels are detected.
4. The physician intervenes promptly without requiring manual input.

Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lifescope.git
   ```
2. Navigate to the project directory:
   ```bash
   cd lifescope
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the required variables:
     ```env
     PORT=your_port
     DATABASE_URL=your_database_url
     ```
5. Start the server:
   ```bash
   npm start
   ```

Future Work
- Integration with wearable health-monitoring devices.
- Expansion to monitor additional health parameters such as heart rate and blood glucose levels.

Acknowledgements
Special thanks to **Galgotias University** and my internship supervisor, **Mr. Anshuman Sir**, for their guidance and support throughout the development of this project.

---

Visit the live project: [Lifescope Health Management System](http://lifescope-env.eba-jrxg3p4c.ap-south-1.elasticbeanstalk.com)
