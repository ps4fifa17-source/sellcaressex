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

    const urgencyLabel = lead.urgency || "Not specified";
    const telHref = "tel:" + (lead.phone || "").replace(/[^\d+]/g, "");

    const html = buildEmailHtml({
      town: lead.town,
      make: lead.make,
      model: lead.model,
      year: lead.year,
      mileage: lead.mileage,
      conditionFlags,
      urgencyLabel,
      name: lead.name,
      phone: lead.phone,
      telHref,
      photoCount: attachments.length,
      source: lead.source || "Direct / not tagged",
    });

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

// Email design tokens — matching the site's palette (green/gold/paper),
// using web-safe font fallbacks since custom fonts don't render reliably
// across email clients (Gmail, Outlook, Apple Mail all differ).
const INK = "#1C1F1B";
const INK_SOFT = "#5B5D53";
const GREEN = "#173A2B";
const GREEN_DEEP = "#0E271C";
const GOLD = "#D3A02C";
const GOLD_BRIGHT = "#E6BC4F";
const PAPER = "#EAE6DA";
const PAPER_RAISED = "#F6F3EA";
const LINE = "#CBC4AF";

function buildEmailHtml({ town, make, model, year, mileage, conditionFlags, urgencyLabel, name, phone, telHref, photoCount, source }) {
  const row = (label, value) => `
    <tr>
      <td style="padding:9px 0; border-bottom:1px solid ${LINE}; font-family:Georgia,'Times New Roman',serif; font-size:13px; color:${INK_SOFT}; width:150px; vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:9px 0; border-bottom:1px solid ${LINE}; font-family:Georgia,'Times New Roman',serif; font-size:14px; color:${INK}; vertical-align:top;">${value}</td>
    </tr>`;

  return `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:${PAPER};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:${PAPER_RAISED}; border:1px solid ${INK};">

          <!-- MASTHEAD -->
          <tr>
            <td style="background:${GREEN_DEEP}; border-bottom:3px solid ${GOLD}; padding:22px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif; text-transform:uppercase; letter-spacing:2px; font-size:11px; font-weight:bold; color:${GOLD_BRIGHT};">SELL CAR ESSEX &middot; NEW LEAD</span>
              <div style="font-family:Arial,Helvetica,sans-serif; text-transform:uppercase; font-size:24px; font-weight:bold; color:${PAPER_RAISED}; margin-top:8px; letter-spacing:0.5px;">
                ${escapeHtml(town || "Essex")}
              </div>
            </td>
          </tr>

          <!-- VEHICLE PLATE BADGE -->
          <tr>
            <td style="padding:26px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${GOLD}; border:2px solid ${INK}; padding:10px 16px; font-family:'Courier New',Courier,monospace; font-weight:bold; letter-spacing:1.5px; font-size:16px; color:${INK};">
                    ${escapeHtml((make || "").toUpperCase())} ${escapeHtml(model || "")} &middot; ${escapeHtml(String(year || ""))}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DETAILS -->
          <tr>
            <td style="padding:24px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Mileage", mileage ? escapeHtml(String(mileage)) : `<span style="color:${INK_SOFT};">Not typed in — check dashboard photo</span>`)}
                ${row("Condition notes", conditionFlags.length ? escapeHtml(conditionFlags.join(", ")) : `<span style="color:${INK_SOFT};">None flagged</span>`)}
                ${row("Timing", escapeHtml(urgencyLabel))}
                ${row("Name", escapeHtml(name || ""))}
                ${row("Mobile", escapeHtml(phone || ""))}
                ${row("Photos", photoCount ? `${photoCount} attached to this email` : `<span style="color:${INK_SOFT};">None provided</span>`)}
                ${row("Source", escapeHtml(source || "Direct / not tagged"))}
              </table>
            </td>
          </tr>

          <!-- CALL BUTTON -->
          <tr>
            <td style="padding:22px 32px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${GREEN};">
                    <a href="${telHref}" style="display:inline-block; padding:14px 26px; font-family:Arial,Helvetica,sans-serif; text-transform:uppercase; letter-spacing:1px; font-size:13px; font-weight:bold; color:${PAPER_RAISED}; text-decoration:none;">
                      Call ${escapeHtml(name || "seller")} now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${PAPER}; border-top:1px solid ${LINE}; padding:16px 32px; text-align:center;">
              <span style="font-family:'Courier New',Courier,monospace; font-size:11px; letter-spacing:1px; color:${INK_SOFT};">SELLCARESSEX.CO.UK</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
