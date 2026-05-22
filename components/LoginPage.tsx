
import React, { useState } from 'react';
import { Member } from '../types';
import { MailIcon, LockClosedIcon } from './Icons';

interface LoginPageProps {
    members: Member[];
    onLoginSuccess: (user: Member) => void;
    onNavigateToSignup: () => void;
    onNavigateToForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ members, onLoginSuccess, onNavigateToSignup, onNavigateToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        console.log("Attempting login for:", email);
        console.log("Available members:", members.map(m => m.email));

        const user = members.find(member => member.email.toLowerCase() === email.toLowerCase());

        if (user) {
            // Validate password against mock data
            if (user.password === password) {
                console.log("Login successful for:", user.email);
                onLoginSuccess(user);
            } else {
                console.log("Password mismatch for:", user.email);
                setError('Invalid email or password. Please try again.');
            }
        } else {
            console.log("User not found for email:", email);
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-wider text-sidebar">TELEMATICS</h1>
                    <p className="mt-2 text-gray-500">Sign in to your account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MailIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={onNavigateToForgotPassword}
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-600 pt-2">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                 <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button onClick={onNavigateToSignup} className="font-medium text-primary-600 hover:text-primary-500">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;