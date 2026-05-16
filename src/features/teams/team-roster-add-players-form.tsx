"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Player } from "@/application/domain-types";
import {
  addTeamPlayerInputSchema,
  createPlayerInputSchema,
  jerseyNumberSchema,
  type AddTeamPlayerInput,
} from "@/application/schemas";
import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, Field, Input, Select } from "@/components/ui";

const createAndAssignSchema = createPlayerInputSchema.extend({
  jerseyNumber: jerseyNumberSchema,
});

type AddTeamPlayerFormInput = z.input<typeof addTeamPlayerInputSchema>;
type CreateAndAssignFormInput = z.input<typeof createAndAssignSchema>;
type CreateAndAssignFormOutput = z.output<typeof createAndAssignSchema>;

export type TeamRosterAddPlayersLabels = {
  assignExisting: string;
  assigningExisting: string;
  createAndAssign: string;
  creatingAndAssigning: string;
  displayName: string;
  position: string;
  birthDate: string;
  jerseyNumber: string;
  player: string;
  noAvailablePlayers: string;
  addError: string;
  assignSuccess: string;
  createAssignSuccess: string;
};

export function TeamRosterAddPlayersForm({
  teamId,
  availablePlayers,
  labels,
}: {
  teamId: string;
  availablePlayers: readonly Player[];
  labels: TeamRosterAddPlayersLabels;
}) {
  const assignAction = useMutationAction();
  const createAndAssignAction = useMutationAction();

  const assignForm = useForm<AddTeamPlayerFormInput, undefined, AddTeamPlayerInput>({
    resolver: zodResolver(addTeamPlayerInputSchema),
  });
  const createAndAssignForm = useForm<
    CreateAndAssignFormInput,
    undefined,
    CreateAndAssignFormOutput
  >({
    resolver: zodResolver(createAndAssignSchema),
  });

  const onAssignExisting = assignForm.handleSubmit((data) => {
    void assignAction.run({
      errorMessage: labels.addError,
      successMessage: labels.assignSuccess,
      successTitle: labels.assignExisting,
      refresh: true,
      request: () =>
        fetch(`/api/v1/teams/${teamId}/players`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        assignForm.reset();
      },
      onError: (error) => {
        assignForm.setError("root.server", { message: error.message || labels.addError });
      },
    });
  });

  const onCreateAndAssign = createAndAssignForm.handleSubmit((data) => {
    void createAndAssignAction.run({
      errorMessage: labels.addError,
      successMessage: labels.createAssignSuccess,
      successTitle: labels.createAndAssign,
      refresh: true,
      request: () =>
        fetch(`/api/v1/teams/${teamId}/players/create-and-assign`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            displayName: data.displayName,
            birthDate: data.birthDate || undefined,
            position: data.position || undefined,
            jerseyNumber: data.jerseyNumber,
          }),
        }),
      onSuccess: () => {
        createAndAssignForm.reset();
      },
      onError: (error) => {
        createAndAssignForm.setError("displayName", { message: error.message || labels.addError });
      },
    });
  });

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <form
        onSubmit={onAssignExisting}
        className="space-y-2 rounded-md border border-outline-variant bg-surface-container p-3"
      >
        <h2 className="text-sm font-semibold">{labels.assignExisting}</h2>
        <Field label={labels.player}>
          <Select {...assignForm.register("playerId")}>
            <option value="">--</option>
            {availablePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={labels.jerseyNumber}>
          <Input {...assignForm.register("jerseyNumber")} placeholder="10" maxLength={3} />
        </Field>
        {assignForm.formState.errors.root?.server ? (
          <p role="alert" className="text-xs text-error">
            {assignForm.formState.errors.root.server.message}
          </p>
        ) : null}
        {availablePlayers.length === 0 ? (
          <p className="text-xs text-foreground/70">{labels.noAvailablePlayers}</p>
        ) : null}
        <Button type="submit" disabled={assignAction.pending || availablePlayers.length === 0}>
          {assignAction.pending ? labels.assigningExisting : labels.assignExisting}
        </Button>
      </form>

      <form
        onSubmit={onCreateAndAssign}
        className="space-y-2 rounded-md border border-outline-variant bg-surface-container p-3"
      >
        <h2 className="text-sm font-semibold">{labels.createAndAssign}</h2>
        <Field label={labels.displayName} error={createAndAssignForm.formState.errors.displayName?.message}>
          <Input {...createAndAssignForm.register("displayName")} />
        </Field>
        <div className="grid gap-2 sm:grid-cols-3">
          <Field label={labels.position}>
            <Input {...createAndAssignForm.register("position")} />
          </Field>
          <Field label={labels.birthDate}>
            <Input type="date" {...createAndAssignForm.register("birthDate")} />
          </Field>
          <Field label={labels.jerseyNumber}>
            <Input
              {...createAndAssignForm.register("jerseyNumber")}
              placeholder="7A"
              maxLength={3}
            />
          </Field>
        </div>
        {createAndAssignForm.formState.errors.root?.server ? (
          <p role="alert" className="text-xs text-error">
            {createAndAssignForm.formState.errors.root.server.message}
          </p>
        ) : null}
        <Button type="submit" disabled={createAndAssignAction.pending}>
          {createAndAssignAction.pending ? labels.creatingAndAssigning : labels.createAndAssign}
        </Button>
      </form>
    </div>
  );
}