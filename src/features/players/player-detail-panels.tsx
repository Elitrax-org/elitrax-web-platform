"use client";

import type { ReactNode } from "react";
import { useMemo, useReducer, useState } from "react";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, ConfirmDialog, EmptyState, Field, Input, Select, Textarea } from "@/components/ui";
import type { Injury, Player, PlayerComment, PlayerMeasurement } from "@/application/domain-types";
import {
  getBodyZoneCodesForRegion,
  type BodyRegion,
  type BodyZoneDefinition,
} from "@/domain/health/body-zone";
import { InjuryLogForm } from "@/features/players/injury-log-form";
import { PlayerCommentsPanel } from "@/features/players/player-comments-panel";
import { PlayerMeasurementsPanel } from "@/features/players/player-measurements-panel";
import { ShieldAlert } from "lucide-react";

type Panel = "comments" | "injuries" | "measurements" | "stats";

type InjuryEditorState = {
  editingId: string | null;
  status: Injury["status"];
  estimatedRecoveryAt: string;
  comment: string;
  injuryToDelete: Injury | null;
};

type PlayerDetailLabels = {
  generalInfo: string;
  bornOn: string;
  createdAt: string;
  position: string;
  openComments: string;
  openInjuries: string;
  openMeasurements: string;
  openStats?: string;
  injuries: string;
  noInjuries: string;
  bodyRegion: string;
  bodyZone: string;
  injuryDiagnosedAt: string;
  injuryStatus: string;
  injuryEstimatedRecoveryAt: string;
  injurySeverity: string;
  injuryDescription: string;
  injuryComment: string;
  injurySubmit: string;
  injurySubmitting: string;
  injuryError: string;
  bodyFigureTitle: string;
  front: string;
  back: string;
  selectedRegion: string;
  zonesTitle: string;
  injurySave: string;
  injuryDelete: string;
  injuryDeleting: string;
  injuryUpdating: string;
  injuryUpdateSuccess: string;
  injuryDeleteSuccess: string;
  injuryDeleteTitle: string;
  injuryDeleteDescription: string;
  injuryConfirmDelete: string;
  statusOption: {
    injured: string;
    recovering: string;
    recovered: string;
  };
  commentsTitle: string;
  noComments: string;
  commentPlaceholder: string;
  post: string;
  posting: string;
  commentError: string;
  edit: string;
  save: string;
  cancel: string;
  remove: string;
  removing: string;
  updating: string;
  commentPostSuccess: string;
  commentUpdateSuccess: string;
  commentRemoveSuccess: string;
  commentRemoveTitle: string;
  commentRemoveDescription: string;
  commentConfirmRemove: string;
  measurementsTitle: string;
  measurementsNoData: string;
  measurementsTakenAt: string;
  measurementsHeight: string;
  measurementsWeight: string;
  measurementsSubmit: string;
  measurementsSubmitting: string;
  measurementsError: string;
  measurementsChartTitle: string;
  measurementsBmi: string;
  measurementsBmiRange: string;
  measurementsBmiRangeLower: string;
  measurementsBmiRangeUpper: string;
  measurementsNoNumericValues: string;
  region: Record<BodyRegion, string>;
  zone: Record<BodyZoneDefinition["code"], string>;
};

type InjuryEditorAction =
  | { type: "start-edit"; injury: Injury; estimatedRecoveryAt: string }
  | { type: "set-status"; status: Injury["status"] }
  | { type: "set-estimated-recovery-at"; value: string }
  | { type: "set-comment"; value: string }
  | { type: "cancel-edit" }
  | { type: "finish-edit" }
  | { type: "queue-delete"; injury: Injury | null };

const initialInjuryEditorState: InjuryEditorState = {
  editingId: null,
  status: "injured",
  estimatedRecoveryAt: "",
  comment: "",
  injuryToDelete: null,
};

/**
 * Hub de paneles del jugador con navegación entre comentarios,
 * lesiones y mediciones en una sola pantalla.
 */
