export default function MeasurementForm({ measurements, onChange }) {
    const fields = ['chest', 'waist', 'length', 'sleeve', 'shoulder', 'hip', 'neck'];

    const handleChange = (field, value) => {
        onChange({ ...measurements, [field]: value });
    };

    return (
        <div className="p-4 bg-gray-50/50">
            <div className="grid grid-cols-2 gap-4">
                {fields.map((field) => (
                    <div key={field}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{field}</label>
                        <input
                            type="text"
                            value={measurements[field] || ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="block w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-sm font-medium p-2.5 border transition-all"
                            placeholder="0.0"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
