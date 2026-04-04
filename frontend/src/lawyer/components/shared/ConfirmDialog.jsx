import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirmation dialog wrapping shadcn AlertDialog.
 *
 * @param {React.ReactNode} trigger       - The element that opens the dialog (rendered via asChild)
 * @param {string}          title         - Dialog heading
 * @param {React.ReactNode} description   - Dialog body text / JSX
 * @param {string}          confirmLabel  - Text on the confirm button (default: "Confirm")
 * @param {string}          confirmClass  - Tailwind classes for the confirm button
 * @param {function}        onConfirm     - Called when the confirm button is clicked
 */
export default function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  confirmClass = "",
  onConfirm,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild={typeof description !== "string"}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={confirmClass} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
