import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import OrderCard from '../components/OrderCard';

export default function OrderList() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const { data, isLoading, error } = useQuery({
        queryKey: ['orders', search, status],
        queryFn: async () => {
            const params = { search, status };
            const res = await api.get('/orders', { params });
            return res.data;
        },
        keepPreviousData: true,
    });

    return (
        <div>
            <SearchBar onSearch={setSearch} />
            <FilterChips status={status} onChange={setStatus} />

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading orders...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500">Error loading orders</div>
            ) : data?.data?.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No orders found</div>
            ) : (
                <div className="space-y-2">
                    {data?.data?.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
