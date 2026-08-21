/* ============================================================
   Star Studios - Application page logic
   ============================================================ */

let currentRole = null;
let currentRoleSlug = null;
let captchaExpected = null;
const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("role");
  currentRoleSlug = slug;
  currentRole = ROLES[slug];

  if (!currentRole) {
    document.getElementById("role-not-found").hidden = false;
    return;
  }

  document.getElementById("apply-content").hidden = false;
  populateRoleContent(currentRole);
  populateProjectDropdown();
  populateOfferAndValues();
  wireVolunteerInfoButtons();
  wireForm();
  document.getElementById("formStartedAt").value = new Date().toISOString();
  newCaptcha();
});

function populateRoleContent(role) {
  document.getElementById("page-title").textContent = `${role.title} - Star Studios`;
  document.getElementById("role-title").textContent = role.title;
  document.getElementById("role-type-pill").textContent = role.type;
  document.getElementById("role-status-label").innerHTML = formatVolunteerPlus(role.status);

  document.getElementById("about-text").textContent = STUDIO_ABOUT;
  document.getElementById("role-summary").textContent = role.summary;

  fillList("duties-list", role.duties);
  fillList("universal-requirements-list", UNIVERSAL_REQUIREMENTS);
  fillList("requirements-list", role.requirements);

  if (role.software && role.software.length) {
    document.getElementById("software-block").hidden = false;
    fillList("software-list", role.software);
  } else {
    document.getElementById("software-block").hidden = true;
  }

  fillList("bonus-list", role.bonus);
  document.getElementById("apply-inclusivity").textContent = INCLUSIVITY_STATEMENT;
}

function formatVolunteerPlus(status) {
  return status === "Volunteer+"
    ? 'Volunteer<span class="vp-plus">+</span>'
    : escapeHtml(status);
}

function fillList(id, items) {
  const el = document.getElementById(id);
  el.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
}

function populateProjectDropdown() {
  const select = document.getElementById("project");
  PROJECTS.forEach(project => {
    const opt = document.createElement("option");
    opt.value = project.id;
    opt.textContent = project.name;
    select.appendChild(opt);
  });
}

function setSubmissionLogo(projectId) {
  const submissionLogo = document.querySelector(".submission-logo");
  const project = PROJECTS.find(item => item.id === projectId);
  submissionLogo.classList.toggle("submission-logo--spinning", !project || Boolean(project.useFavicon));
  submissionLogo.src = project && project.loadingIcon
    ? `gifs/${project.loadingIcon}`
    : "../../favicon.png";
}

function populateOfferAndValues() {
  document.getElementById("apply-offer-grid").innerHTML = OFFER_ITEMS.map(item => `
    <div class="offer-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div>
  `).join("");
  document.getElementById("apply-values-grid").innerHTML = VALUES_ITEMS.map(item => `
    <div class="value-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div>
  `).join("");
}

function wireVolunteerInfoButtons() {
  document.getElementById("vp-info-btn").addEventListener("click", openVolunteerModal);
  document.getElementById("confirm-what-is-vp").addEventListener("click", openVolunteerModal);
  document.getElementById("payment-vp-info").addEventListener("click", openVolunteerModal);
}

/* ------------------------------------------------------------
   Captcha - a simple arithmetic challenge. No external service
   required. Swap in reCAPTCHA/hCaptcha here if you have keys.
   ------------------------------------------------------------ */
function newCaptcha() {
  const challengeType = Math.floor(Math.random() * 3);
  let a;
  let b;
  let operator;

  if (challengeType === 0) {
    a = Math.floor(Math.random() * 11) + 4;
    b = Math.floor(Math.random() * 11) + 4;
    operator = "+";
    captchaExpected = a + b;
  } else if (challengeType === 1) {
    b = Math.floor(Math.random() * 9) + 2;
    a = b + Math.floor(Math.random() * 12) + 4;
    operator = "-";
    captchaExpected = a - b;
  } else {
    a = Math.floor(Math.random() * 7) + 3;
    b = Math.floor(Math.random() * 7) + 3;
    operator = "×";
    captchaExpected = a * b;
  }

  document.getElementById("captchaQuestion").textContent = `What is ${a} ${operator} ${b}?`;
  document.getElementById("captchaAnswer").value = "";
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submission-close")?.addEventListener("click", closeSubmittingModal);
  const refreshBtn = document.getElementById("captchaRefresh");
  if (refreshBtn) refreshBtn.addEventListener("click", newCaptcha);
});

