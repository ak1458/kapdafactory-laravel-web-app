import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search token, bill, date..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
