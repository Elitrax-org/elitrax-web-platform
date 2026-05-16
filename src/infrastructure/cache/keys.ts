export const dataCacheKeys = {
  account: (accountId: string) => `account:${accountId}`,
  subscription: (accountId: string) => `subscription:${accountId}`,
  playersList: (accountId: string) => `players:${accountId}`,
  playerPrefix: (accountId: string) => `player:${accountId}:`,
  player: (accountId: string, playerId: string) =>
    `player:${accountId}:${playerId}`,
  teamsList: (accountId: string) => `teams:${accountId}`,
  teamPrefix: (accountId: string) => `team:${accountId}:`,
  team: (accountId: string, teamId: string) => `team:${accountId}:${teamId}`,
} as const;
