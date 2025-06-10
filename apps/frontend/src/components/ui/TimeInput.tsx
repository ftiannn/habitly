import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

export const TimeInput = ({
    id,
    label,
    value,
    onChange,
    error,
}: {
    id: string;
    label?: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [localError, setLocalError] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const timeOptions = Array.from({ length: 24 }, (_, i) =>
        `${String(i).padStart(2, '0')}:00`
    );

    const validateTime = (time: string): string => {
        if (!time) return '';

        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return 'Please enter a valid time in HH:mm format';
        }

        const [hours, minutes] = time.split(':').map(Number);
        if (hours > 23) {
            return 'Hours must be between 00 and 23';
        }
        if (minutes > 59) {
            return 'Minutes must be between 00 and 59';
        }

        return '';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setInputValue(value);
        setLocalError('');
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        setLocalError('');

        const validationError = validateTime(newValue);
        if (!validationError || newValue === '') {
            onChange(newValue);
        }
    };

    const handleInputBlur = () => {
        const validationError = validateTime(inputValue);

        if (validationError) {
            setLocalError(validationError);
            return;
        }

        if (inputValue.length === 1 || inputValue.length === 2) {
            const hour = inputValue.padStart(2, '0');
            const formatted = `${hour}:00`;
            setInputValue(formatted);
            onChange(formatted);
        } else if (inputValue.length === 4 && inputValue.includes(':')) {
            const [h, m] = inputValue.split(':');
            const formatted = `${h.padStart(2, '0')}:${m}`;
            setInputValue(formatted);
            onChange(formatted);
        }
    };

    const handleTimeSelect = (time: string) => {
        setInputValue(time);
        setLocalError('');
        onChange(time);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const displayError = error || localError;
    const hasError = !!displayError;

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Input field */}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    placeholder="HH:mm"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className={`w-full border rounded-md px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 transition-colors ${hasError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } bg-white dark:bg-gray-800`}
                />

                {/* Dropdown trigger button */}
                <button
                    type="button"
                    onClick={toggleDropdown}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <Clock size={16} />
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => handleTimeSelect(time)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${value === time
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error message */}
            {hasError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {displayError}
                </p>
            )}

        </div>
    );
};