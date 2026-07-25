/* ============================================================
   Star Studios - Careers shared config
   ============================================================ */

const CAREERS_CONFIG = {
  /* Paste the URL you get after deploying the Google Apps Script
     web app from /backend/Code.gs. Leave as-is until then -
     the form will tell users submissions aren't connected yet. */
  SUBMIT_URL: "https://script.google.com/macros/s/AKfycbzezpuXsevG0-w2B3n4qshJI8Pm2PHYgZZ0tCYVeRcdUptm3QmIiLmgE0248efhwgx-Hg/exec"
};

/* Builds and wires up the "What is Volunteer+?" modal.
   Call ensureVolunteerModal() once per page, then
   openVolunteerModal() from any info button. */
function ensureVolunteerModal() {
  if (document.getElementById("volunteer-modal")) return;

  const overlay = document.createElement("div");
  overlay.id = "volunteer-modal";
  overlay.className = "vp-modal-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="vp-modal" role="dialog" aria-modal="true" aria-labelledby="vp-modal-title">
      <button type="button" class="vp-modal-close" aria-label="Close">&times;</button>
      <h2 id="vp-modal-title">Volunteer<span class="vp-plus">+</span></h2>
      <div class="vp-modal-body">${VOLUNTEER_PLUS_HTML}</div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeVolunteerModal();
  });
  overlay.querySelector(".vp-modal-close").addEventListener("click", closeVolunteerModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVolunteerModal();
  });
}

function openVolunteerModal() {
  ensureVolunteerModal();
  const overlay = document.getElementById("volunteer-modal");
  overlay.classList.add("vp-modal-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVolunteerModal() {
  const overlay = document.getElementById("volunteer-modal");
  if (!overlay) return;
  overlay.classList.remove("vp-modal-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
