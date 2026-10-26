import assert from "node:assert/strict";
import { test } from "node:test";
import { deleteMember } from "../client/src/lib/api";
import { serializeMembersCsv } from "../client/src/lib/memberCsv";
import { matchesSearch } from "../shared/search";

test("member search safely handles missing fields and reordered query terms", () => {
  assert.equal(
    matchesSearch("  kAmIl-0977 ", [null, undefined, "Ezedin Kamil", "0977448535"]),
    true,
  );
  assert.equal(matchesSearch("not found", [null, undefined]), false);
});

test("member CSV exports incomplete records and quotes special characters", () => {
  const csv = serializeMembersCsv([
    {
      membershipNumber: "FK-1",
      fullName: 'Alem, "Junior"\nMember',
      phone: null,
      tier: undefined,
      status: "active",
      joinedDate: "not-a-date",
    },
    null,
  ]);

  assert.match(csv, /"Alem, ""Junior""\nMember"/);
  assert.match(csv, /"FK-1","Alem, ""Junior""/);
  assert.match(csv, /\r\n"","","","","",""$/);
});

test("member CSV prevents spreadsheet formula execution", () => {
  const csv = serializeMembersCsv([
    { membershipNumber: "=1+1", fullName: "Safe", phone: "+251900000000" },
  ]);
  assert.match(csv, /"'=1\+1"/);
  assert.match(csv, /"'\+251900000000"/);
});

test("failed member deletion reports the server error instead of resolving as success", async () => {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined },
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: "Member still has linked records" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });

  try {
    await assert.rejects(
      deleteMember(7),
      /Member still has linked records/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage })
        .localStorage;
    }
  }
});
