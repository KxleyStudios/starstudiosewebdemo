/**
 * Star Studios - Careers application backend
 * ---------------------------------------------------------
 * Deploy this as a Google Apps Script Web App and paste the
 * resulting URL into careers/js/careers-common.js
 * (CAREERS_CONFIG.SUBMIT_URL).
 *
 * SETUP
 * 1. Create a new Google Sheet. Note its name doesn't matter.
 * 2. In the Sheet, go to Extensions ▸ Apps Script.
 * 3. Delete the placeholder code and paste this whole file.
 * 4. Update STUDIO_EMAIL and RESUME_FOLDER_NAME below.
 * 5. Run `setupSheet` once from the Apps Script editor
 *    (Run ▸ setupSheet) to create the header row and formatting.
 *    The first run will ask you to authorize the script.
 * 6. Deploy ▸ New deployment ▸ type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 7. Copy the Web app URL into CAREERS_CONFIG.SUBMIT_URL.
 * 8. Whenever you edit this script, redeploy (Deploy ▸ Manage
 *    deployments ▸ Edit ▸ New version) - the URL stays the same.
 * ---------------------------------------------------------
 */

const STUDIO_EMAIL = "contact@starstudiosproductionco.com"; // where full applications go
const RESUME_FOLDER_NAME = "Star Studios - Applicant Resumes";
const SHEET_NAME = "Applications";
const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
const STATUS_OPTIONS = ["New", "Reviewing", "Interview", "Accepted", "Waitlist", "Declined"];
const EMAIL_NOTIFICATION_STATUSES = ["Interview", "Accepted", "Waitlist", "Declined"];
const MIN_SUBMISSION_TIME_MS = 3000;
const SUBMISSION_COOLDOWN_SECONDS = 60;
const DECISION_REASONS = [
  "Role experience did not match this opening",
  "Portfolio was not the right fit for this project",
  "Position has been filled",
  "Keeping your application for future opportunities"
];

const COLUMNS = [
  "Timestamp",
  "Position Applied For",
  "Project Selected",
  "First Name",
  "Last Name",
  "Email",
  "Discord Username",
  "Phone Number",
  "Continent",
  "Experience (Yes/No)",
  "Large Team Experience",
  "Previous Productions",
  "Managed Multiple Projects",
  "Device",
  "Portfolio",
  "Preferred Payment Method",
  "Resume Link",
  "How They Heard About Us",
  "Application Status",
  "Decision Reason",
  "Decision Email Sent",
  "Reviewer Notes"
];

/** Safe setup for new or existing sheets. It never clears applicant rows. */
function setupSheet() {
  upgradeApplicationSheet();
}

/** Adds review columns and dropdowns without clearing existing applications. */
function upgradeApplicationSheet() {
  const sheet = getSheet_();
  const existingHeaders = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];

  COLUMNS.forEach(header => {
    if (!existingHeaders.includes(header)) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      existingHeaders.push(header);
    }
  });

  sheet.setFrozenRows(1);
  const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#7B2CBF");
  headerRange.setFontColor("#FFFFFF");
  sheet.setColumnWidths(1, COLUMNS.length, 180);
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), COLUMNS.length).setWrap(true);
  configureDecisionColumns_(sheet);
  configureStatusFormatting_(sheet);
  applyBandedRows_(sheet);
  ensureApplicationAutomation_();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Applications")
    .addItem("Upgrade application sheet", "upgradeApplicationSheet")
    .addItem("Set up automatic status emails", "installApplicationAutomation")
    .addItem("Send decision email for selected row", "sendDecisionEmailForActiveRow")
    .addToUi();
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    validateSubmission_(data);
    const resumeUrl = saveResume_(data);
    appendRow_(data, resumeUrl);
    sendApplicantEmail_(data);
    sendStudioEmail_(data, resumeUrl);
    markSubmission_(data);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function validateSubmission_(data) {
  if (data.website) throw new Error("Invalid submission.");

  const startedAt = new Date(data.formStartedAt || 0).getTime();
  if (!startedAt || Date.now() - startedAt < MIN_SUBMISSION_TIME_MS) {
    throw new Error("Please complete the form before submitting.");
  }

  const email = String(data.email || "").trim().toLowerCase();
  if (!isValidEmail_(email)) throw new Error("Please enter a valid email address.");
  const cache = CacheService.getScriptCache();
  const key = `application:${Utilities.base64EncodeWebSafe(email)}`;
  if (cache.get(key)) throw new Error("Please wait one minute before submitting another application.");
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function markSubmission_(data) {
  const email = String(data.email || "").trim().toLowerCase();
  if (!email) return;
  const key = `application:${Utilities.base64EncodeWebSafe(email)}`;
  CacheService.getScriptCache().put(key, "1", SUBMISSION_COOLDOWN_SECONDS);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function appendRow_(data, resumeUrl) {
  const sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    data.position || "",
    data.project || "",
    data.firstName || "",
    data.lastName || "",
    data.email || "",
    data.discord || "",
    data.phone || "",
    data.continent || "",
    data.hasExperience || "",
    data.largeTeam || "",
    data.previousProductions || "",
    data.managedMultiple || "",
    data.device || "",
    data.portfolio || "",
    data.paymentMethod || "",
    resumeUrl || "",
    data.hearAboutUs || "",
    "New",
    "",
    "",
    ""
  ]);
  sheet.autoResizeColumns(1, COLUMNS.length);
  applyBandedRows_(sheet);
}

