import clsx from 'clsx';

export default function FilterChips({ status, onChange }) {
    const options = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'ready', label: 'Ready' },
        { value: 'delivered', label: 'Delivered' },
    ];

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-2 no-scrollbar px-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={clsx(
                        'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border',
                        status === opt.value
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200 transform scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