/* ------------------------------------------------------------
   Portfolio validation - reject Google Drive links, accept
   everything else including Google Sites.
   ------------------------------------------------------------ */
function isGoogleDriveLink(url) {
  return /(^|\.)drive\.google\.com/i.test(url) || /docs\.google\.com\/(uc|file)/i.test(url);
}

function wireForm() {
  const form = document.getElementById("application-form");
  const portfolioInput = document.getElementById("portfolio");
  const portfolioError = document.getElementById("portfolio-error");
  const resumeInput = document.getElementById("resume");
  const resumeError = document.getElementById("resume-error");
  const phoneInput = document.getElementById("phone");

  portfolioInput.addEventListener("input", () => {
    portfolioError.textContent = "";
    portfolioInput.closest(".form-field").classList.remove("field-invalid");
  });

  resumeInput.addEventListener("change", () => {
    resumeError.textContent = "";
    resumeInput.closest(".form-field").classList.remove("field-invalid");
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhoneNumber(phoneInput.value);
  });
  phoneInput.addEventListener("change", () => {
    phoneInput.value = formatPhoneNumber(phoneInput.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    openConfirmModal();
  });

  document.getElementById("confirm-cancel").addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-modal-close").addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-submit").addEventListener("click", () => {
    closeConfirmModal();
    submitApplication(form);
  });
}

function validateForm(form) {
  let valid = form.reportValidity();

  // Portfolio: reject Google Drive links specifically, with a clear message.
  const portfolioInput = document.getElementById("portfolio");
  const portfolioError = document.getElementById("portfolio-error");
  const portfolioVal = portfolioInput.value.trim();
  if (portfolioVal && isGoogleDriveLink(portfolioVal)) {
    portfolioError.textContent = "Please provide a portfolio website or publicly accessible portfolio page instead of a Google Drive link.";
    portfolioInput.closest(".form-field").classList.add("field-invalid");
    portfolioInput.focus();
    valid = false;
  }

  const resumeInput = document.getElementById("resume");
  const resumeError = document.getElementById("resume-error");
  const resumeFile = resumeInput.files[0];
  if (resumeFile && resumeFile.size > MAX_RESUME_FILE_SIZE) {
    resumeError.textContent = "Your resume must be 10 MB or smaller.";
    resumeInput.closest(".form-field").classList.add("field-invalid");
    resumeInput.focus();
    valid = false;
  } else {
    resumeError.textContent = "";
  }

  // Captcha
  const captchaError = document.getElementById("captcha-error");
  const captchaVal = parseInt(document.getElementById("captchaAnswer").value, 10);
  if (captchaVal !== captchaExpected) {
    captchaError.textContent = "That answer doesn't look right. Please try again.";
    newCaptcha();
    valid = false;
  } else {
    captchaError.textContent = "";
  }

  return valid;
}

