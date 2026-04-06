import TeamManager from "./TeamManager";

const BASKETBALL_POSITIONS = [
  "Point Guard",
  "Shooting Guard",
  "Small Forward",
  "Power Forward",
  "Center",
];

export default function BasketballTeam() {
  return (
    <TeamManager
      title="Basketball"
      subtitle="Manage players for the basketball team."
      positions={BASKETBALL_POSITIONS}
      storageKey="admin.team.basketball"
      defaultNationality="Ethiopia"
    />
  );
}

