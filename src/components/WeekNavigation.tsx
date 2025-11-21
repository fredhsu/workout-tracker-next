import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WeekNavigationProps {
  currentWeek: number;
  availableWeeks: number[];
  onWeekChange: (week: number) => void;
  onAddWeek: () => void;
}

export default function WeekNavigation({ 
  currentWeek, 
  availableWeeks, 
  onWeekChange,
  onAddWeek 
}: WeekNavigationProps) {
  const currentIndex = availableWeeks.indexOf(currentWeek);
  const hasNewer = currentIndex > 0;
  const hasOlder = currentIndex < availableWeeks.length - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Week {currentWeek}
        </h2>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onWeekChange(availableWeeks[currentIndex + 1])}
            disabled={!hasOlder}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {availableWeeks.length > 0 && (
             <Select
                value={currentWeek.toString()}
                onValueChange={(val) => onWeekChange(Number(val))}
              >
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map(week => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onWeekChange(availableWeeks[currentIndex - 1])}
            disabled={!hasNewer}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

        <Button 
          onClick={onAddWeek}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-none"
        >
          + New Week
        </Button>
      </div>
    </div>
  );
}
