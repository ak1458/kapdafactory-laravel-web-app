import { Link } from 'react-router-dom';
import { Calendar, Package } from 'lucide-react';
import clsx from 'clsx';

export default function OrderCard({ order }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        ready: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
    };

    return (
        <Link to={`/orders/${order.id}`} className="block bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-100 active:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-bold text-gray-900">#{order.token}</span>
                    {order.bill_number && <span className="text-xs text-gray-500 ml-2">Bill: {order.bill_number}</span>}
                </div>
                <span className={clsx('px-2 py-1 rounded-full text-xs font-medium capitalize', statusColors[order.status])}>
                    {order.status}
                </span>
            </div>

            <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    {order.images && order.images.length > 0 ? (
                        <img
                            src={`${import.meta.env.VITE_API_URL || '/api'}/storage/${order.images[0].filename}`}
                            alt="Order"
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={20} />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{order.customer_name || 'No Name'}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar size={12} className="mr-1" />
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'No Date'}
                    </div>
                    {order.remarks && <p className="text-xs text-gray-400 mt-1 truncate">{order.remarks}</p>}
                </div>
            </div>
        </Link>
    );
}
