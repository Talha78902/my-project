import { useState, useRef, useEffect } from "react";

// ── Weather helper (Open-Meteo, no API key needed) ───────────────────────────
const WMO_CODES = {
  0:"Clear ☀️", 1:"Mainly Clear 🌤️", 2:"Partly Cloudy ⛅", 3:"Overcast ☁️",
  45:"Foggy 🌫️", 48:"Icy Fog 🌫️", 51:"Light Drizzle 🌦️", 53:"Drizzle 🌦️",
  55:"Heavy Drizzle 🌧️", 61:"Light Rain 🌧️", 63:"Rain 🌧️", 65:"Heavy Rain 🌧️",
  71:"Light Snow 🌨️", 73:"Snow 🌨️", 75:"Heavy Snow ❄️", 80:"Showers 🌦️",
  81:"Heavy Showers 🌧️", 95:"Thunderstorm ⛈️", 96:"Hail Storm ⛈️",
};
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
  const r = await fetch(url);
  const d = await r.json();
  const c = d.current;
  return {
    temp: Math.round(c.temperature_2m),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    desc: WMO_CODES[c.weathercode] || "Unknown",
  };
}

const PAKISTAN_CITIES = [
  { name: "Multan",       lat: 30.1575, lon: 71.5249 },
  { name: "Lahore",       lat: 31.5497, lon: 74.3436 },
  { name: "Karachi",      lat: 24.8607, lon: 67.0011 },
  { name: "Islamabad",    lat: 33.6844, lon: 73.0479 },
  { name: "Rawalpindi",   lat: 33.5651, lon: 73.0169 },
  { name: "Faisalabad",   lat: 31.4187, lon: 73.0791 },
  { name: "Peshawar",     lat: 34.0151, lon: 71.5249 },
  { name: "Quetta",       lat: 30.1798, lon: 66.9750 },
  { name: "Sialkot",      lat: 32.4945, lon: 74.5229 },
  { name: "Gujranwala",   lat: 32.1877, lon: 74.1945 },
  { name: "Hyderabad",    lat: 25.3960, lon: 68.3578 },
  { name: "Bahawalpur",   lat: 29.3956, lon: 71.6836 },
  { name: "Sargodha",     lat: 32.0836, lon: 72.6711 },
  { name: "Sukkur",       lat: 27.7052, lon: 68.8574 },
  { name: "Larkana",      lat: 27.5570, lon: 68.2138 },
  { name: "Sheikhupura",  lat: 31.7167, lon: 73.9850 },
  { name: "Rahim Yar Khan", lat: 28.4202, lon: 70.2952 },
  { name: "Jhang",        lat: 31.2681, lon: 72.3181 },
  { name: "Dera Ghazi Khan", lat: 30.0588, lon: 70.6350 },
  { name: "Gujrat",       lat: 32.5742, lon: 74.0785 },
  { name: "Kasur",        lat: 31.1170, lon: 74.4453 },
  { name: "Mardan",       lat: 34.1986, lon: 72.0404 },
  { name: "Mingora",      lat: 34.7717, lon: 72.3600 },
  { name: "Nawabshah",    lat: 26.2442, lon: 68.4100 },
  { name: "Chiniot",      lat: 31.7167, lon: 72.9833 },
  { name: "Kotri",        lat: 25.3667, lon: 68.3000 },
  { name: "Khanewal",     lat: 30.3017, lon: 71.9322 },
  { name: "Hafizabad",    lat: 32.0714, lon: 73.6883 },
  { name: "Sahiwal",      lat: 30.6682, lon: 73.1066 },
  { name: "Okara",        lat: 30.8138, lon: 73.4534 },
  { name: "Kohat",        lat: 33.5869, lon: 71.4414 },
  { name: "Mirpur Khas",  lat: 25.5270, lon: 69.0119 },
  { name: "Abbottabad",   lat: 34.1463, lon: 73.2117 },
  { name: "Jacobabad",    lat: 28.2769, lon: 68.4514 },
  { name: "Muzaffargarh", lat: 30.0759, lon: 71.1933 },
  { name: "Turbat",       lat: 26.0023, lon: 63.0440 },
  { name: "Khuzdar",      lat: 27.8120, lon: 66.6170 },
  { name: "Chaman",       lat: 30.9215, lon: 66.4516 },
  { name: "Attock",       lat: 33.7667, lon: 72.3600 },
  { name: "Vehari",       lat: 30.0454, lon: 72.3510 },
  { name: "Mianwali",     lat: 32.5838, lon: 71.5432 },
  { name: "Lodhran",      lat: 29.5340, lon: 71.6326 },
  { name: "Pakpattan",    lat: 30.3436, lon: 73.3867 },
  { name: "Toba Tek Singh", lat: 30.9667, lon: 72.4833 },
  { name: "Chakwal",      lat: 32.9320, lon: 72.8530 },
  { name: "Jhelum",       lat: 32.9416, lon: 73.7267 },
  { name: "Nowshera",     lat: 34.0153, lon: 71.9747 },
  { name: "Khairpur",     lat: 27.5295, lon: 68.7592 },
  { name: "Dadu",         lat: 26.7319, lon: 67.7750 },
  { name: "Shikarpur",    lat: 27.9558, lon: 68.6376 },
];



