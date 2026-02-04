/**********************
STATE
**********************/
const state = {
  nigo: { a: 2000, b: 20 },
  eligibility: { a: 2000, b: 10 },
  policy: { a: 3000, b: 10 },
  email: { a: 500, b: 5, c: 5 },
};

let current = "nigo";

/**********************
CONFIG (labels + formulas)
**********************/
const config = {
  nigo: {
    title: "Claims NIGO Handler",
    theme: "blue",
    labels: ["Claims / Month", "Resubmission %"],
    primaryLabel: "Rework hours saved",
    calc: (v1, v2) => {
      const rework = v1 * (v2 / 100);
      const prevented = rework * 0.6;
      return (prevented * 45) / 60;
    },
    unit: " hrs",
    secondary: {
      label: "Resubmissions prevented / month",
      calc: (v1, v2) => {
        const rework = v1 * (v2 / 100);
        const prevented = rework * 0.6;
        return prevented;
      },
      unit: " resubmissions",
    },
  },

  eligibility: {
    title: "Claims Eligibility Agent",
    theme: "green",
    labels: ["Claims / Month", "Cost per Claim ($)"],
    primaryLabel: "Processing cost saved",
    prefix: "$",
    calc: (v1, v2) => {
      const ineligible = v1 * 0.12;
      const blocked = ineligible * 0.95;
      return blocked * v2;
    },
    unit: " saved",
    secondary: {
      label: "Ineligible claims blocked / month",
      calc: (v1, v2) => {
        const ineligible = v1 * 0.12;
        const blocked = ineligible * 0.95;
        return blocked;
      },
      unit: " claims",
    },
  },

  policy: {
    title: "Policy Recommendation Agent",
    theme: "yellow",
    labels: ["Inquiries / Month", "Time per Inquiry (min)"],
    primaryLabel: "Agent hours freed / month",
    calc: (v1, v2) => {
      const auto = v1 * 0.7;
      return (auto * v2) / 60;
    },
    unit: " hrs saved",
    secondary: {
      label: "Queries auto-resolved / month",
      calc: (v1, v2) => {
        return v1 * 0.7;
      },
      unit: " queries",
    },
  },

  email: {
    title: "Email Automation Agent",
    theme: "purple",
    labels: ["Emails / Day", "Team Size", "Manual Time (min)"],
    primaryLabel: "Hours saved per agent",
    calc: (v1, v2, v3) => {
      const monthly = v1 * 22;
      const saved = (monthly * v3 - monthly * 0.17) / 60;
      return saved / v2;
    },
    unit: " hrs/agent",
    secondary: {
      label: "Emails auto-classified / month",
      calc: (v1, v2, v3) => {
        const monthly = v1 * 22;
        return monthly * 0.99;
      },
      unit: " emails",
    },
    flagged: {
      label: "Flagged for Priority/Fraud Review",
      calc: (v1) => {
        const monthly = v1 * 22;
        return monthly * 0.15;
      },
      unit: " cases",
    },
    tertiary: {
      label: "Total hours saved / month",
      calc: (v1, v2, v3) => {
        const monthly = v1 * 22;
        const saved = (monthly * v3 - monthly * 0.17) / 60;
        return saved;
      },
      unit: " hrs saved",
    },
  },
};

/**********************
ELEMENTS
**********************/
const inputA = document.getElementById("inputA");
const inputB = document.getElementById("inputB");
const valueA = document.getElementById("valueA");
const valueB = document.getElementById("valueB");

const labelA = document.querySelectorAll("label")[0];
const labelB = document.querySelectorAll("label")[1];

