// src/app/register/components/register.tsx
"use client";

import type { SVGProps } from "react";
import { useEffect, useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import CountryDialSelector from "@/lib/country-dial-selector";

/* -------------------------------------------------
   Inline replacements (no external phone-code module)
-------------------------------------------------- */
type CountryDialOption = { iso2: string; name: string; dial: string };

function flagEmoji(iso2: string) {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(
    127397 + code.charCodeAt(0),
    127397 + code.charCodeAt(1)
  );
}

/** Large, common dialing dataset (you can expand further if you need territories). */
const ALL_PHONE_OPTIONS: CountryDialOption[] = [
  { iso2: "AF", name: "Afghanistan", dial: "+93" },
  { iso2: "AL", name: "Albania", dial: "+355" },
  { iso2: "DZ", name: "Algeria", dial: "+213" },
  { iso2: "AD", name: "Andorra", dial: "+376" },
  { iso2: "AO", name: "Angola", dial: "+244" },
  { iso2: "AG", name: "Antigua and Barbuda", dial: "+1-268" },
  { iso2: "AR", name: "Argentina", dial: "+54" },
  { iso2: "AM", name: "Armenia", dial: "+374" },
  { iso2: "AU", name: "Australia", dial: "+61" },
  { iso2: "AT", name: "Austria", dial: "+43" },
  { iso2: "AZ", name: "Azerbaijan", dial: "+994" },
  { iso2: "BS", name: "Bahamas", dial: "+1-242" },
  { iso2: "BH", name: "Bahrain", dial: "+973" },
  { iso2: "BD", name: "Bangladesh", dial: "+880" },
  { iso2: "BB", name: "Barbados", dial: "+1-246" },
  { iso2: "BY", name: "Belarus", dial: "+375" },
  { iso2: "BE", name: "Belgium", dial: "+32" },
  { iso2: "BZ", name: "Belize", dial: "+501" },
  { iso2: "BJ", name: "Benin", dial: "+229" },
  { iso2: "BT", name: "Bhutan", dial: "+975" },
  { iso2: "BO", name: "Bolivia", dial: "+591" },
  { iso2: "BA", name: "Bosnia and Herzegovina", dial: "+387" },
  { iso2: "BW", name: "Botswana", dial: "+267" },
  { iso2: "BR", name: "Brazil", dial: "+55" },
  { iso2: "BN", name: "Brunei", dial: "+673" },
  { iso2: "BG", name: "Bulgaria", dial: "+359" },
  { iso2: "BF", name: "Burkina Faso", dial: "+226" },
  { iso2: "BI", name: "Burundi", dial: "+257" },
  { iso2: "KH", name: "Cambodia", dial: "+855" },
  { iso2: "CM", name: "Cameroon", dial: "+237" },
  { iso2: "CA", name: "Canada", dial: "+1" },
  { iso2: "CV", name: "Cape Verde", dial: "+238" },
  { iso2: "CF", name: "Central African Republic", dial: "+236" },
  { iso2: "TD", name: "Chad", dial: "+235" },
  { iso2: "CL", name: "Chile", dial: "+56" },
  { iso2: "CN", name: "China", dial: "+86" },
  { iso2: "CO", name: "Colombia", dial: "+57" },
  { iso2: "KM", name: "Comoros", dial: "+269" },
  { iso2: "CG", name: "Congo", dial: "+242" },
  { iso2: "CD", name: "Congo (DRC)", dial: "+243" },
  { iso2: "CR", name: "Costa Rica", dial: "+506" },
  { iso2: "CI", name: "Côte d’Ivoire", dial: "+225" },
  { iso2: "HR", name: "Croatia", dial: "+385" },
  { iso2: "CU", name: "Cuba", dial: "+53" },
  { iso2: "CY", name: "Cyprus", dial: "+357" },
  { iso2: "CZ", name: "Czechia", dial: "+420" },
  { iso2: "DK", name: "Denmark", dial: "+45" },
  { iso2: "DJ", name: "Djibouti", dial: "+253" },
  { iso2: "DM", name: "Dominica", dial: "+1-767" },
  { iso2: "DO", name: "Dominican Republic", dial: "+1-809" },
  { iso2: "EC", name: "Ecuador", dial: "+593" },
  { iso2: "EG", name: "Egypt", dial: "+20" },
  { iso2: "SV", name: "El Salvador", dial: "+503" },
  { iso2: "GQ", name: "Equatorial Guinea", dial: "+240" },
  { iso2: "ER", name: "Eritrea", dial: "+291" },
  { iso2: "EE", name: "Estonia", dial: "+372" },
  { iso2: "SZ", name: "Eswatini", dial: "+268" },
  { iso2: "ET", name: "Ethiopia", dial: "+251" },
  { iso2: "FJ", name: "Fiji", dial: "+679" },
  { iso2: "FI", name: "Finland", dial: "+358" },
  { iso2: "FR", name: "France", dial: "+33" },
  { iso2: "GA", name: "Gabon", dial: "+241" },
  { iso2: "GM", name: "Gambia", dial: "+220" },
  { iso2: "GE", name: "Georgia", dial: "+995" },
  { iso2: "DE", name: "Germany", dial: "+49" },
  { iso2: "GH", name: "Ghana", dial: "+233" },
  { iso2: "GR", name: "Greece", dial: "+30" },
  { iso2: "GD", name: "Grenada", dial: "+1-473" },
  { iso2: "GT", name: "Guatemala", dial: "+502" },
  { iso2: "GN", name: "Guinea", dial: "+224" },
  { iso2: "GW", name: "Guinea-Bissau", dial: "+245" },
  { iso2: "GY", name: "Guyana", dial: "+592" },
  { iso2: "HT", name: "Haiti", dial: "+509" },
  { iso2: "HN", name: "Honduras", dial: "+504" },
  { iso2: "HU", name: "Hungary", dial: "+36" },
  { iso2: "IS", name: "Iceland", dial: "+354" },
  { iso2: "IN", name: "India", dial: "+91" },
  { iso2: "ID", name: "Indonesia", dial: "+62" },
  { iso2: "IR", name: "Iran", dial: "+98" },
  { iso2: "IQ", name: "Iraq", dial: "+964" },
  { iso2: "IE", name: "Ireland", dial: "+353" },
  { iso2: "IL", name: "Israel", dial: "+972" },
  { iso2: "IT", name: "Italy", dial: "+39" },
  { iso2: "JM", name: "Jamaica", dial: "+1-876" },
  { iso2: "JP", name: "Japan", dial: "+81" },
  { iso2: "JO", name: "Jordan", dial: "+962" },
  { iso2: "KZ", name: "Kazakhstan", dial: "+7" },
  { iso2: "KE", name: "Kenya", dial: "+254" },
  { iso2: "KI", name: "Kiribati", dial: "+686" },
  { iso2: "KW", name: "Kuwait", dial: "+965" },
  { iso2: "KG", name: "Kyrgyzstan", dial: "+996" },
  { iso2: "LA", name: "Laos", dial: "+856" },
  { iso2: "LV", name: "Latvia", dial: "+371" },
  { iso2: "LB", name: "Lebanon", dial: "+961" },
  { iso2: "LS", name: "Lesotho", dial: "+266" },
  { iso2: "LR", name: "Liberia", dial: "+231" },
  { iso2: "LY", name: "Libya", dial: "+218" },
  { iso2: "LI", name: "Liechtenstein", dial: "+423" },
  { iso2: "LT", name: "Lithuania", dial: "+370" },
  { iso2: "LU", name: "Luxembourg", dial: "+352" },
  { iso2: "MG", name: "Madagascar", dial: "+261" },
  { iso2: "MW", name: "Malawi", dial: "+265" },
  { iso2: "MY", name: "Malaysia", dial: "+60" },
  { iso2: "MV", name: "Maldives", dial: "+960" },
  { iso2: "ML", name: "Mali", dial: "+223" },
  { iso2: "MT", name: "Malta", dial: "+356" },
  { iso2: "MH", name: "Marshall Islands", dial: "+692" },
  { iso2: "MR", name: "Mauritania", dial: "+222" },
  { iso2: "MU", name: "Mauritius", dial: "+230" },
  { iso2: "MX", name: "Mexico", dial: "+52" },
  { iso2: "FM", name: "Micronesia", dial: "+691" },
  { iso2: "MD", name: "Moldova", dial: "+373" },
  { iso2: "MC", name: "Monaco", dial: "+377" },
  { iso2: "MN", name: "Mongolia", dial: "+976" },
  { iso2: "ME", name: "Montenegro", dial: "+382" },
  { iso2: "MA", name: "Morocco", dial: "+212" },
  { iso2: "MZ", name: "Mozambique", dial: "+258" },
  { iso2: "MM", name: "Myanmar", dial: "+95" },
  { iso2: "NA", name: "Namibia", dial: "+264" },
  { iso2: "NR", name: "Nauru", dial: "+674" },
  { iso2: "NP", name: "Nepal", dial: "+977" },
  { iso2: "NL", name: "Netherlands", dial: "+31" },
  { iso2: "NZ", name: "New Zealand", dial: "+64" },
  { iso2: "NI", name: "Nicaragua", dial: "+505" },
  { iso2: "NE", name: "Niger", dial: "+227" },
  { iso2: "NG", name: "Nigeria", dial: "+234" },
  { iso2: "KP", name: "North Korea", dial: "+850" },
  { iso2: "MK", name: "North Macedonia", dial: "+389" },
  { iso2: "NO", name: "Norway", dial: "+47" },
  { iso2: "OM", name: "Oman", dial: "+968" },
  { iso2: "PK", name: "Pakistan", dial: "+92" },
  { iso2: "PW", name: "Palau", dial: "+680" },
  { iso2: "PA", name: "Panama", dial: "+507" },
  { iso2: "PG", name: "Papua New Guinea", dial: "+675" },
  { iso2: "PY", name: "Paraguay", dial: "+595" },
  { iso2: "PE", name: "Peru", dial: "+51" },
  { iso2: "PH", name: "Philippines", dial: "+63" },
  { iso2: "PL", name: "Poland", dial: "+48" },
  { iso2: "PT", name: "Portugal", dial: "+351" },
  { iso2: "QA", name: "Qatar", dial: "+974" },
  { iso2: "RO", name: "Romania", dial: "+40" },
  { iso2: "RU", name: "Russia", dial: "+7" },
  { iso2: "RW", name: "Rwanda", dial: "+250" },
  { iso2: "KN", name: "Saint Kitts and Nevis", dial: "+1-869" },
  { iso2: "LC", name: "Saint Lucia", dial: "+1-758" },
  { iso2: "VC", name: "Saint Vincent and the Grenadines", dial: "+1-784" },
  { iso2: "WS", name: "Samoa", dial: "+685" },
  { iso2: "SM", name: "San Marino", dial: "+378" },
  { iso2: "ST", name: "São Tomé and Príncipe", dial: "+239" },
  { iso2: "SA", name: "Saudi Arabia", dial: "+966" },
  { iso2: "SN", name: "Senegal", dial: "+221" },
  { iso2: "RS", name: "Serbia", dial: "+381" },
  { iso2: "SC", name: "Seychelles", dial: "+248" },
  { iso2: "SL", name: "Sierra Leone", dial: "+232" },
  { iso2: "SG", name: "Singapore", dial: "+65" },
  { iso2: "SK", name: "Slovakia", dial: "+421" },
  { iso2: "SI", name: "Slovenia", dial: "+386" },
  { iso2: "SB", name: "Solomon Islands", dial: "+677" },
  { iso2: "SO", name: "Somalia", dial: "+252" },
  { iso2: "ZA", name: "South Africa", dial: "+27" },
  { iso2: "KR", name: "South Korea", dial: "+82" },
  { iso2: "SS", name: "South Sudan", dial: "+211" },
  { iso2: "ES", name: "Spain", dial: "+34" },
  { iso2: "LK", name: "Sri Lanka", dial: "+94" },
  { iso2: "SD", name: "Sudan", dial: "+249" },
  { iso2: "SR", name: "Suriname", dial: "+597" },
  { iso2: "SE", name: "Sweden", dial: "+46" },
  { iso2: "CH", name: "Switzerland", dial: "+41" },
  { iso2: "SY", name: "Syria", dial: "+963" },
  { iso2: "TW", name: "Taiwan", dial: "+886" },
  { iso2: "TJ", name: "Tajikistan", dial: "+992" },
  { iso2: "TZ", name: "Tanzania", dial: "+255" },
  { iso2: "TH", name: "Thailand", dial: "+66" },
  { iso2: "TL", name: "Timor-Leste", dial: "+670" },
  { iso2: "TG", name: "Togo", dial: "+228" },
  { iso2: "TO", name: "Tonga", dial: "+676" },
  { iso2: "TT", name: "Trinidad and Tobago", dial: "+1-868" },
  { iso2: "TN", name: "Tunisia", dial: "+216" },
  { iso2: "TR", name: "Türkiye", dial: "+90" },
  { iso2: "TM", name: "Turkmenistan", dial: "+993" },
  { iso2: "TV", name: "Tuvalu", dial: "+688" },
  { iso2: "UG", name: "Uganda", dial: "+256" },
  { iso2: "UA", name: "Ukraine", dial: "+380" },
  { iso2: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso2: "GB", name: "United Kingdom", dial: "+44" },
  { iso2: "US", name: "United States", dial: "+1" },
  { iso2: "UY", name: "Uruguay", dial: "+598" },
  { iso2: "UZ", name: "Uzbekistan", dial: "+998" },
  { iso2: "VU", name: "Vanuatu", dial: "+678" },
  { iso2: "VE", name: "Venezuela", dial: "+58" },
  { iso2: "VN", name: "Vietnam", dial: "+84" },
  { iso2: "YE", name: "Yemen", dial: "+967" },
  { iso2: "ZM", name: "Zambia", dial: "+260" },
  { iso2: "ZW", name: "Zimbabwe", dial: "+263" },
];
/* ------------------------------------------------- */

/* ---------- Small UI icon ---------- */
function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 12h12m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Brand SVG icons (inline, no deps) ---------- */
function GoogleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.3 0 6.2 1.1 8.5 3.2l6-6C34.9 3.1 29.8 1 24 1 14.8 1 6.9 6.3 3.2 14.1l7.7 6c1.8-5.8 7.2-10.6 13.1-10.6z"
      />
      <path
        fill="#FBBC05"
        d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.6 3-2.4 5.5-5.1 7.2l7.8 6c4.6-4.3 7.1-10.7 7.1-16.9z"
      />
      <path
        fill="#34A853"
        d="M10.9 27.8a14.5 14.5 0 0 1-.8-4.8c0-1.6.3-3.3.8-4.8l-7.7-6A23 23 0 0 0 1 23c0 3.7.9 7.3 2.6 10.5l7.3-5.7z"
      />
      <path
        fill="#4285F4"
        d="M24 47c6.5 0 12-2.1 16-5.9l-7.8-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.7-4.2-13.6-9.9l-7.7 6C6.4 42.1 14.5 47 24 47z"
      />
    </svg>
  );
}
function MicrosoftMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 23 23" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" rx="1" />
      <rect x="13" y="1" width="9" height="9" fill="#7FBA00" rx="1" />
      <rect x="1" y="13" width="9" height="9" fill="#00A4EF" rx="1" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" rx="1" />
    </svg>
  );
}
function AppleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.45 2.22-1.27 3.02-.94.94-2.17 1.35-3.32 1.24-.08-1.1.46-2.29 1.3-3.12.91-.93 2.41-1.63 3.29-1.14.03.02.04.04.04.08zM21 17.3c-.45 1.03-.66 1.49-1.24 2.39-.8 1.2-1.93 2.7-3.36 2.72-1.26.03-1.59-.79-3.32-.79s-2.11.77-3.36.81c-1.44.06-2.55-1.31-3.36-2.51C3.65 18 2.2 14.62 3.64 11.8c.94-1.88 2.93-3.07 4.98-3.1 1.56-.03 2.84.86 3.32.86.47 0 2.3-1.06 3.89-.9.66.03 2.52.27 3.72 2.04-.1.06-2.21 1.3-2.15 3.85.06 2.99 2.59 4 2.6 4.55z"
      />
    </svg>
  );
}
function LinkedInMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4.9V24H.5zM9 8.5h4.7v2.1h.1c.7-1.2 2.5-2.5 5.1-2.5 5.5 0 6.5 3.6 6.5 8.3V24h-4.9v-7.4c0-1.8 0-4.2-2.6-4.2s-3 2-3 4V24H9z"
      />
    </svg>
  );
}
function GitHubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.9.85.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05.8-.23 1.65-.35 2.5-.35s1.7.12 2.5.35c1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.02 1.63 1.02 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
      />
    </svg>
  );
}

