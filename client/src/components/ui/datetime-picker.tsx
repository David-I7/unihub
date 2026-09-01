import * as React from "react";
import { Calendar as CalendarIcon, Clock, X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DateTimePickerProps {
  value?: string; // Format: "YYYY-MM-DDTHH:mm" or ISO string
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

function parseDateValue(value?: string): {
  date?: Date;
  hour: string;
  minute: string;
} {
  if (!value) {
    return { date: undefined, hour: "09", minute: "00" };
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return { date: undefined, hour: "09", minute: "00" };
  }

  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(Math.floor(d.getMinutes() / 5) * 5).padStart(2, "0");
  return { date: d, hour, minute };
}

function formatToInputValue(date: Date, hour: string, minute: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}T${hour}:${minute}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled = false,
  clearable = false,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { date, hour, minute } = React.useMemo(
    () => parseDateValue(value),
    [value],
  );

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );
  const [selectedHour, setSelectedHour] = React.useState<string>(hour);
  const [selectedMinute, setSelectedMinute] = React.useState<string>(minute);

  React.useEffect(() => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  }, [date, hour, minute]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      if (clearable) {
        onChange("");
      }
      return;
    }
    setSelectedDate(newDate);
    const updated = formatToInputValue(newDate, selectedHour, selectedMinute);
    onChange(updated);
  };

  const handleHourChange = (newHour: string | null) => {
    if (!newHour) return;
    setSelectedHour(newHour);
    const baseDate = selectedDate || new Date();
    setSelectedDate(baseDate);
    const updated = formatToInputValue(baseDate, newHour, selectedMinute);
    onChange(updated);
  };

  const handleMinuteChange = (newMinute: string | null) => {
    if (!newMinute) return;
    setSelectedMinute(newMinute);
    const baseDate = selectedDate || new Date();
    setSelectedDate(baseDate);
    const updated = formatToInputValue(baseDate, selectedHour, newMinute);
    onChange(updated);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSelectedDate(undefined);
  };

  const displayString = React.useMemo(() => {
    if (!date) return null;
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-2xs transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{displayString || placeholder}</span>
        </span>

        {clearable && value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors ml-1"
          >
            <X className="size-3.5" />
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-3 shadow-xl rounded-xl border bg-popover z-[100]"
      >
        <div className="flex flex-col gap-3">
          {/* shadcn Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="p-0 border-0"
          />

          {/* Time Picker Controls */}
          <div className="flex items-center justify-between gap-2 border-t pt-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-primary" />
              <span className="font-semibold text-[11px] text-foreground">Time:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hour select */}
              <div className="w-16">
                <Select
                  value={selectedHour}
                  onValueChange={handleHourChange}
                >
                  <SelectTrigger className="h-7 text-xs px-2 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h} className="text-xs font-mono">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-xs font-bold text-muted-foreground">:</span>

              {/* Minute select */}
              <div className="w-16">
                <Select
                  value={selectedMinute}
                  onValueChange={handleMinuteChange}
                >
                  <SelectTrigger className="h-7 text-xs px-2 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs font-mono">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            className="w-full h-7 text-xs font-semibold mt-0.5 cursor-pointer"
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
