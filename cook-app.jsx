import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  X,
  Send,
  Loader2,
  Clock,
  Flame,
  ChefHat,
  UtensilsCrossed,
  ChevronDown,
  MessageCircle,
  Youtube,
} from "lucide-react";

// ---- visual language: emoji + gradient per food category -------------

const CATEGORIES = [
  { key: "noodle", match: ["noodle", "ramen", "pasta", "spaghetti"], emoji: "🍜", from: "#E4A93A", to: "#C1442D" },
  { key: "rice", match: ["rice", "fried rice", "bowl"], emoji: "🍚", from: "#7A9471", to: "#3D6B4C" },
  { key: "egg", match: ["egg", "omelet", "scramble"], emoji: "🍳", from: "#E4A93A", to: "#E8823A" },
  { key: "quesadilla", match: ["quesadilla", "taco", "burrito", "wrap", "tortilla"], emoji: "🌮", from: "#E8823A", to: "#C1442D" },
  { key: "sausage", match: ["sausage", "sheet-pan", "sheet pan", "roasted", "veg"], emoji: "🌭", from: "#C1442D", to: "#7A2F44" },
  { key: "sandwich", match: ["sandwich", "melt", "toast", "grilled cheese"], emoji: "🥪", from: "#E4A93A", to: "#7A9471" },
  { key: "peanut", match: ["peanut"], emoji: "🥡", from: "#E8823A", to: "#8B5A2B" },
  { key: "soup", match: ["soup", "stew", "broth", "chili"], emoji: "🍲", from: "#C1442D", to: "#7A2F44" },
  { key: "salad", match: ["salad", "greens", "slaw"], emoji: "🥗", from: "#7A9471", to: "#4F7A5B" },
  { key: "pancake", match: ["pancake", "waffle", "breakfast", "french toast"], emoji: "🥞", from: "#E4A93A", to: "#D98A3D" },
  { key: "stirfry", match: ["stir-fry", "stir fry", "wok"], emoji: "🥘", from: "#C1442D", to: "#E4A93A" },
  { key: "pizza", match: ["pizza", "flatbread"], emoji: "🍕", from: "#C1442D", to: "#E4A93A" },
  { key: "default", match: [], emoji: "🍽️", from: "#7A9471", to: "#3F5A46" },
];

function visualFor(text = "") {
  const t = text.toLowerCase();
  return CATEGORIES.find((c) => c.match.some((m) => t.includes(m))) || CATEGORIES[CATEGORIES.length - 1];
}

function youtubeSearchUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " recipe how to make")}`;
}

// ---- ad slot: styled placeholder, ready for a real ad network's tag ----
// Swap the placeholder contents below for your ad network's embed code
// (e.g. Google AdSense <ins> tag, or an ad-network iframe/script).

function AdSlot({ variant = "banner" }) {
  const sizing =
    variant === "banner"
      ? "h-24 sm:h-28"
      : variant === "square"
      ? "aspect-square"
      : "h-40";

  return (
    <div className="w-full">
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#F3ECDD]/30 mb-1.5 text-center">
        Advertisement
      </p>
      <div
        className={`w-full ${sizing} rounded-lg border border-dashed border-[#F3ECDD]/20 bg-[#2C3136]/60 flex flex-col items-center justify-center gap-1`}
      >
        <span className="font-display text-sm text-[#F3ECDD]/30 tracking-wide">AD SPACE</span>
        <span className="font-mono text-[10px] text-[#F3ECDD]/20">{variant} slot</span>
      </div>
    </div>
  );
}

function FoodBadge({ text, size = 64, className = "" }) {
  const v = visualFor(text);
  return (
    <div
      className={`shrink-0 rounded-2xl flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${v.from}, ${v.to})`,
        fontSize: size * 0.52,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      }}
    >
      <span role="img" aria-label="">{v.emoji}</span>
    </div>
  );
}

function zigzagClipPath(teeth = 22, depth = 5) {
  const pts = ["0% 0%", "100% 0%", "100% 100%"];
  for (let i = teeth; i >= 0; i--) {
    const x = (i / teeth) * 100;
    const y = i % 2 === 0 ? 100 : 100 - depth;
    pts.push(`${x}% ${y}%`);
  }
  pts.push("0% 100%");
  return `polygon(${pts.join(",")})`;
}

