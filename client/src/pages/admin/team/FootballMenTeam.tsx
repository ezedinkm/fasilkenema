import TeamManager from "./TeamManager";

const FOOTBALL_POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function FootballMenTeam() {
  return (
    <TeamManager
      title="Football — Men"
      subtitle="Manage first team players for the men's football squad."
      positions={FOOTBALL_POSITIONS}
      storageKey="admin.team.football.men"
      defaultNationality="Ethiopia"
    />
  );
}

