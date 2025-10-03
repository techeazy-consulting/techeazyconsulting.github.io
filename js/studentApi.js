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
