import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const lead = req.body;

    // Build email attachments from any photos that were provided.
    // Photos arrive from the browser as base64 data URLs (see fileToBase64
    // in TownPage.jsx) — Resend wants just the raw base64 content, not the
    // "data:image/jpeg;base64," prefix, so that gets stripped here.
    const attachments = [];
    for (const type of ["front", "dashboard", "damage"]) {
      const dataUrl = lead.photos?.[type];
      if (dataUrl) {
        attachments.push({
          filename: `${type}.jpg`,
          content: dataUrl.split(",")[1] || "",
        });
      }
    }

    const conditionFlags = Object.entries(lead.condition || {})
      .filter(([, checked]) => checked)
      .map(([key]) =>
        ({
          light: "Warning light on",
          service: "Full service history",
          mot: "MOT valid",
          smoker: "Non-smoker car",
          keys: "2 sets of keys",
        }[key] || key)
      );

    const html = `
      <h2 style="font-family: sans-serif;">New lead — ${escapeHtml(lead.town || "")}</h2>
      <table style="font-family: sans-serif; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding:4px 12px 4px 0;"><strong>Vehicle</strong></td><td>${escapeHtml(lead.make || "")} ${escapeHtml(lead.model || "")} (${escapeHtml(String(lead.year || ""))})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Mileage</strong></td><td>${lead.mileage ? escapeHtml(String(lead.mileage)) : "Not typed in — check dashboard photo attached"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Condition notes</strong></td><td>${conditionFlags.length ? escapeHtml(conditionFlags.join(", ")) : "None flagged"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Timing</strong></td><td>${escapeHtml(lead.urgency || "Not specified")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Name</strong></td><td>${escapeHtml(lead.name || "")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Mobile</strong></td><td>${escapeHtml(lead.phone || "")}</td></tr>
      </table>
      <p style="font-family: sans-serif; font-size: 13px; color: #666;">
        ${attachments.length} photo(s) attached.
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.LEAD_FROM_EMAIL || "Sell Car Essex <onboarding@resend.dev>",
      to: (process.env.DEALER_EMAIL || "").split(",").map((e) => e.trim()).filter(Boolean),
      subject: `New lead: ${lead.make || "Unknown"} ${lead.model || ""} — ${lead.town || "Essex"}`,
      html,
      attachments,
    });

    if (error) {
      // The Resend SDK does NOT throw on API-level failures (e.g. unverified
      // domain, sandbox restrictions) — it returns them here instead. Without
      // this check, a failed send looks identical to a successful one.
      console.error("Resend rejected the email:", error);
      return res.status(500).json({ error: error.message || "Resend rejected the email" });
    }

    res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("Lead email failed:", err);
    res.status(500).json({ error: "Failed to send lead email" });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
