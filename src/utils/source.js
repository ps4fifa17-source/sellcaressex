// Captures where a visitor came from, so it can be included with their lead.
// Supports two things:
//   1. Standard UTM params (utm_source, utm_medium, utm_campaign) — set these
//      automatically if you ever run real Google/Facebook ad campaigns.
//   2. A simple manual tag: ?src=fb-group, ?src=nextdoor, ?src=flyer, etc. —
//      easiest for things like a Facebook post link you're typing by hand.
//
// Call captureSource() once when any page loads. It's saved to sessionStorage
// so it's remembered even if someone lands on the hub page first, then clicks
// into a town page (a normal navigation, not a page reload).

export function captureSource() {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const src = params.get("src");

  let value = null;
  if (utmSource) {
    value = utmMedium ? `${utmSource}/${utmMedium}` : utmSource;
    if (utmCampaign) value += ` (${utmCampaign})`;
  } else if (src) {
    value = src;
  }

  if (value) {
    sessionStorage.setItem("leadSource", value);
  }
}

export function getStoredSource() {
  try {
    return sessionStorage.getItem("leadSource") || "Direct / not tagged";
  } catch {
    return "Direct / not tagged";
  }
}