/** Alternating row colors, reapplied after each append. */
function applyBandedRows_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const banding = sheet.getBandings();
  banding.forEach(b => b.remove());
  if (lastRow <= 1) return;

  const range = sheet.getRange(2, 1, lastRow - 1, COLUMNS.length);
  range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
}

function configureDecisionColumns_(sheet) {
  const headerIndexes = getHeaderIndexes_(sheet);
  const rows = Math.max(sheet.getMaxRows() - 1, 1);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_OPTIONS, true)
    .setAllowInvalid(false)
    .build();
  const reasonRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(DECISION_REASONS, true)
    .setAllowInvalid(false)
    .build();

  ["Application Status", "Decision Reason", "Decision Email Sent", "Reviewer Notes"].forEach(header => {
    sheet.getRange(2, headerIndexes[header], rows, 1).clearDataValidations();
  });
  sheet.getRange(2, headerIndexes["Application Status"], rows, 1).setDataValidation(statusRule);
  sheet.getRange(2, headerIndexes["Decision Reason"], rows, 1).setDataValidation(reasonRule);
}

function configureStatusFormatting_(sheet) {
  const headerIndexes = getHeaderIndexes_(sheet);
  const statusColumn = columnLetter_(headerIndexes["Application Status"]);
  const rowRange = sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), COLUMNS.length);
  const managedPrefix = `=$${statusColumn}2=`;
  const existingRules = sheet.getConditionalFormatRules().filter(rule => {
    const criteria = rule.getBooleanCondition();
    const formula = criteria && criteria.getCriteriaValues()[0];
    return !(typeof formula === "string" && formula.startsWith(managedPrefix));
  });
  const colors = {
    Accepted: "#D9EAD3",
    Declined: "#F4CCCC",
    Waitlist: "#CFE2F3",
    Interview: "#FFF2CC"
  };
  const statusRules = Object.entries(colors).map(([status, color]) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=$${statusColumn}2=\"${status}\"`)
      .setBackground(color)
      .setRanges([rowRange])
      .build()
  );
  sheet.setConditionalFormatRules(existingRules.concat(statusRules));
}

function columnLetter_(columnNumber) {
  let result = "";
  let current = columnNumber;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function getHeaderIndexes_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.reduce((indexes, header, index) => {
    indexes[header] = index + 1;
    return indexes;
  }, {});
}

function installApplicationAutomation() {
  ensureApplicationAutomation_();
  SpreadsheetApp.getUi().alert("Automatic status emails are ready.");
}

function ensureApplicationAutomation_() {
  const triggers = ScriptApp.getProjectTriggers();
  const existingTrigger = triggers.find(trigger =>
    trigger.getHandlerFunction() === "handleApplicationStatusEdit"
  );
  if (!existingTrigger) {
    ScriptApp.newTrigger("handleApplicationStatusEdit")
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit()
      .create();
  }
}

function handleApplicationStatusEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME || e.range.getRow() === 1) return;

  const headerIndexes = getHeaderIndexes_(sheet);
  if (e.range.getColumn() !== headerIndexes["Application Status"]) return;
  sendDecisionEmailForRow_(sheet, e.range.getRow(), false);
}

/** Sends a reviewed decision email for the selected applicant row. */
function sendDecisionEmailForActiveRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  if (sheet.getName() !== SHEET_NAME || sheet.getActiveRange().getRow() === 1) {
    ui.alert("Select an applicant row in the Applications sheet first.");
    return;
  }

  sendDecisionEmailForRow_(sheet, sheet.getActiveRange().getRow(), true);
}

