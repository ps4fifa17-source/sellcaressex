import { useState, useRef, useEffect } from "react";
import { allMakes, makeModels } from "../data/vehicles";

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = Array.from({ length: 12 }, (_, i) => CURRENT_YEAR - i);
const OLDER_YEARS = Array.from({ length: CURRENT_YEAR - 12 - 1985 + 1 }, (_, i) => CURRENT_YEAR - 12 - i);

function buildHeadlines(townName) {
  const town = townName ? townName.toUpperCase() : "ESSEX";
  return {
    make: <>SELL YOUR CAR <span className="text-gold-bright">LOCALLY</span> IN {town}</>,
    model: <><span className="text-gold-bright">NO PRESSURE</span>, EVER</>,
    year: <>A REAL PERSON <span className="text-gold-bright">VALUES EVERY CAR</span></>,
    photos: <>NO SURPRISES, <span className="text-gold-bright">EVER</span></>,
    mileage: <>JUST <span className="text-gold-bright">ONE MORE DETAIL</span></>,
    condition: <><span className="text-gold-bright">HONEST PRICING</span>. NO CATCHES.</>,
    timing: <>ON <span className="text-gold-bright">YOUR SCHEDULE</span>, NOT OURS</>,
    contact: <>SUPPORTING A <span className="text-gold-bright">LOCAL BUSINESS</span></>,
    confirm: <>THANK YOU FOR <span className="text-gold-bright">SELLING LOCALLY</span> IN {town}</>,
  };
}

