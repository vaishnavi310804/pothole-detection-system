OK Driver – AI-Powered Pothole Detection & Reporting System

An AI-powered full-stack pothole detection and reporting system that allows users to report potholes, analyze road images using YOLOv8, and track report resolution.

The system also supports automatic civic authority assignment, authority-specific ticket dashboards, and role-based access for users, administrators, and municipal authorities.

Features
Users
Register and login with JWT authentication
Upload pothole images
AI-powered pothole detection
View detection confidence and severity
Submit pothole reports with location details
Track submitted reports and their status
Admin
View and manage all pothole reports
Dashboard with report statistics
Update report status
Reassign reports to civic authorities
Manage authority assignments
Civic Authorities
Authority-specific login accounts
View only pothole reports assigned to their authority
Ticket dashboard for assigned reports
Update ticket status such as In Progress or Resolved
AI Detection
YOLOv8-based pothole detection
Detection confidence
Pothole count
Severity classification
Annotated image preview
Automatic Authority Assignment

Reports are automatically assigned using:

Latitude and longitude bounding-box matching
Address keyword matching
Manual verification fallback for unsupported locations

Supported demonstration locations include:

Chandigarh
Delhi
Bengaluru
Mumbai
Mohali
Tech Stack

Frontend: React, Vite, Tailwind CSS, Axios

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer

AI Service: Python, FastAPI, YOLOv8, Ultralytics

Storage: AWS S3

Project Structure
pothole-detection-system/
├── frontend/       # React application
├── backend/        # Node.js / Express API
└── ai-service/     # FastAPI + YOLOv8 service
Getting Started
1. Clone the Repository
git clone https://github.com/vaishnavi310804/pothole-detection-system.git
cd pothole-detection-system
2. Start the AI Service
cd ai-service
python -m venv venv

Activate the virtual environment and install dependencies:

pip install -r requirements.txt
python main.py

The AI service runs on:

http://localhost:8000

3. Start the Backend

Create and configure the backend environment file:

cd backend
npm install
npm run seed:admin
npm run dev

The backend runs on:

http://localhost:5000

4. Start the Frontend
cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173

Environment Variables

Configure backend/.env with values such as:

DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region

AI_SERVICE_URL=http://localhost:8000
Running Order
MongoDB
AI Service
Backend
Frontend
Roles

The system supports:

User — Report and track potholes
Admin — Manage all reports and authority assignments
Authority — Manage pothole tickets assigned to their organization
Author

Vaishnavi Kumari

OK Driver Assignment – AI-Powered Pothole Detection & Reporting System