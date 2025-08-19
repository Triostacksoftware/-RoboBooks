#!/usr/bin/env node

/**
 * CORS Test Script
 *
 * This script helps test CORS configuration by making requests to your API
 * from different origins to ensure they're properly handled.
 */

import fetch from "node-fetch";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const TEST_ENDPOINTS = [
  "/api/health",
  "/api/module-preferences/preferences",
  "/api/module-preferences/test",
];

const TEST_ORIGINS = [
  "http://localhost:3000",
  "https://robobookss.com",
  "https://www.robobookss.com",
  "http://localhost:3001",
];

async function testCORS(endpoint, origin) {
  try {
    console.log(`\n🧪 Testing ${endpoint} from origin: ${origin}`);

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📋 CORS Headers:`);
    console.log(
      `   Access-Control-Allow-Origin: ${response.headers.get(
        "access-control-allow-origin"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Credentials: ${response.headers.get(
        "access-control-allow-credentials"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Methods: ${response.headers.get(
        "access-control-allow-methods"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Headers: ${response.headers.get(
        "access-control-allow-headers"
      )}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

async function testPreflight(endpoint, origin) {
  try {
    console.log(
      `\n🛫 Testing OPTIONS preflight for ${endpoint} from origin: ${origin}`
    );

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    console.log(`✅ Preflight Status: ${response.status}`);
    console.log(`📋 Preflight CORS Headers:`);
    console.log(
      `   Access-Control-Allow-Origin: ${response.headers.get(
        "access-control-allow-origin"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Credentials: ${response.headers.get(
        "access-control-allow-credentials"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Methods: ${response.headers.get(
        "access-control-allow-methods"
      )}`
    );
    console.log(
      `   Access-Control-Allow-Headers: ${response.headers.get(
        "access-control-allow-headers"
      )}`
    );
  } catch (error) {
    console.log(`❌ Preflight failed: ${error.message}`);
  }
}

async function runTests() {
  console.log("🚀 Starting CORS Tests...");
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);

  for (const endpoint of TEST_ENDPOINTS) {
    for (const origin of TEST_ORIGINS) {
      await testPreflight(endpoint, origin);
      await testCORS(endpoint, origin);
    }
  }

  console.log("\n✅ CORS tests completed!");
}

// Run the tests
runTests().catch(console.error);