function sendDecisionEmailForRow_(sheet, row, showAlert) {
  const notify = message => {
    if (showAlert) SpreadsheetApp.getUi().alert(message);
  };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  const application = headers.reduce((result, header, index) => {
    result[header] = values[index];
    return result;
  }, {});
  const status = application["Application Status"];
  const sentAt = application["Decision Email Sent"];

  if (!application.Email) {
    notify("This applicant does not have an email address.");
    return;
  }
  if (!EMAIL_NOTIFICATION_STATUSES.includes(status)) {
    notify("Set the Application Status to Interview, Accepted, Waitlist, or Declined before sending an email.");
    return;
  }
  if (String(sentAt).startsWith(`${status}:`)) {
    notify(`A ${status.toLowerCase()} email has already been recorded for this applicant.`);
    return;
  }

  const firstName = application["First Name"] || "there";
  const role = application["Position Applied For"] || "the position";
  const reason = application["Decision Reason"];
  const message = decisionMessage_(status, role, reason);
  MailApp.sendEmail(application.Email, "Update on your Star Studios application", `Hi ${firstName},\n\n${message}\n\nThank you again for your interest in Star Studios.\n\nStar Studios Team`);

  const headerIndexes = getHeaderIndexes_(sheet);
  sheet.getRange(row, headerIndexes["Decision Email Sent"]).setValue(`${status}: ${new Date().toLocaleString()}`);
  notify(`${status} email sent.`);
}

function decisionMessage_(status, role, reason) {
  if (status === "Accepted") {
    return `We are pleased to let you know that we would like to move forward with you for the ${role} role. Our team will be in touch with next steps shortly.`;
  }
  if (status === "Waitlist") {
    return `Thank you for your application for the ${role} role. We are keeping your application on our waitlist and may reach out if an appropriate opportunity becomes available.`;
  }
  if (status === "Interview") {
    return `Thank you for your application for the ${role} role. We would like to invite you to a group chat interview. Our team will contact you through Discord with the details.`;
  }

  const reasonLine = reason ? ` ${reason}.` : "";
  return `Thank you for taking the time to apply for the ${role} role. After careful review, we have decided to move forward with other applicants for this opening.${reasonLine}`;
}

/** Saves the base64 resume to Drive and returns a shareable link. */
function saveResume_(data) {
  if (!data.resumeBase64 || !data.resumeFileName) return "";

  const folder = getOrCreateFolder_(RESUME_FOLDER_NAME);
  const bytes = Utilities.base64Decode(data.resumeBase64);
  if (bytes.length > MAX_RESUME_FILE_SIZE) {
    throw new Error("Resume files must be 10 MB or smaller.");
  }
  const blob = Utilities.newBlob(bytes, data.resumeMimeType || "application/octet-stream",
    `${data.lastName}_${data.firstName}_${data.resumeFileName}`);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function sendApplicantEmail_(data) {
  if (!data.email) return;
  const subject = `We received your application - ${data.position}`;
  const body = `Hi ${data.firstName},\n\n` +
    `Thanks for applying to Star Studios for the ${data.position} position! ` +
    `We've received your application and our team will review it shortly.\n\n` +
    `Position: ${data.position}\n` +
    `Project selected: ${data.project}\n\n` +
    `We'll be in touch via email or Discord (${data.discord}) if there's a fit. ` +
    `In the meantime, feel free to check out what we're up to at https://starstudiosproductionco.com.\n\n` +
    `The Star Studios Team`;
  MailApp.sendEmail(data.email, subject, body);
}

function sendStudioEmail_(data, resumeUrl) {
  const subject = `New application: ${data.position} - ${data.firstName} ${data.lastName}`;
  const lines = [
    `Position: ${data.position}`,
    `Project selected: ${data.project}`,
    ``,
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Discord: ${data.discord}`,
    `Phone: ${data.phone}`,
    `Continent: ${data.continent}`,
    ``,
    `3+ years experience: ${data.hasExperience}`,
    `Large team experience: ${data.largeTeam}`,
    `Previous productions/studios: ${data.previousProductions}`,
    `Managed multiple projects: ${data.managedMultiple}`,
    `Primary device(s): ${data.device}`,
    ``,
    `Portfolio: ${data.portfolio}`,
    `Preferred payment method: ${data.paymentMethod}`,
    `Resume: ${resumeUrl || "(not provided)"}`,
    `How they heard about us: ${data.hearAboutUs}`,
    ``,
    `Submitted: ${data.submittedAt}`
  ];
  MailApp.sendEmail(STUDIO_EMAIL, subject, lines.join("\n"));
}
