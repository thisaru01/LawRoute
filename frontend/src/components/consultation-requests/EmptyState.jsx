/**
 * Dashed-border empty state panel.
 * @param {string} title   - Bold line
 * @param {string} message - Soft sub-line
 */
export default function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
      <p className="font-medium">{title}</p>
      {message && <p className="mt-1 text-xs">{message}</p>}
    </div>
  );
}
