import { fetchWithAuth } from "@/lib/api";

/**
 * Team roster API (client).
 *
 * Public:
 * GET    /api/team-players?teamKey=<storageKey>
 *
 * POST   /api/admin/team-players  body: { teamKey, name, position, nationality, image }
 * PATCH  /api/admin/team-players/:id  body: { teamKey, name, position, nationality, image }
 * DELETE /api/admin/team-players/:id?teamKey=<storageKey>
 */

const PUBLIC_BASE_PATH = "/api/team-players";
const BASE_PATH = "/api/admin/team-players";

export type TeamPlayerPayload = {
  name: string;
  position: string;
  nationality: string;
  image: string;
};

export type TeamPlayer = TeamPlayerPayload & { id: string };

/** Nationality choices for team forms: 195 countries, alphabetized in the form. */
export const NATIONALITY_OPTIONS: readonly string[] = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Democratic Republic of the Congo",
  "Republic of the Congo",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

function normalizePlayer(raw: Record<string, unknown>): TeamPlayer {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    position: String(raw.position ?? ""),
    nationality: String(raw.nationality ?? ""),
    image: String(raw.image ?? ""),
  };
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function listTeamPlayers(teamKey: string): Promise<TeamPlayer[]> {
  const url = `${PUBLIC_BASE_PATH}?teamKey=${encodeURIComponent(teamKey)}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await readJson<unknown>(res);
  if (!Array.isArray(data)) return [];
  return data.map((row) => normalizePlayer(row as Record<string, unknown>));
}

export async function createTeamPlayer(
  teamKey: string,
  payload: TeamPlayerPayload,
): Promise<TeamPlayer> {
  const res = await fetchWithAuth(BASE_PATH, {
    method: "POST",
    body: JSON.stringify({
      teamKey,
      name: payload.name,
      position: payload.position,
      nationality: payload.nationality,
      image: payload.image,
    }),
  });
  const json = await readJson<Record<string, unknown>>(res);
  return normalizePlayer(json);
}

export async function updateTeamPlayer(
  teamKey: string,
  id: string,
  payload: TeamPlayerPayload,
): Promise<TeamPlayer> {
  const res = await fetchWithAuth(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      teamKey,
      name: payload.name,
      position: payload.position,
      nationality: payload.nationality,
      image: payload.image,
    }),
  });
  const json = await readJson<Record<string, unknown>>(res);
  return normalizePlayer(json);
}

export async function deleteTeamPlayer(
  teamKey: string,
  id: string,
): Promise<void> {
  const url = `${BASE_PATH}/${encodeURIComponent(id)}?teamKey=${encodeURIComponent(teamKey)}`;
  const res = await fetchWithAuth(url, { method: "DELETE" });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(text || `Request failed (${res.status})`);
  }
}
