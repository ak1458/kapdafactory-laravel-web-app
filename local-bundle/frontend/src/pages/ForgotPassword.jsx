import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await api.post('/forgot-password', { email });
            setMessage(res.data.message);
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ECE5DD] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#075E54]">
                            <Mail size={24} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#075E54]">Forgot Password?</h1>
                    <p className="text-sm text-gray-500">Enter your email to receive a reset link</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all font-medium"
                                placeholder="name@company.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#25D366] hover:bg-[#128C7E] text-white text-lg font-bold rounded-2xl shadow-lg shadow-green-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium">
                            {message}
                        </div>
                        <p className="text-xs text-gray-400">
                            Check your backend logs for the link (Dev Mode).
                        </p>
                    </div>
                )}

                <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
