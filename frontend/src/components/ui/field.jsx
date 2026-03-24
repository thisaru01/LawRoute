import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const FieldGroup = React.forwardRef(function FieldGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("space-y-4", className)} {...props} />;
});

const Field = React.forwardRef(function Field(
  { className, orientation = "vertical", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        orientation === "horizontal"
          ? "flex items-center justify-between gap-3"
          : "space-y-2",
        className,
      )}
      {...props}
    />
  );
});

function FieldLabel({ className, ...props }) {
  return <Label className={cn("text-sm font-medium", className)} {...props} />;
}

function FieldDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel };
