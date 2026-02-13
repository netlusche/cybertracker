import React, { useState } from 'react';

const ProfileModal = ({ user, onClose, onLogout, onUserUpdate }) => {
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

    const [show2FA, setShow2FA] = useState(false);
    const [qrSecret, setQrSecret] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [twoFaCode, setTwoFaCode] = useState('');

    const handleSetup2FA = async () => {
        try {
            const res = await fetch('api/auth.php?action=setup_2fa');
            const data = await res.json();
            if (res.ok) {
                setQrSecret(data.secret);
                setQrCodeData(data.qr_url);
                setShow2FA(true);
            }
        } catch (err) { setError("Failed to init 2FA"); }
    };

    React.useEffect(() => {
        if (show2FA && qrCodeData) {
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer) {
                qrContainer.innerHTML = "";
                // eslint-disable-next-line no-undef
                new QRCode(qrContainer, {
                    text: qrCodeData,
                    width: 128,
                    height: 128,
                    colorDark: "#00FFFF",
                    colorLight: "#000000",
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        }
    }, [show2FA, qrCodeData]);

    const handleEnable2FA = async () => {
        try {
            const res = await fetch('api/auth.php?action=enable_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: qrSecret, code: twoFaCode })
            });
            if (res.ok) {
                setMessage("2FA ACTIVATED. SECURITY LEVEL: MAX.");
                setShow2FA(false);
                if (onUserUpdate) onUserUpdate();
            } else {
                setError("Invalid Code.");
            }
        } catch (err) { setError("Network error"); }
    };

    const handleDisable2FA = async () => {
        if (!confirm("Disable Two-Factor Authentication? Security level will be reduced.")) return;
        try {
            const res = await fetch('api/auth.php?action=disable_2fa', { method: 'POST' });
            if (res.ok) {
                setMessage("2FA DISABLED. SECURITY REDUCED.");
                if (onUserUpdate) onUserUpdate();
            } else {
                setError("Failed to disable 2FA");
            }
        } catch (err) { setError("Network error"); }
    };


    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-cyber w-full max-w-lg border-cyber-neonCyan shadow-[0_0_30px_rgba(0,255,255,0.3)] relative max-h-[90vh] overflow-y-auto">
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

                    {/* 2FA Section */}
                    <div className="border border-cyber-neonGreen/30 bg-cyber-neonGreen/5 p-4 rounded">
                        <h3 className="text-cyber-neonGreen font-bold mb-3 flex items-center gap-2">
                            <span>🛡</span> TWO-FACTOR AUTH
                        </h3>
                        {user.two_factor_enabled ? (
                            <div className="text-center">
                                <p className="text-cyber-neonGreen mb-4 font-mono text-sm">
                                    ✓ SECURITY PROTOCOLS ACTIVE
                                </p>
                                <button onClick={handleDisable2FA} className="btn-cyber border-red-500 text-red-500 hover:bg-red-900/50 text-xs w-full">
                                    DISABLE 2FA SECURITY
                                </button>
                            </div>
                        ) : (
                            !show2FA ? (
                                <button onClick={handleSetup2FA} className="btn-cyber btn-neon-cyan text-xs w-full">
                                    ENABLE 2FA SECURITY
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs text-gray-300">Scan with Google Authenticator:</p>
                                    <div id="qrcode" className="border-4 border-white p-2 bg-white"></div>
                                    <p className="text-xs text-cyber-neonCyan font-mono tracking-widest">{qrSecret}</p>

                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            placeholder="000 000"
                                            value={twoFaCode}
                                            onChange={e => setTwoFaCode(e.target.value)}
                                            className="input-cyber text-center flex-1"
                                            maxLength={6}
                                        />
                                        <button onClick={handleEnable2FA} className="btn-cyber bg-cyber-neonGreen text-black font-bold text-xs">
                                            VERIFY
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

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
