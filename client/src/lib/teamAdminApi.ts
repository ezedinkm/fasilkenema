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

/** Nationality = country (fixed list for admin team forms). Ethiopia first. */
export const NATIONALITY_OPTIONS: readonly string[] = [
  "Ethiopia",
  "Kenya",
  "Nigeria",
  "Niger",
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
