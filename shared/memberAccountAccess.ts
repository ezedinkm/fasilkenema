export interface MemberAccountLink {
  id: number;
  accountId: number | null;
  accountOwnerMemberId: number | null;
}

export function memberBelongsToAccount(
  member: MemberAccountLink,
  accountId: number | null,
  legacyOwnerMemberId: number,
): boolean {
  if (accountId !== null) {
    return member.accountId === accountId;
  }
  return (
    member.id === legacyOwnerMemberId ||
    member.accountOwnerMemberId === legacyOwnerMemberId
  );
}
