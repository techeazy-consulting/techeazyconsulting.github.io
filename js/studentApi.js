// js/studentApi.js
import { DOMAIN } from "./config.js";

export async function submitStudentResponse(token, body) {
  const res = await fetch(
    `${DOMAIN}/rms/student-assessment-tracker/student-response?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      throw new Error("Token expired or invalid. Please use the latest link from your email.");
    } else {
      throw new Error(errData.message || "An unexpected error occurred");
    }
  }

  return res.json(); // success
}


// Validate token
export async function validateToken(token) {
  try {
    const response = await fetch(`${DOMAIN}/rms/student-assessment-tracker/check-token?token=${encodeURIComponent(token)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    // result.data contains the boolean value (true if expired, false if valid)
    // We need to return true if token is VALID (not expired)
    return result.data === false; // Token is valid if NOT expired
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
}