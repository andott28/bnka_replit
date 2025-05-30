"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type Locale } from "date-fns";
import { nb } from "date-fns/locale";
import { TextField, IconButton, InputAdornment } from "@mui/material";

import { cn } from "@/lib/utils";
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
  
  // Calculate date for exactly 18 years ago from today
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  
  // Set initial default date to show in calendar
  const [defaultViewDate] = React.useState(eighteenYearsAgo);
  
  // Initialize with date prop or undefined
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(date ? format(date, "dd/MM/yyyy") : "");
  
  // Keep selectedDate in sync with external date prop
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setInputValue(format(date, "dd/MM/yyyy"));
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let formatted = value;

    // Add slashes automatically
    if (value.length === 2 && !value.includes("/")) formatted = value + "/";
    if (value.length === 5 && value.indexOf("/", 3) === -1) formatted = value + "/";

    setInputValue(formatted);

    // Try to parse the date when we have a complete format
    if (value.length === 10) {
      try {
        const parsedDate = parse(value, "dd/MM/yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          onSelect?.(parsedDate);
        }
      } catch (error) {
        // Invalid date format
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <TextField
            fullWidth
            label={label}
            error={error}
            helperText={helperText}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="DD/MM/YYYY"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
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
                </InputAdornment>
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
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date);
              setInputValue(format(date, "dd/MM/yyyy"));
              onSelect?.(date);
            }
            setOpen(false);
          }}
          disabled={disabled}
          locale={locale}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout={captionLayout}
          showOutsideDays={true}
          fixedWeeks={true}
          hideHead={true}
          defaultMonth={selectedDate || defaultViewDate}
          initialFocus
          className="min-w-[280px]"
        />
      </PopoverContent>
    </Popover>
  );
}