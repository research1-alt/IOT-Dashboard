
import React, { useState } from 'react';
import { Member } from '../types';
import { LockClosedIcon } from './Icons';

interface ResetPasswordPageProps {
    userToReset: Member;
    onResetPassword: (password: string) => boolean;
    onNavigateToLogin: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ userToReset, onResetPassword, onNavigateToLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        const wasSuccessful = onResetPassword(password);
        if (wasSuccessful) {
            setSuccess('Password has been reset successfully! Redirecting to login...');
            setTimeout(() => {
                onNavigateToLogin();
            }, 2000);
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-wider text-sidebar">RESET PASSWORD</h1>
                    <p className="mt-2 text-gray-500">
                        Create a new password for <span className="font-medium">{userToReset.email}</span>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                     <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="new-password"
                                name="new-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="New Password"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm New Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                    {success && <p className="text-center text-sm text-green-600">{success}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!!success}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
