import clsx from 'clsx';

export default function FilterChips({ status, onChange, options }) {
    const getColor = (value) => {
        switch (value) {
            case 'pending': return 'bg-amber-500 border-amber-600 text-white shadow-amber-200';
            case 'ready': return 'bg-blue-500 border-blue-600 text-white shadow-blue-200';
            case 'delivered': return 'bg-green-500 border-green-600 text-white shadow-green-200';
            case 'transferred': return 'bg-purple-500 border-purple-600 text-white shadow-purple-200';
            default: return 'bg-slate-900 border-slate-900 text-white shadow-slate-200';
        }
    };

    return (
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar px-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={clsx(
                        'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border shadow-sm',
                        status === opt.value
                            ? `${getColor(opt.value)} transform scale-105 shadow-md`
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