const resultEl = document.getElementById("result");
const header = document.getElementById("calc-header");
const resultBoxPrimary = document.getElementById("result-box-primary");
const resultBoxSecondary = document.getElementById("result-box-secondary");
const resultBoxTertiary = document.getElementById("result-box-tertiary");
const resultSecondaryValue = document.getElementById("result-secondary-value");
const resultSecondaryLabel = document.getElementById("result-secondary-label");
const resultPrimaryLabel = document.getElementById("result-primary-label");
const resultTertiaryValue = document.getElementById("result-tertiary-value");
const resultTertiaryLabel = document.getElementById("result-tertiary-label");
const resultBoxFlagged = document.getElementById("result-box-flagged");
const resultFlaggedValue = document.getElementById("result-flagged-value");
const resultFlaggedLabel = document.getElementById("result-flagged-label");
const resultsGrid = document.getElementById("results-grid");
const titleEl = document.getElementById("calc-title");
const tabs = document.querySelectorAll(".tab-btn");
const inputC = document.getElementById("inputC");
const valueC = document.getElementById("valueC");
const labelC = document.getElementById("labelC");
const inputCWrapper = document.getElementById("inputCWrapper");

/**********************
COLORS
**********************/
const colorMap = {
  purple: "bg-iris",
  green: "bg-mint",
  yellow: "bg-celeste",
  blue: "bg-primary",
};

// map theme keys to the CSS variables defined in the page so we can
// apply exact inline colors to headers/result boxes (avoids Tailwind class mismatch)
const themeVarMap = {
  purple: "--iris",
  green: "--mint",
  yellow: "--celeste",
  blue: "--primary",
};

// color each tab button to match its calculator theme (uses CSS vars)
// (tabs will be colored when active inside switchTab)

/**********************
HELPERS
**********************/
function format(n) {
  return Math.round(n).toLocaleString();
}

/**********************
UPDATE
**********************/
function update() {
  const { a, b, c } = state[current];
  const cfg = config[current];

  valueA.innerText = format(a);
  valueB.innerText = format(b);
  if (state[current].c !== undefined) {
    valueC.innerText = format(state[current].c);
  }

  const result = cfg.calc(a, b, c);
  const primaryPrefix = cfg.prefix || "";
  const primarySuffix = cfg.unit || "";
  resultEl.innerText = primaryPrefix + format(result) + primarySuffix;
  // Primary label (use per-calculator label if provided)
  if (resultPrimaryLabel) resultPrimaryLabel.innerText = cfg.primaryLabel || "Primary Estimated Impact";

  // Secondary result (optional)
  if (cfg.secondary && typeof cfg.secondary.calc === "function") {
    const sec = cfg.secondary.calc(a, b, c);
    if (resultSecondaryValue && resultSecondaryLabel && resultBoxSecondary) {
      const secPrefix = cfg.secondary.prefix || "";
      const secSuffix = cfg.secondary.unit || "";
      resultSecondaryValue.innerText = secPrefix + format(sec) + secSuffix;
      resultSecondaryLabel.innerText = cfg.secondary.label || "";
      resultBoxSecondary.classList.remove("hidden");
    }
  } else {
    if (resultBoxSecondary) resultBoxSecondary.classList.add("hidden");
  }

  // Tertiary result (optional)
  if (cfg.tertiary && typeof cfg.tertiary.calc === "function") {
    const ter = cfg.tertiary.calc(a, b, c);
    if (resultTertiaryValue && resultTertiaryLabel && resultBoxTertiary) {
      const terPrefix = cfg.tertiary.prefix || "";
      const terSuffix = cfg.tertiary.unit || "";
      resultTertiaryValue.innerText = terPrefix + format(ter) + terSuffix;
      resultTertiaryLabel.innerText = cfg.tertiary.label || "";
      resultBoxTertiary.classList.remove("hidden");
    }
  } else {
    if (resultBoxTertiary) resultBoxTertiary.classList.add("hidden");
  }
  // Flagged result (optional - email only)
  if (cfg.flagged && typeof cfg.flagged.calc === "function") {
    const flag = cfg.flagged.calc(a, b, c);
    if (resultFlaggedValue && resultFlaggedLabel && resultBoxFlagged) {
      const flagPrefix = cfg.flagged.prefix || "";
      const flagSuffix = cfg.flagged.unit || "";
      resultFlaggedValue.innerText = flagPrefix + format(flag) + flagSuffix;
      resultFlaggedLabel.innerText = cfg.flagged.label || "";
      resultBoxFlagged.classList.remove("hidden");
    }
  } else {
    if (resultBoxFlagged) resultBoxFlagged.classList.add("hidden");
  }

  // Flagged result (optional - specific to email)
  if (cfg.flagged && typeof cfg.flagged.calc === "function") {
    const flag = cfg.flagged.calc(a, b, c);
    if (resultFlaggedValue && resultFlaggedLabel && resultBoxFlagged) {
      const fPrefix = cfg.flagged.prefix || "";
      const fSuffix = cfg.flagged.unit || "";
      resultFlaggedValue.innerText = fPrefix + format(flag) + fSuffix;
      resultFlaggedLabel.innerText = cfg.flagged.label || "";
      resultBoxFlagged.classList.remove("hidden");
    }
  } else {
    if (resultBoxFlagged) resultBoxFlagged.classList.add("hidden");
  }

  // Adjust results grid columns based on how many cards will be shown
  if (resultsGrid) {
    let visible = 0;
    visible += 1; // primary always present
    if (cfg.secondary && typeof cfg.secondary.calc === "function") visible += 1;
    if (cfg.tertiary && typeof cfg.tertiary.calc === "function") visible += 1;
    if (cfg.flagged && typeof cfg.flagged.calc === "function") visible += 1;
    // For email calculator prefer a 2x2 layout (md:grid-cols-2) when multiple cards show.
    let cols = Math.min(visible, 3);
    if (current === "email" && visible > 2) cols = 2;
    resultsGrid.className = `grid md:grid-cols-${cols} gap-6`;
  }
}

