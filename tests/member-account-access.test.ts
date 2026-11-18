import assert from "node:assert/strict";
import { test } from "node:test";
import { memberBelongsToAccount } from "../shared/memberAccountAccess";

test("manager account can access only profiles linked to the same account", () => {
  assert.equal(
    memberBelongsToAccount(
      { id: 14, accountId: 9, accountOwnerMemberId: null },
      9,
      0,
    ),
    true,
  );
  assert.equal(
    memberBelongsToAccount(
      { id: 14, accountId: 10, accountOwnerMemberId: null },
      9,
      0,
    ),
    false,
  );
  assert.equal(
    memberBelongsToAccount(
      { id: 14, accountId: null, accountOwnerMemberId: null },
      9,
      0,
    ),
    false,
  );
});

test("legacy member accounts can access their own profile and linked profiles only", () => {
  assert.equal(
    memberBelongsToAccount(
      { id: 7, accountId: null, accountOwnerMemberId: null },
      null,
      7,
    ),
    true,
  );
  assert.equal(
    memberBelongsToAccount(
      { id: 14, accountId: null, accountOwnerMemberId: 7 },
      null,
      7,
    ),
    true,
  );
  assert.equal(
    memberBelongsToAccount(
      { id: 20, accountId: null, accountOwnerMemberId: 8 },
      null,
      7,
    ),
    false,
  );
});
