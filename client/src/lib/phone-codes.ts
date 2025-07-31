// src/lib/phone-codes.ts
// Utility to expose ALL country calling codes, sorted alphabetically by country name.
// Data source: `world-countries` (ISO + IDD info)

import countries from "world-countries";

export type CountryDial = {
  /** Country common name (e.g., "India") */
  name: string;
  /** ISO-3166-1 alpha-2 (e.g., "IN") */
  iso2: string;
  /** E.164 calling code beginning with + (e.g., "+91") */
  dial: string;
  /** Convenience label: "+91 (IN) — India" */
  label: string;
};

/** ISO-2 to flag emoji (works in most modern OS/browsers). */
export const flagEmoji = (iso2: string) =>
  iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

/** All (country, calling code) pairs, sorted by country name then dial code. */
export const ALL_PHONE_OPTIONS: CountryDial[] = countries
  .filter((c) => c.idd && c.idd.root && c.idd.suffixes && c.idd.suffixes.length)
  .flatMap((c) =>
    (c.idd.suffixes ?? [""]).map((suffix) => {
      const dial = `${c.idd.root}${suffix}`;
      const name = c.name.common;
      const iso2 = c.cca2;
      return {
        name,
        iso2,
        dial,
        label: `${dial} (${iso2}) — ${name}`,
      } as CountryDial;
    })
  )
  .filter(
    (opt, idx, arr) =>
      idx ===
      arr.findIndex((o) => o.iso2 === opt.iso2 && o.dial === opt.dial && o.name === opt.name)
  )
  .sort((a, b) =>
    a.name === b.name ? a.dial.localeCompare(b.dial) : a.name.localeCompare(b.name)
  );

/** One primary calling code per country (shortest first), sorted A–Z by name. */
export const PRIMARY_PHONE_FOR_COUNTRY: CountryDial[] = countries
  .filter((c) => c.idd && c.idd.root && c.idd.suffixes && c.idd.suffixes.length)
  .map((c) => {
    const all = (c.idd.suffixes ?? [""]).map((s) => `${c.idd.root}${s}`);
    const dial = all.sort((x, y) => x.length - y.length || x.localeCompare(y))[0];
    const name = c.name.common;
    const iso2 = c.cca2;
    return {
      name,
      iso2,
      dial,
      label: `${dial} (${iso2}) — ${name}`,
    } as CountryDial;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/** Compact label like your UI: "+91 (IN)". */
export const shortLabel = (iso2: string, dial: string) => `${dial} (${iso2})`;
