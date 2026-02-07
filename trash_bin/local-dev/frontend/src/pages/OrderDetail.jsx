import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ChevronLeft, Trash2, CheckCircle, Truck, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [note, setNote] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await api.get(`/orders/${id}`);
            return res.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (newStatus) => {
            await api.put(`/orders/${id}/status`, { status: newStatus, note });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', id]);
            setNote('');
        }
    });

    const deleteImageMutation = useMutation({
        mutationFn: async (imageId) => {
            await api.delete(`/orders/${id}/images/${imageId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['order', id]);
        }
    });

    if (isLoading) return <div className="p-4 text-center">Loading...</div>;
    if (!order) return <div className="p-4 text-center">Order not found</div>;

    return (
        <div className="pb-20">
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="mr-2 p-1">
                    <ChevronLeft />
                </button>
                <h2 className="text-xl font-bold">Order #{order.token}</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <span className="text-xs text-gray-500 block">Customer</span>
                        <span className="font-medium">{order.customer_name || '-'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block">Bill No</span>
                        <span className="font-medium">{order.bill_number || '-'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block">Delivery</span>
                        <span className="font-medium">{order.delivery_date || '-'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block">Status</span>
                        <span className="capitalize font-medium">{order.status}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <span className="text-xs text-gray-500 block mb-1">Measurements</span>
                    <div className="grid grid-cols-3 gap-2 text-sm bg-gray-50 p-2 rounded">
                        {Object.entries(order.measurements || {}).map(([key, val]) => (
                            val && <div key={key}><span className="capitalize text-gray-500">{key}:</span> {val}</div>
                        ))}
                    </div>
                </div>

                {order.remarks && (
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 block">Remarks</span>
                        <p className="text-sm">{order.remarks}</p>
                    </div>
                )}
            </div>

            {/* Images */}
            <div className="mb-6">
                <h3 className="font-medium mb-2">Images</h3>
                <div className="grid grid-cols-3 gap-2">
                    {order.images?.map((img) => (
                        <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={`${import.meta.env.VITE_API_URL || '/api'}/storage/${img.filename}`}
                                alt="Order"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => {
                                    if (confirm('Delete image?')) deleteImageMutation.mutate(img.id);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 border mb-6">
                <h3 className="font-medium mb-3">Update Status</h3>
                <input
                    type="text"
                    placeholder="Add a note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border rounded p-2 text-sm mb-3"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => statusMutation.mutate('pending')}
                        disabled={order.status === 'pending'}
                        className={clsx("flex-1 py-2 rounded text-sm flex justify-center items-center gap-1", order.status === 'pending' ? 'bg-gray-100 text-gray-400' : 'bg-yellow-100 text-yellow-800')}
                    >
                        <Clock size={16} /> Pending
                    </button>
                    <button
                        onClick={() => statusMutation.mutate('ready')}
                        disabled={order.status === 'ready'}
                        className={clsx("flex-1 py-2 rounded text-sm flex justify-center items-center gap-1", order.status === 'ready' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-800')}
                    >
                        <CheckCircle size={16} /> Ready
                    </button>
                    <button
                        onClick={() => statusMutation.mutate('delivered')}
                        disabled={order.status === 'delivered'}
                        className={clsx("flex-1 py-2 rounded text-sm flex justify-center items-center gap-1", order.status === 'delivered' ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-800')}
                    >
                        <Truck size={16} /> Delivered
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div>
                <h3 className="font-medium mb-2 text-sm text-gray-500">History</h3>
                <div className="space-y-3">
                    {order.logs?.map((log) => (
                        <div key={log.id} className="text-sm border-l-2 border-gray-200 pl-3">
                            <div className="flex justify-between">
                                <span className="font-medium">{log.action}</span>
                                <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">by {log.user?.name}</div>
                            {log.note && <div className="text-xs text-gray-600 mt-1 italic">"{log.note}"</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
