
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProfileSelectionPage from './components/ProfileSelectionPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import StatusBar from './components/StatusBar';
import { Member, UserRole, Device } from './types';
import * as api from './services/api';
import { LoadingSpinnerIcon } from './components/Icons';

// An enhanced, centered loading screen that can also display errors
const LoadingScreen: React.FC<{ error?: string | null; onRetry?: () => void }> = ({ error, onRetry }) => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-sidebar p-4">
        {error ? (
            <div className="text-center max-w-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">Initialization Failed</h3>
                <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
                <div className="mt-6 space-y-2">
                     <button
                        onClick={onRetry || (() => window.location.reload())}
                        className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Retry Connection
                    </button>
                    {/* If the error is due to a bad URL, give them a way to reset to local mode locally or they are stuck */}
                     <button
                        onClick={() => {
                             localStorage.setItem('fleetAppConfig', JSON.stringify({ mode: 'local', serverUrl: '' }));
                             window.location.reload();
                        }}
                        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                    >
                        Reset to Local Mode
                    </button>
                </div>
            </div>
        ) : (
            <>
                <LoadingSpinnerIcon className="w-12 h-12 animate-spin text-primary-600" />
                <p className="mt-4 text-lg font-semibold">Initializing System...</p>
                <p className="text-sm text-gray-500">Loading data from configured source.</p>
            </>
        )}
    </div>
);


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [profileSelected, setProfileSelected] = useState<boolean>(false);
    const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword' | 'resetPassword'>('login');
    const [userToReset, setUserToReset] = useState<Member | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    // --- Centralized State Management ---
    const [devices, setDevices] = useState<Device[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic ---
    const fetchSystemData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch data from the API service layer.
            const [devicesData, membersData] = await Promise.all([
                api.fetchDevices(),
                api.fetchMembers()
            ]);
            
            setDevices(devicesData);
            setMembers(membersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown system error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Initial Load ---
    useEffect(() => {
        fetchSystemData();
    }, []); 

    // --- Manual Refresh Handler (Connected to "Sync Data" button) ---
    const handleManualRefresh = async () => {
        await fetchSystemData();
    };

    // --- Data Persistence Effects (Only for Local Mode implicitly via api.ts check) ---
    useEffect(() => {
        if (devices.length > 0 && !isLoading && !error) {
             // We only persist to localStorage if we successfully loaded data.
             // If in server mode, this cache helps if they switch back to local, 
             // but api.fetchDevices handles the source of truth.
            const devicesToPersist = devices.map(device => {
                const { logFileContent, ...restOfDevice } = device;
                return restOfDevice;
            });
            localStorage.setItem('fleetDevices', JSON.stringify(devicesToPersist));
        }
    }, [devices, isLoading, error]);

    useEffect(() => {
        if (members.length > 0 && !isLoading && !error) {
            localStorage.setItem('fleetMembers', JSON.stringify(members));
        }
    }, [members, isLoading, error]);

    // --- Session & Navigation Handlers ---
    const handleLoginSuccess = (user: Member) => {
        setCurrentUser(user);
        setProfileSelected(false);
        setAuthView('login'); // Reset view on successful login
    };
    
    const handleSignup = (name: string, email: string, password: string): Member => {
        const newMember: Member = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            role: 'Customer', // New users default to the 'Customer' role.
            assignedDevices: []
        };
        setMembers(prev => [...prev, newMember]);
        return newMember;
    };

    const handleForgotPasswordRequest = (email: string): boolean => {
        const user = members.find(m => m.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setUserToReset(user);
            setAuthView('resetPassword');
            return true;
        }
        return false;
    };
    
    const handleResetPassword = (password: string): boolean => {
        if (!userToReset) return false;

        setMembers(prevMembers => 
            prevMembers.map(m => 
                m.id === userToReset.id ? { ...m, password } : m
            )
        );
        setUserToReset(null);
        setAuthView('login');
        return true;
    };


    const handleProfileSelect = (role: UserRole) => {
        if (currentUser) {
            const freshUserData = members.find(m => m.id === currentUser.id);
            if (freshUserData) {
                const updatedUser = { ...freshUserData, role };
                setCurrentUser(updatedUser);
                setProfileSelected(true);
            } else {
                // Fallback if member list was refreshed and user is gone, or just use current
                const updatedUser = { ...currentUser, role };
                setCurrentUser(updatedUser);
                setProfileSelected(true);
            }
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setProfileSelected(false);
        setAuthView('login');
    };
    
    const handleChangeProfile = () => {
        setProfileSelected(false);
    };
    
    // --- Data Management Handlers (Moved from Dashboard) ---
    const handleAddDevice = (deviceId: string) => {
        if (deviceId && !devices.find(d => d.id === deviceId)) {
            const newDevice: Device = { id: deviceId, status: 'Offline', location: 'N/A' };
            setDevices(prev => [...prev, newDevice]);
        }
    };
    
    const handleUpdateDeviceDetails = (deviceId: string, details: Partial<Omit<Device, 'id' | 'status'>>) => {
        setDevices(prevDevices => 
            prevDevices.map(d => 
                d.id === deviceId 
                    ? { ...d, ...details, lastUpdated: new Date().toLocaleString() } 
                    : d
            )
        );
    };

    const handleAttachLog = (deviceId: string, content: string) => {
        setDevices(prevDevices => 
            prevDevices.map(d => 
                d.id === deviceId ? { ...d, logFileContent: content } : d
            )
        );
    };

    const handleAddMember = (name: string, email: string, role: UserRole) => {
        const newMember: Member = {
            id: `user-${Date.now()}`,
            name,
            email,
            password: 'password123',
            role,
            assignedDevices: []
        };
        setMembers(prev => [...prev, newMember]);
    };

    const handleUpdateMemberRole = (memberId: string, role: UserRole) => {
        const updatedMembers = members.map(m => m.id === memberId ? { ...m, role } : m);
        setMembers(updatedMembers);

        if (currentUser && currentUser.id === memberId) {
           setCurrentUser(prevUser => prevUser ? { ...prevUser, role } : null);
        }
    };
    
    const handleUpdateMemberAssignments = (memberId: string, assignedDevices: string[]) => {
        const updatedMembers = members.map(m => m.id === memberId ? { ...m, assignedDevices } : m);
        setMembers(updatedMembers);
        
        if (currentUser && currentUser.id === memberId) {
            setCurrentUser(prevUser => prevUser ? { ...prevUser, assignedDevices } : null);
        }
    };

    // --- Render Logic ---
    // If loading and no user is logged in, show global loader
    if (isLoading && !currentUser) {
        return <LoadingScreen />;
    }

    // If critical error prevents data loading at start
    if (error && !currentUser) { 
        return <LoadingScreen error={error} onRetry={fetchSystemData} />;
    }

    const renderAppContent = () => {
        if (!currentUser) {
            switch (authView) {
                case 'login':
                    return <LoginPage members={members} onLoginSuccess={handleLoginSuccess} onNavigateToSignup={() => setAuthView('signup')} onNavigateToForgotPassword={() => setAuthView('forgotPassword')} />;
                case 'signup':
                    return <SignupPage members={members} onSignup={handleSignup} onSignupSuccess={handleLoginSuccess} onNavigateToLogin={() => setAuthView('login')} />;
                case 'forgotPassword':
                    return <ForgotPasswordPage onForgotPasswordRequest={handleForgotPasswordRequest} onNavigateToLogin={() => setAuthView('login')} />;
                case 'resetPassword':
                    if (userToReset) {
                        return <ResetPasswordPage userToReset={userToReset} onResetPassword={handleResetPassword} onNavigateToLogin={() => { setUserToReset(null); setAuthView('login'); }} />;
                    }
                    setAuthView('login'); return null; // Fallback
                default:
                     return <LoginPage members={members} onLoginSuccess={handleLoginSuccess} onNavigateToSignup={() => setAuthView('signup')} onNavigateToForgotPassword={() => setAuthView('forgotPassword')} />;
            }
        }
        
        if (!profileSelected) {
            return <ProfileSelectionPage currentUser={currentUser} onProfileSelect={handleProfileSelect} onLogout={handleLogout} />;
        }

        return (
            <Dashboard 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                onChangeProfile={handleChangeProfile} 
                devices={devices}
                members={members}
                onAddDevice={handleAddDevice}
                onUpdateDeviceDetails={handleUpdateDeviceDetails}
                onAttachLog={handleAttachLog}
                onAddMember={handleAddMember}
                onUpdateMemberRole={handleUpdateMemberRole}
                onUpdateMemberAssignments={handleUpdateMemberAssignments}
                onRefresh={handleManualRefresh}
            />
        );
    }
    
    return (
        <div className="relative min-h-screen">
            <div className="pb-8"> 
                {renderAppContent()}
            </div>
            <StatusBar />
        </div>
    );
};

export default App;
