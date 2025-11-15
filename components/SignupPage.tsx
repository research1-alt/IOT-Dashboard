
import React, { useState } from 'react';
import { Member } from '../types';
import { MailIcon, LockClosedIcon, UserCircleIcon } from './Icons';

interface SignupPageProps {
    members: Member[];
    onSignup: (name: string, email: string, password: string) => Member;
    onSignupSuccess: (user: Member) => void;
    onNavigateToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ members, onSignup, onSignupSuccess, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }

        const emailExists = members.some(member => member.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            setError('An account with this email already exists.');
            return;
        }
        
        const newUser = onSignup(name, email, password);
        onSignupSuccess(newUser);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-wider text-sidebar">CREATE ACCOUNT</h1>
                    <p className="mt-2 text-gray-500">Get started with your new account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="rounded-md shadow-sm -space-y-px">
                         <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="full-name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                            />
                        </div>
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
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-600 pt-2">{error}</p>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                 <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
