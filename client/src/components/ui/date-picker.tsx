"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type Locale } from "date-fns";
import { nb } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  locale?: Locale;
  fromYear?: number;
  toYear?: number;
  captionLayout?: "buttons" | "dropdown";
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  locale = nb,
  fromYear,
  toYear,
  captionLayout = "dropdown",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale }) : <span>Velg dato</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabled}
          locale={locale}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout={captionLayout}
          showOutsideDays={true}
          fixedWeeks={true}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}