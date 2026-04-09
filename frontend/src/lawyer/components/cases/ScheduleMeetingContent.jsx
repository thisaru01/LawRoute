import React from "react";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function ScheduleMeetingContent({
  scheduleForm,
  onChange,
  onConfirm,
  isScheduling,
}) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const selectedDate = scheduleForm.date
    ? new Date(scheduleForm.date)
    : undefined;

  React.useEffect(() => {
    if (!scheduleForm.time) {
      onChange("time", format(new Date(), "HH:mm:ss"));
    }
  }, [onChange, scheduleForm.time]);

  return (
    <AlertDialogContent size="lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Schedule meeting</AlertDialogTitle>
        <AlertDialogDescription>
          Choose date, time and method for this case.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-3 text-sm text-foreground">
        <FieldGroup className="grid gap-2 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="meeting-date">Date</FieldLabel>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="meeting-date"
                  className="w-full justify-between font-normal"
                >
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={(date) => {
                    onChange("date", date ? format(date, "yyyy-MM-dd") : "");
                    setDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel htmlFor="meeting-time">Time</FieldLabel>
            <Input
              type="time"
              id="meeting-time"
              step="1"
              value={scheduleForm.time}
              onChange={(e) => onChange("time", e.target.value)}
              className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </Field>
        </FieldGroup>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="meeting-method">Method</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {scheduleForm.method
                    ? scheduleForm.method.charAt(0).toUpperCase() +
                      scheduleForm.method.slice(1)
                    : "Select method"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onChange("method", "online");
                  }}
                >
                  Online
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onChange("method", "physical");
                  }}
                >
                  Physical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1">
            {scheduleForm.method === "physical" ? (
              <>
                <Label htmlFor="meeting-location-link">Location</Label>
                <Input
                  id="meeting-location-link"
                  value={scheduleForm.location}
                  onChange={(e) => onChange("location", e.target.value)}
                  placeholder="Address for the in-person meeting"
                />
              </>
            ) : (
              <div className="text-xs text-muted-foreground pt-5">
                A secure Jitsi video link will be generated automatically when
                you schedule this meeting.
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isScheduling}>
          {isScheduling ? "Scheduling..." : "Schedule meeting"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
