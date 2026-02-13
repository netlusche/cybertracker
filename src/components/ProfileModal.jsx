import React, { useState } from 'react';

const ProfileModal = ({ user, onClose, onLogout }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await fetch('api/auth.php?action=change_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Cypher updated successfully.');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setError(data.error || 'Update failed');
            }
        } catch (err) {
            setError('Connection refused.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("WARNING: TERMINAL ACTION. THIS CANNOT BE UNDONE. PROCEED?")) return;

        try {
            const res = await fetch('api/auth.php?action=delete_account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deleteConfirmation }),
            });
            const data = await res.json();

            if (res.ok) {
                alert('Identity Terminated.');
                onLogout(); // Force logout/reset app
            } else {
                setError(data.error || 'Termination failed');
            }
        } catch (err) {
            setError('Connection refused.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-cyber w-full max-w-lg border-cyber-neonCyan shadow-[0_0_30px_rgba(0,255,255,0.3)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-4 text-gray-500 hover:text-white text-2xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-cyber-neonCyan mb-6 tracking-widest uppercase border-b border-cyber-gray pb-2">
                    OPERATIVE PROFILE: {user.username}
                </h2>

                {message && <div className="text-cyber-neonGreen mb-4 font-mono">✓ {message}</div>}
                {error && <div className="text-red-500 mb-4 font-mono">⚠ {error}</div>}

                <div className="space-y-8">
                    {/* Change Password Section */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-cyber-neonPink">»</span> UPDATE CYPHER
                        </h3>
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                            <input
                                type="password"
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-cyber text-sm"
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-cyber text-sm"
                                required
                            />
                            <button type="submit" className="btn-cyber btn-neon-cyan text-xs self-end">
                                EXECUTE UPDATE
                            </button>
                        </form>
                    </div>

                    {/* Delete Account Section */}
                    <div className="border border-red-900/50 bg-red-900/10 p-4 rounded">
                        <h3 className="text-red-500 font-bold mb-3 flex items-center gap-2">
                            <span className="text-red-500">⚠</span> DANGER ZONE
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                            To terminate this identity and wipe all associated directives, enter your current password below.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="input-cyber text-sm flex-1 border-red-900 focus:border-red-500"
                            />
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-900 text-white hover:bg-red-700 font-bold text-xs transition-colors border border-red-500"
                            >
                                TERMINATE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
