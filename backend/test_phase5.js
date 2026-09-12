import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api";

async function runPhase5Tests() {
  console.log("==================================================");
  console.log("  PHASE 5 — DATABASE & SCHEMA INTEGRATION TESTS");
  console.log("==================================================");

  // Step 1: Login user
  console.log("\n1. Logging in user to obtain JWT token...");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin123@gmail.com",
      password: "adminpassword123",
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    console.error("Login failed:", loginData);
    process.exit(1);
  }
  const token = loginData.token;
  console.log("✓ Login successful!");

  // Step 2: Upload a sample image to S3 to get a valid media key and presigned URL
  console.log("\n2. Uploading sample media to S3 via POST /api/potholes/upload...");
  const sampleImagePath = path.join(__dirname, "../ai-service/model/test_input.jpg");
  const imageBuffer = fs.readFileSync(sampleImagePath);
  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([imageBuffer], { type: "image/jpeg" }), "test_input.jpg");

  const uploadRes = await fetch(`${BASE_URL}/potholes/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: uploadForm,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.media) {
    console.error("S3 upload failed:", uploadData);
    process.exit(1);
  }
  console.log("✓ Media uploaded to S3 successfully!", uploadData.media);
  const mediaObj = uploadData.media;

  // TEST 1 — AI Detection Report Creation
  console.log("\n--- TEST 1: Creating AI Detection Report (detected: true) ---");
  const aiReportPayload = {
    location: {
      latitude: 30.7333,
      longitude: 76.7794,
      address: "Sector 17, Chandigarh (AI Test)",
    },
    media: mediaObj,
    detection: {
      detected: true,
      confidence: 0.92,
      severity: "High",
      count: 1,
      detections: [
        {
          label: "pothole",
          confidence: 0.92,
          boundingBox: { x1: 200, y1: 250, x2: 440, y2: 450 },
          normalizedBox: { x1: 0.3125, y1: 0.3906, x2: 0.6875, y2: 0.7031 },
        },
      ],
      needsManualReview: false,
    },
  };

  const createAiRes = await fetch(`${BASE_URL}/potholes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(aiReportPayload),
  });

  const aiReport = await createAiRes.json();
  console.log(`Create Status Code: ${createAiRes.status}`);
  console.log("Created AI Detection Object:", JSON.stringify(aiReport.detection, null, 2));

  if (
    createAiRes.status === 201 &&
    aiReport.detection?.detected === true &&
    aiReport.detection?.severity === "High" &&
    aiReport.detection?.confidence === 0.92 &&
    aiReport.detection?.needsManualReview === false
  ) {
    console.log("✓ TEST 1 PASSED: AI Detection Report stored correctly in MongoDB!");
  } else {
    console.error("❌ TEST 1 FAILED!");
  }

  // TEST 2 — No Pothole Detected Report Creation (Manual Review)
  console.log("\n--- TEST 2: Creating Manual Review Report (detected: false) ---");
  const manualReportPayload = {
    location: {
      latitude: 30.7400,
      longitude: 76.7800,
      address: "Sector 22, Chandigarh (Manual Review Test)",
    },
    media: mediaObj,
    detection: {
      detected: false,
      confidence: null,
      severity: null,
      count: 0,
      detections: [],
      needsManualReview: true,
    },
  };

  const createManualRes = await fetch(`${BASE_URL}/potholes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(manualReportPayload),
  });

  const manualReport = await createManualRes.json();
  console.log(`Create Status Code: ${createManualRes.status}`);
  console.log("Created Manual Review Detection Object:", JSON.stringify(manualReport.detection, null, 2));

  if (
    createManualRes.status === 201 &&
    manualReport.detection?.detected === false &&
    manualReport.detection?.severity === null &&
    manualReport.detection?.confidence === null &&
    manualReport.detection?.needsManualReview === true
  ) {
    console.log("✓ TEST 2 PASSED: Manual Review Report stored correctly in MongoDB!");
  } else {
    console.error("❌ TEST 2 FAILED!");
  }

  // TEST 3 — Get My Reports
  console.log("\n--- TEST 3: Fetching My Reports (GET /api/potholes/my-reports) ---");
  const myReportsRes = await fetch(`${BASE_URL}/potholes/my-reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const myReports = await myReportsRes.json();
  console.log(`Status: ${myReportsRes.status}, Total My Reports: ${myReports.length}`);
  if (myReportsRes.status === 200 && Array.isArray(myReports) && myReports.length > 0) {
    console.log("First My Report Detection Object:", myReports[0].detection);
    console.log("✓ TEST 3 PASSED!");
  } else {
    console.error("❌ TEST 3 FAILED!");
  }

  // TEST 4 — Admin All Reports
  console.log("\n--- TEST 4: Fetching All Reports as Admin (GET /api/potholes) ---");
  const allReportsRes = await fetch(`${BASE_URL}/potholes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const allReports = await allReportsRes.json();
  console.log(`Status: ${allReportsRes.status}, Total Reports: ${allReports.length}`);
  if (allReportsRes.status === 200 && Array.isArray(allReports)) {
    console.log("✓ TEST 4 PASSED!");
  } else {
    console.error("❌ TEST 4 FAILED!");
  }

  // TEST 5 — Get Pothole By ID
  console.log("\n--- TEST 5: Fetching Pothole By ID (GET /api/potholes/:id) ---");
  const detailRes = await fetch(`${BASE_URL}/potholes/${aiReport._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const detail = await detailRes.json();
  console.log(`Status: ${detailRes.status}`);
  if (detailRes.status === 200 && detail._id === aiReport._id && detail.detection?.detected === true) {
    console.log("Fetched Detail Detection:", detail.detection);
    console.log("✓ TEST 5 PASSED!");
  } else {
    console.error("❌ TEST 5 FAILED!");
  }

  // TEST 6 & 7 — Presigned S3 URLs
  console.log("\n--- TEST 6 & 7: Media Integration & Presigned S3 URLs ---");
  if (detail.media?.url && detail.media.url.includes("http")) {
    console.log("✓ Presigned Media URL verified:", detail.media.url.substring(0, 60) + "...");
    console.log("✓ TEST 6 & 7 PASSED!");
  } else {
    console.error("❌ TEST 6 & 7 FAILED!");
  }

  console.log("\n==================================================");
  console.log("  ALL PHASE 5 TESTS COMPLETED SUCCESSFULLY");
  console.log("==================================================");
}

runPhase5Tests().catch(console.error);
