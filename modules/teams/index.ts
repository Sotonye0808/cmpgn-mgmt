// Teams module barrel
export {
    createGroup,
    listGroups,
    getGroup,
    getGroupWithTeams,
    createTeam,
    listTeams,
    getTeam,
    getTeamWithMembers,
    addMemberToTeam,
    removeMemberFromTeam,
    setTeamLead,
    generateInviteLink,
    getInviteLink,
    consumeInviteLink,
    deactivateInviteLink,
    getTeamMemberStats,
} from "./services/teamService";
export type { TeamMemberStat } from "./services/teamService";
export { useTeams } from "./hooks/useTeams";
export { default as TeamCard } from "./components/TeamCard";
export { default as MyTeamCard } from "./components/MyTeamCard";
export { default as TeamManagementPanel } from "./components/TeamManagementPanel";
export { default as GroupManagementPanel } from "./components/GroupManagementPanel";
export { default as TeamMemberStatsTable } from "./components/TeamMemberStatsTable";
export { TEAM_PAGE_SECTIONS, TEAM_MANAGEMENT_CONFIG } from "./config";
