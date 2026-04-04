import { useState, useEffect, useRef } from "react";

// ─── URL ROUTING ──────────────────────────────────────────────────────────────
const urlToPage = (pathname) => pathname.replace(/^\//, '') || 'home';
const pageToUrl = (page) => page === 'home' ? '/' : '/' + page;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=JetBrains+Mono:wght@400;500&family=Bebas+Neue&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #060d06; }
  input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
  input[type=range]::-webkit-slider-runnable-track { background: #1a2e1a; height: 3px; border-radius: 2px; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #6ee85a; border-radius: 50%; margin-top: -6.5px; box-shadow: 0 0 10px #6ee85a55; cursor: pointer; }
  select { appearance: none; -webkit-appearance: none; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .fade-in { animation: fadeIn 0.35s ease both; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #060d06; }
  ::-webkit-scrollbar-thumb { background: #1e3a1e; border-radius: 2px; }
  .article-body h2 { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:#0a0804; margin:2rem 0 0.8rem; line-height:1.3; }
  .article-body h3 { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:600; color:#e8e0d0; margin:1.6rem 0 0.6rem; }
  .article-body p { margin-bottom:1rem; color:#2c1e0e; font-family:'Source Serif 4',serif; font-size:0.95rem; line-height:1.85; }
  .article-body ul { padding-left:1.4rem; margin-bottom:1.1rem; }
  .article-body li { margin-bottom:0.45rem; color:#2c1e0e; font-family:'Source Serif 4',serif; font-size:0.95rem; line-height:1.7; }
  .article-body strong { color:#1a1208; font-weight:600; }
  .article-body em { font-style:italic; }
  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
    .stack-mobile { flex-direction: column !important; }
    .full-mobile { width: 100% !important; grid-template-columns: 1fr !important; }
    .pad-mobile { padding: 1rem !important; }
    .text-sm-mobile { font-size: 0.75rem !important; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SITE = "HarvestMyCrypto";
const DOMAIN = "harvestmycrypto.com";
const TAX_BRACKETS = [
  { label:"10%  — Under $11,600",        value:10 },
  { label:"12%  — $11,601–$47,150",      value:12 },
  { label:"22%  — $47,151–$100,525",     value:22 },
  { label:"24%  — $100,526–$191,950",    value:24 },
  { label:"32%  — $191,951–$243,725",    value:32 },
  { label:"35%  — $243,726–$609,350",    value:35 },
  { label:"37%  — Over $609,350",        value:37 },
];
const LT_RATES = [
  { label:"0%  — Income under $47,025",  value:0  },
  { label:"15% — $47,026–$518,900",      value:15 },
  { label:"20% — Over $518,900",         value:20 },
];
const ARTICLES = [
  { id:"crypto-taxed",  cat:"Tax Basics",    tag:"ESSENTIAL", time:"7 min", emoji:"💡",
    title:"How Is Crypto Taxed? A Plain-English Guide",
    sub:"Everything you need to know — without the jargon." },
  { id:"wash-sale",     cat:"Strategy",      tag:"LOOPHOLE",  time:"5 min", emoji:"🔄",
    title:"Does the Wash Sale Rule Apply to Crypto?",
    sub:"The answer is a loophole most investors don't know about." },
  { id:"write-off",     cat:"Deductions",    tag:"POPULAR",   time:"6 min", emoji:"📉",
    title:"How Much Crypto Losses Can You Write Off?",
    sub:"The IRS has specific limits — and a powerful carryforward rule." },
  { id:"swap-taxes",    cat:"Taxable Events",tag:"MUST-READ", time:"5 min", emoji:"⇌",
    title:"Crypto Swap Taxes: Trading One Coin for Another",
    sub:"Most investors are surprised — crypto-to-crypto trades are taxable." },
  { id:"short-long",    cat:"Strategy",      tag:"STRATEGY",  time:"6 min", emoji:"⏱",
    title:"Short-Term vs. Long-Term Crypto Taxes",
    sub:"One timing decision can cut your tax rate nearly in half." },
  { id:"free-calculator",  cat:"Tools",         tag:"FREE",      time:"3 min", emoji:"🧮",
    title:"Is There a Free Crypto Tax Calculator?",
    sub:"Yes — and here's what the best ones actually calculate." },
  { id:"bitcoin-taxed",    cat:"Tax Basics",    tag:"BITCOIN",   time:"6 min", emoji:"₿",
    title:"How Is Bitcoin Taxed? Everything You Need to Know",
    sub:"Bitcoin has its own tax quirks — here's the complete picture." },
  { id:"reduce-taxes",     cat:"Strategy",      tag:"SAVE",      time:"7 min", emoji:"💰",
    title:"How Can I Reduce My Crypto Taxes Legally?",
    sub:"Six strategies that actually work — backed by IRS rules." },
  { id:"worth-it",         cat:"Strategy",      tag:"ANALYSIS",  time:"5 min", emoji:"⚖️",
    title:"Is Tax-Loss Harvesting Worth It?",
    sub:"The honest answer — with real numbers to help you decide." },
  { id:"irs-knows",        cat:"Compliance",    tag:"IRS",       time:"5 min", emoji:"👁",
    title:"Does the IRS Know If You Sell Crypto?",
    sub:"More than most investors realize. Here's exactly what they see." },
];
const TAG_COLORS = { ESSENTIAL:"#2d6a4f", LOOPHOLE:"#7b52d4", POPULAR:"#e76f51", "MUST-READ":"#d62828", STRATEGY:"#457b9d", FREE:"#2d6a4f", BITCOIN:"#e8a020", SAVE:"#2d7a4f", ANALYSIS:"#457b9d", IRS:"#d62828" };
const $$ = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const pct = (n) => `${Number(n).toFixed(1)}%`;

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Card = ({ children, dark=false, style={}, delay=0 }) => (
  <div className="fade-up" style={{ animationDelay:`${delay}ms`,
    background: dark ? "#0a150a" : "#fff",
    border: dark ? "1px solid #1e3a1e" : "1px solid #e8e0d4",
    borderRadius:"13px", padding:"1.4rem", ...style }}>
    {children}
  </div>
);

const Mono = ({ children, style={} }) => (
  <span style={{ fontFamily:"'JetBrains Mono',monospace", ...style }}>{children}</span>
);

const Label = ({ children, light=false }) => (
  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
    letterSpacing:"0.16em", textTransform:"uppercase",
    color: light ? "#8aba8a" : "#8b7355", marginBottom:"0.5rem" }}>
    {children}
  </div>
);

const Tag = ({ children, color }) => (
  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.55rem",
    letterSpacing:"0.14em", textTransform:"uppercase", color:"#fff",
    background:color, padding:"0.18rem 0.45rem", borderRadius:"3px" }}>
    {children}
  </span>
);

const Divider = ({ dark=false, style={} }) => (
  <div style={{ height:"1px", background: dark?"#172717":"#e8e0d4", margin:"1.5rem 0", ...style }} />
);

function SliderRow({ label, value, onChange, min, max, step, pre="", suf="", hint, dark=true }) {
  return (
    <div style={{ marginBottom:"1.3rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"0.3rem" }}>
        <Label light={dark}>{label}</Label>
        <Mono style={{ fontSize:"0.9rem", color: dark?"#c8f0c0":"#2c2010", fontWeight:600 }}>
          {pre}{Number(value).toLocaleString()}{suf}
        </Mono>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{ accentColor:"#6ee85a" }} />
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"0.15rem" }}>
        <Mono style={{ fontSize:"0.55rem", color: dark?"#2a3a2a":"#a89070" }}>{pre}{Number(min).toLocaleString()}{suf}</Mono>
        <Mono style={{ fontSize:"0.55rem", color: dark?"#2a3a2a":"#a89070" }}>{pre}{Number(max).toLocaleString()}{suf}</Mono>
      </div>
      {hint && <p style={{ fontSize:"0.6rem", color: dark?"#3a5a3a":"#8b7355", marginTop:"0.2rem",
        fontStyle:"italic", fontFamily:"'JetBrains Mono',monospace" }}>{hint}</p>}
    </div>
  );
}

function SelectRow({ label, value, onChange, options, dark=true }) {
  return (
    <div style={{ marginBottom:"1.1rem" }}>
      <Label light={dark}>{label}</Label>
      <select value={value} onChange={e=>onChange(Number(e.target.value))} style={{
        width:"100%", padding:"0.5rem 0.8rem",
        background: dark?"#0a140a":"#faf9f6",
        border: dark?"1px solid #1a3a1a":"1px solid #ddd5c0",
        borderRadius:"7px", color: dark?"#c8f0c0":"#2c2010",
        fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", cursor:"pointer" }}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function BigStat({ label, value, highlight, sub, dark=true }) {
  return (
    <div style={{ flex:1, minWidth:120,
      background: highlight ? (dark?"linear-gradient(135deg,#152515,#0e1c0e)":"linear-gradient(135deg,#1a2e1a,#0f1f0f)") : (dark?"#0c160c":"#f5f0e8"),
      border: highlight ? "1px solid #6ee85a33" : (dark?"1px solid #182818":"1px solid #ddd5c0"),
      borderRadius:"10px", padding:"1rem 1.1rem", position:"relative", overflow:"hidden" }}>
      {highlight && <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px",
        background:"linear-gradient(90deg,transparent,#6ee85a,transparent)" }} />}
      <div style={{ fontSize:"0.58rem", letterSpacing:"0.13em", textTransform:"uppercase",
        color: highlight?"#4a8a4a":(dark?"#3a5a3a":"#8b7355"),
        fontFamily:"'JetBrains Mono',monospace", marginBottom:"0.4rem" }}>{label}</div>
      <div style={{ fontSize:"1.35rem", fontWeight:700,
        color: highlight?"#6ee85a":(dark?"#7a9a7a":"#2c2010"),
        fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:"0.58rem", color:dark?"#2a3a2a":"#8b7355",
        marginTop:"0.3rem", fontFamily:"'JetBrains Mono',monospace" }}>{sub}</div>}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid #e8e0d4" }}>
      <button onClick={()=>setOpen(!open)} style={{ width:"100%", padding:"0.85rem 0",
        background:"transparent", border:"none", cursor:"pointer",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        textAlign:"left", gap:"0.8rem" }}>
        <span style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.9rem",
          color:"#2c2416", fontWeight:600, lineHeight:1.4 }}>{q}</span>
        <span style={{ color:"#8b7355", fontSize:"1rem", flexShrink:0,
          transform:open?"rotate(45deg)":"none", transition:"transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom:"0.85rem", paddingRight:"1.5rem" }}>
          <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.85rem",
            color:"#5a4a35", lineHeight:1.75 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

function ToolCTA({ text="Use the Free Calculator →", navigate }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#1a2e1a,#0f1f0f)", borderRadius:"12px",
      padding:"1.6rem", margin:"2rem 0", border:"1px solid #2a4a2a",
      position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px",
        background:"linear-gradient(90deg,transparent,#6ee85a,transparent)" }} />
      <Mono style={{ fontSize:"0.58rem", letterSpacing:"0.18em", color:"#6ee85a",
        textTransform:"uppercase", display:"block", marginBottom:"0.4rem" }}>◈ Free Tool on HarvestMyCrypto</Mono>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem",
        color:"#e8f5e8", marginBottom:"0.4rem" }}>{text}</div>
      <p style={{ fontSize:"0.75rem", color:"#85b885", lineHeight:1.6, marginBottom:"1rem" }}>
        See your real dollar savings in under 60 seconds. No signup required.
      </p>
      <button onClick={()=>navigate("tools")} style={{ padding:"0.6rem 1.3rem",
        background:"#6ee85a", color:"#050e05", borderRadius:"6px",
        fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem",
        letterSpacing:"0.1em", fontWeight:500, border:"none", cursor:"pointer" }}>
        Open Calculator Suite →
      </button>
    </div>
  );
}

// ─── AFFILIATE SECTION ────────────────────────────────────────────────────────
const AFFILIATES = [
  {
    name: "Koinly",
    logo: "K",
    color: "#4f9cf9",
    tagline: "Best for most investors",
    desc: "Imports from 700+ exchanges. Auto-calculates gains, losses & Form 8949.",
    badge: "MOST POPULAR",
    badgeColor: "#2d6a4f",
    url: "https://koinly.io/?via=harvestmycrypto",
    features: ["700+ exchange integrations", "Form 8949 & Schedule D", "Free plan available"],
  },
  {
    name: "CoinTracker",
    logo: "CT",
    color: "#7c3aed",
    tagline: "Best for active traders",
    desc: "Real-time portfolio tracking + full tax filing. TurboTax integration built in.",
    badge: "TURBOTAX PARTNER",
    badgeColor: "#457b9d",
    url: "https://www.cointracker.io/?via=harvestmycrypto",
    features: ["Real-time tracking", "TurboTax direct sync", "DeFi & NFT support"],
  },
  {
    name: "TaxBit",
    logo: "TB",
    color: "#e85a30",
    tagline: "Best for US compliance",
    desc: "Built for US tax law. Automated tax-loss harvesting alerts year-round.",
    badge: "TLH ALERTS",
    badgeColor: "#8b7355",
    url: "https://taxbit.com/?via=harvestmycrypto",
    features: ["Automated TLH alerts", "IRS compliant reports", "Enterprise grade"],
  },
  {
    name: "ZenLedger",
    logo: "ZL",
    color: "#10b981",
    tagline: "Best for DeFi & NFTs",
    desc: "Handles complex DeFi transactions, NFT sales, and staking rewards.",
    badge: "DEFI SPECIALIST",
    badgeColor: "#2d6a4f",
    url: "https://zenledger.io/?via=harvestmycrypto",
    features: ["DeFi & NFT support", "Staking & mining income", "CPA dashboard"],
  },
];

function AffiliateSection() {
  return (
    <div style={{ marginTop:"2.5rem" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"1.4rem" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
          background:"#0a150a", border:"1px solid #1e3a1e", borderRadius:"999px",
          padding:"0.3rem 0.9rem", marginBottom:"0.8rem" }}>
          <span style={{ fontSize:"0.55rem", color:"#6ee85a" }}>●</span>
          <Mono style={{ fontSize:"0.58rem", color:"#5a9a5a", letterSpacing:"0.14em", textTransform:"uppercase" }}>
            Sponsored · Affiliate Links
          </Mono>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem",
          fontWeight:700, color:"#e8f5e8", marginBottom:"0.4rem" }}>
          Ready to File Your Full Crypto Tax Return?
        </h3>
        <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.8rem",
          color:"#7ab07a", maxWidth:"480px", margin:"0 auto", lineHeight:1.6 }}>
          Our free calculators show your estimates. These tools import your full transaction
          history and generate official IRS forms.
        </p>
      </div>

      {/* Tool cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"0.9rem" }}>
        {AFFILIATES.map((a,i) => (
          <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{
            display:"block", textDecoration:"none",
            background:"linear-gradient(135deg,#0d1e0d,#0a160a)",
            border:"1px solid #1e3a1e", borderRadius:"12px",
            padding:"1.2rem", transition:"all 0.2s", cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#6ee85a44"; e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a1e"; e.currentTarget.style.transform="translateY(0)";}}>

            {/* Logo + badge row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.8rem" }}>
              <div style={{ width:"38px", height:"38px", borderRadius:"9px",
                background:a.color+"22", border:`1px solid ${a.color}44`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Mono style={{ fontSize:"0.7rem", color:a.color, fontWeight:600 }}>{a.logo}</Mono>
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.5rem",
                letterSpacing:"0.12em", color:"#fff", background:a.badgeColor,
                padding:"0.18rem 0.45rem", borderRadius:"3px" }}>{a.badge}</span>
            </div>

            {/* Name + tagline */}
            <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.92rem",
              fontWeight:700, color:"#e8f5e8", marginBottom:"0.2rem" }}>{a.name}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem",
              color:a.color, marginBottom:"0.5rem", letterSpacing:"0.06em" }}>{a.tagline}</div>
            <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.75rem",
              color:"#7ab07a", lineHeight:1.55, marginBottom:"0.8rem" }}>{a.desc}</p>

            {/* Features */}
            {a.features.map((f,j) => (
              <div key={j} style={{ display:"flex", gap:"0.4rem", alignItems:"center", marginBottom:"0.3rem" }}>
                <span style={{ color:"#6ee85a", fontSize:"0.6rem", flexShrink:0 }}>✓</span>
                <Mono style={{ fontSize:"0.6rem", color:"#5a9a5a" }}>{f}</Mono>
              </div>
            ))}

            {/* CTA */}
            <div style={{ marginTop:"1rem", display:"flex", alignItems:"center",
              justifyContent:"space-between" }}>
              <Mono style={{ fontSize:"0.62rem", color:"#6ee85a" }}>Get Started →</Mono>
              <Mono style={{ fontSize:"0.52rem", color:"#3a5a3a" }}>Free plan available</Mono>
            </div>
          </a>
        ))}
      </div>

      {/* Disclosure */}
      <p style={{ fontSize:"0.58rem", color:"#2a4a2a", fontFamily:"'JetBrains Mono',monospace",
        textAlign:"center", marginTop:"1rem", lineHeight:1.6 }}>
        Affiliate disclosure: We may earn a commission if you sign up through these links,
        at no extra cost to you. We only recommend tools we'd genuinely use.
      </p>
    </div>
  );
}

