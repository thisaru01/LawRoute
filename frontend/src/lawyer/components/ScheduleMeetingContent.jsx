import React from "react";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 10);
};

export default function ScheduleMeetingContent({
  scheduleForm,
  onChange,
  onConfirm,
  isScheduling,
  timeOptions = [],
}) {
  return (
    <AlertDialogContent size="lg">
      <AlertDialogHeader>
        <AlertDialogTitle>Schedule meeting</AlertDialogTitle>
        <AlertDialogDescription>
          Choose date, time and method for this case.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-3 text-sm text-foreground">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="meeting-date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Input
                  id="meeting-date"
                  readOnly
                  value={formatDateForInput(scheduleForm.date)}
                  placeholder="Select date"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    scheduleForm.date ? new Date(scheduleForm.date) : undefined
                  }
                  onSelect={(date) =>
                    onChange(
                      "date",
                      date ? date.toISOString().slice(0, 10) : "",
                    )
                  }
                  className="p-2"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label htmlFor="meeting-time">Time</Label>
            <Select
              value={scheduleForm.time}
              onValueChange={(v) => onChange("time", v)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="meeting-method">Method</Label>
            <Select
              value={scheduleForm.method}
              onValueChange={(v) => onChange("method", v)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="meeting-location-link">
              Meeting link or location
            </Label>
            <Input
              id="meeting-location-link"
              value={
                scheduleForm.method === "online"
                  ? scheduleForm.meetingLink
                  : scheduleForm.location
              }
              onChange={(e) =>
                onChange(
                  scheduleForm.method === "online" ? "meetingLink" : "location",
                  e.target.value,
                )
              }
              placeholder="Video link for online, address for physical"
            />
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
