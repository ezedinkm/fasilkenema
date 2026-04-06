import TeamManager from "./TeamManager";

const FOOTBALL_POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function FootballWomenTeam() {
  return (
    <TeamManager
      title="Football — Women"
      subtitle="Manage players for the women's football squad."
      positions={FOOTBALL_POSITIONS}
      storageKey="admin.team.football.women"
      defaultNationality="Ethiopia"
    />
  );
}