const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", desc: "Best quality" },
  { id: "llama-3.1-8b-instant",    label: "Llama 3.1 8B",  desc: "Fastest" },
  { id: "mixtral-8x7b-32768",      label: "Mixtral 8x7B",  desc: "Balanced" },
];

const EXPERT_MODES = [
  { id: "agronomist",  label: "Agronomist",        icon: "🌾", desc: "Crop management & yield",        prompt: "You are an expert agronomist. Provide professional guidance on crop management, soil fertility, seeding rates, nutrient scheduling, crop physiology, and yield optimization." },
  { id: "crop_doctor", label: "Crop Doctor",        icon: "🔬", desc: "Disease diagnosis & treatment",  prompt: "You are a plant pathologist and crop doctor. Diagnose crop diseases, nutrient deficiencies, leaf discoloration, fungal/bacterial/viral symptoms, and suggest precise treatments with specific product names." },
  { id: "pest_id",     label: "Pest Expert",        icon: "🐛", desc: "Pest ID & IPM strategies",       prompt: "You are an entomologist and pest management expert. Identify pests, explain life cycles, damage symptoms, prevention methods, IPM strategies, and pesticide recommendations." },
  { id: "soil",        label: "Soil Expert",        icon: "🪨", desc: "Soil health & fertility",        prompt: "You are a soil scientist. Analyze soil issues, pH imbalances, nutrient deficiencies, salinity, organic matter management, and provide detailed fertilizer recommendations." },
  { id: "irrigation",  label: "Irrigation Advisor", icon: "💧", desc: "Water management & scheduling",  prompt: "You are an irrigation and water management expert. Recommend irrigation schedules, water-saving methods, drip/sprinkler suitability, moisture management, and drought prevention strategies." },
  { id: "rotation",    label: "Crop Rotation",      icon: "🔄", desc: "Season-wise rotation planning",  prompt: "You are a crop rotation planning expert. Generate season-wise rotation plans based on soil type, climate, previous crops, and nutrient balance for maximum sustainability." },
  { id: "weather",     label: "Weather Advisory",   icon: "🌦️", desc: "Weather-based crop advice",      prompt: "You are a meteorological agricultural advisor. Provide crop advice based on weather conditions, rainfall, humidity, frost risk, heat stress, and seasonal forecasts." },
  { id: "research",    label: "Research Assistant", icon: "📚", desc: "Scientific agriculture answers", prompt: "You are an agricultural research scientist. Answer scientific agriculture questions with simplified explanations, citing research knowledge and best practices." },
  { id: "calculator",  label: "Fertilizer Calc",    icon: "🧮", desc: "Doses, ratios & schedules",      prompt: "You are a fertilizer and pesticide calculation expert. Calculate fertilizer doses, pesticide mixing ratios, acre/hectare conversions, and nutrient application schedules with step-by-step math." },
  { id: "livestock",   label: "Livestock",          icon: "🐄", desc: "Animal health & management",    prompt: "You are a veterinary and livestock expert. Provide guidance on animal health, feeding schedules, vaccination programs, and farm management for livestock and poultry." },
  { id: "market",      label: "Market Advisor",     icon: "📈", desc: "Prices & market trends",         prompt: "You are an agricultural market analyst. Provide crop market trends, price guidance, storage advice, and optimal harvest timing recommendations." },
];

const QUICK_CHIPS = [
  "Leaves turning yellow 🍂", "Best fertilizer for wheat?", "How to treat fungal infection?",
  "Drip vs sprinkler irrigation", "Crop rotation for cotton", "Soil pH guide",
  "Organic pest control", "When to harvest tomatoes?",
];

const SYSTEM_BASE = `You are AgriMind, an elite AI agricultural advisor. You are highly knowledgeable, practical, and farmer-friendly. Your knowledge is current as of 2026, including the latest agricultural research, crop varieties, pesticide regulations, and farming technologies available up to 2026.

STRICT RULE — AGRICULTURE ONLY:
You ONLY answer questions related to agriculture, farming, crops, livestock, soil, irrigation, fertilizers, pesticides, agribusiness, food production, and related topics. If a user asks about anything NOT related to agriculture (e.g. politics, entertainment, coding, general knowledge, sports, etc.), you must firmly but politely refuse with this exact response: "🌾 AgriMind is a specialized agricultural advisor. I can only help with farming, crops, soil, livestock, irrigation, and related agriculture topics. Please ask an agriculture-related question!"

Always:
- Give specific, actionable advice with product names where relevant
- Ask clarifying questions when needed (crop type, location, symptoms, soil type)
- Structure answers with clear sections using markdown
- Mention safety warnings for pesticides/chemicals
- Respond in the same language the user writes in (English, Urdu اردو, or Sindhi سنڌي)
- Use bullet points, numbered lists, and headers for readability
- Be thorough but concise
- Reference up-to-date 2026 agricultural practices, varieties, and recommendations where applicable`;

