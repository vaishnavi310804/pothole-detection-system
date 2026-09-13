OK Driver – AI-Powered Pothole Detection & Reporting System

An AI-powered full-stack pothole detection and reporting system that allows users to upload road images or videos, detect potholes using YOLOv8, and track report resolution.

The system supports automatic civic authority assignment, authority-specific ticket dashboards, role-based access, AWS S3 media storage, and AI-powered pothole analysis.

Features
Users
Register and login with JWT authentication
Upload pothole images and videos
AI-powered pothole detection using YOLOv8
View detection confidence, pothole count, and severity
View video detection metadata and detection timeline
Submit pothole reports with location details
Track submitted reports and their status
Admin
View and manage all pothole reports
Dashboard with report statistics
Update report status
View assigned civic authority
Filter reports by authority
Reassign reports to civic authorities
Manage pothole reports
Civic Authorities
Authority-specific login accounts
View only pothole reports assigned to their authority
Authority ticket dashboard
View complete report details, media, location, and AI detection results
Update ticket status, including In Progress and Resolved
AI Detection
YOLOv8-based pothole detection
Image and video analysis
Detection confidence
Pothole count
Severity classification
Annotated image preview
Video metadata
Timestamp-based detection timeline
Automatic Authority Assignment

Reports are automatically assigned using:

Latitude and longitude bounding-box matching
Address keyword matching
Manual reassignment by administrators when required

Supported demonstration locations include:

Chandigarh
Delhi
Bengaluru
Mumbai
Mohali
Tech Stack

Frontend: React, Vite, Tailwind CSS, Axios

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer

AI Service: Python, FastAPI, YOLOv8, Ultralytics, OpenCV

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
2. Configure Environment Variables

Create a .env file inside the backend directory and configure:

DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=your_region

AI_SERVICE_URL=http://localhost:8000
3. Start the AI Service
cd ai-service
python -m venv venv

Activate the virtual environment, then:

pip install -r requirements.txt
python main.py

The AI service runs on:

http://localhost:8000
4. Start the Backend
cd backend
npm install
npm run seed:admin
npm run dev

The backend runs on:

http://localhost:5000
5. Start the Frontend
cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:5173
Running Order
MongoDB
AI Service
Backend
Frontend
Roles

The system supports three roles:

User — Report and track potholes
Admin — Manage all reports and authority assignments
Authority — Manage pothole tickets assigned to their organization
Author

Vaishnavi Kumari

OK Driver Assignment – AI-Powered Pothole Detection & Reporting System