export default function SellForm({ townName, onHeadlineChange, onLeadSubmit }) {
  const [steps, setSteps] = useState(["make", "model", "year", "photos", "mileage", "condition", "timing", "contact"]);
  const [stepId, setStepId] = useState("make");

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [showOlderYears, setShowOlderYears] = useState(false);

  const [photoState, setPhotoState] = useState({ front: null, dashboard: null, damage: null });
  const [photoFiles, setPhotoFiles] = useState({ front: null, dashboard: null, damage: null });
  const fileInputRefs = useRef({});
  const [mileage, setMileage] = useState("");

  const [conditionChips, setConditionChips] = useState({});
  const [selectedUrgency, setSelectedUrgency] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [makeQuery, setMakeQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [showMakeResults, setShowMakeResults] = useState(false);
  const [showModelResults, setShowModelResults] = useState(false);

  const [noteMsg, setNoteMsg] = useState("");
  const [noteVisible, setNoteVisible] = useState(false);
  const [noteCollapsed, setNoteCollapsed] = useState(true);
  const collapseTimer = useRef(null);

  useEffect(() => {
    const headlines = buildHeadlines(townName);
    onHeadlineChange?.(headlines[stepId]);
  }, [stepId, townName]);

  function advanceFrom(id) {
    const idx = steps.indexOf(id);
    const next = steps[idx + 1];
    setStepId(next || "confirm");
  }
  function goBack() {
    const idx = steps.indexOf(stepId);
    if (idx > 0) setStepId(steps[idx - 1]);
  }

  function showNote(msg) {
    setNoteMsg(msg);
    setNoteVisible(true);
    setNoteCollapsed(false);
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => setNoteCollapsed(true), 4200);
  }
  function reopenNote() {
    if (noteCollapsed) {
      setNoteCollapsed(false);
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      collapseTimer.current = setTimeout(() => setNoteCollapsed(true), 4200);
    }
  }

  // ---- MAKE ----
  const makeMatches = makeQuery.trim()
    ? allMakes.filter((m) => m.toLowerCase().includes(makeQuery.trim().toLowerCase())).slice(0, 7)
    : [];
  function chooseMake(name) {
    setSelectedMake(name);
    setMakeQuery(name);
    setShowMakeResults(false);
    showNote(`${name} — good, steady demand for those in Essex right now.`);
    setTimeout(() => advanceFrom("make"), 500);
  }

  // ---- MODEL ----
  const modelPool = selectedMake && makeModels[selectedMake] ? makeModels[selectedMake] : allMakes.flatMap((m) => makeModels[m]);
  const modelMatches = modelQuery.trim()
    ? modelPool.filter((m) => m.toLowerCase().includes(modelQuery.trim().toLowerCase())).slice(0, 7)
    : [];
  function chooseModel(name) {
    setSelectedModel(name);
    setModelQuery(name);
    setShowModelResults(false);
    showNote(`${name} noted. Which year is it?`);
    setTimeout(() => advanceFrom("model"), 500);
  }

  // ---- YEAR ----
  function chooseYear(y) {
    setSelectedYear(y);
    setShowOlderYears(false);
    showNote(`Got it, a ${y}. On to the photos next.`);
    setTimeout(() => advanceFrom("year"), 550);
  }

  // ---- PHOTOS ----
  function openPicker(type) {
    fileInputRefs.current[type]?.click();
  }
  function handlePhotoChange(type, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoState((s) => ({ ...s, [type]: previewUrl }));
    setPhotoFiles((s) => ({ ...s, [type]: file }));
  }
  function removePhoto(type, e) {
    e.stopPropagation();
    setPhotoState((s) => ({ ...s, [type]: null }));
    setPhotoFiles((s) => ({ ...s, [type]: null }));
    if (fileInputRefs.current[type]) fileInputRefs.current[type].value = "";
  }
  function finishPhotos() {
    showNote("That's enough for our valuer to start with.");
    setSteps((prev) => {
      const withoutMileage = prev.filter((s) => s !== "mileage");
      if (photoState.dashboard) return withoutMileage;
      if (withoutMileage.includes("mileage")) return withoutMileage;
      const idx = withoutMileage.indexOf("photos");
      const next = [...withoutMileage];
      next.splice(idx + 1, 0, "mileage");
      return next;
    });
    advanceFrom("photos");
  }

  // ---- CONDITION ----
  function toggleChip(key) {
    setConditionChips((c) => ({ ...c, [key]: !c[key] }));
  }
  function finishCondition() {
    const msg = conditionChips.light
      ? "A warning light alone rarely changes much — we'll just double check it."
      : "Noted — that helps us look after the details properly.";
    showNote(msg);
    advanceFrom("condition");
  }

  // ---- TIMING ----
  function chooseUrgency(val) {
    setSelectedUrgency(val);
    const msg =
      val === "This week"
        ? "Marked as urgent — someone will call you today."
        : val === "Next few weeks"
        ? "No rush noted. We'll be in touch whenever suits."
        : "No pressure — this is just so you know where you stand.";
    showNote(msg);
    setTimeout(() => advanceFrom("timing"), 600);
  }

  // ---- CONTACT ----
  const contactValid = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 7;

  function submitLead() {
    const lead = {
      town: townName,
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
      mileage: mileage || null,
      photoFiles, // real File objects — see note in TownPage.jsx about uploading these
      condition: conditionChips,
      urgency: selectedUrgency,
      name,
      phone,
    };
    onLeadSubmit?.(lead);
    setStepId("confirm");
  }

  const idx = steps.indexOf(stepId);
  const total = steps.length;
  const progressPct = stepId === "confirm" ? 100 : Math.round(((idx + 1) / total) * 100);

  return (
    <div className="flex justify-center items-start gap-6 flex-wrap">
      <div className="bg-paper-raised border border-ink max-w-xl w-full p-9 relative">
        {idx > 0 && stepId !== "confirm" && (
          <button onClick={goBack} className="absolute top-4 left-5 font-mono text-xs text-ink-soft hover:text-ink">
            ← BACK
          </button>
        )}

        <div className="h-0.5 bg-line w-full">
          <div className="h-0.5 bg-gold transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="font-mono text-xs text-ink-soft mt-2">
          {stepId === "confirm" ? "CONFIRMED" : `STEP ${String(idx + 1).padStart(2, "0")} / 0${total}`}
        </p>

        {/* MAKE */}
        {stepId === "make" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">What make is it?</h2>
            <div className="relative">
              <input
                className="font-mono bg-paper border border-ink-soft w-full p-3.5 focus:outline-none focus:border-green"
                placeholder="Start typing e.g. Ford, Volkswagen..."
                value={makeQuery}
                onChange={(e) => { setMakeQuery(e.target.value); setShowMakeResults(true); }}
                onFocus={() => setShowMakeResults(true)}
              />
              {showMakeResults && makeQuery.trim() && (
                <div className="absolute top-full left-0 right-0 bg-paper-raised border border-ink border-t-0 max-h-60 overflow-y-auto z-20">
                  {makeMatches.map((m) => (
                    <div key={m} onClick={() => chooseMake(m)} className="font-mono text-sm p-3 cursor-pointer border-b border-line hover:bg-green/10">
                      {m}
                    </div>
                  ))}
                  <div onClick={() => chooseMake(makeQuery.trim())} className="font-mono text-sm p-3 cursor-pointer text-green italic hover:bg-green/10">
                    Can't find it? Use "{makeQuery.trim()}"
                  </div>
                </div>
              )}
            </div>
            {selectedMake && (
              <p onClick={() => advanceFrom("make")} className="font-mono text-xs text-green mt-3 cursor-pointer hover:underline">
                ALREADY ANSWERED — CONTINUE →
              </p>
            )}
          </div>
        )}

        {/* MODEL */}
        {stepId === "model" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">Which model?</h2>
            <div className="relative">
              <input
                className="font-mono bg-paper border border-ink-soft w-full p-3.5 focus:outline-none focus:border-green"
                placeholder="Start typing the model..."
                value={modelQuery}
                onChange={(e) => { setModelQuery(e.target.value); setShowModelResults(true); }}
                onFocus={() => setShowModelResults(true)}
              />
              {showModelResults && modelQuery.trim() && (
                <div className="absolute top-full left-0 right-0 bg-paper-raised border border-ink border-t-0 max-h-60 overflow-y-auto z-20">
                  {modelMatches.map((m) => (
                    <div key={m} onClick={() => chooseModel(m)} className="font-mono text-sm p-3 cursor-pointer border-b border-line hover:bg-green/10">
                      {m}
                    </div>
                  ))}
                  <div onClick={() => chooseModel(modelQuery.trim())} className="font-mono text-sm p-3 cursor-pointer text-green italic hover:bg-green/10">
                    Can't find it? Use "{modelQuery.trim()}"
                  </div>
                </div>
              )}
            </div>
            {selectedModel && (
              <p onClick={() => advanceFrom("model")} className="font-mono text-xs text-green mt-3 cursor-pointer hover:underline">
                ALREADY ANSWERED — CONTINUE →
              </p>
            )}
          </div>
        )}

        {/* YEAR */}
        {stepId === "year" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">What year is it?</h2>
            <div className="flex flex-wrap gap-2.5">
              {RECENT_YEARS.map((y) => (
                <div
                  key={y}
                  onClick={() => chooseYear(y)}
                  className={`border-[1.5px] border-ink px-4 py-2.5 font-mono text-sm cursor-pointer transition ${selectedYear === y ? "bg-green text-paper-raised animate-chip-pop" : "bg-paper"}`}
                >
                  {y}
                </div>
              ))}
              <div onClick={() => setShowOlderYears(true)} className="border-[1.5px] border-ink px-4 py-2.5 font-mono text-sm cursor-pointer bg-paper">
                OLDER ▾
              </div>
            </div>
            {showOlderYears && (
              <select
                className="font-mono bg-paper border border-ink-soft w-full p-3 mt-3"
                onChange={(e) => e.target.value && chooseYear(parseInt(e.target.value))}
                defaultValue=""
              >
                <option value="">Select year…</option>
                {OLDER_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            {selectedYear && (
              <p onClick={() => advanceFrom("year")} className="font-mono text-xs text-green mt-3 cursor-pointer hover:underline">
                ALREADY ANSWERED — CONTINUE →
              </p>
            )}
          </div>
        )}

        {/* PHOTOS */}
        {stepId === "photos" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">Show us the car</h2>
            <p className="text-ink-soft text-sm -mt-3 mb-4">Totally optional — add any you have, or skip straight past.</p>
            <div className="grid grid-cols-3 gap-3">
              {["front", "dashboard", "damage"].map((type) => (
                <div key={type} className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={(el) => (fileInputRefs.current[type] = el)}
                    onChange={(e) => handlePhotoChange(type, e)}
                    className="hidden"
                  />
                  <div
                    onClick={() => openPicker(type)}
                    className={`aspect-square border-[1.5px] flex items-center justify-center transition cursor-pointer overflow-hidden ${photoState[type] ? "border-green bg-green/5" : "border-dashed border-ink-soft bg-paper hover:border-green"}`}
                  >
                    {photoState[type] ? (
                      <img src={photoState[type]} alt={type} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono text-[0.65rem] text-ink-soft text-center px-1">
                        {type.toUpperCase()} (OPTIONAL)
                      </span>
                    )}
                  </div>
                  {photoState[type] && (
                    <button
                      onClick={(e) => removePhoto(type, e)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-ink text-paper-raised text-xs rounded-full flex items-center justify-center"
                      aria-label={`Remove ${type} photo`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={finishPhotos} className="btn-primary mt-6">Continue</button>
            <p onClick={finishPhotos} className="font-mono text-xs text-ink-soft text-center mt-3 cursor-pointer">SKIP THIS STEP →</p>
          </div>
        )}

        {/* MILEAGE */}
        {stepId === "mileage" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">What's the mileage?</h2>
            <p className="text-ink-soft text-sm -mt-3 mb-4">You didn't add a dashboard photo, so we'll need this typed in.</p>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 48000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="font-mono bg-paper border border-ink-soft w-full p-3.5 focus:outline-none focus:border-green"
            />
            <button disabled={!mileage || parseInt(mileage) < 0} onClick={() => advanceFrom("mileage")} className="btn-primary mt-6 disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
            </button>
          </div>
        )}

        {/* CONDITION */}
        {stepId === "condition" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">Anything we should know?</h2>
            <p className="text-ink-soft text-sm -mt-3 mb-4">Tap what applies. Fine if none do.</p>
            <div className="flex flex-wrap gap-2.5">
              {[
                ["light", "WARNING LIGHT ON"],
                ["service", "FULL SERVICE HISTORY"],
                ["mot", "MOT VALID"],
                ["smoker", "NON-SMOKER CAR"],
                ["keys", "2 SETS OF KEYS"],
              ].map(([key, label]) => (
                <div
                  key={key}
                  onClick={() => toggleChip(key)}
                  className={`border-[1.5px] border-ink px-4 py-2.5 font-mono text-sm cursor-pointer transition ${conditionChips[key] ? "bg-green text-paper-raised animate-chip-pop" : "bg-paper"}`}
                >
                  {label}
                </div>
              ))}
            </div>
            <button onClick={finishCondition} className="btn-primary mt-6">Continue</button>
          </div>
        )}

        {/* TIMING */}
        {stepId === "timing" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">When do you want this sorted?</h2>
            <div className="grid gap-3">
              {[
                ["This week", "As soon as possible"],
                ["Next few weeks", "No rush, just want it sorted soon"],
                ["Just checking", "Not decided yet"],
              ].map(([val, sub]) => (
                <div
                  key={val}
                  onClick={() => chooseUrgency(val)}
                  className={`text-left border p-4 cursor-pointer transition ${selectedUrgency === val ? "border-green bg-green/5" : "border-ink-soft bg-paper hover:border-green"}`}
                >
                  <span className="font-mono font-semibold">{val.toUpperCase()}</span>
                  <span className="block text-sm text-ink-soft mt-0.5">{sub}</span>
                </div>
              ))}
            </div>
            {selectedUrgency && (
              <p onClick={() => advanceFrom("timing")} className="font-mono text-xs text-green mt-3 cursor-pointer hover:underline">
                ALREADY ANSWERED — CONTINUE →
              </p>
            )}
          </div>
        )}

        {/* CONTACT */}
        {stepId === "contact" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-3xl font-bold my-4">How should we reach you?</h2>
            <div className="grid gap-3.5">
              <input
                placeholder="FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-mono bg-paper border border-ink-soft w-full p-3.5 focus:outline-none focus:border-green"
              />
              <input
                type="tel"
                placeholder="MOBILE NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono bg-paper border border-ink-soft w-full p-3.5 focus:outline-none focus:border-green"
              />
            </div>
            <button disabled={!contactValid} onClick={submitLead} className="btn-primary mt-6 disabled:opacity-40 disabled:cursor-not-allowed">
              Get my price
            </button>
            <p className="font-mono text-xs text-ink-soft mt-3">NO HARD FEELINGS, NO OBLIGATION IF THE PRICE ISN'T RIGHT FOR YOU.</p>
          </div>
        )}

        {/* CONFIRM */}
        {stepId === "confirm" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold my-4">Received — here's what happens next</h2>
            <p className="text-ink-soft text-sm -mt-2 mb-6">Sarah on our valuation team has your details.</p>
            {[
              ["1", "We review your car by hand — usually within 1–2 hours", true],
              ["2", "We call you to talk through your price", false],
              ["3", "You accept or decline — genuinely no pressure either way", false],
              ["4", "We agree the details with you and pay the same day", false],
            ].map(([num, text, done]) => (
              <div key={num} className="flex gap-4 items-start mb-4">
                <div className={`w-[26px] h-[26px] flex-shrink-0 border font-mono text-xs flex items-center justify-center ${done ? "bg-green text-paper-raised border-green" : "border-ink"}`}>
                  {num}
                </div>
                <p className={`text-sm ${done ? "" : "text-ink-soft"}`}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky note assistant */}
      {noteVisible && (
        <div className="w-56 flex-shrink-0 mt-10 lg:block hidden">
          <div
            onClick={reopenNote}
            className={`bg-[#FFFDF6] border border-ink shadow-[4px_4px_0_theme(colors.ink)] cursor-pointer -rotate-2 relative transition-all animate-note-in ${noteCollapsed ? "w-fit px-3 py-2" : "px-4 py-4"}`}
          >
            {!noteCollapsed && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2 w-14 h-5 bg-gold/50 border border-black/10" />
            )}
            <div className={`flex items-center ${noteCollapsed ? "" : "mb-2"}`}>
              <span className="w-[22px] h-[22px] bg-green text-paper-raised font-mono text-xs flex items-center justify-center mr-2">O</span>
              <span className="font-mono text-xs text-ink-soft">OLLIE · ASSISTANT</span>
            </div>
            {!noteCollapsed && <div className="font-body text-sm text-ink leading-snug">{noteMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
