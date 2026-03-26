export function getWorkspaceHeaders() {
  const workspaceToken = localStorage.getItem("workspace_token") ?? "";

  return {
    "x-workspace-token": workspaceToken,
  };
}
