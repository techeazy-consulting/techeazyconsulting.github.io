// js/student.js
import { submitStudentResponse, validateToken } from "./studentApi.js";

const params = new URLSearchParams(window.location.search);
const student_response_type = params.get("student_response_type");
const token = params.get("token");

// DOM elements
const invalidAccess = document.getElementById("invalid-access");
const formCard = document.getElementById("form-card");
const responseLabel = document.getElementById("responseLabel");
const responseHelp = document.getElementById("responseHelp");
const formSubtitle = document.getElementById("form-subtitle");
const studentResponse = document.getElementById("studentResponse");
const commentField = document.getElementById("comment");
const responseError = document.getElementById("responseError");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("resultText");
const resultIcon = document.getElementById("resultIcon");
const submitBtn = document.getElementById("submitBtn");
const urlCharCount = document.getElementById("urlCharCount");
const commentCharCount = document.getElementById("commentCharCount");

// Character limits
const URL_MAX_LENGTH = 1000;
const COMMENT_MAX_LENGTH = 5000;

// Initialize page
async function initializePage() {
  // Validate access parameters
  if (!student_response_type || !token || !["pr_link", "social_media_link"].includes(student_response_type)) {
    invalidAccess.classList.remove("d-none");
    return;
  }

  // Validate token with backend
  try {
    const isValid = await validateToken(token);
    
    if (!isValid) {
      showTokenExpiredMessage();
      return;
    }

    // Token is valid, show the form
    formCard.classList.remove("d-none");
    setupFormLabels();
    setupCharacterCounters();
  } catch (error) {
    console.error("Token validation error:", error);
    showTokenExpiredMessage();
  }
}

// Show token expired message
function showTokenExpiredMessage() {
  formCard.classList.remove("d-none");
  
  // Create expired message element
  const expiredMessage = document.createElement("div");
  expiredMessage.className = "alert alert-warning mt-3";
  expiredMessage.innerHTML = `
    <strong>Link Expired:</strong> This submission link has expired. Please contact your instructor for a new link.
  `;
  
  // Disable form elements
  const form = document.getElementById("studentForm");
  const inputs = form.querySelectorAll("input, textarea, button");
  inputs.forEach(input => input.disabled = true);
  
  // Add expired message to form body
  const formBody = document.querySelector(".form-body");
  formBody.appendChild(expiredMessage);
  
  // Optionally setup form labels even if expired
  setupFormLabels();
}

// Setup form labels based on response type
function setupFormLabels() {
  if (student_response_type === "pr_link") {
    formSubtitle.textContent = "GitHub Pull Request Submission";
    responseLabel.textContent = "GitHub Pull Request Link";
    studentResponse.placeholder = "https://github.com/username/repo/pull/123";
    responseHelp.textContent = "Paste the complete GitHub Pull Request URL";
    commentField.placeholder = "Describe the changes made, challenges faced, or any additional notes (optional)...";
  } else {
    formSubtitle.textContent = "Social Media Assignment Submission";
    responseLabel.textContent = "Social Media Link";
    studentResponse.placeholder = "https://instagram.com/p/your-post-id";
    responseHelp.textContent = "Paste the social media post URL (Instagram, LinkedIn, etc.)";
    commentField.placeholder = "(optional)...";
  }
}

// Setup character counters
function setupCharacterCounters() {
  // URL field character counter
  studentResponse.addEventListener("input", () => {
    const length = studentResponse.value.length;
    urlCharCount.textContent = `${length}/${URL_MAX_LENGTH}`;
    
    if (length > URL_MAX_LENGTH) {
      urlCharCount.classList.add("text-danger");
      studentResponse.classList.add("is-invalid");
    } else {
      urlCharCount.classList.remove("text-danger");
      studentResponse.classList.remove("is-invalid");
    }
  });

  // Comment field character counter
  commentField.addEventListener("input", () => {
    const length = commentField.value.length;
    commentCharCount.textContent = `${length}/${COMMENT_MAX_LENGTH}`;
    
    if (length > COMMENT_MAX_LENGTH) {
      commentCharCount.classList.add("text-danger");
      commentField.classList.add("is-invalid");
    } else {
      commentCharCount.classList.remove("text-danger");
      commentField.classList.remove("is-invalid");
    }
  });
}

// Simple URL validation
function validateUrl(url) {
  const pattern = /^(https?:\/\/)[\w.-]+(\.[\w\.-]+)+[/#?]?.*$/;
  return pattern.test(url);
}

// Form submit
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  responseError.classList.add("d-none");

  // Validate URL field
  const urlValue = studentResponse.value.trim();
  
  if (!urlValue) {
    responseError.textContent = "Please enter a URL";
    responseError.classList.remove("d-none");
    return;
  }
  
  if (urlValue.length > URL_MAX_LENGTH) {
    responseError.textContent = `URL must not exceed ${URL_MAX_LENGTH} characters`;
    responseError.classList.remove("d-none");
    return;
  }
  
  if (!validateUrl(urlValue)) {
    responseError.textContent = "Please enter a valid URL";
    responseError.classList.remove("d-none");
    return;
  }

  // Validate comment field
  const commentValue = commentField.value.trim();
  
  if (commentValue.length > COMMENT_MAX_LENGTH) {
    responseError.textContent = `Comment must not exceed ${COMMENT_MAX_LENGTH} characters`;
    responseError.classList.remove("d-none");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

  const body = {
    studentResponse: urlValue,
    studentResponseType: student_response_type.toUpperCase(),
    comment: commentValue,
  };

  try {
    await submitStudentResponse(token, body);

    resultText.textContent = "✅ Success: Your submission has been recorded successfully!";
    resultBox.className = "result-message success";
    studentResponse.value = "";
    commentField.value = "";
    
    // Reset character counters
    urlCharCount.textContent = `0/${URL_MAX_LENGTH}`;
    commentCharCount.textContent = `0/${COMMENT_MAX_LENGTH}`;
  } catch (err) {
    resultText.textContent = "❌ Error: " + err.message;
    resultBox.className = "result-message error";
  }

  resultBox.classList.remove("d-none");
  resultIcon.className = resultText.textContent.startsWith("✅")
    ? "fas fa-check-circle"
    : "fas fa-times-circle";

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment';
});

// Initialize on page load
initializePage();