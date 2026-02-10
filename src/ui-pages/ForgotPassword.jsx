'use client';

import { useState } from 'react';
import { Link } from '@/src/lib/router';
import api from '../lib/api';
import { Mail, ArrowRight, ArrowLeft, Copy, CheckCircle, ExternalLink } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setResetLink('');

        try {
            const res = await api.post('/forgot-password', { email });
            setMessage(res.data.message);
            setResetLink(res.data.reset_link || '');
            setEmailSent(res.data.email_sent || false);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openResetLink = () => {
        window.location.href = resetLink;
    };

    return (
        <div className="min-h-screen bg-[#ECE5DD] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8 space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl flex items-center justify-center text-[#075E54] shadow-lg shadow-teal-100">
                            <Mail size={28} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-[#075E54]">Forgot Password?</h1>
                    <p className="text-sm text-gray-500">Enter your email to reset your password</p>
                </div>

                {!message && !error ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all font-medium"
                                placeholder="Enter your registered email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#075E54] to-[#25D366] hover:from-[#128C7E] hover:to-[#25D366] text-white text-lg font-bold rounded-2xl shadow-lg shadow-green-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>
                ) : error ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center">
                            {error}
                        </div>
                        <button
                            onClick={() => { setError(''); setMessage(''); }}
                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Success Message */}
                        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-green-700 font-medium text-sm">{message}</p>
                                    {emailSent && (
                                        <p className="text-green-600 text-xs mt-1">Check your inbox and spam folder.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reset Link Display */}
                        {resetLink && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {emailSent ? 'Or use this link directly:' : 'Reset Link:'}
                                </p>

                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                    <p className="text-xs text-gray-600 break-all font-mono">{resetLink}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        {copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    <button
                                        onClick={openResetLink}
                                        className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <ExternalLink size={16} />
                                        Open Link
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 text-center">
                            Link expires in 60 minutes.
                        </p>
                    </div>
                )}

                <div className="text-center pt-2">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
                &copy; 2025 KapdaFactory developed by SmileFotilo
            </p>
        </div>
    );
}


