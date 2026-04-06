import TeamManager from "./TeamManager";

const BOX_POSITIONS = ["Lightweight", "Middleweight", "Heavyweight", "Cruiserweight"];

export default function BoxTeam() {
  return (
    <TeamManager
      title="Box"
      subtitle="Manage athletes for the boxing team."
      positions={BOX_POSITIONS}
      storageKey="admin.team.box"
      defaultNationality="Ethiopia"
    />
  );
}

