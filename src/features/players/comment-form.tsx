"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { postCommentInputSchema, type PostCommentInput } from "@/application/schemas/injury";
import { useRouter } from "@/i18n/routing";

/**
 * Formulario simple para publicar comentarios del jugador.
 */
export function CommentForm({
  playerId,
  labels,
}: {
  playerId: string;
  labels: { body: string; submit: string; submitting: string; error: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<PostCommentInput>({ resolver: zodResolver(postCommentInputSchema) });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        startTransition(async () => {
          // El comentario se envía tal como se escribe; la validación de longitud y contenido ya corre en schema compartido.
          const res = await fetch(`/api/v1/players/${playerId}/comments`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            // El campo principal también concentra el feedback de error para mantener la interacción rápida.
            setError("body", { message: labels.error });
            return;
          }
          reset();
          router.refresh();
        });
      })}
      className="space-y-2"
    >
      <textarea
        {...register("body")}
        {...(errors.body ? { "aria-invalid": true } : {})}
        rows={3}
        className="w-full rounded-md border border-outline-variant bg-surface p-2 text-sm"
        placeholder={labels.body}
      />
      {errors.body ? (
        <p role="alert" className="text-xs text-error">{errors.body.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
