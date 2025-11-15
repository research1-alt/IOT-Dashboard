
import React, { useState } from 'react';
import { MailIcon } from './Icons';

interface ForgotPasswordPageProps {
    onForgotPasswordRequest: (email: string) => boolean;
    onNavigateToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onForgotPasswordRequest, onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        const emailExists = onForgotPasswordRequest(email);
        if (!emailExists) {
            setError('No account found with that email address.');
        } else {
             // The App component will handle navigation, but we can show a temporary message
             setSuccess(true);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-wider text-sidebar">FORGOT PASSWORD</h1>
                    <p className="mt-2 text-gray-500">Enter your email to reset your password</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                            className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>

                    {error && <p className="text-center text-sm text-red-600">{error}</p>}
                    {success && <p className="text-center text-sm text-green-600">If an account exists, you will be redirected to the reset page.</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
                 <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                        Remember your password?{' '}
                        <button onClick={onNavigateToLogin} className="font-medium text-primary-600 hover:text-primary-500">
                            Back to Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
