"use strict";
/* ---------- المنطق (دوال نقية قابلة للاختبار) ---------- */
const CONFIG = { capacityKwh: 80, baseConsumption: 18 /* kWh/100km, افتراض */, reserve: 10 };

function clamp(v, lo, hi){ return Math.min(hi, Math.max(lo, v)); }

function consumptionPer100(tempC, speedKmh, acOn, base = CONFIG.baseConsumption){
  const speedFactor = 1 + Math.max(0, speedKmh - 90) * 0.006;
  const heatFactor  = 1 + Math.max(0, tempC - 25) * 0.004;
  const acFactor    = acOn ? 1 + clamp((tempC - 20) * 0.006, 0, 0.2) : 1;
  return base * speedFactor * heatFactor * acFactor;
}

function estimateRangeKm(soc, soh, tempC, speedKmh, acOn){
  const usableKwh = CONFIG.capacityKwh * (soh / 100) * (soc / 100);
  return Math.round((usableKwh / consumptionPer100(tempC, speedKmh, acOn)) * 100);
}

function sohLabel(soh){
  if (soh >= 90) return { text: "ممتازة", cls: "ok" };
  if (soh >= 80) return { text: "جيدة", cls: "warn" };
  return { text: "تحتاج فحصًا", cls: "bad" };
}

function buildAlerts(s){
  const out = [];
  if (s.soc <= 20) out.push({ cls: "bad", text: "الشحن منخفض (" + s.soc + "%). خطّط لمحطة شحن قريبة." });
  if (s.cellTemp >= 45) out.push({ cls: "bad", text: "حرارة الخلايا مرتفعة (" + s.cellTemp + "°م). قلّل السرعة أو ركّن بالظل." });
  else if (s.cellTemp >= 38) out.push({ cls: "warn", text: "حرارة الخلايا أعلى من المعتاد (" + s.cellTemp + "°م)." });
  if (s.tripKm > s.rangeKm) out.push({ cls: "bad", text: "الرحلة المحددة أطول من المدى الحالي، تحتاج توقف شحن." });
  if (!out.length) out.push({ cls: "ok", text: "كل شيء طبيعي، لا توجد تنبيهات." });
  return out;
}

function planTrip(tripKm, rangeKm, reservePct = CONFIG.reserve){
  const safeRange = Math.floor(rangeKm * (1 - reservePct / 100));
  if (safeRange <= 0) return { feasible: false, stops: Infinity, safeRange };
  const stops = Math.max(0, Math.ceil(tripKm / safeRange) - 1);
  return { feasible: true, stops, safeRange };
}

if (typeof module !== "undefined") module.exports = { CONFIG, clamp, consumptionPer100, estimateRangeKm, sohLabel, buildAlerts, planTrip };
