# Application Email Automation Guide

This system lets directors review applications in Google Sheets and send clear
status updates with minimal manual work.

## One-time setup

1. Open the Google Sheet that contains the `Applications` tab.
2. Open Extensions > Apps Script and paste in the latest `backend/Code.gs`.
3. Save the script, then reload the Google Sheet.
4. Run `setupSheet` once from Apps Script, or choose **Applications > Upgrade
   application sheet**. This adds the review columns, dropdowns, and automatic
   email trigger without deleting current applications. Approve the Google
   permissions when asked.
5. Deploy a new Web App version so new website submissions include all current
   fields and safeguards.

## Director workflow

For each applicant, use the columns at the right side of the Applications tab:

| Column | What to do |
| --- | --- |
| Application Status | Choose New, Reviewing, Interview, Accepted, Waitlist, or Declined. |
| Decision Reason | Choose a reason before selecting a final status when appropriate. |
| Decision Email Sent | Filled automatically after a notification is sent. |
| Reviewer Notes | Add internal notes for the team. This is never emailed. |

Set the decision reason first, then select the final status. The system sends
an applicant email automatically for these statuses:

| Status | Applicant message | Row color |
| --- | --- | --- |
| Interview | They will be contacted in Discord for a group chat interview. | Light yellow |
| Accepted | The team will contact them with next steps. | Light green |
| Waitlist | Their application is being kept for a suitable opening. | Light blue |
| Declined | A respectful decline with the selected reason, if one was chosen. | Light red |

New and Reviewing do not email the applicant.

## Duplicate protection

The system records the status and timestamp in `Decision Email Sent`. Changing
a row to the same status again does not send a duplicate email. Changing it to
a different final status can send the appropriate updated message.

## Manual send option

If a director prefers to review the row one final time, select the applicant
row and choose **Applications > Send decision email for selected row**. This
uses the same duplicate protection.

## New-application notifications

Set `STUDIO_EMAIL` in `backend/Code.gs` to the director inbox or group inbox.
Every newly submitted application is emailed there, with the resume Drive link.
Uploaded resumes are saved in the `Star Studios - Applicant Resumes` Drive
folder and shared as **Anyone with the link can view**.