/**********************
SWITCH TAB
**********************/
function switchTab(type) {
  current = type;
  const cfg = config[type];

  titleEl.innerText = cfg.title;

  labelA.innerText = cfg.labels[0];
  labelB.innerText = cfg.labels[1];

  inputA.value = state[type].a;
  inputB.value = state[type].b;

  // Set per-calculator input min/max values and ensure current state values fit within them
  // Defaults
  inputA.min = 0;
  inputA.max = 100000;
  inputB.min = 0;
  inputB.max = 100;
  inputC.min = 0;
  inputC.max = 30;

  // Per-calculator overrides
  if (type === "policy") {
    // Time per inquiry should be between 5 and 60 minutes
    inputB.min = 5;
    inputB.max = 60;
    // Inquiries per month should cap at 50,000 (not 100k)
    inputA.max = 50000;
  }

  if (type === "email") {
    // For the email calculator: Emails/day between 100 and 5000, Team size 1-50, Manual time 5-30
    inputA.min = 100;
    inputA.max = 5000;
    inputB.min = 1;
    inputB.max = 50;
    inputC.min = 5;
    inputC.max = 30;
  }

  if (type === "eligibility") {
    // Ensure cost per claim has a minimum of $10
    inputB.min = 10;
    inputB.max = 1000;
  }

  // Clamp state values to the new min/max to avoid invalid ranges
  const clamp = (val, mn, mx) => {
    const n = +val;
    const lo = +mn;
    const hi = +mx;
    if (isNaN(n)) return lo;
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  };

  state[type].a = clamp(state[type].a, inputA.min, inputA.max);
  state[type].b = clamp(state[type].b, inputB.min, inputB.max);
  if (state[type].c !== undefined) state[type].c = clamp(state[type].c, inputC.min, inputC.max);

  // Reflect any clamped values back to inputs
  inputA.value = state[type].a;
  inputB.value = state[type].b;
  if (state[type].c !== undefined) inputC.value = state[type].c;
  const color = colorMap[cfg.theme];
  

  header.className = `text-white px-6 py-4 ${color}`;
  // Keep consistent vertical padding and rounded style for all result boxes
  if (resultBoxPrimary) resultBoxPrimary.className = `text-white rounded-xl py-8 text-center ${color}`;
  if (resultBoxSecondary) resultBoxSecondary.className = `text-white rounded-xl py-8 text-center ${color}`;
  if (resultBoxTertiary) resultBoxTertiary.className = `text-white rounded-xl py-8 text-center ${color}`;
  if (resultBoxFlagged) resultBoxFlagged.className = `text-white rounded-xl py-8 text-center ${color}`;
  valueA.className = `px-3 py-1 text-white rounded-md text-sm font-semibold ${color}`;
  valueB.className = `px-3 py-1 text-white rounded-md text-sm font-semibold ${color}`;
  if (cfg.labels[2]) {
    inputCWrapper.classList.remove("hidden");
    labelC.innerText = cfg.labels[2];
    inputC.value = state[type].c;
    valueC.className = `px-3 py-1 text-white rounded-md text-sm font-semibold ${color}`;
  } else {
    inputCWrapper.classList.add("hidden");
  }


  tabs.forEach((t) => t.classList.remove("active"));
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  // color only the active tab button to match its calculator theme
  const themeVar = themeVarMap[cfg.theme];
  const bgColor = themeVar ? `var(${themeVar})` : null;
  tabs.forEach((t) => {
    if (t.dataset.type === type) {
      if (bgColor) {
        t.style.backgroundColor = bgColor;
        t.style.color = "white";
        t.style.border = "none";
      }
    } else {
      t.style.backgroundColor = "";
      t.style.color = "";
      t.style.border = "";
    }
  });

  // Reorder result cards for specific calculators.
  // For the `email` calculator we want: secondary, tertiary, primary (primary appears 3rd).
  // For others use the default: secondary, primary, tertiary.
  if (resultsGrid) {
    if (type === "email") {
      // Desired order for email: secondary, primary, flagged, tertiary
      if (resultBoxSecondary) resultsGrid.appendChild(resultBoxSecondary);
      if (resultBoxPrimary) resultsGrid.appendChild(resultBoxPrimary);
      if (resultBoxFlagged) resultsGrid.appendChild(resultBoxFlagged);
      if (resultBoxTertiary) resultsGrid.appendChild(resultBoxTertiary);
    } else {
      if (resultBoxSecondary) resultsGrid.appendChild(resultBoxSecondary);
      if (resultBoxPrimary) resultsGrid.appendChild(resultBoxPrimary);
      if (resultBoxTertiary) resultsGrid.appendChild(resultBoxTertiary);
      if (resultBoxFlagged) resultsGrid.appendChild(resultBoxFlagged);
    }
  }

  update();
}

