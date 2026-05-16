import "server-only";

import type { CachePort } from "@/application/ports/cache";
import type {
  AccountRepository,
  ApplicationDependencies,
  PlayerRepository,
  SubscriptionRepository,
  TeamRepository,
} from "@/application/ports/repositories";
import { dataCacheKeys } from "@/infrastructure/cache/keys";

/**
 * Decoradores de repositorios con caché de lectura para entidades frecuentes.
 *
 * Estrategia general:
 * - cache-through para lecturas
 * - invalidación explícita en escrituras
 */

const TTL = {
  accountMs: 5 * 60 * 1000,
  subscriptionMs: 5 * 60 * 1000,
  playerMs: 2 * 60 * 1000,
  playersListMs: 30 * 1000,
  teamMs: 2 * 60 * 1000,
  teamsListMs: 30 * 1000,
} as const;

/**
 * Añade caché de lectura a cuentas.
 */
function withCachedAccounts(
  inner: AccountRepository,
  cache: CachePort,
): AccountRepository {
  return {
    ...inner,
    async createAccount(input) {
      const created = await inner.createAccount(input);
      await cache.set(dataCacheKeys.account(created.id), created, {
        ttlMs: TTL.accountMs,
      });
      return created;
    },
    async getAccount(accountId) {
      const key = dataCacheKeys.account(accountId);
      const cached = await cache.get<Awaited<ReturnType<AccountRepository["getAccount"]>>>(
        key,
      );
      if (cached !== undefined) return cached;

      const fresh = await inner.getAccount(accountId);
      if (fresh !== null) {
        await cache.set(key, fresh, { ttlMs: TTL.accountMs });
      }
      return fresh;
    },
  };
}

/**
 * Añade caché de lectura a suscripciones.
 */
function withCachedSubscriptions(
  inner: SubscriptionRepository,
  cache: CachePort,
): SubscriptionRepository {
  return {
    ...inner,
    async getSubscription(accountId) {
      const key = dataCacheKeys.subscription(accountId);
      const cached = await cache.get<
        Awaited<ReturnType<SubscriptionRepository["getSubscription"]>>
      >(key);
      if (cached !== undefined) return cached;

      const fresh = await inner.getSubscription(accountId);
      if (fresh !== null) {
        await cache.set(key, fresh, { ttlMs: TTL.subscriptionMs });
      }
      return fresh;
    },
    async upsertSubscription(input) {
      const saved = await inner.upsertSubscription(input);
      // On updates, evict to force next read from the source of truth.
      await cache.delete(dataCacheKeys.subscription(input.accountId));
      return saved;
    },
  };
}

/**
 * Añade caché para listado y lectura puntual de jugadores.
 */
function withCachedPlayers(
  inner: PlayerRepository,
  cache: CachePort,
): PlayerRepository {
  return {
    ...inner,
    async createPlayer(accountId, input) {
      const created = await inner.createPlayer(accountId, input);
      await cache.set(dataCacheKeys.player(accountId, created.id), created, {
        ttlMs: TTL.playerMs,
      });
      await cache.delete(dataCacheKeys.playersList(accountId));
      await cache.deleteByPrefix(dataCacheKeys.playerPrefix(accountId));
      return created;
    },
    async deletePlayer(accountId, playerId) {
      await inner.deletePlayer(accountId, playerId);
      await cache.delete(dataCacheKeys.player(accountId, playerId));
      await cache.delete(dataCacheKeys.playersList(accountId));
      await cache.deleteByPrefix(dataCacheKeys.playerPrefix(accountId));
    },
    async listPlayers(accountId) {
      const key = dataCacheKeys.playersList(accountId);
      const cached = await cache.get<
        Awaited<ReturnType<PlayerRepository["listPlayers"]>>
      >(key);
      if (cached !== undefined) return cached;

      const fresh = await inner.listPlayers(accountId);
      await cache.set(key, fresh, { ttlMs: TTL.playersListMs });
      return fresh;
    },
    async getPlayer(accountId, playerId) {
      const key = dataCacheKeys.player(accountId, playerId);
      const cached = await cache.get<Awaited<ReturnType<PlayerRepository["getPlayer"]>>>(
        key,
      );
      if (cached !== undefined) return cached;

      const fresh = await inner.getPlayer(accountId, playerId);
      if (fresh !== null) {
        await cache.set(key, fresh, { ttlMs: TTL.playerMs });
      }
      return fresh;
    },
  };
}

/**
 * Añade caché para listado y lectura puntual de equipos.
 */
function withCachedTeams(inner: TeamRepository, cache: CachePort): TeamRepository {
  return {
    ...inner,
    async createTeam(accountId, input) {
      const created = await inner.createTeam(accountId, input);
      await cache.set(dataCacheKeys.team(accountId, created.id), created, {
        ttlMs: TTL.teamMs,
      });
      await cache.delete(dataCacheKeys.teamsList(accountId));
      await cache.deleteByPrefix(dataCacheKeys.teamPrefix(accountId));
      return created;
    },
    async listTeams(accountId) {
      const key = dataCacheKeys.teamsList(accountId);
      const cached = await cache.get<Awaited<ReturnType<TeamRepository["listTeams"]>>>(
        key,
      );
      if (cached !== undefined) return cached;

      const fresh = await inner.listTeams(accountId);
      await cache.set(key, fresh, { ttlMs: TTL.teamsListMs });
      return fresh;
    },
    async getTeam(accountId, teamId) {
      const key = dataCacheKeys.team(accountId, teamId);
      const cached = await cache.get<Awaited<ReturnType<TeamRepository["getTeam"]>>>(
        key,
      );
      if (cached !== undefined) return cached;

      const fresh = await inner.getTeam(accountId, teamId);
      if (fresh !== null) {
        await cache.set(key, fresh, { ttlMs: TTL.teamMs });
      }
      return fresh;
    },
  };
}

/**
 * Envuelve dependencias de aplicación con repositorios cacheados.
 */
export function withCachedRepositories(
  deps: ApplicationDependencies,
  cache: CachePort,
): ApplicationDependencies {
  return {
    ...deps,
    accounts: withCachedAccounts(deps.accounts, cache),
    subscriptions: withCachedSubscriptions(deps.subscriptions, cache),
    players: withCachedPlayers(deps.players, cache),
    teams: withCachedTeams(deps.teams, cache),
  };
}