// ─── CALCULATORS ──────────────────────────────────────────────────────────────
function TLHCalc() {
  const [buy,setBuy]=useState(10000);
  const [cur,setCur]=useState(6000);
  const [months,setMonths]=useState(8);
  const [bracket,setBracket]=useState(22);
  const [ltRate,setLtRate]=useState(15);
  const [gains,setGains]=useState(5000);
  const [open,setOpen]=useState(false);
  const isLT=months>=12;
  const loss=Math.max(0,buy-cur);
  const rate=isLT?ltRate/100:bracket/100;
  const gainOff=Math.min(loss,gains);
  const gainSave=gainOff*rate;
  const rem=loss-gainOff;
  const incSave=Math.min(rem,3000)*(bracket/100);
  const carry=Math.max(0,rem-3000);
  const total=gainSave+incSave;
  const effRate=loss>0?(total/loss)*100:0;
  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Tax-Loss Harvesting <span style={{ color:"#6ee85a" }}>Calculator</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>Enter your position to see your estimated tax savings.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Your Position</Label>
          <SliderRow label="Amount Invested" value={buy} onChange={setBuy} min={500} max={100000} step={500} pre="$" hint="What you originally paid" />
          <SliderRow label="Current Value" value={cur} onChange={v=>setCur(Math.min(v,buy))} min={0} max={buy} step={100} pre="$" hint="What it's worth today" />
          <SliderRow label="Months Held" value={months} onChange={setMonths} min={1} max={36} step={1} suf=" mo" hint={isLT?"✓ Long-term rate applies":"⚠ Short-term rate applies"} />
          <SliderRow label="Other Capital Gains This Year" value={gains} onChange={setGains} min={0} max={50000} step={500} pre="$" hint="From stocks, crypto, or other sales" />
          <SelectRow label="Your Tax Bracket" value={bracket} onChange={setBracket} options={TAX_BRACKETS} />
          {isLT && <SelectRow label="Long-Term Rate" value={ltRate} onChange={setLtRate} options={LT_RATES} />}
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160}>
            <Label light>◈ Results</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              <BigStat label="Capital Loss" value={loss>0?$$(loss):"$0"} sub={`${pct((loss/buy)*100)} decline`} />
              <BigStat label="Est. Tax Savings" value={total>0?$$(total):"$0"} highlight sub={`${pct(effRate)} of loss recovered`} />
            </div>
            {carry>0&&(
              <div style={{ background:"#0d1a0d", border:"1px dashed #2a4a2a", borderRadius:"8px", padding:"0.8rem", marginBottom:"0.9rem" }}>
                <Mono style={{ fontSize:"0.58rem", letterSpacing:"0.12em", color:"#4a8a4a", textTransform:"uppercase", display:"block", marginBottom:"0.2rem" }}>Carries Forward</Mono>
                <Mono style={{ fontSize:"1.1rem", color:"#8ab08a" }}>{$$(carry)}</Mono>
                <Mono style={{ fontSize:"0.58rem", color:"#5a9a5a", display:"block", marginTop:"0.15rem" }}>Offsets future gains + ${Math.min(carry,3000).toLocaleString()} income</Mono>
              </div>
            )}
            <button onClick={()=>setOpen(!open)} style={{ width:"100%", padding:"0.5rem",
              background:"transparent", border:"1px solid #1e3a1e", borderRadius:"7px",
              color:"#3a6a3a", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace",
              fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              {open?"▲ Hide Breakdown":"▼ Show Breakdown"}
            </button>
            {open&&(
              <div style={{ marginTop:"0.9rem", borderTop:"1px solid #172717", paddingTop:"0.9rem" }}>
                {[
                  {l:"Gains offset",v:$$(gainOff),n:`@ ${isLT?ltRate:bracket}%`},
                  {l:"Savings from gains",v:$$(gainSave),n:""},
                  {l:"Income offset (max $3K)",v:$$(Math.min(rem,3000)),n:`@ ${bracket}%`},
                  {l:"Savings from income",v:$$(incSave),n:""},
                  {l:"Total tax savings",v:$$(total),n:"← your number",bold:true},
                ].map((r,i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"0.28rem 0", borderBottom:"1px solid #1e3a1e" }}>
                    <Mono style={{ fontSize:"0.68rem", color:r.bold?"#9ab89a":"#3a5a3a" }}>{r.l} <span style={{color:"#4a8a4a"}}>{r.n}</span></Mono>
                    <Mono style={{ fontSize:"0.68rem", color:r.bold?"#6ee85a":"#4a6a4a", fontWeight:r.bold?600:400 }}>{r.v}</Mono>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card dark delay={240} style={{ background:isLT?"linear-gradient(135deg,#0d1e0d,#0a180a)":"linear-gradient(135deg,#1e1000,#140b00)", border:isLT?"1px solid #2a5a2a":"1px solid #3a2800" }}>
            <div style={{ display:"flex", gap:"0.7rem", alignItems:"center" }}>
              <span style={{ fontSize:"1.2rem" }}>{isLT?"🌿":"⚡"}</span>
              <div>
                <Mono style={{ fontSize:"0.62rem", color:isLT?"#6ee85a":"#e8a840", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:"0.2rem" }}>
                  {isLT?"Long-Term Hold":"Short-Term Hold"}
                </Mono>
                <p style={{ fontSize:"0.72rem", color:"#85b885", lineHeight:1.5 }}>
                  {isLT?`${months} months held. Favorable ${ltRate}% long-term rate applies.`:`${months} months held. ${bracket}% income rate applies. ${12-months} more month${12-months===1?"":"s"} to qualify for lower rates.`}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function GainsCalc() {
  const [buy,setBuy]=useState(5000);
  const [sell,setSell]=useState(12000);
  const [qty,setQty]=useState(1);
  const [months,setMonths]=useState(10);
  const [bracket,setBracket]=useState(22);
  const [ltRate,setLtRate]=useState(15);
  const isLT=months>=12;
  const totalGain=(sell-buy)*qty;
  const isGain=totalGain>0;
  const stTax=isGain?totalGain*(bracket/100):0;
  const ltTax=isGain?totalGain*(ltRate/100):0;
  const savings=stTax-ltTax;
  const curTax=isLT?ltTax:stTax;
  const curNet=(sell-buy)*qty-curTax;
  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Capital Gains <span style={{ color:"#6ee85a" }}>Estimator</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>See your tax bill before you sell — and how timing changes everything.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Your Trade</Label>
          <SliderRow label="Buy Price (per coin)" value={buy} onChange={setBuy} min={100} max={100000} step={100} pre="$" />
          <SliderRow label="Sell Price (per coin)" value={sell} onChange={setSell} min={0} max={200000} step={100} pre="$" />
          <SliderRow label="Quantity" value={qty} onChange={setQty} min={0.1} max={100} step={0.1} suf=" coins" />
          <SliderRow label="Months Held" value={months} onChange={setMonths} min={1} max={36} step={1} suf=" mo"
            hint={isLT?"✓ Long-term rates apply":`⚠ ${12-months} more month${12-months===1?"":"s"} to qualify`} />
          <SelectRow label="Your Tax Bracket" value={bracket} onChange={setBracket} options={TAX_BRACKETS} />
          <SelectRow label="Long-Term Capital Gains Rate" value={ltRate} onChange={setLtRate} options={LT_RATES} />
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160}>
            <Label light>◈ Results</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              <BigStat label="Total Gain/Loss" value={totalGain>=0?$$(totalGain):`-${$$(-totalGain)}`} sub={`${pct(((sell-buy)/buy)*100)} per coin`} />
              <BigStat label={isLT?"Tax Owed (LT)":"Tax Owed (ST)"} value={$$(curTax)} highlight sub={`@ ${isLT?ltRate:bracket}% rate`} />
            </div>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap" }}>
              <BigStat label="Net Profit After Tax" value={$$(curNet)} sub="what you actually keep" />
              {!isLT&&savings>0&&<BigStat label="Save by Waiting" value={$$(savings)} sub={`hold ${12-months} more mo.`} />}
            </div>
          </Card>
          <Card dark delay={240}>
            <Label light>◈ Short vs. Long-Term</Label>
            {[
              {label:"Short-Term Tax",value:stTax,rate:`${bracket}%`},
              {label:"Long-Term Tax",value:ltTax,rate:`${ltRate}%`,green:true},
              {label:"Potential Savings",value:savings,rate:"by waiting",bold:true},
            ].map((r,i)=>(
              <div key={i} style={{ marginBottom:"0.85rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.2rem" }}>
                  <Mono style={{ fontSize:"0.65rem", color:r.bold?"#9ab89a":"#3a5a3a" }}>{r.label} <span style={{color:"#4a8a4a"}}>({r.rate})</span></Mono>
                  <Mono style={{ fontSize:"0.7rem", fontWeight:r.bold?600:400, color:r.bold?"#6ee85a":r.green?"#6ee85a":"#6a8a6a" }}>{$$(r.value)}</Mono>
                </div>
                {!r.bold&&<div style={{ height:"3px", background:"#0c1a0c", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,(r.value/Math.max(stTax,1))*100)}%`, background:r.green?"#6ee85a":"#e85a5a", borderRadius:"2px", transition:"width 0.4s" }} />
                </div>}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SwapCalc() {
  const [basis,setBasis]=useState(3000);
  const [fmv,setFmv]=useState(8000);
  const [months,setMonths]=useState(14);
  const [bracket,setBracket]=useState(22);
  const [ltRate,setLtRate]=useState(15);
  const isLT=months>=12;
  const gain=fmv-basis;
  const isGain=gain>0;
  const rate=isLT?ltRate/100:bracket/100;
  const taxDue=isGain?gain*rate:0;
  const netAfter=fmv-taxDue;
  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Crypto Swap <span style={{ color:"#6ee85a" }}>Tax Impact</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>Trading one coin for another is a taxable event. Here's what it costs.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Your Swap (Coin A)</Label>
          <SliderRow label="Original Cost Basis" value={basis} onChange={setBasis} min={100} max={100000} step={100} pre="$" hint="What you paid for Coin A" />
          <SliderRow label="Fair Market Value at Swap" value={fmv} onChange={setFmv} min={0} max={200000} step={100} pre="$" hint="Value of Coin A when traded" />
          <SliderRow label="Months Held" value={months} onChange={setMonths} min={1} max={36} step={1} suf=" mo" hint={isLT?"✓ Long-term rate applies":"⚠ Short-term rate applies"} />
          <SelectRow label="Your Tax Bracket" value={bracket} onChange={setBracket} options={TAX_BRACKETS} />
          {isLT&&<SelectRow label="Long-Term Rate" value={ltRate} onChange={setLtRate} options={LT_RATES} />}
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160}>
            <Label light>◈ Tax Impact</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              <BigStat label="Taxable Gain" value={isGain?$$(gain):"No Gain"} sub={isGain?`${pct((gain/basis)*100)} appreciation`:"Loss — may offset other gains"} />
              <BigStat label="Tax Due on Swap" value={$$(taxDue)} highlight={taxDue>0} sub={`@ ${isLT?ltRate:bracket}% ${isLT?"LT":"ST"} rate`} />
            </div>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap" }}>
              <BigStat label="Value After Tax Liability" value={$$(netAfter)} sub="true value of Coin B" />
              <BigStat label="Effective Tax Rate" value={fmv>0?pct((taxDue/fmv)*100):"0%"} sub="of swap value owed" />
            </div>
          </Card>
          <Card dark delay={240} style={{ border:"1px solid #2a1a00", background:"linear-gradient(135deg,#161000,#110d00)" }}>
            <Mono style={{ fontSize:"0.62rem", color:"#e8a840", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:"0.4rem" }}>⚠ Easy to Overlook</Mono>
            <p style={{ fontSize:"0.75rem", color:"#6a5a3a", lineHeight:1.65 }}>
              Many investors don't realize this tax exists until filing season. If you didn't set aside <strong style={{color:"#c8a860"}}>{$$(taxDue)}</strong> from this swap, you may owe it out of pocket. Plan ahead.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CarryCalc() {
  const [initLoss,setInitLoss]=useState(15000);
  const [g1,setG1]=useState(4000);
  const [g2,setG2]=useState(3000);
  const [g3,setG3]=useState(5000);
  const [bracket,setBracket]=useState(22);
  const calc=(loss,gains)=>{
    const go=Math.min(loss,gains);
    const r1=loss-go;
    const io=Math.min(r1,3000);
    const carry=Math.max(0,r1-3000);
    const savings=(go+io)*(bracket/100);
    return{go,io,carry,savings};
  };
  const y1=calc(initLoss,g1);
  const y2=calc(y1.carry,g2);
  const y3=calc(y2.carry,g3);
  const total=y1.savings+y2.savings+y3.savings;
  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Loss Carryforward <span style={{ color:"#6ee85a" }}>Tracker</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>See how unused losses save you taxes year after year.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Starting Loss & Tax Rate</Label>
          <SliderRow label="Initial Capital Loss" value={initLoss} onChange={setInitLoss} min={1000} max={100000} step={500} pre="$" hint="Total realized loss in Year 1" />
          <SelectRow label="Your Tax Bracket" value={bracket} onChange={setBracket} options={TAX_BRACKETS} />
          <Divider dark />
          <Label light>Set Gains Per Year</Label>
          <SliderRow label="Year 1 Capital Gains" value={g1} onChange={setG1} min={0} max={30000} step={500} pre="$" />
          <SliderRow label="Year 2 Capital Gains" value={g2} onChange={setG2} min={0} max={30000} step={500} pre="$" />
          <SliderRow label="Year 3 Capital Gains" value={g3} onChange={setG3} min={0} max={30000} step={500} pre="$" />
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160}>
            <Label light>◈ 3-Year Summary</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"0.9rem" }}>
              <BigStat label="Initial Loss" value={$$(initLoss)} sub="realized in Year 1" />
              <BigStat label="Total Tax Saved" value={$$(total)} highlight sub="across 3 years" />
            </div>
            <BigStat label="Remaining After Year 3" value={$$(y3.carry)} sub={y3.carry>0?"continues to carry forward":"fully utilized ✓"} />
          </Card>
          {[{year:"Year 1",loss:initLoss,...y1},{year:"Year 2",loss:y1.carry,...y2},{year:"Year 3",loss:y2.carry,...y3}].map((y,i)=>(
            <Card key={i} dark delay={240+i*80} style={{ opacity:y.loss<=0?0.4:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.8rem" }}>
                <Label light>◈ {y.year}</Label>
                <Mono style={{ fontSize:"0.68rem", color:"#6ee85a" }}>Saved {$$(y.savings)}</Mono>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                {[{l:"Loss Available",v:$$(y.loss)},{l:"Gains Offset",v:$$(y.go)},{l:"Income Offset",v:$$(y.io)},{l:"Carried Forward",v:$$(y.carry)}].map((s,j)=>(
                  <div key={j} style={{ background:"#0c1a0c", borderRadius:"7px", padding:"0.55rem 0.65rem", border:"1px solid #172717" }}>
                    <Mono style={{ fontSize:"0.52rem", color:"#5a9a5a", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:"0.2rem" }}>{s.l}</Mono>
                    <Mono style={{ fontSize:"0.85rem", color:s.l==="Carried Forward"&&y.carry===0?"#6ee85a":"#7a9a7a", fontWeight:500 }}>{s.v}</Mono>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ARTICLE CONTENT ─────────────────────────────────────────────────────────
function ArticleContent({ id, navigate }) {
  const content = {
    "crypto-taxed": <>
      <h2>The IRS Treats Crypto Like Property</h2>
      <p>The most important thing to understand about crypto taxes: the IRS does not treat cryptocurrency like money. It treats it like <strong>property</strong> — similar to stocks, real estate, or collectibles. That one fact explains almost everything about how crypto is taxed.</p>
      <p>Because crypto is property, taxes only kick in when you <em>do something with it</em>. Simply owning crypto and watching the price move? Not taxable. It's when you make a move that the IRS takes interest.</p>
      <h2>What Counts as a Taxable Event?</h2>
      <p>A taxable event is any transaction that may trigger a tax obligation. For crypto, these include:</p>
      <ul>
        <li><strong>Selling crypto for dollars</strong> — the most obvious one</li>
        <li><strong>Trading one crypto for another</strong> — swapping Bitcoin for Ethereum counts</li>
        <li><strong>Spending crypto on goods or services</strong></li>
        <li><strong>Earning crypto</strong> — staking rewards, mining, or getting paid in crypto</li>
      </ul>
      <p>What's <em>not</em> on that list: buying and holding. That's not taxable until you sell or trade.</p>
      <h2>Short-Term vs. Long-Term Capital Gains</h2>
      <p>How long you held the crypto matters enormously. Held <strong>under 12 months</strong> and any gain is taxed at your ordinary income rate — as high as 37%. Hold <strong>over 12 months</strong> and you qualify for long-term rates of 0%, 15%, or 20%. A significant difference that a simple timing decision can control.</p>
      <h2>The Silver Lining: Losses Help You Too</h2>
      <p>If you sell crypto for less than you paid, that's a capital loss — and losses work in your favor. They can offset capital gains dollar for dollar, reduce taxable income by up to <strong>$3,000 per year</strong>, and carry forward indefinitely to future tax years. This strategy is called <strong>tax-loss harvesting</strong>.</p>
      <ToolCTA text="See How Much You Could Save →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="Do I owe taxes if I just buy and hold crypto?" a="No. Simply purchasing and holding crypto is not a taxable event. Taxes apply when you sell, trade, spend, or earn crypto." />
      <FAQItem q="What if I lost money on crypto — do I still need to report it?" a="Yes, you still need to report losses. But reporting a loss benefits you — it can offset gains from other investments and reduce your overall tax bill." />
      <FAQItem q="Does the IRS know about my crypto?" a="Increasingly, yes. Tax forms now directly ask about crypto activity, and exchanges are required to report transactions via Form 1099-DA starting with the 2025 tax year." />
    </>,
    "wash-sale": <>
      <h2>What Is the Wash Sale Rule?</h2>
      <p>The wash sale rule is an IRS regulation that prevents investors from claiming a tax loss on a security if they buy the same or substantially identical security within 30 days before or after the sale. It was designed to stop people from selling a stock just to claim a loss, then immediately buying it back.</p>
      <h2>Crypto Is Currently Exempt</h2>
      <p>Here's what most people don't know: <strong>the wash sale rule applies to "securities" — and the IRS currently classifies cryptocurrency as property, not a security.</strong></p>
      <p>That means right now, you can sell Bitcoin at a loss to realize the tax deduction, then immediately — even the same day — buy Bitcoin back. You keep your market exposure while capturing the tax loss. This is a significant and legitimate advantage crypto has over stocks.</p>
      <h2>A Real-World Example</h2>
      <p>You bought Ethereum for $8,000 and it's now worth $5,200. You sell, realizing a $2,800 loss. That loss offsets $2,800 of capital gains from other trades. With stocks, you'd wait 31 days before rebuying. With crypto, you can buy back five minutes later. If the price recovers, you benefit. Either way, you've locked in the tax break.</p>
      <h2>Will This Change?</h2>
      <p>Possibly. There have been legislative proposals to extend the wash sale rule to crypto. As of 2025, it remains intact — but investors should stay informed as rules can evolve quickly.</p>
      <ToolCTA text="Calculate Your Tax-Loss Harvesting Savings →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="What is the 30-day rule in crypto?" a="There is no 30-day waiting rule for crypto. The wash sale rule — which requires 30-day waiting before rebuying after a loss — applies to stocks, not cryptocurrency. Crypto investors can sell at a loss and immediately repurchase." />
      <FAQItem q="Can I sell crypto at a loss and rebuy immediately?" a="Yes. Because the wash sale rule does not currently apply to crypto, you can sell at a loss to realize the deduction and buy back the same cryptocurrency immediately." />
    </>,
    "write-off": <>
      <h2>Two Ways Crypto Losses Reduce Your Taxes</h2>
      <h3>1. Offsetting Capital Gains — No Dollar Limit</h3>
      <p>The most powerful use of a crypto loss is offsetting capital gains from other investments. There's <strong>no annual cap</strong>. If you have $20,000 in stock gains and $20,000 in crypto losses, they cancel out completely — zero taxable gains.</p>
      <h3>2. Deducting Against Ordinary Income — $3,000 Annual Limit</h3>
      <p>Once you've offset all capital gains, any remaining loss can reduce your ordinary income — salary, wages, freelance — by up to <strong>$3,000 per year</strong>. At a 22% bracket, that saves you $660. At 32%, that's $960 from one provision alone.</p>
      <h2>The Carryforward Rule: Losses Don't Disappear</h2>
      <p>If your losses exceed your gains plus the $3,000 deduction, the remaining loss <strong>carries forward indefinitely</strong> to future tax years. A painful crypto year can provide tax relief for years to come.</p>
      <ToolCTA text="Track Your Loss Carryforward →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="How much crypto losses can you write off?" a="There's no limit to offsetting capital gains. Once gains are zeroed out, you can deduct up to $3,000 against ordinary income per year. Remaining losses carry forward indefinitely." />
      <FAQItem q="Can crypto losses offset stock gains?" a="Yes. Capital losses from crypto can offset capital gains from stocks, real estate, or any other capital asset." />
      <FAQItem q="Do crypto losses carry forward?" a="Yes. Unused capital losses carry forward indefinitely. If losses exceed your gains plus the $3,000 deduction, the remainder rolls into future tax years automatically." />
    </>,
    "swap-taxes": <>
      <h2>Why Swapping Crypto Is a Taxable Event</h2>
      <p>The IRS views a crypto-to-crypto swap as two simultaneous transactions: you're <em>selling</em> Coin A at its current market value and <em>buying</em> Coin B. Even though no dollars change hands, the IRS sees a disposition of property — and that triggers a capital gains calculation.</p>
      <h2>How to Calculate the Tax on a Swap</h2>
      <ul>
        <li><strong>Step 1:</strong> Determine the fair market value of Coin A at the moment of the swap</li>
        <li><strong>Step 2:</strong> Subtract your original cost basis in Coin A</li>
        <li><strong>Step 3:</strong> The difference is your capital gain or loss</li>
        <li><strong>Step 4:</strong> Apply short-term (under 12 months) or long-term tax rate</li>
      </ul>
      <p>Your cost basis in Coin B is set to its fair market value at the time of the swap — important for any future sale.</p>
      <h2>The Hidden Tax Trap</h2>
      <p>When you swap coins, you receive no cash. But you may owe taxes on the gain. If you spend the new coins or the market moves before tax time, you could face a bill with no liquid funds to pay it. Best practice: estimate your liability immediately after each swap and set that amount aside.</p>
      <ToolCTA text="Calculate the Tax Impact of Your Swap →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="Is trading crypto for crypto a taxable event?" a="Yes. The IRS treats crypto-to-crypto trades as a sale of the first cryptocurrency. Any gain on the first coin is taxable at the time of the swap, even though no dollars changed hands." />
      <FAQItem q="Do I owe taxes if I swap crypto at a loss?" a="If you swap a crypto that has declined in value, you realize a capital loss — not a gain. That loss can offset other gains or reduce your income by up to $3,000." />
    </>,
    "short-long": <>
      <h2>The 12-Month Rule That Changes Everything</h2>
      <p>The entire short-term vs. long-term distinction comes down to one question: did you hold for more than one year before selling? Cross that threshold and you qualify for long-term capital gains rates — dramatically lower than short-term. One timing decision can cut your rate nearly in half.</p>
      <h2>Short-Term: The Expensive Category</h2>
      <p>Crypto held <strong>12 months or less</strong> is taxed at your ordinary income rate — the same as your paycheck. Depending on income, that's 10% to 37%. On a $10,000 gain, that's $2,200 to $3,200 in federal taxes from poor timing alone.</p>
      <h2>Long-Term: The Preferred Rate</h2>
      <p>Hold longer than 12 months and gains qualify for long-term rates: <strong>0%</strong> (under ~$47K income), <strong>15%</strong> (most earners), or <strong>20%</strong> (high earners). For most investors, long-term means 15% vs. 22–32% short-term on the same gain.</p>
      <h2>The Math: Side-by-Side</h2>
      <p>You bought $5,000 of Solana, now worth $18,000 — a $13,000 gain:</p>
      <ul>
        <li><strong>Short-term at 22%:</strong> $2,860 owed</li>
        <li><strong>Long-term at 15%:</strong> $1,950 owed</li>
        <li><strong>Saved by waiting:</strong> $910 — just from timing</li>
      </ul>
      <ToolCTA text="Compare Your Short vs. Long-Term Tax Bill →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="How long do I need to hold crypto to pay less tax?" a="You need to hold for more than 12 months from the date of purchase before selling to qualify for lower long-term capital gains tax rates." />
      <FAQItem q="Does the holding period reset if I swap crypto?" a="Yes. When you swap one crypto for another, your holding period for the new asset starts from the date of the swap — not from when you bought the original coin." />
    </>,

    "free-calculator": <>
      <h2>Yes — Free Crypto Tax Calculators Exist</h2>
      <p>You don't need to pay for a subscription or hand over your email to understand your crypto tax situation. Free calculators can show you the real dollar impact of your trades, losses, and strategies before you ever talk to an accountant.</p>
      <p>The key is knowing <em>which</em> calculations actually matter — and using a tool built around those specific numbers.</p>
      <h2>What the Best Free Crypto Tax Calculators Actually Do</h2>
      <p>Most crypto investors only think about one number: what they owe. But a genuinely useful calculator shows you four things:</p>
      <ul>
        <li><strong>Capital gains estimate</strong> — short-term vs. long-term, before you sell</li>
        <li><strong>Tax-loss harvesting savings</strong> — how much a losing position could save you</li>
        <li><strong>Swap tax impact</strong> — the hidden cost of trading one coin for another</li>
        <li><strong>Loss carryforward projection</strong> — how unused losses reduce taxes in future years</li>
      </ul>
      <p>Most paid tools focus on transaction imports and full tax filing. That's useful at tax time. But free calculators shine earlier in the process — helping you make smarter decisions <em>before</em> you sell or trade.</p>
      <h2>What Free Tools Won't Do</h2>
      <p>Free calculators are educational and strategic — they're not a replacement for tax filing software or a CPA. They won't import your exchange history, generate Form 8949, or file your return. For that, you'll want tools like Koinly, CoinTracker, or TaxBit — which do charge for full filing features.</p>
      <p>But for understanding your situation, running scenarios, and deciding whether to sell? Free calculators are exactly what you need.</p>
      <ToolCTA text="Try the Free HarvestMyCrypto Calculator Suite →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="Is there a free crypto tax calculator?" a="Yes. HarvestMyCrypto offers four free calculators covering tax-loss harvesting savings, capital gains estimates, swap tax impact, and loss carryforward tracking. No signup required." />
      <FAQItem q="Which crypto tax calculator is best?" a="The best calculator depends on your goal. For strategic decisions before selling, free calculators like HarvestMyCrypto show real dollar estimates instantly. For full tax filing, paid platforms like Koinly or CoinTracker import your exchange history and generate official tax forms." />
      <FAQItem q="Do I need a paid crypto tax tool?" a="Not for understanding your situation or running scenarios. You only need a paid tool when you're ready to generate official tax forms or file your return. Start with free calculators first." />
    </>,

    "bitcoin-taxed": <>
      <h2>Bitcoin Is Taxed as Property, Not Currency</h2>
      <p>This is the foundation of everything. The IRS made its position clear in 2014 and has maintained it since: Bitcoin is <strong>property</strong> for tax purposes. That means the same rules that apply to selling stocks or real estate apply to selling Bitcoin.</p>
      <p>The practical implication: every time you dispose of Bitcoin — selling it, trading it, spending it — you have a potential taxable event. The gain or loss from that transaction is what gets reported, not the Bitcoin itself.</p>
      <h2>When Do You Owe Tax on Bitcoin?</h2>
      <p>You owe tax on Bitcoin when you:</p>
      <ul>
        <li><strong>Sell Bitcoin for dollars</strong> — any profit is a capital gain</li>
        <li><strong>Trade Bitcoin for another crypto</strong> — treated as selling Bitcoin at market value</li>
        <li><strong>Spend Bitcoin on goods or services</strong> — the IRS sees this as a sale</li>
        <li><strong>Receive Bitcoin as payment for work</strong> — taxed as ordinary income at the time of receipt</li>
        <li><strong>Earn Bitcoin through mining</strong> — taxed as self-employment income</li>
      </ul>
      <p>What's <em>not</em> taxable: buying Bitcoin and holding it. Transferring between your own wallets. Gifting Bitcoin under the annual gift tax exclusion ($18,000 in 2024).</p>
      <h2>Short-Term vs. Long-Term Bitcoin Gains</h2>
      <p>If you sell Bitcoin for more than you paid, how long you held it determines your tax rate. Hold for <strong>12 months or less</strong> and profits are taxed at your ordinary income rate — up to 37%. Hold for <strong>more than 12 months</strong> and you qualify for long-term capital gains rates of 0%, 15%, or 20%.</p>
      <p>On a meaningful Bitcoin position, this timing difference can mean thousands of dollars. The math is simple: holding an extra few months before selling a profitable position can dramatically reduce what you owe.</p>
      <h2>What If Bitcoin Goes Down?</h2>
      <p>If you sell Bitcoin for less than you paid, that's a capital loss — and losses are actually valuable. They can offset gains from other investments dollar for dollar. Beyond that, up to $3,000 in net losses can be deducted against your ordinary income each year, with any remainder carrying forward to future tax years.</p>
      <p>This is why market downturns aren't purely bad news for Bitcoin investors who understand the tax rules. A losing position can be converted into real tax savings through a strategy called tax-loss harvesting.</p>
      <ToolCTA text="Calculate Your Bitcoin Tax Savings →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="How is Bitcoin taxed?" a="Bitcoin is taxed as property by the IRS. When you sell, trade, or spend Bitcoin, any gain is subject to capital gains tax — short-term (your income rate) if held under 12 months, or long-term (0%, 15%, or 20%) if held over 12 months." />
      <FAQItem q="Does the IRS know if you sell Bitcoin?" a="Yes. Cryptocurrency exchanges are required to report transactions to the IRS via Form 1099-DA. Tax returns now directly ask whether you had digital asset transactions. The IRS has significantly expanded crypto enforcement." />
      <FAQItem q="Do you pay taxes on Bitcoin if you don't sell?" a="No. Simply holding Bitcoin is not a taxable event, regardless of how much it appreciates in value. Taxes only apply when you sell, trade, spend, or earn Bitcoin." />
      <FAQItem q="What happens if you don't report Bitcoin on taxes?" a="Failing to report crypto transactions can result in penalties, interest, and in serious cases, criminal charges for tax evasion. The IRS has made crypto compliance a priority and exchanges now report directly to them." />
    </>,

    "reduce-taxes": <>
      <h2>Six Legal Strategies That Actually Work</h2>
      <p>Reducing your crypto tax bill isn't about loopholes or tricks. It's about understanding rules the IRS already built into the tax code — and using them intentionally. Here are six strategies that hold up legally and can meaningfully reduce what you owe.</p>
      <h3>1. Hold for More Than 12 Months</h3>
      <p>The single most impactful thing most crypto investors can do is simply wait. Gains on assets held over 12 months qualify for long-term capital gains rates of 0%, 15%, or 20% — compared to short-term rates that can reach 37%. On a $20,000 gain at a 22% bracket, that's the difference between owing $4,400 and owing $3,000. Just from timing.</p>
      <h3>2. Harvest Your Losses</h3>
      <p>When positions are down, selling them creates a capital loss that can offset your gains dollar for dollar. Unlike stocks, crypto has no wash sale rule — so you can sell at a loss and immediately buy back the same asset. You maintain your market position while capturing a real tax deduction.</p>
      <h3>3. Use the $3,000 Income Deduction</h3>
      <p>If your capital losses exceed your capital gains, up to $3,000 of the remaining loss can be deducted against your ordinary income each year. At a 24% tax bracket, that's $720 in direct savings from a single provision.</p>
      <h3>4. Carry Forward Unused Losses</h3>
      <p>Losses that exceed gains plus the $3,000 deduction don't disappear — they carry forward to future years indefinitely. A large loss in a bad year can provide tax relief for multiple years ahead. Track your carryforward balance and use it strategically.</p>
      <h3>5. Gift Crypto Instead of Selling</h3>
      <p>If you want to transfer crypto to family, gifting it instead of selling avoids triggering a taxable event for you. The recipient receives your cost basis and holding period. Under the annual gift tax exclusion ($18,000 per person in 2024), there's no gift tax either.</p>
      <h3>6. Donate Appreciated Crypto to Charity</h3>
      <p>Donating crypto that has appreciated in value to a qualified charity lets you deduct the full fair market value — without paying capital gains tax on the appreciation. This is often more tax-efficient than selling the crypto and donating cash.</p>
      <ToolCTA text="See How Much You Could Save →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="How can I reduce my taxes on crypto?" a="The most effective legal strategies are: holding assets over 12 months for long-term rates, harvesting losses to offset gains, using the $3,000 income deduction, carrying forward unused losses, and donating appreciated crypto to charity." />
      <FAQItem q="Is tax-loss harvesting legal for crypto?" a="Yes. Tax-loss harvesting is completely legal and is actively encouraged by the tax code. Unlike stocks, crypto has no wash sale rule, making it even more flexible for crypto investors." />
      <FAQItem q="Can I avoid crypto taxes legally?" a="You can reduce crypto taxes significantly through legal strategies, but not eliminate them entirely in most cases. Anyone promising complete tax elimination should be viewed with skepticism. Reduction through legitimate strategies is both legal and achievable." />
    </>,

    "worth-it": <>
      <h2>The Honest Answer: Usually Yes — But It Depends</h2>
      <p>Tax-loss harvesting gets a lot of hype. The real answer is more nuanced: it's genuinely valuable in certain situations and not worth the effort in others. Here's how to know which side you're on.</p>
      <h2>When Tax-Loss Harvesting Is Clearly Worth It</h2>
      <p>The math works strongly in your favor when:</p>
      <ul>
        <li><strong>You have significant gains elsewhere</strong> — if you've had a good year in stocks or other crypto, losses can offset those gains dollar for dollar. At a 22% tax rate, every $1,000 of gains offset is $220 in real tax savings.</li>
        <li><strong>Your losses are substantial</strong> — a $10,000+ loss position is worth harvesting even if you have no other gains, because you can deduct $3,000 against income now and carry the rest forward.</li>
        <li><strong>You plan to rebuy anyway</strong> — since there's no wash sale rule for crypto, you can sell, capture the loss, and buy back immediately. Your investment position doesn't change. The tax savings are essentially free.</li>
        <li><strong>You're in a high tax bracket</strong> — the higher your rate, the more each dollar of loss is worth as a deduction.</li>
      </ul>
      <h2>When It's Less Compelling</h2>
      <p>Tax-loss harvesting makes less sense when:</p>
      <ul>
        <li><strong>Your losses are small</strong> — harvesting a $200 loss creates minimal savings and isn't worth the transaction complexity.</li>
        <li><strong>You have no gains to offset and low income</strong> — the $3,000 deduction saves less if you're in a low bracket.</li>
        <li><strong>Transaction costs are high</strong> — on some platforms or with certain assets, the cost of selling and rebuying can eat into the tax savings.</li>
      </ul>
      <h2>The Real Question to Ask</h2>
      <p>The right question isn't "is tax-loss harvesting worth it in general?" It's "how much would I actually save on my specific position, at my specific tax rate, with my specific gain situation?" That's a number you can calculate — and it usually surprises people.</p>
      <ToolCTA text="Calculate If It's Worth It for Your Position →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="Is tax-loss harvesting worth it?" a="For most investors with meaningful losses and gains to offset, yes. The strategy is especially powerful for crypto because there's no wash sale rule — you can sell at a loss and immediately rebuy without affecting your market position." />
      <FAQItem q="What is the downside of tax-loss harvesting?" a="The main downsides are: lower cost basis on the repurchased asset (meaning higher future gains), complexity in tracking transactions, and transaction costs. For small positions, the paperwork may not be worth the modest savings." />
      <FAQItem q="How much do you save from tax-loss harvesting?" a="It depends on your tax bracket and loss amount. At 22%, every $1,000 of losses that offset gains saves $220. Plus up to $3,000 can offset ordinary income per year. Use a calculator to see your specific number." />
    </>,

    "irs-knows": <>
      <h2>More Than Most Investors Realize</h2>
      <p>This is one of the most common questions — and the honest answer is that IRS visibility into crypto transactions has expanded dramatically in recent years. If you're assuming your crypto activity is invisible to the government, that assumption is increasingly wrong.</p>
      <h2>What the IRS Can See</h2>
      <h3>Form 1099-DA — Exchange Reporting</h3>
      <p>Starting with the 2025 tax year, cryptocurrency exchanges are required to report your transactions directly to the IRS via <strong>Form 1099-DA</strong>. This includes sales, trades, and other dispositions. The same way your brokerage sends a 1099-B for stock sales, exchanges now send equivalent forms for crypto. Coinbase, Kraken, Gemini, and other major platforms are all subject to this requirement.</p>
      <h3>Your Tax Return</h3>
      <p>Since 2019, the IRS has included a direct question on Form 1040 asking whether you received, sold, exchanged, or otherwise disposed of any digital assets during the year. This question is near the top of the form — it's hard to miss and impossible to claim you didn't see.</p>
      <h3>Blockchain Analysis</h3>
      <p>The IRS has contracts with blockchain analytics companies including Chainalysis and CipherTrace. These tools can trace transactions across wallets, identify patterns, and link pseudonymous addresses to real identities — particularly when funds touch a regulated exchange at any point.</p>
      <h3>Subpoenas and John Doe Summons</h3>
      <p>The IRS has successfully subpoenaed major exchanges for user data. In 2016, it forced Coinbase to turn over records for over 13,000 users. This legal tool allows the IRS to obtain bulk user data without targeting specific individuals.</p>
      <h2>What This Means for You</h2>
      <p>The practical takeaway is straightforward: report your crypto transactions accurately. The risk of non-compliance is no longer theoretical — it's measurable and increasing. The good news is that accurate reporting, combined with smart tax strategies like loss harvesting, is both the legal path and often the financially optimal one.</p>
      <ToolCTA text="Calculate Your Crypto Tax Liability →" navigate={navigate} />
      <h2>People Also Ask</h2>
      <FAQItem q="Does the IRS know if you sell crypto?" a="Yes. Major exchanges are required to report transactions to the IRS via Form 1099-DA starting with the 2025 tax year. Additionally, your tax return directly asks about digital asset activity, and the IRS uses blockchain analytics tools to trace transactions." />
      <FAQItem q="What happens if you don't report crypto on taxes?" a="Failure to report crypto can result in back taxes, penalties, and interest. In cases of willful tax evasion, criminal charges are possible. The IRS has increased crypto enforcement and has access to exchange data through both reporting requirements and legal subpoenas." />
      <FAQItem q="How many people don't report crypto on taxes?" a="Studies have estimated that crypto tax compliance has historically been low — some surveys suggested fewer than 50% of investors reported crypto income. The new Form 1099-DA reporting requirements are specifically designed to close this gap." />
      <FAQItem q="Can the IRS track crypto wallets?" a="The IRS has contracts with blockchain analytics firms that can trace transactions across wallets and link addresses to identities, especially when funds touch regulated exchanges. Complete anonymity on public blockchains is difficult to maintain." />
    </>,
  };
  return <div className="article-body">{content[id]}</div>;
}

// ─── PAGES ────────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"3rem 1rem 2.5rem", position:"relative" }}>
        <Mono style={{ fontSize:"0.62rem", letterSpacing:"0.22em", color:"#4a8a4a",
          textTransform:"uppercase", display:"block", marginBottom:"0.9rem", animationDelay:"0ms" }}>
          ◈ Free Crypto Tax Tools & Guides
        </Mono>
        <h1 className="fade-up" style={{ animationDelay:"60ms",
          fontFamily:"'Bebas Neue',sans-serif",
          fontSize:"clamp(2.8rem,8vw,5rem)", letterSpacing:"0.04em",
          color:"#e8f5e8", lineHeight:0.95, marginBottom:"1rem" }}>
          Harvest Your<br /><span style={{ color:"#6ee85a" }}>Crypto Losses.</span><br />
          <span style={{ fontSize:"0.65em", color:"#5a7a5a" }}>Cut Your Tax Bill.</span>
        </h1>
        <p className="fade-up" style={{ animationDelay:"120ms",
          fontFamily:"'Source Serif 4',serif", fontSize:"clamp(0.9rem,2.5vw,1.1rem)",
          color:"#7ab07a", lineHeight:1.7, maxWidth:"520px", margin:"0 auto 2rem" }}>
          Most crypto investors overpay on taxes because they don't know the rules.
          Free calculators and plain-English guides that change that.
        </p>
        <div className="fade-up" style={{ animationDelay:"180ms",
          display:"flex", gap:"0.8rem", justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={()=>navigate("tools")} style={{ padding:"0.85rem 2rem",
            background:"#6ee85a", color:"#050e05", borderRadius:"8px",
            fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem",
            letterSpacing:"0.1em", fontWeight:500, border:"none", cursor:"pointer",
            boxShadow:"0 0 24px #6ee85a33" }}>
            ◈ Free Calculators
          </button>
          <button onClick={()=>navigate("guides")} style={{ padding:"0.85rem 2rem",
            background:"transparent", color:"#6ee85a", borderRadius:"8px",
            fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem",
            letterSpacing:"0.1em", border:"1px solid #2a4a2a", cursor:"pointer" }}>
            Read the Guides →
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="fade-up" style={{ animationDelay:"240ms",
        display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",
        gap:"1px", background:"#1a2e1a", borderRadius:"12px", overflow:"hidden",
        margin:"0 0 2rem", border:"1px solid #1a2e1a" }}>
        {[
          {n:"7",d:"Free Calculators"},
          {n:"10",d:"In-Depth Guides"},
          {n:"$3K",d:"Income Deduction"},
          {n:"∞",d:"Loss Carryforward"},
        ].map((s,i)=>(
          <div key={i} style={{ background:"#0a150a", padding:"1.2rem", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2rem",
              color:"#6ee85a", letterSpacing:"0.06em", lineHeight:1 }}>{s.n}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem",
              color:"#7ab07a", textTransform:"uppercase", letterSpacing:"0.1em",
              marginTop:"0.2rem" }}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* Tools section */}
      <div className="fade-up" style={{ animationDelay:"300ms", marginBottom:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.1rem" }}>
          <Label light>◈ Free Calculators</Label>
          <button onClick={()=>navigate("tools")} style={{ background:"none", border:"none",
            cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
            color:"#4a8a4a", letterSpacing:"0.1em" }}>See All →</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"0.9rem" }}>
          {[
            {id:"tlh",     icon:"◈", name:"Tax-Loss Harvesting", desc:"See your exact savings from selling at a loss."},
            {id:"gains",   icon:"◆", name:"Capital Gains",       desc:"Your tax bill before you sell."},
            {id:"swap",    icon:"⇌", name:"Swap Tax Impact",     desc:"Hidden tax cost of coin-to-coin trades."},
            {id:"carry",   icon:"↻", name:"Carryforward Tracker",desc:"How losses roll into future years."},
            {id:"whatif",  icon:"★", name:"What If I Invested",  desc:"What $1,000 in Bitcoin years ago is worth today."},
            {id:"income",  icon:"⬡", name:"Crypto Income Tax",   desc:"Tax on staking, mining & airdrops."},
            {id:"bracket", icon:"⚖", name:"Tax Bracket Impact",  desc:"See which bracket your crypto gains hit."},
          ].map(t=>(
            <button key={t.id} onClick={()=>navigate(t.id)} style={{
              background:"linear-gradient(135deg,#0d1e0d,#0a160a)",
              border:"1px solid #1e3a1e", borderRadius:"10px", padding:"1.1rem",
              cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#6ee85a44";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a1e";}}>
              <Mono style={{ fontSize:"1.1rem", color:"#6ee85a", display:"block", marginBottom:"0.45rem" }}>{t.icon}</Mono>
              <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#9ab89a",
                marginBottom:"0.3rem", fontFamily:"'Source Serif 4',serif" }}>{t.name}</div>
              <div style={{ fontSize:"0.7rem", color:"#7ab87a", lineHeight:1.5,
                fontFamily:"'Source Serif 4',serif" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Guides section */}
      <div className="fade-up" style={{ animationDelay:"380ms", marginBottom:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.1rem" }}>
          <Label light>◈ Tax Guides</Label>
          <button onClick={()=>navigate("guides")} style={{ background:"none", border:"none",
            cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
            color:"#4a8a4a", letterSpacing:"0.1em" }}>See All →</button>
        </div>
        <div style={{ background:"#0a150a", border:"1px solid #172717", borderRadius:"13px", overflow:"hidden" }}>
          {ARTICLES.map((a,i)=>(
            <button key={a.id} onClick={()=>navigate(a.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:"1rem",
              padding:"1rem 1.2rem", background:"transparent", border:"none",
              borderBottom: i<ARTICLES.length-1?"1px solid #172717":"none",
              cursor:"pointer", textAlign:"left", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#0d1e0d"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ fontSize:"1.3rem", flexShrink:0 }}>{a.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.88rem",
                  color:"#9ab89a", fontWeight:600, lineHeight:1.3,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</div>
                <Mono style={{ fontSize:"0.58rem", color:"#5a9a5a", marginTop:"0.2rem" }}>{a.time} · {a.cat}</Mono>
              </div>
              <Tag color={TAG_COLORS[a.tag]}>{a.tag}</Tag>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="fade-up" style={{ animationDelay:"460ms",
        background:"#0a150a", border:"1px solid #172717", borderRadius:"13px",
        padding:"1.5rem", marginBottom:"2rem" }}>
        <Label light>◈ How Tax-Loss Harvesting Works</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"0.8rem" }}>
          {[
            {n:"01",t:"Crypto Drops",d:"You hold a coin that's down from your purchase price."},
            {n:"02",t:"Sell at a Loss",d:"Selling below cost creates a capital loss on paper."},
            {n:"03",t:"Offset Gains",d:"That loss cancels gains from other trades or stocks."},
            {n:"04",t:"Rebuy Instantly",d:"No wash-sale rule for crypto — buy back immediately."},
            {n:"05",t:"Save on Taxes",d:"Up to $3K offsets income. Unused losses carry forward."},
          ].map(s=>(
            <div key={s.n} style={{ background:"#0c1a0c", borderRadius:"9px",
              padding:"0.9rem", border:"1px solid #182818" }}>
              <Mono style={{ fontSize:"0.62rem", color:"#6ee85a", display:"block", marginBottom:"0.35rem" }}>{s.n}</Mono>
              <div style={{ fontSize:"0.8rem", fontWeight:600, color:"#9ab89a",
                marginBottom:"0.3rem", fontFamily:"'Source Serif 4',serif" }}>{s.t}</div>
              <div style={{ fontSize:"0.7rem", color:"#7ab07a",
                color:"#8aaa8a", lineHeight:1.5, fontFamily:"'Source Serif 4',serif" }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WHAT IF CALCULATOR ───────────────────────────────────────────────────────
const COIN_DATA = {
  BTC:  { name:"Bitcoin",   symbol:"BTC",  emoji:"₿",  prices:{ "2019":7200,  "2020":29000, "2021":47000, "2022":16500, "2023":42000, "2024":94000, "2025":85000 } },
  ETH:  { name:"Ethereum",  symbol:"ETH",  emoji:"Ξ",  prices:{ "2019":130,   "2020":730,   "2021":3700,  "2022":1200,  "2023":2200,  "2024":3400,  "2025":3200  } },
  SOL:  { name:"Solana",    symbol:"SOL",  emoji:"◎",  prices:{ "2019":0.5,   "2020":1.5,   "2021":170,   "2022":10,    "2023":100,   "2024":190,   "2025":165   } },
  BNB:  { name:"BNB",       symbol:"BNB",  emoji:"⬡",  prices:{ "2019":14,    "2020":37,    "2021":640,   "2022":245,   "2023":305,   "2024":720,   "2025":680   } },
  DOGE: { name:"Dogecoin",  symbol:"DOGE", emoji:"Ð",  prices:{ "2019":0.002, "2020":0.005, "2021":0.33,  "2022":0.07,  "2023":0.09,  "2024":0.38,  "2025":0.28  } },
  XRP:  { name:"XRP",       symbol:"XRP",  emoji:"✕",  prices:{ "2019":0.19,  "2020":0.22,  "2021":0.83,  "2022":0.34,  "2023":0.62,  "2024":2.20,  "2025":2.10  } },
};
const CURRENT_PRICES = { BTC:84000, ETH:3100, SOL:155, BNB:640, DOGE:0.25, XRP:2.05 };

function WhatIfCalc() {
  const [coin, setCoin] = useState("BTC");
  const [year, setYear] = useState("2020");
  const [amount, setAmount] = useState(1000);
  const years = ["2019","2020","2021","2022","2023","2024","2025"];
  const coinInfo = COIN_DATA[coin];
  const buyPrice = coinInfo.prices[year];
  const currentPrice = CURRENT_PRICES[coin];
  const coinsAcquired = amount / buyPrice;
  const currentValue = coinsAcquired * currentPrice;
  const gain = currentValue - amount;
  const multiplier = currentValue / amount;
  const isUp = gain > 0;

  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          What If I Invested <span style={{ color:"#6ee85a" }}>Calculator</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>See what any investment would be worth today.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Your Hypothetical Investment</Label>
          <SliderRow label="Amount Invested" value={amount} onChange={setAmount} min={100} max={50000} step={100} pre="$" hint="How much you would have put in" />
          <div style={{ marginBottom:"1.2rem" }}>
            <Label light>Select Coin</Label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.5rem" }}>
              {Object.entries(COIN_DATA).map(([k,v])=>(
                <button key={k} onClick={()=>setCoin(k)} style={{
                  padding:"0.6rem 0.4rem", borderRadius:"8px", border:"none",
                  background: coin===k ? "#1a3a1a" : "#0c1a0c",
                  outline: coin===k ? "1px solid #6ee85a" : "1px solid #172717",
                  cursor:"pointer", transition:"all 0.15s" }}>
                  <div style={{ fontSize:"1.1rem", marginBottom:"0.15rem" }}>{v.emoji}</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem",
                    color: coin===k ? "#6ee85a" : "#3a5a3a", letterSpacing:"0.08em" }}>{v.symbol}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:"0.5rem" }}>
            <Label light>Year of Investment</Label>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
              {years.map(y=>(
                <button key={y} onClick={()=>setYear(y)} style={{
                  padding:"0.4rem 0.7rem", borderRadius:"6px", border:"none",
                  background: year===y ? "#1a3a1a" : "#0c1a0c",
                  outline: year===y ? "1px solid #6ee85a" : "1px solid #172717",
                  cursor:"pointer", fontFamily:"'JetBrains Mono',monospace",
                  fontSize:"0.65rem", color: year===y ? "#6ee85a" : "#3a5a3a",
                  transition:"all 0.15s" }}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160} style={{ background: isUp ? "linear-gradient(135deg,#0d200d,#0a1a0a)" : "linear-gradient(135deg,#200d0d,#1a0a0a)", border: isUp ? "1px solid #2a5a2a" : "1px solid #5a2a2a", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px",
              background: isUp ? "linear-gradient(90deg,transparent,#6ee85a,transparent)" : "linear-gradient(90deg,transparent,#e85a5a,transparent)" }} />
            <Label light>◈ Result</Label>
            <div style={{ textAlign:"center", padding:"1rem 0" }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem",
                color:"#7ab87a", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:"0.4rem" }}>
                {amount > 0 ? `$${amount.toLocaleString()} in ${coinInfo.name} in ${year}` : ""}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"clamp(2.5rem,6vw,3.8rem)", letterSpacing:"0.04em",
                color: isUp ? "#6ee85a" : "#e85a5a", lineHeight:1 }}>
                {$$(currentValue)}
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem",
                color: isUp ? "#4a8a4a" : "#8a4a4a", marginTop:"0.4rem" }}>
                {isUp ? "+" : ""}{$$(gain)} ({isUp ? "+" : ""}{pct((gain/amount)*100)})
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem",
                color:"#5a9a5a", marginTop:"0.3rem" }}>
                {multiplier.toFixed(2)}x your money
              </div>
            </div>
          </Card>
          <Card dark delay={240}>
            <Label light>◈ The Math</Label>
            {[
              { l:"Amount invested",     v:`$${amount.toLocaleString()}` },
              { l:`${coinInfo.symbol} price in ${year}`, v:`$${buyPrice.toLocaleString()}` },
              { l:"Coins acquired",      v:`${coinsAcquired.toFixed(4)} ${coinInfo.symbol}` },
              { l:`${coinInfo.symbol} price today`,      v:`$${currentPrice.toLocaleString()}` },
              { l:"Value today",         v:$$(currentValue), bold:true },
              { l:"Gain / Loss",         v:`${isUp?"+":""}${$$(gain)}`, bold:true, green:isUp },
            ].map((r,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"0.28rem 0", borderBottom:"1px solid #1e3a1e" }}>
                <Mono style={{ fontSize:"0.68rem", color:"#7ab87a" }}>{r.l}</Mono>
                <Mono style={{ fontSize:"0.68rem", fontWeight:r.bold?600:400,
                  color: r.bold ? (r.green===false?"#e85a5a":r.green?"#6ee85a":"#9ab89a") : "#4a6a4a" }}>{r.v}</Mono>
              </div>
            ))}
          </Card>
          <Card dark delay={320} style={{ background:"linear-gradient(135deg,#1a1a00,#141400)", border:"1px solid #3a3a00" }}>
            <Mono style={{ fontSize:"0.62rem", color:"#e8e040", textTransform:"uppercase",
              letterSpacing:"0.12em", display:"block", marginBottom:"0.4rem" }}>⚠ Tax Reminder</Mono>
            <p style={{ fontSize:"0.72rem", color:"#6a6a3a", lineHeight:1.6 }}>
              If you actually sold this position, the <strong style={{color:"#c8c860"}}>{$$(Math.max(0,gain))}</strong> gain would be taxable.
              Use the Capital Gains calculator to see exactly what you'd owe.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── CRYPTO INCOME TAX CALCULATOR ────────────────────────────────────────────
function IncomeCalc() {
  const [incomeType, setIncomeType] = useState("staking");
  const [cryptoAmount, setCryptoAmount] = useState(500);
  const [fmvAtReceipt, setFmvAtReceipt] = useState(1200);
  const [currentFmv, setCurrentFmv] = useState(1800);
  const [bracket, setBracket] = useState(22);
  const [selfEmployed, setSelfEmployed] = useState(false);

  const incomeTypes = [
    { id:"staking",  label:"Staking Rewards", icon:"🔒", desc:"Earned by locking crypto in a validator" },
    { id:"mining",   label:"Mining Income",   icon:"⛏",  desc:"Crypto earned from proof-of-work mining" },
    { id:"payment",  label:"Paid in Crypto",  icon:"💸",  desc:"Received crypto as payment for work/services" },
    { id:"airdrop",  label:"Airdrop",         icon:"🪂",  desc:"Free crypto received from a project" },
  ];

  const ordinaryIncomeTax = fmvAtReceipt * (bracket / 100);
  const seRate = selfEmployed && (incomeType === "mining" || incomeType === "payment") ? 0.1413 : 0;
  const seTax = fmvAtReceipt * seRate;
  const totalTaxAtReceipt = ordinaryIncomeTax + seTax;
  const newCostBasis = fmvAtReceipt;
  const additionalGain = currentFmv - fmvAtReceipt;
  const additionalTax = additionalGain > 0 ? additionalGain * (bracket / 100) : 0;
  const totalIfSoldNow = totalTaxAtReceipt + additionalTax;
  const effectiveRate = currentFmv > 0 ? (totalIfSoldNow / currentFmv) * 100 : 0;

  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Crypto Income <span style={{ color:"#6ee85a" }}>Tax Calculator</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>Staking, mining, airdrops & payments — taxed differently from capital gains.</p>
      </div>

      <Card dark delay={60} style={{ marginBottom:"1.1rem" }}>
        <Label light>◈ How did you earn this crypto?</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"0.6rem" }}>
          {incomeTypes.map(t=>(
            <button key={t.id} onClick={()=>setIncomeType(t.id)} style={{
              padding:"0.75rem 0.6rem", borderRadius:"9px", border:"none",
              background: incomeType===t.id ? "#1a3a1a" : "#0c1a0c",
              outline: incomeType===t.id ? "1px solid #6ee85a" : "1px solid #172717",
              cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
              <div style={{ fontSize:"1.1rem", marginBottom:"0.3rem" }}>{t.icon}</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
                color: incomeType===t.id ? "#6ee85a" : "#4a6a4a",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"0.2rem" }}>{t.label}</div>
              <div style={{ fontSize:"0.62rem", color:"#5a9a5a", lineHeight:1.4,
                fontFamily:"'Source Serif 4',serif" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={120}>
          <Label light>◈ Your Earnings</Label>
          <SliderRow label="USD Value When Received" value={fmvAtReceipt} onChange={setFmvAtReceipt} min={10} max={50000} step={50} pre="$" hint="Fair market value on the day you received it" />
          <SliderRow label="Current Market Value" value={currentFmv} onChange={setCurrentFmv} min={0} max={100000} step={50} pre="$" hint="What it's worth today if you haven't sold" />
          <SelectRow label="Your Tax Bracket" value={bracket} onChange={setBracket} options={TAX_BRACKETS} />
          {(incomeType === "mining" || incomeType === "payment") && (
            <div style={{ display:"flex", alignItems:"center", gap:"0.7rem", padding:"0.7rem",
              background:"#0c1a0c", borderRadius:"8px", border:"1px solid #172717", marginTop:"0.5rem" }}>
              <button onClick={()=>setSelfEmployed(!selfEmployed)} style={{
                width:"36px", height:"20px", borderRadius:"10px", border:"none",
                background: selfEmployed ? "#6ee85a" : "#1a3a1a", cursor:"pointer",
                position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:"3px",
                  left: selfEmployed ? "18px" : "3px", width:"14px", height:"14px",
                  background:"#fff", borderRadius:"50%", transition:"left 0.2s" }} />
              </button>
              <div>
                <Mono style={{ fontSize:"0.62rem", color:"#85b885", display:"block" }}>Self-Employed</Mono>
                <Mono style={{ fontSize:"0.56rem", color:"#5a9a5a" }}>Add ~14.1% self-employment tax</Mono>
              </div>
            </div>
          )}
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={200}>
            <Label light>◈ Tax Due at Time of Receipt</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              <BigStat label="Income Tax" value={$$(ordinaryIncomeTax)} highlight sub={`@ ${bracket}% ordinary rate`} />
              {seTax > 0 && <BigStat label="Self-Employ Tax" value={$$(seTax)} sub="~14.1% SE rate" />}
            </div>
            <div style={{ background:"#0c1a0c", border:"1px solid #172717", borderRadius:"9px", padding:"0.9rem" }}>
              <Mono style={{ fontSize:"0.6rem", color:"#7ab87a", textTransform:"uppercase",
                letterSpacing:"0.12em", display:"block", marginBottom:"0.3rem" }}>Key Rule</Mono>
              <p style={{ fontSize:"0.72rem", color:"#85b885", lineHeight:1.6 }}>
                Crypto earned as income is taxed at <strong style={{color:"#9ab89a"}}>fair market value on the day received</strong> — regardless of what the price does afterward. Your cost basis for future sales is set to that same value.
              </p>
            </div>
          </Card>

          <Card dark delay={280}>
            <Label light>◈ If You Sell Today</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"0.9rem" }}>
              <BigStat label="Additional Gain Tax" value={additionalGain > 0 ? $$(additionalTax) : "$0"} sub={additionalGain > 0 ? `+${$$(additionalGain)} since receipt` : "No additional gain"} />
              <BigStat label="Total Tax If Sold" value={$$(totalIfSoldNow)} highlight sub={`${pct(effectiveRate)} of current value`} />
            </div>
            {[
              { l:"Value at receipt (cost basis)", v:$$(fmvAtReceipt) },
              { l:"Income tax at receipt",         v:`-${$$(ordinaryIncomeTax)}` },
              { l:"Additional gain since receipt", v:$$(Math.max(0,additionalGain)) },
              { l:"Capital gains tax on gain",     v:`-${$$(additionalTax)}` },
              { l:"Net after all taxes",           v:$$(currentFmv - totalIfSoldNow), bold:true },
            ].map((r,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"0.28rem 0", borderBottom:"1px solid #1e3a1e" }}>
                <Mono style={{ fontSize:"0.66rem", color:"#7ab87a" }}>{r.l}</Mono>
                <Mono style={{ fontSize:"0.68rem", color: r.bold?"#6ee85a":"#4a6a4a", fontWeight:r.bold?600:400 }}>{r.v}</Mono>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── TAX BRACKET IMPACT CALCULATOR ───────────────────────────────────────────
function BracketCalc() {
  const [salary, setSalary] = useState(75000);
  const [stGains, setStGains] = useState(15000);
  const [ltGains, setLtGains] = useState(10000);
  const [filingStatus, setFilingStatus] = useState("single");

  const BRACKETS_2025 = {
    single: [
      {min:0,      max:11600,  rate:0.10},
      {min:11600,  max:47150,  rate:0.12},
      {min:47150,  max:100525, rate:0.22},
      {min:100525, max:191950, rate:0.24},
      {min:191950, max:243725, rate:0.32},
      {min:243725, max:609350, rate:0.35},
      {min:609350, max:Infinity,rate:0.37},
    ],
    married: [
      {min:0,      max:23200,  rate:0.10},
      {min:23200,  max:94300,  rate:0.12},
      {min:94300,  max:201050, rate:0.22},
      {min:201050, max:383900, rate:0.24},
      {min:383900, max:487450, rate:0.32},
      {min:487450, max:731200, rate:0.35},
      {min:731200, max:Infinity,rate:0.37},
    ],
  };
  const LT_BRACKETS = {
    single:  [{max:47025,rate:0},{max:518900,rate:0.15},{max:Infinity,rate:0.20}],
    married: [{max:94050,rate:0},{max:583750,rate:0.15},{max:Infinity,rate:0.20}],
  };

  const calcOrdinaryTax = (income, status) => {
    let tax = 0;
    const brackets = BRACKETS_2025[status];
    for (const b of brackets) {
      if (income <= b.min) break;
      tax += (Math.min(income, b.max) - b.min) * b.rate;
    }
    return tax;
  };

  const totalOrdinary = salary + stGains;
  const ordinaryTax = calcOrdinaryTax(totalOrdinary, filingStatus);
  const baseTax = calcOrdinaryTax(salary, filingStatus);
  const stTaxPortion = ordinaryTax - baseTax;

  const ltRate = LT_BRACKETS[filingStatus].find(b => (salary + stGains) <= b.max)?.rate ?? 0.20;
  const ltTax = ltGains * ltRate;
  const totalTax = ordinaryTax + ltTax;
  const totalIncome = salary + stGains + ltGains;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
  const afterTax = totalIncome - totalTax;

  const brackets = BRACKETS_2025[filingStatus];
  const topBracket = brackets.find(b => totalOrdinary > b.min && totalOrdinary <= b.max) || brackets[brackets.length-1];

  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)",
          letterSpacing:"0.06em", color:"#e8f5e8", lineHeight:1, marginBottom:"0.4rem" }}>
          Tax Bracket <span style={{ color:"#6ee85a" }}>Impact Calculator</span>
        </h2>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>See exactly which bracket your crypto gains push you into — and what you owe.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.1rem" }}>
        <Card dark delay={80}>
          <Label light>◈ Your Income Picture</Label>
          <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.2rem" }}>
            {[{id:"single",label:"Single"},{id:"married",label:"Married Filing Jointly"}].map(s=>(
              <button key={s.id} onClick={()=>setFilingStatus(s.id)} style={{
                flex:1, padding:"0.5rem", borderRadius:"7px", border:"none",
                background: filingStatus===s.id ? "#1a3a1a" : "#0c1a0c",
                outline: filingStatus===s.id ? "1px solid #6ee85a" : "1px solid #172717",
                cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
                color: filingStatus===s.id ? "#6ee85a" : "#3a5a3a",
                textTransform:"uppercase", letterSpacing:"0.08em", transition:"all 0.15s" }}>
                {s.label}
              </button>
            ))}
          </div>
          <SliderRow label="Annual Salary / Wages" value={salary} onChange={setSalary} min={0} max={400000} step={1000} pre="$" hint="Your W-2 or self-employment income" />
          <SliderRow label="Short-Term Crypto Gains" value={stGains} onChange={setStGains} min={0} max={200000} step={500} pre="$" hint="Held under 12 months — taxed as income" />
          <SliderRow label="Long-Term Crypto Gains" value={ltGains} onChange={setLtGains} min={0} max={200000} step={500} pre="$" hint="Held over 12 months — lower rate" />
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <Card dark delay={160}>
            <Label light>◈ Your Tax Breakdown</Label>
            <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              <BigStat label="Total Tax Owed" value={$$(totalTax)} highlight sub={`${pct(effectiveRate)} effective rate`} />
              <BigStat label="Take-Home" value={$$(afterTax)} sub="after all taxes" />
            </div>
            {[
              { l:"Salary + ST gains",    v:$$(totalOrdinary),  note:"ordinary income" },
              { l:"Tax on salary",        v:$$(baseTax),        note:"" },
              { l:"Tax on ST crypto",     v:$$(stTaxPortion),   note:`@ marginal rate` },
              { l:"LT crypto gains",      v:$$(ltGains),        note:"long-term" },
              { l:"Tax on LT crypto",     v:$$(ltTax),          note:`@ ${(ltRate*100).toFixed(0)}% LT rate` },
              { l:"Total tax owed",       v:$$(totalTax),       note:"", bold:true },
            ].map((r,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"0.28rem 0", borderBottom:"1px solid #1e3a1e" }}>
                <Mono style={{ fontSize:"0.67rem", color: r.bold?"#9ab89a":"#3a5a3a" }}>
                  {r.l} <span style={{color:"#4a8a4a"}}>{r.note}</span>
                </Mono>
                <Mono style={{ fontSize:"0.68rem", color: r.bold?"#6ee85a":"#4a6a4a", fontWeight:r.bold?600:400 }}>{r.v}</Mono>
              </div>
            ))}
          </Card>

          <Card dark delay={240} style={{ background:"linear-gradient(135deg,#0d1e0d,#0a180a)", border:"1px solid #2a5a2a" }}>
            <Label light>◈ Your Bracket Status</Label>
            <div style={{ marginBottom:"0.8rem" }}>
              <Mono style={{ fontSize:"0.62rem", color:"#6ee85a", display:"block", marginBottom:"0.25rem" }}>
                Top Marginal Bracket: {(topBracket.rate*100).toFixed(0)}%
              </Mono>
              <p style={{ fontSize:"0.72rem", color:"#85b885", lineHeight:1.6 }}>
                Your short-term crypto gains are taxed at up to <strong style={{color:"#9ab89a"}}>{(topBracket.rate*100).toFixed(0)}%</strong>. Your long-term gains are taxed at <strong style={{color:"#9ab89a"}}>{(ltRate*100).toFixed(0)}%</strong>. Converting short-term to long-term saves you <strong style={{color:"#6ee85a"}}>{$$(stTaxPortion - ltTax > 0 ? (stGains * (topBracket.rate - ltRate)) : 0)}</strong> on your crypto gains alone.
              </p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
              {brackets.map((b,i)=>{
                const isActive = totalOrdinary > b.min && totalOrdinary <= b.max;
                const isPast = totalOrdinary > b.max;
                return (
                  <div key={i} style={{ padding:"0.5rem 0.6rem", borderRadius:"7px",
                    background: isActive ? "#1a3a1a" : "#0c1a0c",
                    border: isActive ? "1px solid #6ee85a" : "1px solid #172717",
                    opacity: isPast ? 0.4 : 1 }}>
                    <Mono style={{ fontSize:"0.65rem", color: isActive ? "#6ee85a" : "#3a5a3a",
                      display:"block", fontWeight: isActive ? 600 : 400 }}>
                      {(b.rate*100).toFixed(0)}% {isActive && "← you"}
                    </Mono>
                    <Mono style={{ fontSize:"0.55rem", color:"#527852" }}>
                      ${b.min.toLocaleString()}+
                    </Mono>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToolsPage({ navigate }) {
  const [active, setActive] = useState("tlh");
  const tools = [
    {id:"tlh",     label:"Tax-Loss Harv.", icon:"◈"},
    {id:"gains",   label:"Capital Gains",  icon:"◆"},
    {id:"swap",    label:"Swap Impact",    icon:"⇌"},
    {id:"carry",   label:"Carryforward",   icon:"↻"},
    {id:"whatif",  label:"What If",        icon:"★"},
    {id:"income",  label:"Crypto Income",  icon:"⬡"},
    {id:"bracket", label:"Tax Bracket",    icon:"⚖"},
  ];
  return (
    <div className="fade-in">
      <div style={{ textAlign:"center", marginBottom:"1.8rem" }}>
        <Label light>◈ Free Calculator Suite</Label>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif",
          fontSize:"clamp(2rem,5vw,3rem)", letterSpacing:"0.06em",
          color:"#e8f5e8", lineHeight:1, marginBottom:"0.5rem" }}>
          HarvestMyCrypto <span style={{ color:"#6ee85a" }}>Tools</span>
        </h1>
        <p style={{ color:"#7ab07a", fontSize:"0.78rem" }}>Seven free calculators. Real numbers. No signup.</p>
      </div>
      <div style={{ display:"flex", gap:"0", overflowX:"auto", scrollbarWidth:"none",
        background:"#0a150a", border:"1px solid #172717", borderRadius:"10px",
        padding:"0.3rem", marginBottom:"1.5rem", WebkitOverflowScrolling:"touch" }}>
        {tools.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)} style={{
            flexShrink:0, padding:"0.6rem 0.7rem", background:active===t.id?"#1a3a1a":"transparent",
            border:"none", borderRadius:"7px", color:active===t.id?"#6ee85a":"#3a5a3a",
            cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem",
            letterSpacing:"0.07em", textTransform:"uppercase", whiteSpace:"nowrap",
            transition:"all 0.2s", display:"flex", alignItems:"center",
            justifyContent:"center", gap:"0.3rem" }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {active==="tlh"     && <TLHCalc />}
      {active==="gains"   && <GainsCalc />}
      {active==="swap"    && <SwapCalc />}
      {active==="carry"   && <CarryCalc />}
      {active==="whatif"  && <WhatIfCalc />}
      {active==="income"  && <IncomeCalc />}
      {active==="bracket" && <BracketCalc />}
      <AffiliateSection />
      <p style={{ fontSize:"0.6rem", color:"#4a7a4a", fontFamily:"'JetBrains Mono',monospace",
        textAlign:"center", lineHeight:1.7, marginTop:"2rem" }}>
        For educational purposes only. Not financial or tax advice.<br />
        Results are estimates. Consult a qualified tax professional.
      </p>
    </div>
  );
}
function GuidesPage({ navigate }) {
  return (
    <div className="fade-in">
      <div style={{ borderBottom:"1px solid #172717", paddingBottom:"1.5rem", marginBottom:"1.5rem" }}>
        <Label light>◈ Crypto Tax Guides</Label>
        <h1 style={{ fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900,
          color:"#e8f5e8", lineHeight:1.15, marginBottom:"0.6rem" }}>
          Plain-English Guides<br /><em style={{ color:"#6ee85a", fontWeight:400 }}>to Crypto Taxes</em>
        </h1>
        <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.9rem",
          color:"#7ab07a", lineHeight:1.7, maxWidth:"520px" }}>
          Everything you need to know about crypto taxes — written for investors, not accountants.
        </p>
      </div>
      {ARTICLES.map((a,i)=>(
        <button key={a.id} onClick={()=>navigate(a.id)} className="fade-up"
          style={{ animationDelay:`${i*60}ms`, width:"100%",
            display:"flex", alignItems:"flex-start", gap:"1.1rem",
            padding:"1.4rem 0", background:"transparent", border:"none",
            borderBottom:"1px solid #172717", cursor:"pointer", textAlign:"left",
            transition:"opacity 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <span style={{ fontSize:"2rem", flexShrink:0 }}>{a.emoji}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginBottom:"0.5rem", flexWrap:"wrap" }}>
              <Mono style={{ fontSize:"0.58rem", color:"#7ab07a", textTransform:"uppercase", letterSpacing:"0.12em" }}>{a.cat}</Mono>
              <Tag color={TAG_COLORS[a.tag]}>{a.tag}</Tag>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1rem,2.5vw,1.2rem)",
              fontWeight:700, color:"#e8f5e8", lineHeight:1.3, marginBottom:"0.4rem" }}>{a.title}</h2>
            <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.82rem",
              color:"#85b885", lineHeight:1.6, marginBottom:"0.4rem" }}>{a.sub}</p>
            <Mono style={{ fontSize:"0.58rem", color:"#5a9a5a" }}>{a.time} read</Mono>
          </div>
          <span style={{ color:"#5a9a5a", fontSize:"1.2rem", flexShrink:0, marginTop:"4px" }}>→</span>
        </button>
      ))}
    </div>
  );
}

function ArticlePage({ article, navigate }) {
  const idx = ARTICLES.findIndex(a=>a.id===article.id);
  const prev = ARTICLES[idx-1];
  const next = ARTICLES[idx+1];
  return (
    <div className="fade-in" style={{ maxWidth:"680px", margin:"0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"1.5rem",
        fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", color:"#5a9a5a",
        letterSpacing:"0.08em", flexWrap:"wrap" }}>
        <button onClick={()=>navigate("home")} style={{ background:"none", border:"none",
          cursor:"pointer", color:"#4a8a4a", fontFamily:"inherit", fontSize:"inherit",
          letterSpacing:"inherit" }}>Home</button>
        <span>›</span>
        <button onClick={()=>navigate("guides")} style={{ background:"none", border:"none",
          cursor:"pointer", color:"#4a8a4a", fontFamily:"inherit", fontSize:"inherit",
          letterSpacing:"inherit" }}>Guides</button>
        <span>›</span>
        <span style={{ color:"#7ab07a" }}>{article.cat}</span>
      </div>
      {/* Header */}
      <div style={{ borderBottom:"1px solid #172717", paddingBottom:"1.5rem", marginBottom:"1.8rem" }}>
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", marginBottom:"0.8rem" }}>
          <Mono style={{ fontSize:"0.58rem", color:"#7ab07a", textTransform:"uppercase", letterSpacing:"0.14em" }}>{article.cat}</Mono>
          <Tag color={TAG_COLORS[article.tag]}>{article.tag}</Tag>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif",
          fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:900,
          color:"#e8f5e8", lineHeight:1.2, marginBottom:"0.8rem" }}>{article.title}</h1>
        <p style={{ fontFamily:"'Source Serif 4',serif", fontSize:"0.95rem",
          color:"#85b885", lineHeight:1.6, marginBottom:"0.8rem",
          fontStyle:"italic" }}>{article.sub}</p>
        <Mono style={{ fontSize:"0.58rem", color:"#5a9a5a" }}>{article.time} read · Educational, not tax advice</Mono>
      </div>
      {/* Article content - light background for readability */}
      <div style={{ background:"#faf9f6", borderRadius:"13px", padding:"1.8rem",
        marginBottom:"1.5rem", border:"1px solid #e8e0d4" }}>
        <ArticleContent id={article.id} navigate={navigate} />
      </div>
      {/* Continue reading */}
      {(prev||next) && (
        <div style={{ marginBottom:"1.5rem" }}>
          <Label light>◈ Continue Reading</Label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
            {[prev,next].filter(Boolean).map(a=>(
              <button key={a.id} onClick={()=>navigate(a.id)} style={{
                background:"#0a150a", border:"1px solid #172717", borderRadius:"10px",
                padding:"1rem", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#2a4a2a"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#172717"}>
                <Mono style={{ fontSize:"0.56rem", color:"#5a9a5a", textTransform:"uppercase",
                  letterSpacing:"0.12em", display:"block", marginBottom:"0.4rem" }}>{a.cat}</Mono>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.85rem",
                  color:"#9ab89a", fontWeight:600, lineHeight:1.35 }}>{a.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <AffiliateSection />
      <button onClick={()=>navigate("guides")} style={{ background:"transparent",
        border:"1px solid #1e3a1e", borderRadius:"6px", padding:"0.5rem 1rem",
        marginTop:"1.5rem",
        cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
        color:"#3a6a3a", letterSpacing:"0.1em", textTransform:"uppercase" }}>
        ← All Guides
      </button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(() => urlToPage(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePop = () => setPage(urlToPage(window.location.pathname));
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (p) => {
    window.history.pushState({}, '', pageToUrl(p));
    setPage(p);
    setMenuOpen(false);
    window.scrollTo(0, 0);
    if(containerRef.current) containerRef.current.scrollTo({top:0,behavior:"smooth"});
  };

  useEffect(() => {
    const el = containerRef.current;
    if(!el) return;
    const fn = () => setScrolled(el.scrollTop > 15);
    el.addEventListener("scroll", fn);
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const currentArticle = ARTICLES.find(a=>a.id===page);
  const NAV_ITEMS = [
    {id:"home",   label:"Home"},
    {id:"tools",  label:"Calculators"},
    {id:"guides", label:"Guides"},
  ];

  return (
    <div ref={containerRef} style={{ height:"100vh", overflowY:"auto",
      background:"#060d06", fontFamily:"'Source Serif 4',serif", color:"#c0d0c0",
      position:"relative" }}>
      <style>{GLOBAL_CSS}</style>

      {/* BG grid */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(#0d1a0d14 1px,transparent 1px),linear-gradient(90deg,#0d1a0d14 1px,transparent 1px)",
        backgroundSize:"48px 48px", zIndex:0 }} />
      <div style={{ position:"fixed", top:"-200px", left:"50%", transform:"translateX(-50%)",
        width:"800px", height:"500px",
        background:"radial-gradient(ellipse,#6ee85a06 0%,transparent 70%)",
        pointerEvents:"none", zIndex:0 }} />

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{ position:"sticky", top:0, zIndex:100,
        background: scrolled?"rgba(6,13,6,0.95)":"rgba(6,13,6,0.75)",
        backdropFilter:"blur(14px)",
        borderBottom: scrolled?"1px solid #1a3a1a":"1px solid #0d1f0d",
        transition:"all 0.3s" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto",
          padding:"0 1.2rem", height:"56px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <button onClick={()=>navigate("home")} style={{ background:"none", border:"none",
            cursor:"pointer", display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",
              fontSize:"1rem", color:"#6ee85a", animation:"float 3s ease-in-out infinite" }}>◈</span>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.1rem",
              letterSpacing:"0.08em", color:"#e8f5e8" }}>HarvestMyCrypto</span>
            <span className="hide-mobile" style={{ fontFamily:"'JetBrains Mono',monospace",
              fontSize:"0.52rem", color:"#5a9a5a", letterSpacing:"0.08em" }}>.com</span>
          </button>

          {/* Desktop nav */}
          <div className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:"0.2rem" }}>
            {NAV_ITEMS.map(n=>(
              <button key={n.id} onClick={()=>navigate(n.id)} style={{
                padding:"0.45rem 0.9rem", background:"transparent", border:"none",
                borderBottom: page===n.id?"2px solid #6ee85a":"2px solid transparent",
                color: page===n.id?"#6ee85a":"#2e4e2e",
                cursor:"pointer", fontFamily:"'JetBrains Mono',monospace",
                fontSize:"0.65rem", letterSpacing:"0.1em", textTransform:"uppercase",
                transition:"all 0.2s" }}
                onMouseEnter={e=>{if(page!==n.id)e.currentTarget.style.color="#9aca9a";}}
                onMouseLeave={e=>{if(page!==n.id)e.currentTarget.style.color="#2e4e2e";}}>
                {n.label}
              </button>
            ))}
            <button onClick={()=>navigate("tools")} style={{ marginLeft:"0.5rem",
              padding:"0.45rem 1rem", background:"#6ee85a", color:"#050e05",
              borderRadius:"6px", fontFamily:"'JetBrains Mono',monospace",
              fontSize:"0.62rem", letterSpacing:"0.1em", border:"none", cursor:"pointer",
              fontWeight:500 }}>
              ◈ Free Tools
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{ display:"none",
            background:"none", border:"1px solid #1e3a1e", borderRadius:"6px",
            padding:"0.4rem 0.6rem", cursor:"pointer", color:"#6ee85a",
            fontFamily:"'JetBrains Mono',monospace", fontSize:"0.8rem" }}
            className="mobile-menu-btn">
            {menuOpen?"✕":"☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background:"rgba(6,13,6,0.98)", borderTop:"1px solid #1a3a1a",
            padding:"1rem 1.2rem", display:"flex", flexDirection:"column", gap:"0.2rem" }}>
            {[...NAV_ITEMS,
              {id:"tlh",   label:"◈ Tax-Loss Harvesting"},
              {id:"gains", label:"◆ Capital Gains"},
              {id:"swap",  label:"⇌ Swap Impact"},
              {id:"carry", label:"↻ Carryforward"},
            ].map(n=>(
              <button key={n.id} onClick={()=>navigate(n.id)} style={{
                padding:"0.75rem 0", background:"transparent", border:"none",
                borderBottom:"1px solid #1e3a1e", color: page===n.id?"#6ee85a":"#4a6a4a",
                cursor:"pointer", fontFamily:"'JetBrains Mono',monospace",
                fontSize:"0.72rem", letterSpacing:"0.1em", textAlign:"left",
                textTransform:"uppercase" }}>
                {n.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <main style={{ position:"relative", zIndex:1, maxWidth:"960px",
        margin:"0 auto", padding:"2rem 1.2rem 5rem" }}>
        {page==="home"   && <HomePage navigate={navigate} />}
        {page==="tools"  && <ToolsPage navigate={navigate} />}
        {page==="guides" && <GuidesPage navigate={navigate} />}
        {currentArticle  && <ArticlePage article={currentArticle} navigate={navigate} />}
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer style={{ position:"relative", zIndex:1,
        borderTop:"1px solid #172717", background:"#060d06",
        padding:"2rem 1.2rem" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
            gap:"1.5rem", marginBottom:"1.5rem" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", marginBottom:"0.5rem" }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#6ee85a" }}>◈</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem",
                  letterSpacing:"0.08em", color:"#e8f5e8" }}>HarvestMyCrypto</span>
              </div>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem",
                color:"#5a9a5a", lineHeight:1.7, letterSpacing:"0.06em" }}>
                Free crypto tax calculators<br />and plain-English guides.<br />{DOMAIN}
              </p>
            </div>
            <div>
              <Mono style={{ fontSize:"0.6rem", color:"#5a9a5a", textTransform:"uppercase",
                letterSpacing:"0.14em", display:"block", marginBottom:"0.6rem" }}>Calculators</Mono>
              {["Tax-Loss Harvesting","Capital Gains","Swap Impact","Carryforward","What If","Crypto Income","Tax Bracket"].map((l,i)=>(
                <button key={i} onClick={()=>navigate(["tlh","gains","swap","carry","whatif","income","bracket"][i])} style={{
                  display:"block", background:"none", border:"none", cursor:"pointer",
                  fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem",
                  color:"#5a9a5a", letterSpacing:"0.06em", padding:"0.2rem 0",
                  textAlign:"left" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#4a6a4a"}
                  onMouseLeave={e=>e.currentTarget.style.color="#2a4a2a"}>
                  {l}
                </button>
              ))}
            </div>
            <div>
              <Mono style={{ fontSize:"0.6rem", color:"#5a9a5a", textTransform:"uppercase",
                letterSpacing:"0.14em", display:"block", marginBottom:"0.6rem" }}>Guides</Mono>
              {ARTICLES.map(a=>(
                <button key={a.id} onClick={()=>navigate(a.id)} style={{
                  display:"block", background:"none", border:"none", cursor:"pointer",
                  fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem",
                  color:"#5a9a5a", letterSpacing:"0.06em", padding:"0.2rem 0",
                  textAlign:"left", maxWidth:"200px", overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#4a6a4a"}
                  onMouseLeave={e=>e.currentTarget.style.color="#2a4a2a"}>
                  {a.title}
                </button>
              ))}
            </div>
          </div>
          <Divider dark />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap:"0.8rem" }}>
            <Mono style={{ fontSize:"0.58rem", color:"#4a7a4a" }}>
              © 2026 HarvestMyCrypto · {DOMAIN}
            </Mono>
            <Mono style={{ fontSize:"0.58rem", color:"#4a7a4a", textAlign:"right", lineHeight:1.7 }}>
              For educational purposes only. Not financial or tax advice.<br />
              Consult a qualified tax professional before making decisions.
            </Mono>
          </div>
        </div>
      </footer>

      {/* Mobile menu button visible fix */}
      <style>{`
        @media (max-width: 640px) {
          .mobile-menu-btn { display: block !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
