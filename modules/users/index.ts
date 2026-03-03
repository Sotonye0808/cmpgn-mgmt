// Users module — client-safe exports only
// Services are imported directly from @/modules/users/services/userService by API routes
export type { UserListItem } from "./services/userService";
export { default as UserManagementPanel } from "./components/UserManagementPanel";
