type RevenueRecord = {
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
  type?: unknown;
  metadata?: unknown;
};

function sumCurrency(
  rows: readonly RevenueRecord[],
  currency: "ETB" | "USD",
): number {
  return rows.reduce((total, row) => {
    if (String(row.currency ?? "").trim().toUpperCase() !== currency) {
      return total;
    }
    const amount = Number(row.amount);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}

export function calculateDashboardRevenue(
  paymentRows: readonly RevenueRecord[],
  donationRows: readonly RevenueRecord[],
) {
  const membershipPayments = paymentRows.filter(
    (payment) =>
      String(payment.status ?? "").toLowerCase() === "completed" &&
      (payment.type === "membership" ||
        payment.type === "membership_renewal"),
  );
  const manualMembershipPayments = membershipPayments.filter((payment) => {
    const metadata =
      payment.metadata !== null &&
      typeof payment.metadata === "object" &&
      !Array.isArray(payment.metadata)
        ? (payment.metadata as Record<string, unknown>)
        : {};
    return metadata.source === "admin_manual_membership";
  });
  const completedDonations = donationRows.filter(
    (donation) => String(donation.status ?? "").toLowerCase() === "completed",
  );

  return {
    membershipETB: sumCurrency(membershipPayments, "ETB"),
    membershipUSD: sumCurrency(membershipPayments, "USD"),
    manualMembershipETB: sumCurrency(manualMembershipPayments, "ETB"),
    manualMembershipUSD: sumCurrency(manualMembershipPayments, "USD"),
    donationETB: sumCurrency(completedDonations, "ETB"),
    donationUSD: sumCurrency(completedDonations, "USD"),
  };
}
