"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type Locale } from "date-fns";
import { nb } from "date-fns/locale";
import { TextField, IconButton } from "@mui/material";

import { cn } from "@/lib/utils";
//import { Button } from "@/components/ui/button"; // Removed as TextField is used instead.
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
  error?: boolean;
  helperText?: string;
  label?: string;
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  locale = nb,
  fromYear,
  toYear,
  captionLayout = "dropdown",
  error,
  helperText,
  label,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <TextField
            fullWidth
            label={label}
            error={error}
            helperText={helperText}
            value={date ? format(date, "PPP", { locale }) : ""}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton 
                  onClick={() => setOpen(true)}
                  sx={{ 
                    color: 'action.active',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <CalendarIcon className="h-5 w-5" />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0"
        align="start"
        sideOffset={8}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onSelect?.(date);
            setOpen(false);
          }}
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