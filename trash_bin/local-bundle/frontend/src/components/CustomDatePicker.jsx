import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// Custom Input Component
const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
    <button
        onClick={onClick}
        ref={ref}
        type="button"
        className={clsx(
            "w-full flex items-center justify-between gap-3 bg-transparent text-left font-medium text-sm focus:outline-none py-1",
            !value ? "text-gray-400" : "text-gray-900",
            className
        )}
    >
        <span className="flex-1 truncate">{value || placeholder || "Select Date"}</span>
        <Calendar size={16} className="text-gray-400 flex-shrink-0" />
    </button>
));

const years = Array.from({ length: 2030 - 1999 + 1 }, (_, i) => 1999 + i);
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const CustomSelect = ({ value, onChange, options, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold transition-colors",
                    "bg-white/20 hover:bg-white/30 text-white border border-white/40",
                    className
                )}
            >
                {value}
                <ChevronDown size={12} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-32 max-h-48 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 z-20 no-scrollbar">
                        {options.map((option) => (
                            <div
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "px-3 py-2 text-xs font-bold cursor-pointer transition-colors",
                                    value === option
                                        ? "bg-teal-50 text-teal-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
                                )}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function CustomDatePicker({ selected, onChange, minDate, maxDate, placeholder, className }) {
    return (
        <>
            <style>
                {`
                    .react-datepicker {
                        font-family: inherit;
                        border: none;
                        border-radius: 16px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                        overflow: visible;
                    }
                    .react-datepicker__header {
                        background: linear-gradient(to right, #25D366, #128C7E);
                        border-bottom: none;
                        padding-top: 16px;
                        padding-bottom: 16px;
                        border-top-left-radius: 16px;
                        border-top-right-radius: 16px;
                    }
                    .react-datepicker__day-names {
                        margin-top: 10px;
                        border-bottom: 1px solid #f3f4f6;
                        padding-bottom: 5px;
                    }
                    .react-datepicker__day-name {
                        color: #075E54;
                        font-weight: 800;
                        width: 2.5rem;
                        margin: 0.2rem;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                    }
                    .react-datepicker__day {
                        width: 2.5rem;
                        line-height: 2.5rem;
                        margin: 0.2rem;
                        border-radius: 50%;
                        font-weight: 500;
                        color: #374151;
                    }
                    .react-datepicker__day:hover {
                        background-color: #f3f4f6;
                    }
                    .react-datepicker__day--selected, 
                    .react-datepicker__day--keyboard-selected {
                        background-color: #25D366 !important;
                        color: white !important;
                        font-weight: bold;
                    }
                    .react-datepicker__day--today {
                        color: #128C7E;
                        font-weight: 900;
                        position: relative;
                    }
                    .react-datepicker__day--today::after {
                        content: '';
                        position: absolute;
                        bottom: 4px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 4px;
                        height: 4px;
                        background-color: #128C7E;
                        border-radius: 50%;
                    }
                    .react-datepicker__day-name:first-child {
                        color: #D32F2F;
                    }
                    .react-datepicker__week > .react-datepicker__day:first-child {
                        color: #D32F2F;
                        font-weight: bold;
                    }
                    .react-datepicker__week > .react-datepicker__day--selected:first-child,
                    .react-datepicker__week > .react-datepicker__day--keyboard-selected:first-child {
                        color: white !important;
                    }
                    .react-datepicker__triangle {
                        display: none;
                    }
                `}
            </style>
            <DatePicker
                selected={selected && !isNaN(new Date(selected).getTime()) ? new Date(selected) : null}
                onChange={(date) => {
                    if (date) {
                        // Format date as YYYY-MM-DD without timezone conversion
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        onChange(`${year}-${month}-${day}`);
                    } else {
                        onChange('');
                    }
                }}
                dateFormat="dd-MM-yyyy"
                minDate={minDate ? new Date(minDate) : undefined}
                maxDate={maxDate ? new Date(maxDate) : undefined}
                customInput={<CustomInput className={className} placeholder={placeholder} />}
                showPopperArrow={false}
                calendarClassName="font-sans"
                popperPlacement="bottom-end"
                renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="flex items-center justify-between px-4 mb-2">
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className="p-1 rounded-full hover:bg-white/20 text-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex gap-2">
                            <CustomSelect
                                value={months[date.getMonth()]}
                                onChange={(month) => changeMonth(months.indexOf(month))}
                                options={months}
                            />
                            <CustomSelect
                                value={date.getFullYear()}
                                onChange={(year) => changeYear(year)}
                                options={years}
                            />
                        </div>

                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className="p-1 rounded-full hover:bg-white/20 text-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            />
        </>
    );
}
