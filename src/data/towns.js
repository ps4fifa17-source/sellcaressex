// Add a new area page by adding one entry here.
// slug becomes the URL: sellcaressex.co/<slug>
// nearby is used for on-page copy and long-tail search coverage.
export const towns = [
  { slug: "colchester", name: "Colchester", nearby: ["Highwoods", "Stanway", "Wivenhoe", "Myland"] },
  { slug: "witham", name: "Witham", nearby: ["Rivenhall", "Hatfield Peverel", "Silver End"] },
  { slug: "tiptree", name: "Tiptree", nearby: ["Tolleshunt Knights", "Layer de la Haye", "Great Braxted"] },
  { slug: "braintree", name: "Braintree", nearby: ["Bocking", "Rayne", "Great Notley"] },
  { slug: "chelmsford", name: "Chelmsford", nearby: ["Springfield", "Broomfield", "Galleywood"] },
  { slug: "maldon", name: "Maldon", nearby: ["Heybridge", "Woodham Mortimer", "Goldhanger"] },
  { slug: "clacton-on-sea", name: "Clacton-on-Sea", nearby: ["Jaywick", "Holland-on-Sea", "Little Clacton"] },
  { slug: "harwich", name: "Harwich", nearby: ["Dovercourt", "Ramsey", "Little Oakley"] },
];

export function getTownBySlug(slug) {
  return towns.find((t) => t.slug === slug);
}
