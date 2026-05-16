type InjuryCommentSummaryInput = {
  description?: string;
  status: "injured" | "recovering" | "recovered";
  estimatedRecoveryAt: string;
  injuryComment: string;
};

const statusLabel: Record<InjuryCommentSummaryInput["status"], string> = {
  injured: "lesionado",
  recovering: "en proceso de recuperacion",
  recovered: "recuperado",
};

export function formatInjuryCommentSummary(input: InjuryCommentSummaryInput): string {
  const lesion = input.description?.trim() ? input.description.trim() : "sin descripcion";
  const note = input.injuryComment.trim();
  return [
    `Lesion: ${lesion}`,
    `Estado: ${statusLabel[input.status]}`,
    `Fecha estimada de recuperacion: ${input.estimatedRecoveryAt}`,
    `Comentario: ${note}`,
  ].join("\n");
}