/* ---------- Reusable provider button (icons only) ---------- */
type ProviderBtnProps = {
  label: "Google" | "Microsoft" | "Apple" | "LinkedIn" | "GitHub";
  children: React.ReactNode;
  onClick?: () => void;
};
function ProviderButton({ label, children, onClick }: ProviderBtnProps) {
  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      title={label}
      onClick={onClick}
      className={[
        "grid h-10 w-12 place-items-center rounded-2xl",
        "bg-white border border-slate-200/80 shadow-sm",
        "transition duration-200 ease-out will-change-transform",
        "hover:shadow-md hover:scale-[1.02] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
      ].join(" ")}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

/* ---------- Auto scale wrapper ---------- */
function AutoScaledFrame({
  children,
  targetW = 1160,
  targetH = 760,
  marginX = 48,
  marginY = 96,
  enableAtMinWidth = 768,
}: {
  children: React.ReactNode;
  targetW?: number;
  targetH?: number;
  marginX?: number;
  marginY?: number;
  enableAtMinWidth?: number;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (vw < enableAtMinWidth) {
        setScale(1);
        return;
      }

      const maxW = Math.max(320, vw - marginX);
      const maxH = Math.max(320, vh - marginY);
      const s = Math.min(1, maxW / targetW, maxH / targetH);
      setScale(Number(s.toFixed(3)));
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [enableAtMinWidth, marginX, marginY, targetW, targetH]);

  const reservedW = targetW * scale;
  const reservedH = targetH * scale;

  return (
    <div
      style={{ width: reservedW, height: reservedH }}
      className="pointer-events-none md:pointer-events-auto"
    >
      <div
        style={{
          width: targetW,
          height: targetH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Local form types ---------- */
type FormData = {
  companyName: string;
  email: string;
  phoneDialCode: string;
  phoneIso2: string;
  phoneNumber: string;
  password: string;
  country: string;
  state: string;
  agree: boolean;
};

const statesOfIndia = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
];

export default function Register() {
  // Default to India +91
  const defaultIN = useMemo(
    () =>
      ALL_PHONE_OPTIONS.find(
        (o: CountryDialOption) => o.iso2 === "IN" && o.dial === "+91"
      ),
    []
  );

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    companyName: "",
    email: "",
    phoneDialCode: defaultIN?.dial ?? "+91",
    phoneIso2: defaultIN?.iso2 ?? "IN",
    phoneNumber: "",
    password: "",
    country: "India",
    state: "Uttar Pradesh",
    agree: false,
  });

  const onChange =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value as never }));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim())
      return alert("Please enter your company name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return alert("Please enter a valid email.");
    if (!form.phoneNumber.trim())
      return alert("Please enter your mobile number.");
    if (form.password.length < 6)
      return alert("Password must be at least 6 characters.");
    if (!form.agree)
      return alert(
        "You must agree to the Terms of Service and Privacy Policy."
      );

    try {
      setLoading(true);
      console.log("Submitting form:", form);
      alert("Account created (demo). Wire this up to your API/server action.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100svh] bg-gradient-to-b from-sky-50 to-emerald-50">
      {/* Center like your Sign-in; frame below auto-scales the whole card */}
      <div className="mx-auto flex min-h-[100svh] max-w-7xl items-center justify-center px-4 md:px-6">
        <AutoScaledFrame
          targetW={1160}
          targetH={760}
          marginX={48}
          marginY={96}
          enableAtMinWidth={768}
        >
          {/* === CARD === */}
          <section className="relative grid h-full w-full overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 md:grid-cols-2">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-emerald-500"
            />

            {/* LEFT: trust panel */}
            <section className="hidden w-full flex-col justify-between bg-blue-700 p-8 text-white lg:flex">
              <div className="relative">
                <h2 className="text-4xl font-bold leading-tight">
                  Trusted by <br /> businesses and CAs
                </h2>

                <article className="mt-10 rounded-2xl bg-blue-800/70 p-6">
                  <div className="text-6xl leading-none opacity-80">“</div>
                  <p className="mt-4 text-lg leading-8">
                    Running a business requires smart accounts management. Robo
                    Books simplifies everything from invoicing to inventory in
                    one platform.
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-yellow-300 text-blue-900 font-bold">
                      N
                    </div>
                    <div>
                      <p className="font-semibold">Naveedh V.V</p>
                      <p className="text-xs text-blue-100">
                        CO-FOUNDER, MAKE YOUR OWN PERFUME
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <span className="h-1 w-6 rounded bg-white/70" />
                    <span className="h-1 w-2 rounded bg-white/40" />
                    <span className="h-1 w-2 rounded bg-white/40" />
                  </div>
                </article>

                <div className="mt-10 text-center text-xs tracking-widest text-white/80">
                  RATED BY THE BEST
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="rounded-xl bg-blue-800/50 px-3 py-2 text-center text-sm">
                    Capterra ★ 4.4/5
                  </div>
                  <div className="rounded-xl bg-blue-800/50 px-3 py-2 text-center text-sm">
                    G2 ★ 4.4/5
                  </div>
                  <div className="rounded-xl bg-blue-800/50 px-3 py-2 text-center text-sm">
                    Play ★ 4.7/5
                  </div>
                  <div className="rounded-xl bg-blue-800/50 px-3 py-2 text-center text-sm">
                    App Store ★ 4.8/5
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT: form (no inner scrollbar) */}
            <div className="relative p-6 md:p-8 lg:p-10">
              {/* Brand */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <span className="size-6 rounded-md bg-blue-600 shadow-sm" />
                  <span className="size-6 rounded-md bg-emerald-500 shadow-sm" />
                  <span className="size-6 rounded-md bg-blue-400 shadow-sm" />
                </div>
                <span className="font-semibold tracking-tight">Robo Books</span>
              </div>

              <h1 className="mt-4 text-[26px] md:text-[28px] font-semibold leading-7 tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-500">
                Start your 14-day free trial. No credit card required.
              </p>

              {/* 2-col form grid */}
              <form
                onSubmit={onSubmit}
                className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {/* Company (full width) */}
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Company name
                  </span>
                  <input
                    id="companyName"
                    value={form.companyName}
                    onChange={onChange("companyName")}
                    placeholder="e.g., Robo Innovations Pvt Ltd"
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-2.5 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                  />
                </label>

                {/* Email (full width) */}
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email address
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-2.5 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                  />
                </label>

                {/* Country code (left) */}
                <div className="md:col-span-1">
                  <CountryDialSelector
                    id="countryCode"
                    label="Country code"
                    options={ALL_PHONE_OPTIONS}
                    popularIso2={["IN", "US", "GB", "AU", "AE"]}
                    value={{ iso2: form.phoneIso2, dial: form.phoneDialCode }}
                    onChange={(opt: CountryDialOption) =>
                      setForm((prev) => ({
                        ...prev,
                        phoneIso2: opt.iso2,
                        phoneDialCode: opt.dial,
                      }))
                    }
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {flagEmoji(form.phoneIso2)} {form.phoneIso2} •{" "}
                    {form.phoneDialCode}
                  </p>
                </div>

                {/* Mobile number (right) */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Mobile number
                  </span>
                  <input
                    aria-label="Mobile number"
                    value={form.phoneNumber}
                    onChange={onChange("phoneNumber")}
                    placeholder="98765 43210"
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-2.5 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                  />
                </label>

                {/* Password (full width) */}
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={onChange("password")}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-4 py-2.5 text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-400 focus:ring-4"
                  />
                </label>

                {/* Country (left) */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Country
                  </span>
                  <select
                    id="country"
                    value={form.country}
                    onChange={onChange("country")}
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-2.5 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <option>India</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>United Arab Emirates</option>
                  </select>
                </label>

                {/* State (right) */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    State
                  </span>
                  <select
                    id="state"
                    value={form.state}
                    onChange={onChange("state")}
                    className="w-full rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-2.5 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    {statesOfIndia.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Consent (full width) */}
                <label className="md:col-span-2 flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={onChange("agree")}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/legal/terms"
                      className="text-blue-700 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/legal/privacy"
                      className="text-blue-700 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit (full width) */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 px-4 py-2.5 font-semibold text-white shadow-lg"
                  >
                    <span
                      className="absolute inset-0 opacity-30"
                      style={{
                        maskImage:
                          "linear-gradient(90deg, transparent, black, transparent)",
                      }}
                    >
                      <span className="absolute -left-6 top-0 h-full w-16 bg-white/70 blur-lg animate-[shine_2.2s_ease-in-out_infinite]" />
                    </span>
                    <span>
                      {loading ? "Creating your account..." : "Create my account"}
                    </span>
                    <ArrowRightIcon className="size-4" />
                  </button>
                  <p className="mt-1 text-[12px] text-slate-500">
                    *No credit card required
                  </p>
                </div>
              </form>

              {/* Social sign up — icons only */}
              <div className="mt-6">
                <p className="text-sm text-slate-500">Or sign up using</p>
                <div className="mt-3 flex min-h-[52px] flex-wrap items-center gap-3">
                  <ProviderButton
                    label="Apple"
                    onClick={() =>
                      (window.location.href = "/api/auth/signin/apple")
                    }
                  >
                    <AppleMark className="h-5 w-5 text-black" />
                  </ProviderButton>
                  <ProviderButton
                    label="Google"
                    onClick={() =>
                      (window.location.href = "/api/auth/signin/google")
                    }
                  >
                    <GoogleMark className="h-5 w-5" />
                  </ProviderButton>
                  <ProviderButton
                    label="LinkedIn"
                    onClick={() =>
                      (window.location.href = "/api/auth/signin/linkedin")
                    }
                  >
                    <LinkedInMark className="h-5 w-5 text-[#0A66C2]" />
                  </ProviderButton>
                  <ProviderButton
                    label="GitHub"
                    onClick={() =>
                      (window.location.href = "/api/auth/signin/github")
                    }
                  >
                    <GitHubMark className="h-5 w-5 text-black" />
                  </ProviderButton>
                  <ProviderButton
                    label="Microsoft"
                    onClick={() =>
                      (window.location.href = "/api/auth/signin/azure-ad")
                    }
                  >
                    <MicrosoftMark className="h-5 w-5" />
                  </ProviderButton>
                </div>
              </div>

              {/* Login link */}
              <p className="mt-6 text-sm text-slate-600">
                Already have a Robo Books account?{" "}
                <a
                  className="font-semibold text-blue-700 hover:underline"
                  href="/signin"
                >
                  Sign in
                </a>
              </p>
            </div>
          </section>
          {/* === end card === */}
        </AutoScaledFrame>
      </div>

      {/* Keyframes for shiny buttons */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </main>
  );
}