function openConfirmModal() {
  const overlay = document.getElementById("confirm-modal");
  overlay.classList.add("vp-modal-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  const overlay = document.getElementById("confirm-modal");
  overlay.classList.remove("vp-modal-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openSubmittingModal() {
  const overlay = document.getElementById("submission-overlay");
  document.getElementById("submission-title").textContent = "Please wait";
  document.getElementById("submission-message").textContent = "Submitting your application...";
  document.getElementById("submission-close").hidden = true;
  document.querySelector(".topnav").inert = true;
  document.querySelector(".apply-container").inert = true;
  overlay.classList.add("submission-overlay--open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  overlay.focus();
}

function showSubmittedModal() {
  document.getElementById("submission-title").textContent = "Application submitted";
  document.getElementById("submission-message").textContent = "Thank you. Check your email for confirmation.";
  document.querySelector(".submission-logo").classList.remove("submission-logo--spinning");
  const closeButton = document.getElementById("submission-close");
  closeButton.hidden = false;
  closeButton.focus();
}

function closeSubmittingModal() {
  const overlay = document.getElementById("submission-overlay");
  document.querySelector(".topnav").inert = false;
  document.querySelector(".apply-container").inert = false;
  overlay.classList.remove("submission-overlay--open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ------------------------------------------------------------
   Submission
   ------------------------------------------------------------ */
async function submitApplication(form) {
  const statusEl = document.getElementById("form-status");
  const submitBtn = form.querySelector(".apply-submit-btn");
  submitBtn.disabled = true;
  statusEl.className = "form-status is-pending";
  statusEl.textContent = "Submitting your application…";
  setSubmissionLogo(document.getElementById("project").value);
  openSubmittingModal();
  let submissionSucceeded = false;

  try {
    const data = new FormData(form);
    const resumeFile = document.getElementById("resume").files[0];
    const resumeBase64 = resumeFile ? await fileToBase64(resumeFile) : null;

    const payload = {
      position: currentRole.title,
      roleSlug: currentRoleSlug,
      project: projectNameFromId(data.get("project")),
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      email: data.get("email"),
      discord: data.get("discord"),
      phone: data.get("phone") || "",
      continent: data.get("continent"),
      hasExperience: data.get("hasExperience"),
      largeTeam: data.get("largeTeam"),
      previousProductions: data.get("previousProductions") || "",
      managedMultiple: data.get("managedMultiple"),
      device: data.get("device"),
      portfolio: data.get("portfolio"),
      portfolioAccess: data.get("portfolioAccess") || "",
      paymentMethod: data.get("paymentMethod"),
      hearAboutUs: data.get("hearAboutUs") || "",
      website: data.get("website") || "",
      formStartedAt: data.get("formStartedAt"),
      resumeFileName: resumeFile ? resumeFile.name : "",
      resumeMimeType: resumeFile ? resumeFile.type : "",
      resumeBase64: resumeBase64,
      submittedAt: new Date().toISOString()
    };

    if (!CAREERS_CONFIG.SUBMIT_URL || CAREERS_CONFIG.SUBMIT_URL.startsWith("PASTE_")) {
      throw new Error("NOT_CONFIGURED");
    }

    const res = await fetch(CAREERS_CONFIG.SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight against Apps Script
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok || !result.ok) throw new Error(result.error || "BAD_RESPONSE");

    statusEl.className = "form-status is-success";
    statusEl.textContent = "Application received. Thank you! Check your email for confirmation.";
    form.reset();
    newCaptcha();
    submissionSucceeded = true;
    showSubmittedModal();
  } catch (err) {
    submitBtn.disabled = false;
    statusEl.className = "form-status is-error";
    if (err.message === "NOT_CONFIGURED") {
      statusEl.textContent = "Submissions aren't connected yet. Set CAREERS_CONFIG.SUBMIT_URL in careers/js/careers-common.js.";
    } else if (err.message.includes("Resume files must be 10 MB or smaller.")) {
      statusEl.textContent = "Your resume must be 10 MB or smaller.";
    } else if (err.message.includes("Please complete the form before submitting.")) {
      statusEl.textContent = "Please take a moment to complete the form before submitting.";
    } else if (err.message.includes("Please wait one minute before submitting another application.")) {
      statusEl.textContent = "Please wait one minute before submitting another application.";
    } else if (err.message.includes("Please enter a valid email address.")) {
      statusEl.textContent = "Please enter a valid email address.";
    } else if (err.message.includes("already applied for this role")) {
      statusEl.textContent = err.message.replace(/^Error:\s*/, "");
    } else {
      statusEl.textContent = "Something went wrong sending your application. Please try again or email us directly.";
    }
  } finally {
    if (!submissionSucceeded) closeSubmittingModal();
  }
}

function formatPhoneNumber(value) {
  const hasPlus = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "");
  if (!digits) return hasPlus ? "+" : "";

  const countryPrefix = hasPlus ? "+" : "";
  if (digits.length <= 10) {
    if (digits.length <= 3) return `${countryPrefix}${digits}`;
    if (digits.length <= 6) return `${countryPrefix}${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${countryPrefix}${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `${countryPrefix}1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  const groups = digits.match(/.{1,3}/g) || [];
  return `${countryPrefix}${groups.join(" ")}`;
}

function projectNameFromId(id) {
  const match = PROJECTS.find(p => p.id === id);
  return match ? match.name : id;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("FILE_READ_ERROR"));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