const QUICK_WINS = [
  {
    title: "Garlic Butter Noodles",
    time: "10 min",
    tag: "5 ingredients",
    desc: "Noodles, butter, garlic, soy sauce, green onion. Boil, toss, done.",
    steps: [
      "Boil noodles in salted water until just tender, then drain, saving a splash of the water.",
      "Melt butter in the same pot over medium heat and add minced garlic. Cook 30 seconds until fragrant, don't let it brown.",
      "Add the noodles back in with a splash of soy sauce and the reserved water. Toss until glossy.",
      "Top with sliced green onion and serve right away.",
    ],
  },
  {
    title: "Egg Fried Rice",
    time: "12 min",
    tag: "uses leftovers",
    desc: "Yesterday's rice, an egg, whatever vegetables are wilting in the drawer.",
    steps: [
      "Heat oil in a large pan or wok over high heat until shimmering.",
      "Add chopped vegetables and stir-fry 2 minutes until just softened.",
      "Push everything to one side, crack in the egg, scramble it, then mix together.",
      "Add cold day-old rice, breaking up clumps, and stir-fry 3-4 minutes until hot.",
      "Season with soy sauce and a pinch of salt, then serve.",
    ],
  },
  {
    title: "Loaded Quesadilla",
    time: "8 min",
    tag: "one pan",
    desc: "Tortilla, cheese, anything else you've got. Fold, crisp, cut into wedges.",
    steps: [
      "Lay a tortilla flat in a dry, unheated pan and scatter cheese over half of it.",
      "Add any extras: cooked meat, beans, veggies, on top of the cheese.",
      "Fold the tortilla over and turn the heat to medium.",
      "Cook 2-3 minutes per side until golden and the cheese has melted.",
      "Slide onto a board, rest a minute, then cut into wedges.",
    ],
  },
  {
    title: "Sheet-Pan Sausage & Veg",
    time: "25 min",
    tag: "hands-off",
    desc: "Sausage and chopped vegetables, oil, oven. Walk away till it's done.",
    steps: [
      "Heat the oven to 425°F (220°C).",
      "Chop sausage and vegetables into similar-sized pieces so they cook evenly.",
      "Toss everything on a sheet pan with oil, salt, and pepper, then spread into a single layer.",
      "Roast 20-25 minutes, flipping halfway, until the veg is browned and the sausage is cooked through.",
    ],
  },
  {
    title: "Tuna Melt",
    time: "10 min",
    tag: "pantry can",
    desc: "Canned tuna, mayo, cheese, bread. Broil until the top bubbles.",
    steps: [
      "Mix drained canned tuna with mayo and a squeeze of lemon or a dash of vinegar if you have it.",
      "Spread onto bread and top with a slice of cheese.",
      "Broil or toast in a pan until the cheese is melted and bubbling.",
      "Cut in half and serve hot.",
    ],
  },
  {
    title: "Peanut Noodles",
    time: "15 min",
    tag: "no cooking skill needed",
    desc: "Noodles tossed in peanut butter, soy sauce, a little vinegar and chili.",
    steps: [
      "Boil noodles until tender, then drain and rinse briefly with cold water.",
      "Whisk peanut butter with soy sauce, a splash of vinegar, and a little warm water until smooth.",
      "Add chili flakes or hot sauce to taste.",
      "Toss the noodles in the sauce until fully coated, then serve, warm or cold.",
    ],
  },
];

const PANTRY_STAPLES = ["salt", "pepper", "cooking oil", "butter", "water"];

const HERO_FLOATERS = ["🍅", "🥕", "🧄", "🥬", "🌽", "🧅", "🥑", "🍋"];

// ---- order ticket result card ------------------------------------------