/**********************
EVENTS
**********************/
inputA.addEventListener("input", () => {
  state[current].a = +inputA.value;
  update();
});

inputB.addEventListener("input", () => {
  state[current].b = +inputB.value;
  update();
});

inputC.addEventListener("input", () => {
  state[current].c = +inputC.value;
  update();
});

tabs.forEach((btn) =>
  btn.addEventListener("click", () => switchTab(btn.dataset.type)),
);

/**********************
INIT
**********************/
switchTab("nigo");


/* NAV SCROLLSPY: highlight header nav items based on visible section */
(function () {
  const navLinks = document.querySelectorAll('header nav a[href^="#"]');
  if (!navLinks || !navLinks.length) return;

  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => {
            if (a.getAttribute("href") === id) {
              a.classList.add("text-primary", "font-semibold");
            } else {
              a.classList.remove("text-primary", "font-semibold");
            }
          });
        }
      });
    },
    { root: null, rootMargin: "0px 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((s) => io.observe(s));

  // On click, immediately show active state for that link
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.forEach((x) => x.classList.remove("text-primary", "font-semibold"));
      a.classList.add("text-primary", "font-semibold");
    })
  );

  // Ensure correct state on load
  window.addEventListener("load", () => {
    let found = false;
    sections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (!found && r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2) {
        const id = "#" + s.id;
        navLinks.forEach((a) => {
          if (a.getAttribute("href") === id) a.classList.add("text-primary", "font-semibold");
          else a.classList.remove("text-primary", "font-semibold");
        });
        found = true;
      }
    });
    if (!found) {
      navLinks.forEach((a) => {
        if (a.getAttribute("href") === "#hero") a.classList.add("text-primary", "font-semibold");
      });
    }
  });
})();
