import TeamManager from "./TeamManager";

const HANDBALL_POSITIONS = ["Goalkeeper", "Left Wing", "Right Wing", "Pivot", "Back"];

export default function HandballTeam() {
  return (
    <TeamManager
      title="Handball"
      subtitle="Manage players for the handball team."
      positions={HANDBALL_POSITIONS}
      storageKey="admin.team.handball"
      defaultNationality="Ethiopia"
    />
  );
}

