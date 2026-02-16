const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// Deck
export const deckApi = {
  listConfigs: () => request<string[]>("/deck/configs"),
  get: (filename: string) =>
    request<import("../types").DeckResponse>(`/deck/${filename}`),
  put: (filename: string, body: import("../types").DeckConfig) =>
    request<import("../types").DeckResponse>(`/deck/${filename}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// Board
export const boardApi = {
  listConfigs: () => request<string[]>("/board/configs"),
  get: (filename: string) =>
    request<import("../types").BoardResponse>(`/board/${filename}`),
  put: (filename: string, body: import("../types").BoardConfig) =>
    request<import("../types").BoardResponse>(`/board/${filename}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// Gantry
export const gantryApi = {
  listConfigs: () => request<string[]>("/gantry/configs"),
  get: (filename: string) =>
    request<import("../types").GantryResponse>(`/gantry/${filename}`),
  put: (filename: string, body: import("../types").GantryConfig) =>
    request<import("../types").GantryResponse>(`/gantry/${filename}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getPosition: () =>
    request<import("../types").GantryPosition>("/gantry/position"),
  connect: (port: string, baudrate = 115200) =>
    request<import("../types").GantryPosition>("/gantry/connect", {
      method: "POST",
      body: JSON.stringify({ port, baudrate }),
    }),
  disconnect: () =>
    request<import("../types").GantryPosition>("/gantry/disconnect", {
      method: "POST",
    }),
};

// Raw YAML
export const rawApi = {
  get: (filename: string) =>
    request<{ content: string }>(`/raw/${filename}`),
  put: (filename: string, content: string) =>
    request<{ content: string }>(`/raw/${filename}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
};
