import clsx from 'clsx';

export default function FilterChips({ status, onChange }) {
    const options = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'ready', label: 'Ready' },
        { value: 'delivered', label: 'Delivered' },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={clsx(
                        'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                        status === opt.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
