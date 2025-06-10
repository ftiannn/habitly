import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { TIMEZONE_GROUPS } from "@/constants/timezone";

export const TimezoneDropdown = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = TIMEZONE_GROUPS
    .flatMap(group => group.options)
    .find(option => option.value === value)?.label || "Select timezone";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-input rounded-lg bg-background focus:ring-2 focus:ring-blue-500 transition text-sm text-left"
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Globe size={16} />
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-44 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg text-sm">
          {TIMEZONE_GROUPS.map(group => (
            <div key={group.label}>
              <div className="px-3 py-1.5 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase bg-gray-50 dark:bg-gray-700">
                {group.label}
              </div>
              {group.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition ${
                    value === option.value
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
