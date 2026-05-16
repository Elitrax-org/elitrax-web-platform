"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutationAction } from "@/components/forms/use-mutation-action";
import { Button, ConfirmDialog, Field, Textarea } from "@/components/ui";
import type { PlayerComment } from "@/application/domain-types";
import {
  postCommentInputSchema,
  updateCommentInputSchema,
  type PostCommentInput,
  type UpdateCommentInput,
} from "@/application/schemas";

const COMMENT_TIMESTAMP_FORMATTERS = {
  en: new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }),
  es: new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }),
} as const;

function getCommentTimestampFormatter(locale: string) {
  const normalizedLocale = locale.toLowerCase();
  if (normalizedLocale.startsWith("es")) {
    return COMMENT_TIMESTAMP_FORMATTERS.es;
  }
  return COMMENT_TIMESTAMP_FORMATTERS.en;
}

/**
 * Panel cliente para crear, editar y borrar comentarios de un jugador.
 *
 * Solo el autor del comentario puede editar o eliminar su propio contenido.
 */
export function PlayerCommentsPanel({
  playerId,
  actorUserId,
  comments,
  locale,
  labels,
}: {
  playerId: string;
  actorUserId?: string;
  comments: readonly PlayerComment[];
  locale: string;
  labels: {
    title: string;
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
    postSuccess: string;
    updateSuccess: string;
    removeSuccess: string;
    removeTitle: string;
    removeDescription: string;
    confirmRemove: string;
  };
}) {
  const { pending, run } = useMutationAction();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [commentToRemove, setCommentToRemove] = useState<PlayerComment | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PostCommentInput>({ resolver: zodResolver(postCommentInputSchema) });

  const formatter = getCommentTimestampFormatter(locale);

  function formatTimestamp(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return formatter.format(date);
  }

  // Crea comentario y refresca datos server-side al confirmar.
  const onCreate = handleSubmit((data) => {
    void run({
      errorMessage: labels.commentError,
      successMessage: labels.postSuccess,
      successTitle: labels.post,
      refresh: true,
      request: () =>
        fetch(`/api/v1/players/${playerId}/comments`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        }),
      onSuccess: () => {
        reset();
      },
      onError: (error) => {
        setError("body", { message: error.message || labels.commentError });
      },
    });
  });

  // Habilita modo edición sobre un comentario existente.
  function startEdit(comment: PlayerComment) {
    setEditingId(comment.id);
    setEditingValue(comment.body);
  }

  // Persiste edición validando el payload con el schema de actualización.
  function saveEdit(commentId: string) {
    const parsed = updateCommentInputSchema.safeParse({ body: editingValue });
    if (!parsed.success) return;
    void run({
      errorMessage: labels.commentError,
      successMessage: labels.updateSuccess,
      successTitle: labels.save,
      refresh: true,
      request: () => {
        const payload: UpdateCommentInput = parsed.data;
        return fetch(`/api/v1/players/${playerId}/comments/${commentId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      },
      onSuccess: () => {
        setEditingId(null);
        setEditingValue("");
      },
    });
  }

  // Elimina comentario y sincroniza la vista.
  function removeComment(commentId: string) {
    void run({
      errorMessage: labels.commentError,
      successMessage: labels.removeSuccess,
      successTitle: labels.remove,
      refresh: true,
      request: () =>
        fetch(`/api/v1/players/${playerId}/comments/${commentId}`, {
          method: "DELETE",
        }),
      onSuccess: () => {
        if (editingId === commentId) {
          setEditingId(null);
          setEditingValue("");
        }
        setCommentToRemove(null);
      },
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg">{labels.title}</h2>
      <form onSubmit={onCreate} className="space-y-2">
        <Field label={labels.title} error={errors.body?.message} className="gap-2">
          <Textarea
            {...register("body")}
            rows={3}
            placeholder={labels.commentPlaceholder}
            aria-invalid={errors.body ? true : undefined}
          />
        </Field>
        <Button
          type="submit"
          disabled={pending}
        >
          {pending ? labels.posting : labels.post}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-foreground/70">{labels.noComments}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {comments.map((comment) => {
            const ownComment = !!actorUserId && comment.authorUserId === actorUserId;
            const isEditing = editingId === comment.id;
            return (
              <li
                key={comment.id}
                className="rounded-md border border-outline-variant bg-surface-container p-3"
              >
                <p className="text-xs text-foreground/60">{formatTimestamp(comment.createdAt)}</p>
                {isEditing ? (
                  <Textarea
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-1">{comment.body}</p>
                )}
                {ownComment ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          onClick={() => saveEdit(comment.id)}
                          disabled={pending}
                          size="sm"
                        >
                          {pending ? labels.updating : labels.save}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditingValue("");
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          {labels.cancel}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          onClick={() => startEdit(comment)}
                          variant="secondary"
                          size="sm"
                        >
                          {labels.edit}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setCommentToRemove(comment)}
                          disabled={pending}
                          variant="danger"
                          size="sm"
                        >
                          {pending ? labels.removing : labels.remove}
                        </Button>
                      </>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}

          <ConfirmDialog
            open={commentToRemove !== null}
            title={labels.removeTitle}
            description={labels.removeDescription}
            confirmLabel={pending ? labels.removing : labels.confirmRemove}
            cancelLabel={labels.cancel}
            onCancel={() => setCommentToRemove(null)}
            onConfirm={() => {
              if (commentToRemove) {
                removeComment(commentToRemove.id);
              }
            }}
            busy={pending}
          />
        </ul>
      )}
    </section>
  );
}