// ─── Auth helpers ────────────────────────────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem("agrimind_users") || "{}"); } catch { return {}; }
}
function saveUsers(u) { localStorage.setItem("agrimind_users", JSON.stringify(u)); }
function getSession() {
  try { return JSON.parse(localStorage.getItem("agrimind_session") || "null"); } catch { return null; }
}
function saveSession(u) { localStorage.setItem("agrimind_session", JSON.stringify(u)); }
function clearSession() { localStorage.removeItem("agrimind_session"); }
function hashPw(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h) ^ pw.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// ─── Auth Screen ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = () => {
    setError("");
    if (!username.trim() || !password) { triggerError("Please fill in all fields."); return; }
    const users = getUsers();
    const key = username.trim().toLowerCase();
    if (!users[key]) { triggerError("No account found. Please sign up."); return; }
    if (users[key].password !== hashPw(password)) { triggerError("Wrong password. Try again."); return; }
    const session = { username: key, name: users[key].name };
    saveSession(session);
    onLogin(session);
  };

  const handleSignup = () => {
    setError("");
    if (!name.trim() || !username.trim() || !password) { triggerError("Please fill in all fields."); return; }
    if (password.length < 6) { triggerError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { triggerError("Passwords do not match."); return; }
    const users = getUsers();
    const key = username.trim().toLowerCase();
    if (users[key]) { triggerError("Username already taken. Choose another."); return; }
    users[key] = { name: name.trim(), password: hashPw(password), createdAt: Date.now() };
    saveUsers(users);
    const session = { username: key, name: name.trim() };
    saveSession(session);
    onLogin(session);
  };

  const inp = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: "1.5px solid #b0d8ba", background: "#f8fdf9",
    color: "#1b4332", fontSize: 15, boxSizing: "border-box",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#d8f3dc 0%,#b7e4c7 40%,#74c69d 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 380,
        boxShadow: "0 20px 60px rgba(27,67,50,0.18)",
        animation: shake ? "shake 0.45s ease" : "slideUp 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 6 }}>🌾</div>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#1b4332", letterSpacing: -0.5 }}>AgriMind</div>
          <div style={{ fontSize: 13, color: "#52b788", marginTop: 2 }}>Free AI Farm Advisor</div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: "#f0f7f1", borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 9, border: "none",
                background: tab === t ? "#1b4332" : "transparent",
                color: tab === t ? "#fff" : "#52b788",
                fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
              }}>
              {t === "login" ? "🔑 Login" : "🌱 Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <input placeholder="👤 Full Name" value={name} onChange={e => setName(e.target.value)} style={inp} />
          )}
          <input
            placeholder="🪪 Username" value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleSignup())}
            style={{ ...inp, textTransform: "lowercase" }} autoCapitalize="none" autoCorrect="off"
          />
          <div style={{ position: "relative" }}>
            <input
              placeholder="🔒 Password" type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleSignup())}
              style={{ ...inp, paddingRight: 48 }}
            />
            <button onClick={() => setShowPw(s => !s)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#52b788" }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {tab === "signup" && (
            <input
              placeholder="🔒 Confirm Password" type={showPw ? "text" : "password"} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignup()}
              style={inp}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={tab === "login" ? handleLogin : handleSignup}
          style={{
            width: "100%", marginTop: 18, padding: "14px", borderRadius: 13,
            background: "linear-gradient(135deg,#2d6a4f,#1b4332)",
            color: "#fff", border: "none", fontWeight: 800, fontSize: 16,
            cursor: "pointer", letterSpacing: 0.3,
            boxShadow: "0 4px 15px rgba(27,67,50,0.3)",
          }}>
          {tab === "login" ? "🚀 Login to AgriMind" : "🌿 Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#74c69d", marginTop: 14 }}>
          Powered by Groq + Llama 3 · 100% Free
        </p>
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
        }
        input:focus { border-color:#40916c!important; box-shadow:0 0 0 3px rgba(64,145,108,0.12); }
      `}</style>
    </div>
  );
}

// ─── Root (session gate) ─────────────────────────────────────────────────────
export default function Root() {
  const [session, setSession] = useState(() => getSession());
  if (!session) return <AuthScreen onLogin={setSession} />;
  return <AgriAssistant session={session} onLogout={() => { clearSession(); setSession(null); }} />;
}

// ─── Main Chat App ────────────────────────────────────────────────────────────
function AgriAssistant({ session, onLogout }) {
  const [apiKey, setApiKey] = useState(() => GROQ_API_KEY || localStorage.getItem("groq_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(() => !GROQ_API_KEY && !localStorage.getItem("groq_key"));
  const [selectedModel, setSelectedModel] = useState(GROQ_MODELS[0].id);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `🌱 **Assalam-o-Alaikum, ${session.name}! Welcome to AgriMind.**\n\nI'm your free AI agricultural advisor powered by **Groq + Llama 3**. I can help you with:\n\n- 🔬 Crop disease diagnosis\n- 🐛 Pest identification & control\n- 💧 Irrigation planning\n- 🪨 Soil health & fertilizers\n- 🌾 Complete crop management\n- 🧮 Fertilizer & spray calculations\n\nSelect an **Expert Mode** or just ask your question!\n\nکھیتی باڑی کے بارے میں کیا جاننا چاہتے ہیں؟ 🌿` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [activeMode, setActiveMode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [farmProfile, setFarmProfile] = useState({ district: "", coordinates: "", cropType: "", soilType: "", size: "" });
  const [showProfile, setShowProfile] = useState(false);
  const [showModeSheet, setShowModeSheet] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [savedChats, setSavedChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`agrimind_chats_${session.username}`) || "[]"); } catch { return []; }
  });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Weather state ──────────────────────────────────────────────────────────
  const [weather, setWeather] = useState(null);
  const [weatherLocation, setWeatherLocation] = useState("Multan");
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState(PAKISTAN_CITIES[0]); // default Multan

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (!m) setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    if (window.innerWidth >= 768) setSidebarOpen(true);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Fetch weather whenever selectedCity changes (default: Multan) ─────────
  useEffect(() => {
    fetchWeather(selectedCity.lat, selectedCity.lon)
      .then(w => { setWeather(w); setWeatherLocation(selectedCity.name); })
      .catch(() => {});
  }, [selectedCity]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamText]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (!showUserMenu) return;
    const close = (e) => setShowUserMenu(false);
    setTimeout(() => document.addEventListener("click", close), 10);
    return () => document.removeEventListener("click", close);
  }, [showUserMenu]);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem("groq_key", k);
    setApiKey(k);
    setShowKeyModal(false);
  };

  const buildSystem = () => {
    let sys = SYSTEM_BASE;
    const mode = EXPERT_MODES.find(m => m.id === activeMode);
    if (mode) sys += `\n\nACTIVE EXPERT MODE — ${mode.label}:\n${mode.prompt}`;
    const p = farmProfile;
    if (p.district || p.cropType || p.soilType || p.size)
      sys += `\n\nFARMER PROFILE:\n- District: ${p.district||"not set"}\n- Coordinates: ${p.coordinates||"not set"}\n- Crops: ${p.cropType||"not set"}\n- Soil: ${p.soilType||"not set"}\n- Farm Size: ${p.size||"not set"}`;
    return sys;
  };

  // ── Agriculture topic classifier (lightweight Groq call) ─────────────────
  const checkIfAgri = async (msg, key, model) => {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model, max_tokens: 5,
          messages: [
            { role: "system", content: "Reply only YES or NO. Is the following question related to agriculture, farming, crops, soil, irrigation, livestock, fertilizers, or plant/animal health?" },
            { role: "user", content: msg }
          ],
        }),
      });
      const d = await res.json();
      const reply = (d.choices?.[0]?.message?.content || "YES").toUpperCase();
      return reply.includes("YES");
    } catch { return true; } // fail open
  };

  const sendMessage = async (text) => {
    const msg = text !== undefined ? text : input.trim();
    if (!msg || loading) return;
    if (!apiKey) { setShowKeyModal(true); return; }
    if (isMobile) setSidebarOpen(false);

    // ── Agriculture-only pre-check ──────────────────────────────────────────
    const agriKeywords = /agri|farm|crop|soil|pest|fertiliz|irrigation|harvest|seed|plant|wheat|rice|cotton|maize|sugarcane|vegetable|fruit|livestock|poultry|cattle|disease|fungal|bacteria|virus|weed|herbicide|pesticide|insect|drought|flood|yield|sow|cultivat|orchard|nursery|compost|organic|manure|tractor|spray|khet|fasal|zara|beemar|keeda|pani|khad|فصل|مٹی|کھیت|آبپاشی|کھاد|کیڑے|بیماری|زراعت|مویشی|فصلون|مٽي|ٻج|پوک|آبياري|fasal|mitti|beej|darakht|paudha|phool|phal|sabzi|gehun|chawal|makka|ganna|kapas|sarson|alu|tamatar|pyaz|lahsun|kheera|gobi|bhindi|mirch|kisan|dehqan|zameen|kheti|bari|paani|barish|mosam|khad|dawai|spray|tractor|pump|nali|nahar|band|khal|khurpa|dranty|thresher|combine|silo|godam|mandi|bhao|qeemat|munafa|nuqsan|pest|phaphoond|virus|bacteria|fungus|keera|rog|ilaj|dawa|zehreela|mehnat|fasal katna|bona|lagana|ugana|sina|peela|sukha|murjhana|jalna|sadna|galna/i;
    if (!agriKeywords.test(msg) && msg.trim().split(/\s+/).length > 3) {
      const agriCheck = await checkIfAgri(msg, apiKey, selectedModel);
      if (!agriCheck) {
        const refusal = "🌾 AgriMind is a specialized agricultural advisor. I can only help with farming, crops, soil, livestock, irrigation, and related agriculture topics. Please ask an agriculture-related question!";
        setMessages(prev => [...prev, { role: "user", content: msg }, { role: "assistant", content: refusal }]);
        setInput("");
        return;
      }
    }

    const userMsg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamText("");

    const apiMsgs = newMessages.slice(-14).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "system", content: buildSystem() }, ...apiMsgs],
          temperature: 0.7, max_tokens: 2048, stream: true,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `HTTP ${res.status}`); }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try { const delta = JSON.parse(data).choices?.[0]?.delta?.content || ""; full += delta; setStreamText(full); } catch {}
        }
      }
      setMessages([...newMessages, { role: "assistant", content: full }]);
      setStreamText("");
    } catch (err) {
      const errMsg = err.message.includes("401") ? "❌ **Invalid API Key.** Please check your Groq key."
        : err.message.includes("429") ? "⏳ **Rate limit reached.** Please wait a moment."
        : `❌ **Error:** ${err.message}`;
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      setStreamText("");
    } finally { setLoading(false); }
  };

  const clearChat = () => {
    const firstUser = messages.find(m => m.role === "user");
    if (firstUser) {
      const newSaved = [...savedChats, { id: Date.now(), title: firstUser.content.slice(0, 42), msgs: messages }].slice(-20);
      setSavedChats(newSaved);
      localStorage.setItem(`agrimind_chats_${session.username}`, JSON.stringify(newSaved));
    }
    setMessages([{ role: "assistant", content: "🌱 New session started. Ask me anything about farming!" }]);
    if (isMobile) setSidebarOpen(false);
  };

  const md = (text) => text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.12);padding:1px 6px;border-radius:4px;font-size:0.87em;font-family:monospace">$1</code>')
    .replace(/^### (.+)$/gm, '<div style="font-weight:700;font-size:0.97em;margin:10px 0 3px">$1</div>')
    .replace(/^## (.+)$/gm, '<div style="font-weight:700;font-size:1.04em;margin:12px 0 4px">$1</div>')
    .replace(/^# (.+)$/gm, '<div style="font-weight:700;font-size:1.1em;margin:12px 0 5px">$1</div>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;list-style-type:decimal">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, s => `<ul style="margin:6px 0;padding-left:22px">${s}</ul>`)
    .replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

  const activeModeObj = EXPERT_MODES.find(m => m.id === activeMode);
  const initials = session.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const C = {
    bg:          darkMode ? "#0b1f12" : "#f0f7f1",
    sidebar:     darkMode ? "#081510" : "#ffffff",
    border:      darkMode ? "#1a3a22" : "#d0ead4",
    header:      darkMode ? "#081510" : "#1b4332",
    text:        darkMode ? "#e0f0e4" : "#1b4332",
    muted:       darkMode ? "#6dbf7e" : "#4a7c59",
    accent:      "#40916c",
    accentDark:  "#2d6a4f",
    userBg:      "#2d6a4f",
    aiBg:        darkMode ? "#0f2a17" : "#ffffff",
    aiBorder:    darkMode ? "#1a4a2a" : "#c3e6cb",
    chip:        darkMode ? "#0f2a17" : "#e8f5eb",
    chipBorder:  darkMode ? "#2d6a4f" : "#9dd4a8",
    inputBg:     darkMode ? "#081510" : "#ffffff",
    inputBorder: darkMode ? "#2d6a4f" : "#b0d8ba",
    modalBg:     darkMode ? "#0b1f12" : "#ffffff",
    overlay:     "rgba(0,0,0,0.5)",
  };

  return (
    <div style={{ display:"flex", height:"100dvh", background:C.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:C.text, overflow:"hidden", position:"relative" }}>

      {/* ── API Key Modal ── */}
      {showKeyModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.modalBg, borderRadius:18, padding:28, width:"100%", maxWidth:420, border:`2px solid ${C.accent}` }}>
            <div style={{ textAlign:"center", fontSize:40, marginBottom:6 }}>🌾</div>
            <h2 style={{ textAlign:"center", margin:"0 0 6px", color:C.accentDark, fontSize:20 }}>Enter Groq API Key</h2>
            <p style={{ textAlign:"center", color:C.muted, fontSize:13, margin:"0 0 18px" }}>Powered by <strong>Groq + Llama 3</strong> — 100% Free</p>
            <div style={{ background:darkMode?"#0f2a17":"#e8f5eb", borderRadius:10, padding:"12px 14px", marginBottom:16, fontSize:13, color:C.muted, lineHeight:1.7 }}>
              <strong style={{ color:C.accentDark }}>Get your free Groq API key:</strong><br/>
              1. Go to <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color:C.accent }}>console.groq.com/keys</a><br/>
              2. Sign up free → Create API Key → Copy ✅
            </div>
            <input type="password" placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx" value={keyInput}
              onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key==="Enter" && saveKey()} autoFocus
              style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none", marginBottom:12 }} />
            <button onClick={saveKey} disabled={!keyInput.trim()}
              style={{ width:"100%", padding:"13px", borderRadius:10, background:C.accentDark, color:"#fff", border:"none", fontSize:15, fontWeight:700, cursor:"pointer", opacity:keyInput.trim()?1:0.5 }}>
              🚀 Start AgriMind
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:C.muted, marginTop:10 }}>14,400 free requests/day • No credit card needed</p>
          </div>
        </div>
      )}

      {/* ── Farm Profile Modal ── */}
      {showProfile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:C.modalBg, borderRadius:16, padding:24, width:"100%", maxWidth:390, border:`1.5px solid ${C.accent}`, maxHeight:"90dvh", overflowY:"auto" }}>
            <h3 style={{ margin:"0 0 4px", color:C.accentDark, fontSize:16 }}>🌿 Your Farm Profile</h3>
            <p style={{ fontSize:12, color:C.muted, margin:"0 0 14px" }}>Helps AgriMind give personalized advice.</p>

            {/* District Dropdown */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>📍 District / City</label>
              <select value={farmProfile.district} onChange={e => setFarmProfile(p=>({...p, district:e.target.value}))}
                style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" }}>
                <option value="">-- Select District --</option>
                {PAKISTAN_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Coordinates */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>🌐 Farm Coordinates <span style={{ fontWeight:400 }}>(optional)</span></label>
              <input value={farmProfile.coordinates} onChange={e => setFarmProfile(p=>({...p, coordinates:e.target.value}))}
                placeholder="e.g. 30.1575, 71.5249"
                style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" }} />
              <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>Paste GPS coordinates from Google Maps for precise advice</div>
            </div>

            {/* Other fields */}
            {[
              ["cropType","🌾 Current Crops","e.g. Wheat, Cotton, Rice"],
              ["soilType","🪨 Soil Type","e.g. Sandy Loam, Clay"],
              ["size","📐 Farm Size","e.g. 10 acres"],
            ].map(([key,label,ph]) => (
              <div key={key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:4 }}>{label}</label>
                <input value={farmProfile[key]} onChange={e => setFarmProfile(p=>({...p,[key]:e.target.value}))} placeholder={ph}
                  style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" }} />
              </div>
            ))}

            {/* Weather City Picker */}
            <div style={{ marginBottom:12, padding:"10px 13px", borderRadius:8, border:`1.5px solid ${C.accent}`, background: darkMode?"rgba(82,183,136,0.08)":"rgba(82,183,136,0.06)" }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.accentDark, display:"block", marginBottom:6 }}>🌤️ Weather Monitoring City</label>
              <select value={selectedCity.name} onChange={e => {
                const city = PAKISTAN_CITIES.find(c => c.name === e.target.value);
                if (city) setSelectedCity(city);
              }} style={{ width:"100%", padding:"9px 13px", borderRadius:8, border:`1.5px solid ${C.inputBorder}`, background:C.inputBg, color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" }}>
                {PAKISTAN_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>Current: {weatherLocation} {weather ? `• ${weather.temp}°C ${weather.desc}` : ""}</div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={()=>setShowProfile(false)} style={{ flex:1, padding:"11px", borderRadius:9, background:C.accentDark, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}>Save</button>
              <button onClick={()=>setShowProfile(false)} style={{ padding:"11px 18px", borderRadius:9, background:"transparent", color:C.muted, border:`1.5px solid ${C.inputBorder}`, cursor:"pointer", fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expert Mode Bottom Sheet (mobile) ── */}
      {showModeSheet && isMobile && (
        <div style={{ position:"fixed", inset:0, zIndex:998, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} onClick={()=>setShowModeSheet(false)} />
          <div style={{ position:"relative", background:C.sidebar, borderRadius:"20px 20px 0 0", padding:"16px 16px 40px", maxHeight:"75dvh", overflowY:"auto" }}>
            <div style={{ width:40, height:4, background:C.chipBorder, borderRadius:2, margin:"0 auto 16px" }} />
            <div style={{ fontSize:13, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.9, marginBottom:10 }}>Expert Modes</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {EXPERT_MODES.map(mode => (
                <button key={mode.id} onClick={()=>{setActiveMode(activeMode===mode.id?null:mode.id);setShowModeSheet(false);}}
                  style={{ padding:"12px 10px", borderRadius:12, border:`1.5px solid ${activeMode===mode.id?C.accentDark:C.chipBorder}`, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8, background:activeMode===mode.id?C.accentDark:C.chip, color:activeMode===mode.id?"#fff":C.text }}>
                  <span style={{ fontSize:20 }}>{mode.icon}</span>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{mode.label}</div>
                    <div style={{ fontSize:10, opacity:0.6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile sidebar overlay ── */}
      {isMobile && sidebarOpen && (
        <div style={{ position:"fixed", inset:0, background:C.overlay, zIndex:89 }} onClick={()=>setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div style={{
          width:265, background:C.sidebar, borderRight:`1px solid ${C.border}`,
          display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0,
          ...(isMobile?{position:"fixed",top:0,left:0,height:"100dvh",zIndex:90,boxShadow:"4px 0 24px rgba(0,0,0,0.22)"}:{}),
        }}>
          {/* Sidebar header */}
          <div style={{ padding:"16px 14px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:C.accentDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🌾</div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:C.accentDark }}>AgriMind</div>
                <div style={{ fontSize:10, color:C.muted }}>Free AI Farm Advisor</div>
              </div>
            </div>
            {isMobile && <button onClick={()=>setSidebarOpen(false)} style={{ background:"transparent", border:"none", color:C.muted, fontSize:22, cursor:"pointer", padding:4 }}>✕</button>}
          </div>

          {/* User card */}
          <div style={{ padding:"10px 12px 6px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, background:C.chip, border:`1px solid ${C.chipBorder}` }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#40916c,#1b4332)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                {initials}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{session.name}</div>
                <div style={{ fontSize:10, color:C.muted }}>@{session.username}</div>
              </div>
            </div>
          </div>

          {/* Model */}
          <div style={{ padding:"6px 12px" }}>
            <label style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.8, display:"block", marginBottom:5 }}>AI Model</label>
            <select value={selectedModel} onChange={e=>setSelectedModel(e.target.value)}
              style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C.chipBorder}`, background:C.inputBg, color:C.text, fontSize:13, cursor:"pointer", outline:"none" }}>
              {GROQ_MODELS.map(m=><option key={m.id} value={m.id}>{m.label} — {m.desc}</option>)}
            </select>
          </div>

          {/* New chat */}
          <div style={{ padding:"4px 12px 6px" }}>
            <button onClick={clearChat} style={{ width:"100%", padding:"9px", borderRadius:10, background:"transparent", border:`1.5px solid ${C.accent}`, color:C.accent, fontWeight:700, fontSize:13, cursor:"pointer" }}>
              ✏️ New Chat
            </button>
          </div>

          {/* Expert modes list */}
          <div style={{ padding:"4px 10px 8px", flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.9, margin:"4px 4px 7px" }}>Expert Modes</div>
            {EXPERT_MODES.map(mode=>(
              <button key={mode.id} onClick={()=>{setActiveMode(activeMode===mode.id?null:mode.id);if(isMobile)setSidebarOpen(false);}}
                style={{ width:"100%", padding:"8px 9px", borderRadius:8, border:"none", cursor:"pointer", textAlign:"left", marginBottom:2, display:"flex", alignItems:"center", gap:9, background:activeMode===mode.id?C.accentDark:"transparent", color:activeMode===mode.id?"#fff":C.text }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{mode.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{mode.label}</div>
                  <div style={{ fontSize:10, opacity:0.65, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Saved chats */}
          {savedChats.length>0 && (
            <div style={{ padding:"6px 10px 6px", borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:0.9, margin:"4px 4px 7px" }}>Recent Chats</div>
              {savedChats.slice(-6).reverse().map(chat=>(
                <button key={chat.id} onClick={()=>{setMessages(chat.msgs);if(isMobile)setSidebarOpen(false);}}
                  style={{ width:"100%", padding:"6px 9px", borderRadius:7, border:"none", cursor:"pointer", textAlign:"left", background:"transparent", color:C.muted, fontSize:12, marginBottom:1, display:"block", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  💬 {chat.title}
                </button>
              ))}
            </div>
          )}

          {/* Bottom controls */}
          <div style={{ padding:"10px 10px 20px", borderTop:`1px solid ${C.border}` }}>
            <button onClick={()=>{setShowProfile(true);if(isMobile)setSidebarOpen(false);}}
              style={{ width:"100%", padding:"9px 10px", borderRadius:10, background:C.chip, border:`1px solid ${C.chipBorder}`, color:C.text, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
              <span>🌿</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontWeight:600, fontSize:12.5 }}>Farm Profile</div>
                <div style={{ fontSize:10, color:C.muted }}>{farmProfile.district||"Add your farm details"}</div>
              </div>
            </button>
            <button onClick={()=>setDarkMode(d=>!d)}
              style={{ width:"100%", padding:"8px", borderRadius:8, background:"transparent", border:`1px solid ${C.chipBorder}`, color:C.muted, cursor:"pointer", fontSize:12, marginBottom:7 }}>
              {darkMode?"☀️ Light Mode":"🌙 Dark Mode"}
            </button>
            <button onClick={onLogout}
              style={{ width:"100%", padding:"8px", borderRadius:8, background:"transparent", border:"1px solid #fca5a5", color:"#dc2626", cursor:"pointer", fontSize:12, fontWeight:600 }}>
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* ── Main Chat ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <div style={{ background:C.header, padding:"11px 14px", display:"flex", alignItems:"center", gap:10, flexShrink:0, boxShadow:"0 2px 10px rgba(0,0,0,0.25)" }}>
          <button onClick={()=>setSidebarOpen(s=>!s)} style={{ background:"transparent", border:"none", color:"#fff", cursor:"pointer", fontSize:22, padding:0, lineHeight:1, flexShrink:0 }}>☰</button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {activeModeObj?`${activeModeObj.icon} ${activeModeObj.label}`:"🌾 AgriMind"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.55)", fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {activeModeObj?activeModeObj.desc:`Groq + ${GROQ_MODELS.find(m=>m.id===selectedModel)?.label}`}
            </div>
          </div>

          {/* ── Real-time Weather Bar ── */}
          {weather && (
            <div onClick={()=>setShowProfile(true)} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.13)", borderRadius:10, padding:"4px 10px", flexShrink:0, cursor:"pointer" }} title="Click to change weather city">
              <span style={{ fontSize:15 }}>{weather.desc.split(" ")[1] || "🌡️"}</span>
              <div style={{ lineHeight:1.2 }}>
                <div style={{ color:"#fff", fontSize:13, fontWeight:700 }}>{weather.temp}°C</div>
                {!isMobile && <div style={{ color:"rgba(255,255,255,0.65)", fontSize:9, whiteSpace:"nowrap" }}>{weatherLocation} • {weather.desc.split(" ")[0]}</div>}
              </div>
            </div>
          )}

          {/* Mobile mode button */}
          {isMobile && (
            <button onClick={()=>setShowModeSheet(true)}
              style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", cursor:"pointer", padding:"6px 10px", borderRadius:8, fontSize:12, flexShrink:0, whiteSpace:"nowrap" }}>
              {activeModeObj?activeModeObj.icon:"🔧 Mode"}
            </button>
          )}

          {activeModeObj && (
            <button onClick={()=>setActiveMode(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", cursor:"pointer", padding:"5px 10px", borderRadius:7, fontSize:12, flexShrink:0 }}>✕</button>
          )}

          {loading && !isMobile && <div style={{ color:"#a5d6a7", fontSize:12, display:"flex", alignItems:"center", gap:5, flexShrink:0 }}><Dots color="#a5d6a7"/> Thinking</div>}

          {/* Avatar with dropdown */}
          <div style={{ position:"relative", flexShrink:0 }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowUserMenu(s=>!s)}
              style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#52b788,#2d6a4f)", border:"2px solid rgba(255,255,255,0.3)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {initials}
            </button>
            {showUserMenu && (
              <div style={{ position:"absolute", top:42, right:0, background:C.modalBg, border:`1px solid ${C.border}`, borderRadius:12, padding:8, minWidth:170, boxShadow:"0 8px 30px rgba(0,0,0,0.18)", zIndex:500 }}>
                <div style={{ padding:"6px 10px 10px", borderBottom:`1px solid ${C.border}`, marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{session.name}</div>
                  <div style={{ fontSize:11, color:C.muted }}>@{session.username}</div>
                </div>
                <button onClick={()=>{setShowProfile(true);setShowUserMenu(false);}} style={{ width:"100%", padding:"8px 10px", border:"none", background:"transparent", color:C.text, cursor:"pointer", textAlign:"left", borderRadius:8, fontSize:13 }}>🌿 Farm Profile</button>
                <button onClick={()=>{setDarkMode(d=>!d);setShowUserMenu(false);}} style={{ width:"100%", padding:"8px 10px", border:"none", background:"transparent", color:C.text, cursor:"pointer", textAlign:"left", borderRadius:8, fontSize:13 }}>{darkMode?"☀️ Light Mode":"🌙 Dark Mode"}</button>
                <button onClick={onLogout} style={{ width:"100%", padding:"8px 10px", border:"none", background:"transparent", color:"#dc2626", cursor:"pointer", textAlign:"left", borderRadius:8, fontSize:13, fontWeight:600 }}>🚪 Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:isMobile?"12px 10px":"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>
          {messages.map((msg,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start", alignItems:"flex-start", gap:8 }}>
              {msg.role==="assistant" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:C.accentDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, marginTop:2 }}>🌾</div>
              )}
              <div style={{ maxWidth:isMobile?"85%":"78%", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px", padding:"10px 14px", background:msg.role==="user"?C.userBg:C.aiBg, color:msg.role==="user"?"#fff":C.text, border:msg.role==="user"?"none":`1px solid ${C.aiBorder}`, fontSize:14, lineHeight:1.65, wordBreak:"break-word" }}>
                <div dangerouslySetInnerHTML={{ __html:md(msg.content) }} />
              </div>
              {msg.role==="user" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#52b788,#2d6a4f)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13, flexShrink:0, marginTop:2 }}>
                  {initials}
                </div>
              )}
            </div>
          ))}

          {(loading&&streamText) && (
            <div style={{ display:"flex", justifyContent:"flex-start", alignItems:"flex-start", gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.accentDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, marginTop:2 }}>🌾</div>
              <div style={{ maxWidth:isMobile?"85%":"78%", borderRadius:"4px 18px 18px 18px", padding:"10px 14px", background:C.aiBg, color:C.text, border:`1px solid ${C.aiBorder}`, fontSize:14, lineHeight:1.65, wordBreak:"break-word" }}>
                <div dangerouslySetInnerHTML={{ __html:md(streamText) }} />
                <span style={{ display:"inline-block", width:7, height:15, background:C.accent, borderRadius:2, marginLeft:2, verticalAlign:"text-bottom", animation:"blink 0.9s infinite" }} />
              </div>
            </div>
          )}

          {(loading&&!streamText) && (
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.accentDark, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🌾</div>
              <div style={{ padding:"12px 16px", background:C.aiBg, border:`1px solid ${C.aiBorder}`, borderRadius:"4px 18px 18px 18px" }}>
                <Dots color={C.accent}/>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Quick chips */}
        {messages.length<=2 && (
          <div style={{ padding:"2px 10px 6px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {QUICK_CHIPS.map(chip=>(
              <button key={chip} onClick={()=>sendMessage(chip)}
                style={{ padding:"6px 12px", borderRadius:20, background:C.chip, border:`1px solid ${C.chipBorder}`, color:C.text, fontSize:12, cursor:"pointer", fontWeight:500, whiteSpace:"nowrap" }}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding:isMobile?"8px 10px 16px":"10px 14px 14px", background:C.inputBg, borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:C.bg, borderRadius:14, border:`1.5px solid ${C.inputBorder}`, padding:"8px 8px 8px 14px" }}>
            <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!isMobile){e.preventDefault();sendMessage();}}}
              rows={1}
              placeholder={activeModeObj?`Ask ${activeModeObj.label}...`:"Ask about crops, diseases, pests... 🌱"}
              style={{ flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontSize:14, color:C.text, lineHeight:1.6, maxHeight:120, padding:0, fontFamily:"inherit" }} />
            <button onClick={()=>sendMessage()} disabled={loading||!input.trim()}
              style={{ width:40, height:40, borderRadius:10, background:loading||!input.trim()?C.muted:C.accentDark, border:"none", color:"#fff", cursor:loading||!input.trim()?"not-allowed":"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.2s" }}>
              {loading?"⏳":"⬆️"}
            </button>
          </div>
          <div style={{ textAlign:"center", marginTop:5, fontSize:10, color:C.muted }}>
            AgriMind • Groq • English, اردو, سنڌي
          </div>
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes dot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${C.chipBorder};border-radius:10px}
        ::-webkit-scrollbar-track{background:transparent}
        textarea::placeholder{color:${C.muted};opacity:0.65}
        input::placeholder{color:${C.muted};opacity:0.65}
        button{-webkit-tap-highlight-color:transparent}
        select option{background:${C.inputBg}}
      `}</style>
    </div>
  );
}

function Dots({ color="#40916c" }) {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:color, animation:`dot 1.2s ${i*0.22}s infinite ease-in-out` }}/>
      ))}
    </div>
  );
}
