import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getMembers } from "./api";

const globals = globalThis as unknown as Record<string, unknown>;
const originalFetch = globalThis.fetch;

beforeEach(() => {
  globals.localStorage = {
    getItem: () => null,
    removeItem: () => {},
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getMembers", () => {
  it("rejects HTTP errors using the server error message", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "Members are unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await expect(getMembers()).rejects.toThrow("Members are unavailable");
  });

  it("rejects successful responses whose JSON is not an array", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ members: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await expect(getMembers()).rejects.toThrow(
      "The members response was invalid. Please try again.",
    );
  });
});
