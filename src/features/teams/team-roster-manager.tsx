"use client";

import { useState } from "react";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { ConfirmDialog, EmptyState, buttonVariants } from "@/components/ui";
import type { TeamRosterPlayer } from "@/application/domain-types";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Users } from "lucide-react";

export type TeamRosterManagerLabels = {
  rosterTitle: string;
  rosterCount: string;
  emptyRoster: string;
  addPlayers: string;
  jerseyNumber: string;
  addError: string;
  remove: string;
  removing: string;
  openDetails: string;
  openProfile: string;
  selected: string;
  editJersey: string;
  saveJersey: string;
  cancelJersey: string;
  updatingJersey: string;
  assignSuccess: string;
  createAssignSuccess: string;
  removeSuccess: string;
  jerseyUpdateSuccess: string;
  removeTitle: string;
  removeDescription: string;
  confirmRemove: string;
};

/**
 * Gestor integral de roster:
 * - asigna jugadores existentes
 * - crea jugador y lo asigna en un solo flujo
 * - edita dorsal y elimina del equipo
 */
export function TeamRosterManager({
  teamId,
  roster,
  selectedPlayerId,
  labels,
}: {
  teamId: string;
  roster: readonly TeamRosterPlayer[];
  selectedPlayerId?: string;
  labels: TeamRosterManagerLabels;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const removeAction = useMutationAction();
  const jerseyAction = useMutationAction();
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [editingJerseyPlayerId, setEditingJerseyPlayerId] = useState<string | null>(null);
  const [editingJerseyValue, setEditingJerseyValue] = useState("");
  const [playerToRemove, setPlayerToRemove] = useState<TeamRosterPlayer | null>(null);

  // Selecciona jugador activo para abrir detalles en la misma vista.
  function pickPlayer(playerId: string) {
    const nextPath = `${pathname}?playerId=${encodeURIComponent(playerId)}`;
    replace(nextPath as never);
  }

  function removeFromTeam(playerId: string) {
    setRemovingPlayerId(playerId);
    void removeAction.run({
      errorMessage: labels.addError,
      successMessage: labels.removeSuccess,
      successTitle: labels.remove,
      refresh: true,
      request: () =>
        fetch(`/api/v1/teams/${teamId}/players/${playerId}`, {
          method: "DELETE",
        }),
      onSuccess: () => {
        setRemovingPlayerId(null);
        setPlayerToRemove(null);
      },
      onError: () => {
        setRemovingPlayerId(null);
      },
    });
  }

  function startEditJersey(playerId: string, currentJersey?: string) {
    setEditingJerseyPlayerId(playerId);
    setEditingJerseyValue(currentJersey ?? "");
  }

  function cancelEditJersey() {
    setEditingJerseyPlayerId(null);
    setEditingJerseyValue("");
  }

  function saveJersey(playerId: string) {
    void jerseyAction.run({
      errorMessage: labels.addError,
      successMessage: labels.jerseyUpdateSuccess,
      successTitle: labels.saveJersey,
      refresh: true,
      request: () =>
        fetch(`/api/v1/teams/${teamId}/players/${playerId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jerseyNumber: editingJerseyValue,
          }),
        }),
      onSuccess: () => {
        cancelEditJersey();
      },
    });
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">{labels.rosterTitle}</h2>
          <p className="text-sm text-foreground/70">{labels.rosterCount}</p>
        </div>
        <Link
          href={`/teams/${teamId}/roster/new`}
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          {labels.addPlayers}
        </Link>
      </header>

      <RosterEntriesSection
        roster={roster}
        selectedPlayerId={selectedPlayerId}
        labels={labels}
        editingJerseyPlayerId={editingJerseyPlayerId}
        editingJerseyValue={editingJerseyValue}
        jerseyPending={jerseyAction.pending}
        removePending={removeAction.pending}
        removingPlayerId={removingPlayerId}
        onEditingJerseyValueChange={setEditingJerseyValue}
        onPickPlayer={pickPlayer}
        onStartEditJersey={startEditJersey}
        onSaveJersey={saveJersey}
        onCancelEditJersey={cancelEditJersey}
        onQueueRemove={setPlayerToRemove}
      />

      <ConfirmDialog
        open={playerToRemove !== null}
        title={labels.removeTitle}
        description={labels.removeDescription}
        confirmLabel={removeAction.pending ? labels.removing : labels.confirmRemove}
        cancelLabel={labels.cancelJersey}
        onCancel={() => setPlayerToRemove(null)}
        onConfirm={() => {
          if (playerToRemove) {
            removeFromTeam(playerToRemove.playerId);
          }
        }}
        busy={removeAction.pending}
      />
    </section>
  );
}

function RosterEntriesSection({
  roster,
  selectedPlayerId,
  labels,
  editingJerseyPlayerId,
  editingJerseyValue,
  jerseyPending,
  removePending,
  removingPlayerId,
  onEditingJerseyValueChange,
  onPickPlayer,
  onStartEditJersey,
  onSaveJersey,
  onCancelEditJersey,
  onQueueRemove,
}: {
  roster: readonly TeamRosterPlayer[];
  selectedPlayerId?: string;
  labels: TeamRosterManagerLabels;
  editingJerseyPlayerId: string | null;
  editingJerseyValue: string;
  jerseyPending: boolean;
  removePending: boolean;
  removingPlayerId: string | null;
  onEditingJerseyValueChange: (value: string) => void;
  onPickPlayer: (playerId: string) => void;
  onStartEditJersey: (playerId: string, currentJersey?: string) => void;
  onSaveJersey: (playerId: string) => void;
  onCancelEditJersey: () => void;
  onQueueRemove: (entry: TeamRosterPlayer) => void;
}) {
  if (roster.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={labels.rosterTitle}
        description={labels.emptyRoster}
      />
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {roster.map((entry) => (
        <li
          key={entry.playerId}
          className="rounded-md border border-outline-variant bg-surface-container p-4"
        >
          <p className="text-xs uppercase tracking-normal text-secondary">
            {labels.jerseyNumber}:{" "}
            {editingJerseyPlayerId === entry.playerId ? (
              <span className="inline-flex items-center gap-1">
                <input
                  value={editingJerseyValue}
                  onChange={(event) => onEditingJerseyValueChange(event.target.value)}
                  className="w-16 rounded-md border border-outline-variant bg-surface px-2 py-1 text-xs"
                  maxLength={3}
                  aria-label={`${labels.jerseyNumber} ${entry.player.displayName}`}
                />
                <button
                  type="button"
                  onClick={() => onSaveJersey(entry.playerId)}
                  disabled={jerseyPending}
                  className="rounded-md border border-outline-variant px-2 py-1 text-[10px]"
                  aria-label={`${labels.saveJersey} ${entry.player.displayName}`}
                >
                  {jerseyPending ? labels.updatingJersey : labels.saveJersey}
                </button>
                <button
                  type="button"
                  onClick={onCancelEditJersey}
                  className="rounded-md border border-outline-variant px-2 py-1 text-[10px]"
                  aria-label={`${labels.cancelJersey} ${entry.player.displayName}`}
                >
                  {labels.cancelJersey}
                </button>
              </span>
            ) : (
              <>
                {entry.jerseyNumber ?? "-"}
                <button
                  type="button"
                  onClick={() => onStartEditJersey(entry.playerId, entry.jerseyNumber)}
                  className="ml-2 rounded-md border border-outline-variant px-2 py-1 text-[10px]"
                  aria-label={`${labels.editJersey} ${entry.player.displayName}`}
                >
                  {labels.editJersey}
                </button>
              </>
            )}
          </p>
          <h3 className="font-heading text-lg">{entry.player.displayName}</h3>
          {entry.player.position ? (
            <p className="text-xs text-foreground/70">{entry.player.position}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPickPlayer(entry.playerId)}
              className="rounded-md border border-outline-variant px-2 py-1 text-xs"
            >
              {selectedPlayerId === entry.playerId ? labels.selected : labels.openDetails}
            </button>
            <Link
              href={`/players/${entry.playerId}`}
              className="rounded-md border border-outline-variant px-2 py-1 text-xs"
            >
              {labels.openProfile}
            </Link>
            <button
              type="button"
              onClick={() => onQueueRemove(entry)}
              disabled={removePending && removingPlayerId === entry.playerId}
              className="rounded-md border border-error px-2 py-1 text-xs text-error disabled:opacity-50"
            >
              {removePending && removingPlayerId === entry.playerId
                ? labels.removing
                : labels.remove}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