function OrderTicket({ recipe, index }) {
  const [open, setOpen] = useState(index === 0);
  const clip = useMemo(() => zigzagClipPath(22, 5), []);
  const v = visualFor(recipe.title + " " + recipe.description);

  return (
    <div style={{ animation: `printIn 480ms ease-out ${index * 140}ms both` }}>
      <div className="bg-[#F3ECDD] text-[#23262A] px-6 pt-6 pb-8 shadow-xl" style={{ clipPath: clip }}>
        <div className="flex items-start gap-4 border-b border-dashed border-[#23262A]/30 pb-3 mb-3">
          <FoodBadge text={recipe.title + " " + recipe.description} size={56} />
          <div className="flex-1">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#C1442D]">
              Ticket #{String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display text-2xl leading-tight mt-0.5">{recipe.title}</h3>
          </div>
        </div>

        <p className="font-body text-sm text-[#23262A]/80 mb-3">{recipe.description}</p>

        <div className="flex flex-wrap gap-2 mb-4 font-mono text-[11px] uppercase tracking-wide">
          <span className="inline-flex items-center gap-1 bg-[#23262A] text-[#F3ECDD] px-2 py-1 rounded-sm">
            <Clock size={12} /> {recipe.time}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[#23262A]" style={{ background: v.from }}>
            <Flame size={12} /> {recipe.difficulty}
          </span>
          {recipe.extras && recipe.extras.length > 0 && (
            <span className="inline-flex items-center gap-1 bg-[#7A9471] text-[#F3ECDD] px-2 py-1 rounded-sm">
              also needs: {recipe.extras.join(", ")}
            </span>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-[#C1442D] hover:opacity-70 transition-opacity"
        >
          {open ? "Hide steps" : "Show steps"}
          <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
        </button>

        {open && (
          <>
            <ol className="mt-3 space-y-2 font-body text-sm">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[#C1442D] shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <a
              href={youtubeSearchUrl(recipe.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#F3ECDD] bg-[#C1442D] hover:brightness-110 transition px-3 py-2 rounded-sm"
            >
              <Youtube size={14} /> Watch it made on YouTube
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// ---- quick win card (click to reveal steps) -----------------------------

function QuickWinCard({ r }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`bg-[#2C3136] border rounded-xl p-5 transition cursor-pointer ${
        open ? "border-[#E4A93A]/60" : "border-[#F3ECDD]/10 hover:border-[#E4A93A]/40 hover:-translate-y-0.5"
      }`}
      onClick={() => setOpen((o) => !o)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
    >
      <div className="flex items-start gap-3 mb-3">
        <FoodBadge text={r.title + " " + r.desc} size={52} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#E4A93A] truncate">{r.tag}</span>
            <span className="font-mono text-[10px] text-[#F3ECDD]/40 flex items-center gap-1 shrink-0">
              <Clock size={11} /> {r.time}
            </span>
          </div>
          <h3 className="font-display text-xl leading-tight">{r.title}</h3>
        </div>
      </div>
      <p className="font-body text-sm text-[#F3ECDD]/60 mb-2">{r.desc}</p>

      <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[#E4A93A]">
        {open ? "Hide steps" : "How to make it"}
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
      </div>

      {open && (
        <div onClick={(e) => e.stopPropagation()}>
          <ol className="mt-3 space-y-2 font-body text-sm border-t border-[#F3ECDD]/10 pt-3">
            {r.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-[#E4A93A] shrink-0">{i + 1}.</span>
                <span className="text-[#F3ECDD]/85">{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={youtubeSearchUrl(r.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#23262A] bg-[#E4A93A] hover:brightness-105 transition px-3 py-2 rounded-sm"
          >
            <Youtube size={14} /> Watch it made on YouTube
          </a>
        </div>
      )}
    </div>
  );
}

// ---- chat panel: "Ask the Kitchen" --------------------------------------

function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey — I'm your kitchen buddy. Ask me anything: substitutions, what goes with what, why your sauce broke, whatever's on your mind." },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    const system = `You are a warm, knowledgeable line cook and kitchen buddy having a casual chat about food. You help with substitutions, techniques, flavor pairings, what to do with an ingredient, fixing a dish that went wrong, or just chatting about food. Keep answers conversational and concise, 2-4 sentences unless the person clearly needs a short numbered list. No markdown headers, no preamble like "Great question!" - just talk like a friendly person who knows their way around a kitchen.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      setMessages((prev) => [...prev, { role: "assistant", text: text || "Hmm, lost that thought. Ask me again?" }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Kitchen's noisy, didn't catch that. Try again?" }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-[#2C3136] border border-[#F3ECDD]/10 rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ height: "480px" }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3ECDD]/10 bg-[#23262A]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg, #E4A93A, #C1442D)" }}
        >
          👨‍🍳
        </div>
        <div>
          <p className="font-display text-lg leading-none">Ask The Kitchen</p>
          <p className="font-mono text-[10px] text-[#F3ECDD]/40 uppercase tracking-wide mt-1">Talk food, anytime</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl font-body text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#C1442D] text-[#F3ECDD] rounded-br-sm"
                  : "bg-[#F3ECDD] text-[#23262A] rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-[#F3ECDD] text-[#23262A] px-4 py-2.5 rounded-2xl rounded-bl-sm font-mono text-xs flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> thinking
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-[#F3ECDD]/10 bg-[#23262A]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What's cooking?"
          className="flex-1 bg-[#F3ECDD] text-[#23262A] placeholder-[#23262A]/40 font-body text-sm rounded-full px-4 py-2.5"
        />
        <button
          onClick={send}
          disabled={!draft.trim() || sending}
          aria-label="Send message"
          className="shrink-0 bg-[#E4A93A] disabled:opacity-40 text-[#23262A] rounded-full w-10 h-10 flex items-center justify-center hover:brightness-105 transition"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ---- main app -------------------------------------------------------

export default function App() {
  const [ingredients, setIngredients] = useState([]);
  const [draft, setDraft] = useState("");
  const [usePantry, setUsePantry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function addIngredient() {
    const val = draft.trim().toLowerCase();
    if (!val) return;
    if (!ingredients.includes(val)) setIngredients((prev) => [...prev, val]);
    setDraft("");
    inputRef.current?.focus();
  }

  function removeIngredient(item) {
    setIngredients((prev) => prev.filter((i) => i !== item));
  }

  async function sendOrder() {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    setRecipes(null);

    const system = `You are a line cook at a fast, friendly diner who specializes in turning whatever's in someone's kitchen into an easy meal. Given a list of ingredients someone has on hand, respond with 2-3 simple recipe ideas that primarily use those ingredients. Respond ONLY with valid JSON, nothing else, no markdown fences, in exactly this shape:
{"recipes":[{"title":string,"time":string,"difficulty":"Easy"|"Medium","description":string,"extras":string[],"steps":string[]}]}
Rules: "time" is a short estimate like "15 min". "difficulty" is Easy or Medium, favor Easy. "description" is one short sentence. "extras" lists any ingredients beyond what was given that are truly necessary (empty array if none). "steps" is 3-6 short, actionable steps. Keep everything genuinely simple - these are for people who want an easy meal, not a project.`;

    const pantryNote = usePantry
      ? `They also have basic pantry staples on hand: ${PANTRY_STAPLES.join(", ")}.`
      : `Assume they have nothing beyond what's listed - no pantry staples.`;

    const userMsg = `Ingredients on hand: ${ingredients.join(", ")}. ${pantryNote} What can I make?`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: userMsg }],
        }),
      });

      const data = await response.json();
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.recipes || !Array.isArray(parsed.recipes) || parsed.recipes.length === 0) throw new Error("empty");
      setRecipes(parsed.recipes);
    } catch (e) {
      setError("The line's a little backed up. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#22262A] text-[#F3ECDD]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.01em; }
        .font-body { font-family: 'Work Sans', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        @keyframes printIn { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes floatY { 0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-14px) rotate(var(--r, 0deg)); } }
        .steel-texture { background-image: radial-gradient(circle, rgba(243,236,221,0.05) 1px, transparent 1px); background-size: 18px 18px; }
        input:focus { outline: none; }
        @media (prefers-reduced-motion: reduce) { *{ animation: none !important; } }
      `}</style>

      {/* NAV / BRAND */}
      <nav className="px-6 sm:px-10 py-4 flex items-center gap-2 border-b border-[#F3ECDD]/10">
        <span className="text-xl">🍳</span>
        <span className="font-display text-lg tracking-wide">
          SIMPLE COOKS <span style={{ color: "#E4A93A" }}>AI</span>
        </span>
      </nav>

      {/* HERO */}
      <header className="steel-texture relative px-6 pt-16 pb-14 sm:px-10 sm:pt-24 sm:pb-20 border-b border-[#F3ECDD]/10 overflow-hidden">
        {HERO_FLOATERS.map((emoji, i) => (
          <span
            key={i}
            className="hidden sm:block absolute text-3xl opacity-70 select-none"
            style={{
              left: `${6 + i * 12}%`,
              top: `${10 + (i % 3) * 24}%`,
              animation: `floatY ${4 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              "--r": `${(i % 2 === 0 ? -1 : 1) * 8}deg`,
            }}
          >
            {emoji}
          </span>
        ))}
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.35em] text-[#E4A93A] mb-4">
            Order up &middot; No skills required
          </p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] mb-5">
            COOK WHAT<br />
            <span style={{ color: "#E4A93A" }}>YOU'VE</span>{" "}
            <span style={{ color: "#C1442D" }}>GOT</span>
          </h1>
          <p className="font-body text-base sm:text-lg text-[#F3ECDD]/70 max-w-xl mx-auto">
            Tell the line cook what's in your kitchen, or just talk it through.
            Get back a real meal, not a grocery list you don't have time for.
          </p>
        </div>
      </header>

      {/* ORDER PAD */}
      <section className="px-6 sm:px-10 -mt-8 sm:-mt-10 relative z-10">
        <div className="max-w-2xl mx-auto bg-[#2C3136] border border-[#F3ECDD]/10 rounded-md p-5 sm:p-7 shadow-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#F3ECDD]/50 mb-3">
            What's in the kitchen?
          </p>

          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              placeholder="e.g. eggs, spinach, leftover rice"
              className="flex-1 bg-[#F3ECDD] text-[#23262A] placeholder-[#23262A]/40 font-body text-sm sm:text-base rounded-sm px-4 py-3"
            />
            <button onClick={addIngredient} aria-label="Add ingredient" className="shrink-0 bg-[#E4A93A] text-[#23262A] rounded-sm px-4 hover:brightness-105 transition">
              <Plus size={20} />
            </button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ingredients.map((item) => {
                const v = visualFor(item);
                return (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full text-[#F3ECDD]"
                    style={{ background: `linear-gradient(135deg, ${v.from}, ${v.to})` }}
                  >
                    {item}
                    <button onClick={() => removeIngredient(item)} aria-label={`Remove ${item}`}>
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <label className="flex items-center gap-2 mb-5 font-body text-sm text-[#F3ECDD]/70 cursor-pointer select-none">
            <input type="checkbox" checked={usePantry} onChange={(e) => setUsePantry(e.target.checked)} className="accent-[#E4A93A] w-4 h-4" />
            I've also got the basics ({PANTRY_STAPLES.join(", ")})
          </label>

          <button
            onClick={sendOrder}
            disabled={ingredients.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#C1442D] disabled:bg-[#C1442D]/30 disabled:cursor-not-allowed text-[#F3ECDD] font-display text-lg tracking-wide py-3 rounded-sm hover:brightness-110 transition"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> SENDING TO THE LINE...
              </>
            ) : (
              <>
                <Send size={18} /> SEND TO THE LINE
              </>
            )}
          </button>

          {ingredients.length === 0 && (
            <p className="font-mono text-[11px] text-[#F3ECDD]/40 mt-2 text-center">
              add at least one ingredient to place your order
            </p>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="px-6 sm:px-10 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center gap-3 font-mono text-sm text-[#F3ECDD]/60 py-10">
              <span style={{ animation: "pulseDot 1s infinite" }}>●</span> the cook is reading your order
            </div>
          )}
          {error && <p className="text-center font-body text-sm text-[#C1442D] py-6">{error}</p>}
          {recipes && (
            <div className="space-y-8">
              {recipes.map((r, i) => (
                <OrderTicket key={i} recipe={r} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AD: banner */}
      <section className="px-6 sm:px-10 max-w-3xl mx-auto">
        <AdSlot variant="banner" />
      </section>

      {/* QUICK WINS */}
      <section className="px-6 sm:px-10 py-14 sm:py-20 bg-[#1B1E22] border-t border-[#F3ECDD]/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <UtensilsCrossed size={22} className="text-[#E4A93A]" />
            <h2 className="font-display text-3xl sm:text-4xl">QUICK WINS</h2>
          </div>
          <p className="font-body text-sm sm:text-base text-[#F3ECDD]/60 mb-8 max-w-lg">
            No ingredients to type in? Browse a few meals that are hard to mess up.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {QUICK_WINS.slice(0, 3).map((r) => (
              <QuickWinCard key={r.title} r={r} />
            ))}

            <div className="rounded-xl border border-dashed border-[#F3ECDD]/20 bg-[#2C3136]/60 p-5 flex flex-col items-center justify-center text-center gap-1 min-h-[196px]">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#F3ECDD]/30">Sponsored</span>
              <span className="font-display text-base text-[#F3ECDD]/30">AD SPACE</span>
              <span className="font-mono text-[10px] text-[#F3ECDD]/20">native slot</span>
            </div>

            {QUICK_WINS.slice(3).map((r) => (
              <QuickWinCard key={r.title} r={r} />
            ))}
          </div>
        </div>
      </section>

      {/* CHAT */}
      <section className="px-6 sm:px-10 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={22} className="text-[#E4A93A]" />
            <h2 className="font-display text-3xl sm:text-4xl">TALK IT THROUGH</h2>
          </div>
          <p className="font-body text-sm sm:text-base text-[#F3ECDD]/60 mb-8 max-w-lg">
            Substitutions, techniques, "what goes with this," or a dish gone wrong. Just ask.
          </p>
          <ChatPanel />
        </div>
      </section>

      {/* AD: footer banner */}
      <section className="px-6 sm:px-10 max-w-3xl mx-auto pb-4">
        <AdSlot variant="banner" />
      </section>

      <footer className="px-6 sm:px-10 py-8 text-center">
        <p className="font-mono text-[11px] text-[#F3ECDD]/30">Simple Cooks AI &middot; no ingredient too sad, no fridge too empty</p>
      </footer>
    </div>
  );
}