export function PlayerDetailPanels({
  player,
  actorUserId,
  injuries,
  comments,
  measurements,
  statsPanel,
  locale,
  labels,
}: {
  player: Player;
  actorUserId?: string;
  injuries: readonly Injury[];
  comments: readonly PlayerComment[];
  measurements: readonly PlayerMeasurement[];
  statsPanel?: ReactNode;
  locale: string;
  labels: PlayerDetailLabels;
}) {
  const [activePanel, setActivePanel] = useState<Panel>("comments");
  const updateInjuryAction = useMutationAction();
  const deleteInjuryAction = useMutationAction();
  const [injuryEditor, dispatchInjuryEditor] = useReducer(
    injuryEditorReducer,
    initialInjuryEditorState,
  );

  const formattedInjuries = useMemo(
    () =>
      injuries.map((injury) => ({
        ...injury,
        zoneCodes: getBodyZoneCodesForRegion(injury.bodyRegion, injury.bodyZoneDetail),
      })),
    [injuries],
  );

  // Convierte string de formulario a ISO para endpoints API.
  function toIsoDateTime(input: string) {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? input : date.toISOString();
  }

  function toDateTimeLocal(input: string) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return "";
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  function startEditInjury(injury: Injury) {
    dispatchInjuryEditor({
      type: "start-edit",
      injury,
      estimatedRecoveryAt: toDateTimeLocal(injury.estimatedRecoveryAt),
    });
  }

  function saveInjury(injury: Injury) {
    const trimmedComment = injuryEditor.comment.trim();
    if (!trimmedComment || !injuryEditor.estimatedRecoveryAt) {
      return;
    }
    void updateInjuryAction.run({
      errorMessage: labels.injuryError,
      successMessage: labels.injuryUpdateSuccess,
      successTitle: labels.injurySave,
      refresh: true,
      request: () =>
        fetch(`/api/v1/players/${player.id}/injuries/${injury.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: injuryEditor.status,
            estimatedRecoveryAt: toIsoDateTime(injuryEditor.estimatedRecoveryAt),
            injuryComment: trimmedComment,
          }),
        }),
      onSuccess: () => {
        dispatchInjuryEditor({ type: "finish-edit" });
      },
    });
  }

  function removeInjury(injuryId: string) {
    void deleteInjuryAction.run({
      errorMessage: labels.injuryError,
      successMessage: labels.injuryDeleteSuccess,
      successTitle: labels.injuryDelete,
      refresh: true,
      request: () =>
        fetch(`/api/v1/players/${player.id}/injuries/${injuryId}`, {
          method: "DELETE",
        }),
      onSuccess: () => {
        if (injuryEditor.editingId === injuryId) {
          dispatchInjuryEditor({ type: "finish-edit" });
        }
        dispatchInjuryEditor({ type: "queue-delete", injury: null });
      },
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-outline-variant bg-surface-container p-4">
        <h2 className="font-heading text-lg">{labels.generalInfo}</h2>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-foreground/60">{labels.position}</dt>
            <dd>{player.position ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">{labels.bornOn}</dt>
            <dd>{player.birthDate ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-foreground/60">{labels.createdAt}</dt>
            <dd>{player.createdAt}</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActivePanel("comments")}
          className={panelClass(activePanel === "comments")}
        >
          {labels.openComments}
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("injuries")}
          className={panelClass(activePanel === "injuries")}
        >
          {labels.openInjuries}
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("measurements")}
          className={panelClass(activePanel === "measurements")}
        >
          {labels.openMeasurements}
        </button>
        {statsPanel ? (
          <button
            type="button"
            onClick={() => setActivePanel("stats")}
            className={panelClass(activePanel === "stats")}
          >
            {labels.openStats}
          </button>
        ) : null}
      </div>

      {activePanel === "comments" ? (
        <PlayerCommentsPanel
          playerId={player.id}
          actorUserId={actorUserId}
          comments={comments}
          locale={locale}
          labels={{
            title: labels.commentsTitle,
            noComments: labels.noComments,
            commentPlaceholder: labels.commentPlaceholder,
            post: labels.post,
            posting: labels.posting,
            commentError: labels.commentError,
            edit: labels.edit,
            save: labels.save,
            cancel: labels.cancel,
            remove: labels.remove,
            removing: labels.removing,
            updating: labels.updating,
            postSuccess: labels.commentPostSuccess,
            updateSuccess: labels.commentUpdateSuccess,
            removeSuccess: labels.commentRemoveSuccess,
            removeTitle: labels.commentRemoveTitle,
            removeDescription: labels.commentRemoveDescription,
            confirmRemove: labels.commentConfirmRemove,
          }}
        />
      ) : null}

      {activePanel === "injuries" ? (
        <PlayerInjuriesPanel
          playerId={player.id}
          injuries={formattedInjuries}
          labels={labels}
          editor={injuryEditor}
          updatePending={updateInjuryAction.pending}
          deletePending={deleteInjuryAction.pending}
          onStartEdit={startEditInjury}
          onSave={saveInjury}
          onCancelEdit={() => dispatchInjuryEditor({ type: "cancel-edit" })}
          onStatusChange={(status) => dispatchInjuryEditor({ type: "set-status", status })}
          onEstimatedRecoveryAtChange={(value) =>
            dispatchInjuryEditor({ type: "set-estimated-recovery-at", value })}
          onCommentChange={(value) => dispatchInjuryEditor({ type: "set-comment", value })}
          onQueueDelete={(injury) => dispatchInjuryEditor({ type: "queue-delete", injury })}
          onRemove={removeInjury}
        />
      ) : null}

      {activePanel === "measurements" ? (
        <PlayerMeasurementsPanel
          playerId={player.id}
          playerBirthDate={player.birthDate}
          measurements={measurements}
          labels={{
            title: labels.measurementsTitle,
            noData: labels.measurementsNoData,
            takenAt: labels.measurementsTakenAt,
            height: labels.measurementsHeight,
            weight: labels.measurementsWeight,
            submit: labels.measurementsSubmit,
            submitting: labels.measurementsSubmitting,
            error: labels.measurementsError,
            chartTitle: labels.measurementsChartTitle,
            bmi: labels.measurementsBmi,
            bmiRange: labels.measurementsBmiRange,
            bmiRangeLower: labels.measurementsBmiRangeLower,
            bmiRangeUpper: labels.measurementsBmiRangeUpper,
            noNumericValues: labels.measurementsNoNumericValues,
          }}
        />
      ) : null}

      {activePanel === "stats" ? statsPanel : null}
    </div>
  );
}

function injuryEditorReducer(
  state: InjuryEditorState,
  action: InjuryEditorAction,
): InjuryEditorState {
  switch (action.type) {
    case "start-edit":
      return {
        ...state,
        editingId: action.injury.id,
        status: action.injury.status,
        estimatedRecoveryAt: action.estimatedRecoveryAt,
        comment: "",
      };
    case "set-status":
      return { ...state, status: action.status };
    case "set-estimated-recovery-at":
      return { ...state, estimatedRecoveryAt: action.value };
    case "set-comment":
      return { ...state, comment: action.value };
    case "cancel-edit":
    case "finish-edit":
      return {
        ...state,
        editingId: null,
        estimatedRecoveryAt: "",
        comment: "",
      };
    case "queue-delete":
      return { ...state, injuryToDelete: action.injury };
    default:
      return state;
  }
}

function PlayerInjuriesPanel({
  playerId,
  injuries,
  labels,
  editor,
  updatePending,
  deletePending,
  onStartEdit,
  onSave,
  onCancelEdit,
  onStatusChange,
  onEstimatedRecoveryAtChange,
  onCommentChange,
  onQueueDelete,
  onRemove,
}: {
  playerId: string;
  injuries: readonly (Injury & { zoneCodes: readonly BodyZoneDefinition["code"][] })[];
  labels: PlayerDetailLabels;
  editor: InjuryEditorState;
  updatePending: boolean;
  deletePending: boolean;
  onStartEdit: (injury: Injury) => void;
  onSave: (injury: Injury) => void;
  onCancelEdit: () => void;
  onStatusChange: (status: Injury["status"]) => void;
  onEstimatedRecoveryAtChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onQueueDelete: (injury: Injury | null) => void;
  onRemove: (injuryId: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg">{labels.injuries}</h2>
      <InjuryLogForm
        playerId={playerId}
        labels={{
          diagnosedAt: labels.injuryDiagnosedAt,
          status: labels.injuryStatus,
          estimatedRecoveryAt: labels.injuryEstimatedRecoveryAt,
          severity: labels.injurySeverity,
          description: labels.injuryDescription,
          injuryComment: labels.injuryComment,
          bodyZone: labels.bodyZone,
          bodyRegion: labels.bodyRegion,
          submit: labels.injurySubmit,
          submitting: labels.injurySubmitting,
          error: labels.injuryError,
          bodyFigureTitle: labels.bodyFigureTitle,
          front: labels.front,
          back: labels.back,
          selectedRegion: labels.selectedRegion,
          zonesTitle: labels.zonesTitle,
          statusOption: labels.statusOption,
          region: labels.region,
          zone: labels.zone,
        }}
      />
      {injuries.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={labels.injuries}
          description={labels.noInjuries}
        />
      ) : (
        <ul className="space-y-2 text-sm">
          {injuries.map((injury) => (
            <li
              key={injury.id}
              className="rounded-md border border-outline-variant bg-surface-container p-3"
            >
              <p>{injury.diagnosedAt} · {injury.severity ?? "-"}</p>
              <p className="text-xs text-foreground/70">
                {labels.injuryStatus}: {labels.statusOption[injury.status]} · {labels.injuryEstimatedRecoveryAt}: {injury.estimatedRecoveryAt}
              </p>
              <p className="text-xs text-foreground/70">
                {labels.bodyRegion}: {labels.region[injury.bodyRegion]} · {labels.bodyZone}: {injury.zoneCodes.map((zoneCode) => labels.zone[zoneCode] ?? zoneCode).join(", ") || "-"}
              </p>
              {injury.description ? (
                <p className="mt-1 text-foreground/80">{injury.description}</p>
              ) : null}
              {editor.editingId === injury.id ? (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap items-end gap-2">
                    <Field label={labels.injuryStatus}>
                      <Select
                        value={editor.status}
                        onChange={(event) =>
                          onStatusChange(event.target.value as Injury["status"])
                        }
                      >
                        <option value="injured">{labels.statusOption.injured}</option>
                        <option value="recovering">{labels.statusOption.recovering}</option>
                        <option value="recovered">{labels.statusOption.recovered}</option>
                      </Select>
                    </Field>
                    <Field label={labels.injuryEstimatedRecoveryAt}>
                      <Input
                        type="datetime-local"
                        value={editor.estimatedRecoveryAt}
                        onChange={(event) => onEstimatedRecoveryAtChange(event.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label={labels.injuryComment}>
                    <Textarea
                      value={editor.comment}
                      onChange={(event) => onCommentChange(event.target.value)}
                      rows={2}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={updatePending}
                      onClick={() => onSave(injury)}
                      size="sm"
                    >
                      {updatePending ? labels.injuryUpdating : labels.injurySave}
                    </Button>
                    <Button
                      type="button"
                      onClick={onCancelEdit}
                      variant="secondary"
                      size="sm"
                    >
                      {labels.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => onStartEdit(injury)}
                    variant="secondary"
                    size="sm"
                  >
                    {labels.edit}
                  </Button>
                  <Button
                    type="button"
                    disabled={deletePending}
                    onClick={() => onQueueDelete(injury)}
                    variant="danger"
                    size="sm"
                  >
                    {deletePending ? labels.injuryDeleting : labels.injuryDelete}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={editor.injuryToDelete !== null}
        title={labels.injuryDeleteTitle}
        description={labels.injuryDeleteDescription}
        confirmLabel={deletePending ? labels.injuryDeleting : labels.injuryConfirmDelete}
        cancelLabel={labels.cancel}
        onCancel={() => onQueueDelete(null)}
        onConfirm={() => {
          if (editor.injuryToDelete) {
            onRemove(editor.injuryToDelete.id);
          }
        }}
        busy={deletePending}
      />
    </section>
  );
}

// Devuelve clases visuales para tabs de panel activo/inactivo.
function panelClass(active: boolean) {
  return [
    "rounded-md border px-3 py-1.5 text-sm transition",
    active
      ? "border-primary bg-primary text-on-primary"
      : "border-outline-variant bg-surface text-foreground hover:bg-surface-container",
  ].join(" ");
}
