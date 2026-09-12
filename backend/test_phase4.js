import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("==================================================");
  console.log("  PHASE 4 — EXPRESS BACKEND INTEGRATION TEST");
  console.log("==================================================");

  // Step 1: Login to obtain JWT Token
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
  console.log("✓ Login successful! Token acquired.");

  // Step 2: Test POST /api/potholes/detect with sample pothole image
  console.log("\n2. Testing POST /api/potholes/detect with sample image...");
  const sampleImagePath = path.join(__dirname, "../ai-service/model/test_input.jpg");
  if (!fs.existsSync(sampleImagePath)) {
    console.error(`Sample image file not found at ${sampleImagePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(sampleImagePath);
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("file", blob, "test_input.jpg");

  const detectRes = await fetch(`${BASE_URL}/potholes/detect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(`Response Status Code: ${detectRes.status}`);
  const detectData = await detectRes.json();
  console.log("Response Payload:", JSON.stringify(detectData, null, 2));

  if (detectRes.status === 200 && detectData.detected !== undefined) {
    console.log("✓ AI Detection Proxy Endpoint Test SUCCESS!");
  } else {
    console.error("❌ AI Detection Proxy Endpoint Test FAILED!");
  }

  // Step 3: Test Missing File Error (400)
  console.log("\n3. Testing edge case: Missing File...");
  const emptyForm = new FormData();
  const missingRes = await fetch(`${BASE_URL}/potholes/detect`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: emptyForm,
  });
  console.log(`Status Code: ${missingRes.status} (Expected: 400)`);
  const missingData = await missingRes.json();
  console.log("Payload:", missingData);

  // Step 4: Test Video Upload Error (400)
  console.log("\n4. Testing edge case: Video File Upload...");
  const videoForm = new FormData();
  const dummyVideoBlob = new Blob([Buffer.from("dummy video content")], { type: "video/mp4" });
  videoForm.append("file", dummyVideoBlob, "test_road.mp4");

  const videoRes = await fetch(`${BASE_URL}/potholes/detect`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: videoForm,
  });
  console.log(`Status Code: ${videoRes.status} (Expected: 400)`);
  const videoData = await videoRes.json();
  console.log("Payload:", videoData);

  // Step 5: Test Unauthorized Access (401)
  console.log("\n5. Testing edge case: Missing Authorization Token...");
  const unauthRes = await fetch(`${BASE_URL}/potholes/detect`, {
    method: "POST",
    body: formData,
  });
  console.log(`Status Code: ${unauthRes.status} (Expected: 401)`);
  const unauthData = await unauthRes.json();
  console.log("Payload:", unauthData);

  console.log("\n==================================================");
  console.log("  ALL PHASE 4 VERIFICATION TESTS COMPLETED");
  console.log("==================================================");
}

runTests().catch(console.error);
