import React, { useState, useEffect } from 'react';
import CyberConfirm from './CyberConfirm';

// Internal reusable component for password fields with toggle
const PasswordInput = ({ value, onChange, placeholder, className, required = false }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${className} pr-10`}
                required={required}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-neonCyan hover:text-white transition-colors p-1"
                tabIndex="-1"
            >
                {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

const ProfileModal = ({ user, onClose, onLogout, onUserUpdate, onCategoryUpdate }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null, title: '', variant: '' });

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
        setConfirmModal({
            show: true,
            title: "SECURITY ALERT",
            variant: "pink",
            message: "WARNING: TERMINAL ACCOUNT TERMINATION DETECTED. ALL DATA WILL BE WIPED FROM THE GRID. PROCEED?",
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch('api/auth.php?action=delete_account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: deleteConfirmation }),
                    });
                    const data = await res.json();

                    if (res.ok) {
                        setMessage('Identity Terminated.');
                        onLogout(); // Force logout/reset app
                    } else {
                        setError(data.error || 'Termination failed');
                    }
                } catch (err) {
                    setError('Connection refused.');
                }
            }
        });
    };

    const [show2FA, setShow2FA] = useState(false);
    const [qrSecret, setQrSecret] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');
    const [twoFaCode, setTwoFaCode] = useState('');
    const [backupCodes, setBackupCodes] = useState(null);
    const [setupMethod, setSetupMethod] = useState('totp'); // 'totp' or 'email'
    const [emailSetupStep, setEmailSetupStep] = useState(1); // 1: choose, 2: verify

    const clearSetupState = () => {
        setShow2FA(false);
        setBackupCodes(null);
        setQrSecret('');
        setQrCodeData('');
        setTwoFaCode('');
        setError('');
        setMessage('');
    };

    const handleSetup2FA = async () => {
        setError('');
        setMessage('');
        try {
            const res = await fetch('api/auth.php?action=setup_2fa');
            const data = await res.json();
            if (res.ok) {
                setQrSecret(data.secret);
                setQrCodeData(data.qr_url);
                setShow2FA(true);
                setSetupMethod('totp');
                setBackupCodes(null);
            }
        } catch (err) { setError("Failed to init 2FA"); }
    };

    const handleSetupEmail2FA = async () => {
        setError('');
        setMessage('');
        try {
            const res = await fetch('api/auth.php?action=setup_email_2fa');
            const data = await res.json();
            if (res.ok) {
                setShow2FA(true);
                setSetupMethod('email');
                setEmailSetupStep(2);
                setBackupCodes(null);
            } else {
                setError(data.error || "Failed to init Email 2FA");
            }
        } catch (err) { setError("Network error during uplink"); }
    };

    React.useEffect(() => {
        if (show2FA && qrCodeData && setupMethod === 'totp' && !backupCodes) {
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
    }, [show2FA, qrCodeData, setupMethod, backupCodes]);

    const handleEnable2FA = async () => {
        setError('');
        setMessage('');
        try {
            const cleanedCode = twoFaCode.replace(/\s/g, '');
            if (cleanedCode.length !== 6) {
                setError("Access code must be 6 digits.");
                return;
            }

            const action = setupMethod === 'totp' ? 'enable_2fa' : 'enable_email_2fa';
            const body = setupMethod === 'totp'
                ? { secret: qrSecret, code: cleanedCode }
                : { code: cleanedCode };

            const res = await fetch(`api/auth.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                setBackupCodes(Array.isArray(data.backup_codes) ? data.backup_codes : []);
                setMessage(setupMethod === 'totp' ? "NEURAL LINK ESTABLISHED. SECURITY MAXIMA." : "EMAIL UPLINK SECURED.");
                if (onUserUpdate) onUserUpdate();
            } else {
                setError(data.error || "Invalid Access Code.");
            }
        } catch (err) {
            console.error("2FA Error:", err);
            setError("Network error during verification");
        }
    };

    const handleDisable2FA = async () => {
        setConfirmModal({
            show: true,
            title: "SECURITY ALERT",
            variant: "pink",
            message: "TERMINATING 2FA WILL REDUCE YOUR DEFENSIVE ENCRYPTION. PROCEED?",
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch('api/auth.php?action=disable_2fa', { method: 'POST' });
                    if (res.ok) {
                        setMessage("2FA DISABLED. SECURITY REDUCED.");
                        if (onUserUpdate) onUserUpdate();
                    } else {
                        setError("Failed to disable 2FA");
                    }
                } catch (err) { setError("Network error"); }
            }
        });
    };

    const handleUpdateEmail = async (newEmail, password) => {
        setConfirmModal({
            show: true,
            title: "SECURITY ALERT",
            variant: "purple",
            message: "IDENTITY FREQUENCY SHIFT DETECTED. RE-ROUTING WILL REQUIRE RE-AUTHENTICATION. JACK IN?",
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch('api/auth.php?action=update_email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: newEmail, password: password })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setMessage(data.message + " SESSION RESTART REQUIRED.");
                        setTimeout(() => onLogout(), 2000);
                    } else {
                        setError(data.error || 'Update failed');
                    }
                } catch (err) { setError("Network error"); }
            }
        });
    };

    const UpdateEmailForm = ({ currentEmail, onUpdate }) => {
        const [email, setEmail] = useState(currentEmail || '');
        const [password, setPassword] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault();
            if (email === currentEmail) return;
            onUpdate(email, password);
        };

        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 border border-gray-800 bg-black/20 rounded">
                <input
                    type="email"
                    placeholder="New Email Frequency"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-cyber text-sm"
                    required
                />
                <PasswordInput
                    placeholder="Confirm Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-cyber text-sm w-full"
                    required
                />
                <button type="submit" className="btn-cyber text-cyber-neonCyan border-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black text-xs self-end">
                    RE-ROUTE FREQUENCY
                </button>
            </form>
        );
    };

    // --- Category Management ---
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatName, setEditingCatName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await fetch('api/categories.php');
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) { console.error("Failed to load categories"); }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            const res = await fetch('api/categories.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCatName })
            });
            if (res.ok) {
                setNewCatName('');
                loadCategories();
                if (onCategoryUpdate) onCategoryUpdate();
            }
        } catch (err) { setError('Failed to add category'); }
    };

    const handleStartEdit = (cat) => {
        setEditingCatId(cat.id);
        setEditingCatName(cat.name);
    };

    const handleSaveRename = async (id) => {
        if (!editingCatName.trim()) return;
        try {
            const res = await fetch('api/categories.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editingCatName })
            });
            if (res.ok) {
                setEditingCatId(null);
                loadCategories();
                if (onCategoryUpdate) onCategoryUpdate();
            }
        } catch (err) { setError('Failed to rename category'); }
    };

    const handleDeleteCategory = async (id) => {
        setConfirmModal({
            show: true,
            title: "CATEGORY PURGE",
            variant: "purple",
            message: "CATEGORY PURGE WILL VOID ALL ASSOCIATED DIRECTIVE VECTORS. PROCEED WITH DELETION?",
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch(`api/categories.php?id=${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        loadCategories();
                        if (onCategoryUpdate) onCategoryUpdate();
                    } else {
                        setError('Failed to delete category (Default one cannot be deleted if only one remains)');
                    }
                } catch (err) { setError('Failed to delete category'); }
            }
        });
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await fetch(`api/categories.php?action=set_default`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                loadCategories();
                if (onCategoryUpdate) onCategoryUpdate();
            }
        } catch (err) { setError('Failed to set default category'); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-cyber w-full max-w-lg border-cyber-neonCyan shadow-[0_0_30px_rgba(0,255,255,0.3)] relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-cyber-neonPink hover:text-white font-bold text-xl"
                >
                    [X]
                </button>

                <h2 className="text-2xl font-bold text-cyber-neonCyan mb-6 tracking-widest uppercase border-b border-cyber-gray pb-2 flex flex-col">
                    <span>OPERATIVE PROFILE:</span>
                    <span className="text-white text-3xl mt-1">{user.username}</span>
                </h2>

                {message && <div className="text-cyber-neonGreen mb-4 font-mono">✓ {message}</div>}
                {error && <div className="text-red-500 mb-4 font-mono">⚠ {error}</div>}

                <div className="space-y-8">

                    {/* Category Management */}
                    <div className="border border-cyber-neonPurple/30 bg-cyber-neonPurple/5 p-4 rounded">
                        <h3 className="text-cyber-neonPurple font-bold mb-3 flex items-center gap-2">
                            <span>📂</span> CATEGORY PROTOCOLS
                        </h3>

                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-700">
                                    {editingCatId === cat.id ? (
                                        <div className="flex gap-2 w-full">
                                            <input
                                                type="text"
                                                value={editingCatName}
                                                onChange={(e) => setEditingCatName(e.target.value)}
                                                className="input-cyber text-xs p-1 flex-1"
                                                autoFocus
                                            />
                                            <button onClick={() => handleSaveRename(cat.id)} className="text-green-500 hover:text-green-400">✓</button>
                                            <button onClick={() => setEditingCatId(null)} className="text-red-500 hover:text-red-400">✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-300 font-mono text-sm">{cat.name}</span>
                                                {cat.is_default && (
                                                    <span className="text-[10px] bg-cyber-neonCyan/20 text-cyber-neonCyan px-1 rounded border border-cyber-neonCyan/30 animate-pulse font-bold">
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {!cat.is_default && (
                                                    <button onClick={() => handleSetDefault(cat.id)} className="text-gray-500 hover:text-yellow-500" title="Set as Default">★</button>
                                                )}
                                                <button onClick={() => handleStartEdit(cat)} className="text-gray-500 hover:text-cyber-neonCyan" title="Rename">✎</button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 hover:text-red-500" title="Delete">🗑</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="NEW PROTOCOL NAME"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                className="input-cyber text-xs flex-1"
                                maxLength={20}
                            />
                            <button type="submit" className="btn-cyber text-cyber-neonPurple border-cyber-neonPurple hover:bg-cyber-neonPurple hover:text-black text-xs px-3">
                                ADD
                            </button>
                        </form>
                    </div>

                    {/* 2FA Section */}
                    <div className="border border-cyber-neonGreen/30 bg-cyber-neonGreen/5 p-4 rounded shadow-[inset_0_0_15px_rgba(0,255,0,0.05)]">
                        <h3 className="text-cyber-neonGreen font-bold mb-4 flex items-center gap-2 tracking-widest text-sm">
                            <span className="animate-pulse">🛡</span> BIO-LOCK SECURITY [2FA]
                        </h3>

                        {/* PHASE 0: ACTIVE STATUS */}
                        {user.two_factor_enabled && !show2FA && !backupCodes && (
                            <div className="text-center space-y-4 py-2">
                                <p className="text-cyber-neonGreen font-mono text-xs uppercase tracking-[0.2em] border-y border-cyber-neonGreen/20 py-2">
                                    ✓ PROTOCOLS ACTIVE: {user.two_factor_method === 'totp' ? 'NEURAL AUTHENTICATOR' : 'EMAIL UPLINK'}
                                </p>
                                <button onClick={handleDisable2FA} className="btn-cyber border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-[10px] w-full py-2 transition-all">
                                    TERMINATE SECURITY PROTOCOLS
                                </button>
                            </div>
                        )}

                        {/* PHASE 1: SELECTION */}
                        {!user.two_factor_enabled && !show2FA && !backupCodes && (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleSetup2FA} className="btn-cyber btn-neon-cyan text-[10px] py-3 uppercase font-bold tracking-tighter">
                                    AUTHENTICATOR APP
                                </button>
                                <button onClick={handleSetupEmail2FA} className="btn-cyber btn-neon-purple text-[10px] py-3 uppercase font-bold tracking-tighter">
                                    EMAIL SECURITY
                                </button>
                            </div>
                        )}

                        {/* PHASE 2: SETUP/VERIFICATION */}
                        {show2FA && !backupCodes && (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {setupMethod === 'totp' ? (
                                    <div className="flex flex-col items-center gap-3 bg-black/40 p-3 border border-cyber-neonCyan/20 rounded">
                                        <p className="text-[11px] text-gray-300 uppercase tracking-widest text-center">Sync Neural Link (Authenticator App):</p>
                                        <div id="qrcode" className="border-2 border-white p-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"></div>
                                        <p className="text-[11px] text-cyber-neonCyan font-mono break-all text-center px-4 py-1 bg-black/60 rounded border border-gray-800">{qrSecret}</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2 py-4 border-y border-cyber-neonPurple/20 bg-cyber-neonPurple/5">
                                        <p className="text-xs text-cyber-neonPurple uppercase font-bold tracking-[0.1em]">Transmission sent to your comm-link.</p>
                                        <p className="text-[11px] text-gray-400 font-mono italic">SIGNAL DECAY: 10 MINUTES</p>
                                    </div>
                                )}

                                <div className="flex gap-2 w-full">
                                    <input
                                        type="text"
                                        placeholder="VERIFY ACCESS CODE"
                                        value={twoFaCode}
                                        onChange={e => setTwoFaCode(e.target.value)}
                                        className="input-cyber text-center flex-1 text-sm h-10 tracking-[0.3em] font-bold border-cyber-neonGreen/40"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleEnable2FA}
                                        className="btn-cyber bg-cyber-neonGreen text-black font-bold text-xs px-6 h-10 shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        BRIDGE
                                    </button>
                                </div>
                                <button type="button" onClick={clearSetupState} className="text-[11px] text-gray-400 hover:text-white uppercase tracking-widest text-center transition-colors">
                                    [ ABORT UPLINK ]
                                </button>
                            </div>
                        )}

                        {/* PHASE 3: BACKUP FRAGMENTS */}
                        {backupCodes && (
                            <div className="bg-black/60 p-4 border border-cyber-neonCyan rounded-lg space-y-4 animate-in zoom-in-95 duration-300 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                                <div className="text-center border-b border-cyber-neonCyan/30 pb-3">
                                    <p className="text-cyber-neonPink text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                                        ⚠ CRITICAL: SECURE BACKUP FRAGMENTS ⚠
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">Emergency Override only. Store in Analog format.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono">
                                    {backupCodes.map((code, i) => (
                                        <div key={i} className="group relative bg-gray-900/80 p-2 border border-gray-800 text-center text-cyber-neonCyan hover:border-cyber-neonCyan transition-all duration-300">
                                            <span className="text-xs tracking-widest">{code}</span>
                                            <div
                                                onClick={() => {
                                                    navigator.clipboard.writeText(code);
                                                    setMessage("FRAGMENT COPIED");
                                                    setTimeout(() => setMessage(""), 2000);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-cyber-neonCyan/20 backdrop-blur-[1px] transition-opacity cursor-pointer border border-cyber-neonCyan scale-105"
                                            >
                                                <span className="bg-cyber-neonCyan text-black text-[9px] px-2 font-bold uppercase shadow-lg">COPY FRAGMENT</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={clearSetupState}
                                    className="btn-cyber btn-neon-cyan text-black font-bold text-xs w-full py-3 uppercase shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-[1.02] transition-transform"
                                >
                                    UPLINK SECURED & COMPLETE
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email Update Section */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-cyber-neonCyan">@</span> CONTACT CHANNEL
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="text-xs text-gray-400 mb-1">
                                Current: <span className="text-white font-mono">{user.email || 'N/A'}</span>
                            </div>
                            <UpdateEmailForm
                                currentEmail={user.email}
                                onUpdate={(email, pass) => handleUpdateEmail(email, pass)}
                            />
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-cyber-neonPink">»</span> UPDATE CYPHER
                        </h3>
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                            <PasswordInput
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input-cyber text-sm w-full"
                                required
                            />
                            <PasswordInput
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-cyber text-sm w-full"
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
                            <PasswordInput
                                placeholder="Confirm Password"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="input-cyber text-sm flex-1 border-red-900 focus:border-red-500 w-full"
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

            {confirmModal.show && (
                <CyberConfirm
                    title={confirmModal.title}
                    variant={confirmModal.variant}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' })}
                />
            )}
        </div>
    );
};

export default ProfileModal;
