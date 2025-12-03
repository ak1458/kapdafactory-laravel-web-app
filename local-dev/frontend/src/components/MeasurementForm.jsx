export default function MeasurementForm({ measurements, onChange }) {
    const fields = ['chest', 'waist', 'length', 'sleeve', 'shoulder', 'hip', 'neck'];

    const handleChange = (field, value) => {
        onChange({ ...measurements, [field]: value });
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Measurements</label>
            <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                    <div key={field}>
                        <label className="block text-xs text-gray-500 capitalize mb-1">{field}</label>
                        <input
                            type="text"
                            value={measurements[field] || ''}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
