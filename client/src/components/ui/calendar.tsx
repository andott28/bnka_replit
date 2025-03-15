"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fromYear: fromYearProp,
  toYear: toYearProp,
  ...props
}: CalendarProps) {
  // Customize date picker with Material Design V3 styles
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-xl shadow-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "hidden", // Hide default label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-10 w-10 bg-transparent p-0 hover:bg-opacity-10 hover:bg-primary transition-colors rounded-full flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-25",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] h-10 flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 h-10 w-10",
          "transition-all duration-200",
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center",
          "hover:bg-primary hover:bg-opacity-10 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-25",
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-medium",
        day_today: "bg-primary bg-opacity-10 font-medium",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-primary aria-selected:bg-opacity-10 aria-selected:text-foreground",
        day_hidden: "invisible",
        vhidden: "sr-only",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
        IconRight: () => <ChevronRight className="h-5 w-5" />,
        Caption: ({ displayMonth }) => {
          // Create a calendar UI with month/year dropdowns in Material Design V3 style
          const month = displayMonth.getMonth();
          const year = displayMonth.getFullYear();
          
          // Calculate year range based on props or defaults
          const fromYear = fromYearProp || year - 10;
          const toYear = toYearProp || year + 10;
          
          // Generate year options for the dropdown
          const yearOptions = React.useMemo(() => {
            return Array.from(
              { length: toYear - fromYear + 1 },
              (_, i) => fromYear + i
            );
          }, [fromYear, toYear]);
          
          // Component reference to access DayPicker methods
          const dayPickerRef = React.useRef<HTMLDivElement>(null);
          
          // Update the displayed month
          const updateMonth = (newMonth: Date) => {
            // Access the DayPicker's goToMonth method directly from props
            if (props.onMonthChange) {
              props.onMonthChange(newMonth);
            }
          };

          return (
            <div className="flex justify-center items-center px-1 py-2 h-14" ref={dayPickerRef}>
              <div className="flex flex-row space-x-2 items-center">
                {/* Month Selector - Material Design V3 style */}
                <div className="relative">
                  <select
                    aria-label="Velg måned"
                    className="appearance-none bg-transparent pl-3 pr-9 py-1.5 text-sm font-medium rounded-full 
                      border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-25 
                      hover:bg-primary hover:bg-opacity-10 transition-colors cursor-pointer"
                    value={month}
                    onChange={(e) => {
                      const newMonth = new Date(displayMonth);
                      newMonth.setMonth(parseInt(e.target.value));
                      updateMonth(newMonth);
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>
                        {new Date(2000, i, 1).toLocaleString("no", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                    <svg
                      className="h-4 w-4 text-primary opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Year Selector - Material Design V3 style */}
                <div className="relative">
                  <select
                    aria-label="Velg år"
                    className="appearance-none bg-transparent pl-3 pr-9 py-1.5 text-sm font-medium rounded-full 
                      border-0 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-25 
                      hover:bg-primary hover:bg-opacity-10 transition-colors cursor-pointer"
                    value={year}
                    onChange={(e) => {
                      const newYear = new Date(displayMonth);
                      newYear.setFullYear(parseInt(e.target.value));
                      updateMonth(newYear);
                    }}
                  >
                    {yearOptions.map((yearValue) => (
                      <option key={yearValue} value={yearValue}>
                        {yearValue}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
                    <svg
                      className="h-4 w-4 text-primary opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
export { Calendar };
