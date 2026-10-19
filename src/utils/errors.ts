/** Estrae un messaggio leggibile da un errore sconosciuto (catch con `unknown`). */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Errore sconosciuto';
};
