import { Link } from "react-router-dom";
import { useEffect } from "react";
import { towns } from "../data/towns";
import { captureSource } from "../utils/source";

export default function Hub() {
  useEffect(() => {
    captureSource();
  }, []);

  useEffect(() => {
    document.title = "Sell Car Essex | Sell Your Car Locally, No Obligation";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Sell your car locally across Essex. A real person reviews every car and calls you with a fair price — no bots, no obligation. Colchester, Witham, Chelmsford and more.";
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <div className="bg-green-deep text-paper-raised border-b-[3px] border-gold px-6 pt-16 pb-14 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #E6BC4F, transparent 45%), radial-gradient(circle at 80% 80%, #E6BC4F, transparent 45%)" }}
        />
        <p className="font-mono text-xs tracking-widest text-gold-bright mb-4 relative">SELLCARESSEX.CO.UK</p>
        <h1 className="font-display uppercase font-extrabold text-4xl md:text-6xl leading-none max-w-3xl mx-auto relative">
          Sell your car <span className="text-gold-bright">locally</span>, anywhere in Essex
        </h1>
        <p className="font-body text-paper-raised/80 mt-5 max-w-xl mx-auto text-lg relative">
          A real person reviews every car by hand. No bots guessing a number, no pressure to accept.
        </p>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-9 font-mono text-xs text-paper-raised/70 relative">
          <span>✓ REAL HUMAN VALUATION</span>
          <span>✓ NO OBLIGATION</span>
          <span>✓ HONEST PRICING</span>
        </div>

        <a href="#choose-area" className="inline-block mt-9 bg-gold-bright text-ink font-display uppercase font-bold text-sm tracking-wide px-8 py-3.5 relative hover:bg-gold transition">
          Get Started — Choose Your Area
        </a>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-ink-soft text-center tracking-widest mb-3">HOW IT WORKS</p>
        <h2 className="font-display uppercase font-bold text-3xl text-center mb-12">Three steps. No catches.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            ["01", "Tell us about your car", "Make, model, year, and a couple of quick details — takes about a minute."],
            ["02", "We call you with a price", "A real person reviews it and talks you through the number, no automated offer."],
            ["03", "Sell whenever suits you", "Accept or decline with genuinely no pressure. If it's a yes, we sort the rest with you directly."],
          ].map(([num, title, body]) => (
            <div key={num} className="bg-paper-raised border border-ink p-6">
              <span className="font-display text-4xl font-extrabold text-gold block mb-3">{num}</span>
              <h3 className="font-display uppercase font-bold text-lg mb-2">{title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WHY LOCAL */}
      <div className="bg-paper-raised border-y border-ink">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="font-mono text-xs text-ink-soft text-center tracking-widest mb-3">WHY SELL WITH US</p>
          <h2 className="font-display uppercase font-bold text-3xl text-center mb-12">Built for Essex sellers</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {[
              ["No pressure, ever", "If our price isn't right for you, that's completely fine. There's no hard sell and no follow-up chasing."],
              ["A real person, not an algorithm", "Every car is reviewed by someone who actually knows what they're looking at, not an instant online guess."],
              ["Honest from the first message", "We tell you what we can and can't do upfront, including anything that might affect your price."],
              ["You're supporting a local business", "Every sale goes through a business rooted in Essex, not a national call centre."],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-4">
                <span className="w-2 h-2 mt-2 bg-gold flex-shrink-0" />
                <div>
                  <h3 className="font-display uppercase font-bold text-base mb-1">{title}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AREA PICKER */}
      <div id="choose-area" className="max-w-3xl mx-auto px-6 py-16 scroll-mt-6">
        <p className="font-mono text-xs text-ink-soft text-center tracking-widest mb-3">GET YOUR PRICE</p>
        <h2 className="font-display uppercase font-bold text-3xl text-center mb-3">Choose your area to get started</h2>
        <p className="text-ink-soft text-center text-sm mb-10 max-w-md mx-auto">
          Takes about a minute — we'll ask a few quick questions about your car.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {towns.map((t) => (
            <Link
              key={t.slug}
              to={`/${t.slug}`}
              className="bg-paper-raised border border-ink text-center py-5 font-display uppercase font-bold text-lg hover:bg-green hover:text-paper-raised transition"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <p className="text-center text-ink-soft text-sm mt-8">
          Don't see your town? We probably still cover it —{" "}
          <Link to={`/${towns[0].slug}`} className="text-green underline font-medium">
            start here
          </Link>{" "}
          and let us know.
        </p>
      </div>

      <footer className="border-t border-line py-8 text-center font-mono text-xs text-ink-soft">
        SELLCARESSEX.CO.UK — SERVING TOWNS ACROSS ESSEX
      </footer>
    </div>
  );
}
