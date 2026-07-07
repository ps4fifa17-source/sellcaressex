import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { getTownBySlug } from "../data/towns";
import SellForm from "../components/SellForm";

export default function TownPage() {
  const { slug } = useParams();
  const town = getTownBySlug(slug);
  const [headline, setHeadline] = useState(null);

  useEffect(() => {
    if (!town) return;
    document.title = `Sell Your Car in ${town.name}, Essex | Sell Car Essex`;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = `Sell your car locally in ${town.name}, Essex. A real person reviews every car and calls you with a fair price — no obligation, no pressure.`;
  }, [town]);

  if (!town) return <Navigate to="/" replace />;

  function handleLeadSubmit(lead) {
    // TODO: send this to your backend / CRM / email.
    // For now it just logs — wire this up to an API route or a service like
    // Formspree / Airtable / a simple serverless function on Vercel.
    console.log("New lead:", lead);
  }

  return (
    <div className="min-h-screen">
      <div className="bg-green-deep text-paper-raised border-b-[3px] border-gold px-6 pt-6 pb-8 relative">
        <Link to="/" className="font-mono text-xs text-paper-raised/60 hover:text-paper-raised absolute top-4 right-6">
          CHANGE AREA
        </Link>
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display uppercase font-extrabold text-3xl md:text-5xl leading-none max-w-lg">
            {headline || <>SELL YOUR CAR <span className="text-gold-bright">LOCALLY</span> IN {town.name.toUpperCase()}</>}
          </h1>
          <p className="font-body text-paper-raised/80 mt-5 max-w-lg text-sm md:text-base">
            Covering {town.name} and the surrounding area, including {town.nearby.join(", ")}. A real person reviews
            every car and calls you with a price — no obligation either way.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
        <SellForm townName={town.name} onHeadlineChange={setHeadline} onLeadSubmit={handleLeadSubmit} />
      </div>
    </div>
  );
}
