
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProfileSelectionPage from './components/ProfileSelectionPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { Member, UserRole, Device } from './types';
import { mockMembers } from './data/mock-members';
import { mockDevices } from './data/mock-devices';


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [profileSelected, setProfileSelected] = useState<boolean>(false);
    const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword' | 'resetPassword'>('login');
    const [userToReset, setUserToReset] = useState<Member | null>(null);


    // --- Centralized State Management ---
    const [devices, setDevices] = useState<Device[]>(() => {
        const saved = localStorage.getItem('fleetDevices');
        return saved ? JSON.parse(saved) : mockDevices;
    });

    const [members, setMembers] = useState<Member[]>(() => {
        const saved = localStorage.getItem('fleetMembers');
        return saved ? JSON.parse(saved) : mockMembers;
    });

    // --- Data Persistence Effects ---
    useEffect(() => {
        // Exclude large log file content from being persisted to localStorage
        // to prevent exceeding storage quotas and causing crashes.
        const devicesToPersist = devices.map(device => {
            const { logFileContent, ...restOfDevice } = device;
            return restOfDevice;
        });
        localStorage.setItem('fleetDevices', JSON.stringify(devicesToPersist));
    }, [devices]);

    useEffect(() => {
        localStorage.setItem('fleetMembers', JSON.stringify(members));
    }, [members]);

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
                console.error("Critical Error: Logged-in user not found in the master list. Forcing logout.");
                handleLogout();
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
                // Fallback if userToReset is null
                setAuthView('login');
                return null;
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
            onAttachLog={handleAttachLog}
            onAddMember={handleAddMember}
            onUpdateMemberRole={handleUpdateMemberRole}
            onUpdateMemberAssignments={handleUpdateMemberAssignments}
        />
    );
};

export default App;
