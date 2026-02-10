'use client';

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
        <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all duration-300"
                placeholder="Search by token, bill #, customer, or date..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}

