import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "protogrid.studio@gmail.com";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function send(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) return; // silently skip if not configured
  try {
    await transporter.sendMail({
      from: `"ProtoGrid" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email]", err);
  }
}

function base(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #1e2028; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .brand { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #e8e9ed; margin-bottom: 32px; text-decoration: none; display: block; }
  .box { border: 1px solid rgba(120,120,180,0.2); border-radius: 2px; padding: 28px 28px; margin-bottom: 24px; }
  h1 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #e8e9ed; letter-spacing: -0.01em; }
  p { margin: 0 0 12px; font-size: 14px; line-height: 1.65; color: #9192a8; }
  .label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #5a5b7a; margin-bottom: 4px; }
  .value { font-size: 14px; color: #c8c9d8; margin-bottom: 16px; }
  .badge { display: inline-block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #5a5b7a; border: 1px solid rgba(90,91,122,0.4); border-radius: 999px; padding: 3px 10px; margin-bottom: 16px; }
  .btn { display: inline-block; background: #e8e9ed; color: #1e2028; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; padding: 10px 20px; border-radius: 2px; font-weight: 600; margin-top: 8px; }
  .footer { font-size: 11px; color: #3e3f55; margin-top: 32px; }
  .divider { border: none; border-top: 1px solid rgba(90,91,122,0.2); margin: 20px 0; }
</style>
</head>
<body>
<div class="wrap">
  <a class="brand" href="https://protogrid.no">PROTOGRID</a>
  ${content}
  <p class="footer">ProtoGrid · Engineering &amp; Fabrication Studio · protogrid.no</p>
</div>
</body>
</html>`;
}

// ─── Notifications ──────────────────────────────────────────────

/** New request submitted → notify admin */
export async function notifyAdminNewRequest(opts: {
  name: string;
  email: string;
  title?: string | null;
  message: string;
  requestId: string;
}) {
  const subject = `New request${opts.title ? `: ${opts.title}` : ""} — ${opts.name}`;
  const html = base(`
    <div class="box">
      <h1>New request received</h1>
      <hr class="divider">
      ${opts.title ? `<p class="label">Title</p><p class="value">${opts.title}</p>` : ""}
      <p class="label">From</p>
      <p class="value">${opts.name} &lt;${opts.email}&gt;</p>
      <p class="label">Task</p>
      <p class="value" style="white-space:pre-line">${opts.message}</p>
      <a class="btn" href="https://protogrid.no/admin/requests/${opts.requestId}">Open request →</a>
    </div>
  `);
  await send(ADMIN_EMAIL, subject, html);
}

/** Client sends a message → notify admin */
export async function notifyAdminNewMessage(opts: {
  name: string;
  email: string;
  title?: string | null;
  body: string;
  requestId: string;
}) {
  const subject = `New message from ${opts.name}${opts.title ? ` — ${opts.title}` : ""}`;
  const html = base(`
    <div class="box">
      <h1>New message from client</h1>
      <hr class="divider">
      <p class="label">From</p>
      <p class="value">${opts.name} &lt;${opts.email}&gt;</p>
      ${opts.title ? `<p class="label">Request</p><p class="value">${opts.title}</p>` : ""}
      <p class="label">Message</p>
      <p class="value" style="white-space:pre-line">${opts.body}</p>
      <a class="btn" href="https://protogrid.no/admin/requests/${opts.requestId}">View conversation →</a>
    </div>
  `);
  await send(ADMIN_EMAIL, subject, html);
}

/** Admin sends a message → notify client */
export async function notifyClientNewMessage(opts: {
  to: string;
  clientName: string;
  title?: string | null;
  body: string;
  requestId: string;
}) {
  const subject = `ProtoGrid replied to your request${opts.title ? `: ${opts.title}` : ""}`;
  const html = base(`
    <div class="box">
      <h1>You have a new reply</h1>
      <p>Hi ${opts.clientName}, ProtoGrid has sent you a message regarding your request.</p>
      <hr class="divider">
      ${opts.title ? `<p class="label">Request</p><p class="value">${opts.title}</p>` : ""}
      <p class="label">Message</p>
      <p class="value" style="white-space:pre-line">${opts.body}</p>
      <a class="btn" href="https://protogrid.no/account/requests/${opts.requestId}">View &amp; reply →</a>
    </div>
  `);
  await send(opts.to, subject, html);
}

/** Admin updates request status → notify client */
export async function notifyClientStatusChange(opts: {
  to: string;
  clientName: string;
  title?: string | null;
  status: string;
  requestId: string;
}) {
  const STATUS_LABEL: Record<string, string> = {
    IN_REVIEW: "In Review — we are looking at your request",
    ACCEPTED:  "Accepted — work is starting",
    REJECTED:  "Rejected — see the message thread for details",
    DONE:      "Done — your order is complete",
  };
  const label = STATUS_LABEL[opts.status];
  if (!label) return; // don't notify for NEW or unknown statuses

  const subject = `Your request${opts.title ? ` "${opts.title}"` : ""} is now: ${label.split(" — ")[0]}`;
  const html = base(`
    <div class="box">
      <h1>Request status update</h1>
      <p>Hi ${opts.clientName}, the status of your request has been updated.</p>
      <hr class="divider">
      ${opts.title ? `<p class="label">Request</p><p class="value">${opts.title}</p>` : ""}
      <p class="label">New status</p>
      <span class="badge">${label}</span>
      <br>
      <a class="btn" href="https://protogrid.no/account/requests/${opts.requestId}">View request →</a>
    </div>
  `);
  await send(opts.to, subject, html);
}
