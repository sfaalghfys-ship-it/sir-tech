"use strict";
var Energy = (function () {
  // كل القيم أدناه افتراضات تجريبية وليست مواصفات رسمية
  var POWER = { ac: 11, dc: 100 };                       // kW
  var TARIFF = { home: 0.18, offpeak: 0.12, pub: 0.45 }; // ر.س/kWh
  var EFF = 0.92;
  function cp() {
    var f = typeof module !== "undefined" ? require("./logic.js").consumptionPer100 : consumptionPer100;
    return f.apply(null, arguments);
  }
  function energyNeeded(cap, soh, from, to) { return Math.max(0, cap * (soh / 100) * (to - from) / 100); }
  function chargeHours(kwh, kw) { return kwh / (kw * EFF); }
  function cost(kwh, rate) { return kwh / EFF * rate; }
  function fmtDur(h) { var m = Math.round(h * 60); return Math.floor(m / 60) + " س " + (m % 60) + " د"; }
  function planRoute(o) {
    var cpk = cp(o.temp, o.speed, o.ac) * (o.mult || 1) / 100, effCap = o.cap * o.soh / 100;
    var pos = 0, soc = o.soc, stops = [], guard = 0, ok = true, chargeMin = 0;
    while (pos < o.distKm) {
      if (guard++ > 12) { ok = false; break; }
      var remain = o.distKm - pos, reach = Math.max(0, (soc - o.reserve) / 100 * effCap) / cpk;
      if (reach >= remain) { soc -= remain * cpk / effCap * 100; pos = o.distKm; break; }
      var leg = Math.floor(reach * 0.9);
      if (leg < 20) { ok = false; break; }
      soc -= leg * cpk / effCap * 100; pos += leg;
      var add = energyNeeded(o.cap, o.soh, soc, o.chargeTo), min = Math.round(chargeHours(add, o.kw) * 60);
      stops.push({ km: pos, arrivalSoc: Math.round(soc), chargeTo: o.chargeTo, minutes: min, kwh: add });
      chargeMin += min; soc = o.chargeTo;
    }
    var kwhTotal = o.distKm * cpk;
    return { feasible: ok, stops: stops, arrivalSoc: Math.round(soc), kwhTotal: kwhTotal, per100: cpk * 100,
      percentUsed: kwhTotal / effCap * 100, driveHours: o.distKm / o.speed, chargeMin: chargeMin };
  }
  return { POWER: POWER, TARIFF: TARIFF, energyNeeded: energyNeeded, chargeHours: chargeHours, cost: cost, fmtDur: fmtDur, planRoute: planRoute };
})();
if (typeof module !== "undefined") module.exports = Energy;
