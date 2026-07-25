# Star Studios - Careers & Applications System

## What's here

```
index.html                  ← homepage (nav now links to careers/)
careers/
  index.html                ← careers listing page (all open positions)
  careers.css                ← shared careers styling (cards, modal, offer/values grids)
  js/
    careers-data.js          ← ALL role + project content lives here. Add a role
                                or project once, and it appears everywhere.
    careers-common.js        ← Volunteer+ modal + CAREERS_CONFIG (backend URL)
    careers-list.js           ← renders the listing page from careers-data.js
  apply/
    index.html                ← shared application page template (one page, all roles)
    apply.css                 ← form + role-content styling
    apply.js                   ← reads ?role=... from the URL, populates the page,
                                 validates the form, and submits to the backend
backend/
  Code.gs                     ← Google Apps Script: Sheet logging + emails
```

Every open position lives at `careers/apply/?role=<slug>` - e.g.
`careers/apply/?role=animatic-editor`. The listing page builds these links
automatically from `careers-data.js`, so adding a new role is just adding
one entry to the `ROLES` object - no new pages or design work needed.

## Adding or editing a role

Open `careers/js/careers-data.js` and add an entry to `ROLES`:

```js
"my-new-role": {
  title: "My New Role",
  tag: "Category",
  type: "Remote",
  status: "Volunteer+",
  summary: "...",
  duties: ["...", "..."],
  requirements: ["...", "..."],
  software: ["...", "..."],   // omit or leave empty if not applicable
  bonus: ["...", "..."]
}
```

It'll immediately show up as a card on the careers page and get its own
application page at `careers/apply/?role=my-new-role`.

## Adding a project to the dropdown

Add an entry to the `PROJECTS` array in the same file. It shows up in the
"Which project would you like to work on?" dropdown on every application
page automatically.

## Connecting Google Sheets + email notifications

The frontend is ready to submit applications, but it needs a backend
endpoint to actually deliver them, since a static site can't write to a
Google Sheet or send email on its own.

1. Create a new Google Sheet.
2. In it, go to **Extensions ▸ Apps Script**, delete the placeholder code,
   and paste in `backend/Code.gs`.
3. In the script, update `STUDIO_EMAIL` to your team's inbox.
4. Run the `setupSheet` function once (top toolbar ▸ select `setupSheet` ▸
   ▶ Run). This safely creates or updates the formatted header row and the
   automatic email trigger without deleting existing applications. You'll be
   asked to authorize the script the first time - that's expected.
5. **Deploy ▸ New deployment ▸ Web app.**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the resulting Web app URL.
7. Paste it into `careers/js/careers-common.js` as `CAREERS_CONFIG.SUBMIT_URL`.

Until that URL is set, the form will validate and run through the
confirmation modal, but will show a message that submissions aren't
connected yet instead of silently failing.

Each submission will:
- Append a row to the "Applications" sheet (frozen header, banded rows,
  wrapped/auto-sized columns, timestamped).
- Upload the resume to a Drive folder named "Star Studios - Applicant
  Resumes" and store a link (not the raw file) in the sheet/email, since
  Apps Script emails work best with links for larger files.
- Email the applicant a short confirmation.
- Email the studio the full application, including the resume link.

Whenever you edit `Code.gs`, redeploy via **Deploy ▸ Manage deployments ▸
Edit ▸ New version** - the same URL keeps working.

## Reviewing applications and sending decision emails

The Applications sheet includes status, decision reason, email-sent, and
reviewer-notes columns. After pasting the latest `Code.gs`, reload the Google
Sheet and use the **Applications** menu:

1. Run **Upgrade application sheet** once to add the review columns without
   clearing existing applicants.
2. Select an applicant row and choose a status: Accepted, Waitlist, or
   Declined.
3. Choose a decision reason when appropriate.
4. Select **Send decision email for selected row** from the same menu.

The script sends one email and timestamps the Decision Email Sent column to
prevent accidental duplicates.

## Human verification

The form uses a simple arithmetic captcha (no external service or API key
needed). If you'd rather use reCAPTCHA or hCaptcha, swap the captcha
section in `careers/apply/index.html` and the `newCaptcha`/`validateForm`
functions in `apply.js`.

## One thing worth double-checking

The homepage links to `pibby.png` (lowercase) but the uploaded file is
named `Pibby.png`. That's unrelated to the careers system, but worth
renaming or fixing the reference if the image isn't showing up on the
homepage.
