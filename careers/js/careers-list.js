/* ============================================================
   Star Studios - Careers listing page renderer
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("careers-about").textContent = STUDIO_ABOUT;

  renderCareerCards();
  renderOfferGrid();
  renderValuesGrid();
  renderInclusivity();
});

function renderCareerCards() {
  const list = document.getElementById("careers-list");
  list.innerHTML = "";

  Object.entries(ROLES).forEach(([slug, role]) => {
    const card = document.createElement("article");
    card.className = "career-card" + (role.general ? " career-card--general" : "");

    card.innerHTML = `
      <div class="career-card-header">
        <span class="career-card-tag">${escapeHtml(role.tag)}</span>
        <span class="career-card-type">${escapeHtml(role.type)}</span>
      </div>
      <h3>${escapeHtml(role.title)}</h3>
      <p>${escapeHtml(role.summary)}</p>
      <div class="career-card-footer">
        <span class="status-pill">
          ${formatVolunteerPlus(role.status)}
          <button type="button" class="info-btn" aria-label="What is Volunteer+?" data-vp-info>ⓘ</button>
        </span>
        <a class="apply-btn" href="apply/?role=${encodeURIComponent(slug)}">Apply ›</a>
      </div>
    `;

    card.querySelector("[data-vp-info]").addEventListener("click", (e) => {
      e.stopPropagation();
      openVolunteerModal();
    });

    list.appendChild(card);
  });
}

function formatVolunteerPlus(status) {
  return status === "Volunteer+"
    ? 'Volunteer<span class="vp-plus">+</span>'
    : escapeHtml(status);
}

function renderOfferGrid() {
  const grid = document.getElementById("offer-grid");
  grid.innerHTML = OFFER_ITEMS.map(item => `
    <div class="offer-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
    </div>
  `).join("");
}

function renderValuesGrid() {
  const grid = document.getElementById("values-grid");
  grid.innerHTML = VALUES_ITEMS.map(item => `
    <div class="value-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
    </div>
  `).join("");
}

function renderInclusivity() {
  document.getElementById("inclusivity-block").textContent = INCLUSIVITY_STATEMENT;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
