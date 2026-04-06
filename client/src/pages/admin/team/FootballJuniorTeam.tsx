import TeamManager from "./TeamManager";

const FOOTBALL_POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function FootballJuniorTeam() {
  return (
    <TeamManager
      title="Football — Junior"
      subtitle="Manage players for the junior football squad."
      positions={FOOTBALL_POSITIONS}
      storageKey="admin.team.football.junior"
      defaultNationality="Ethiopia"
    />
  );
}

