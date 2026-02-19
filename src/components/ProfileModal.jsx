import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CyberConfirm from './CyberConfirm';
import CyberAlert from './CyberAlert';

// Internal reusable component for password fields with toggle
const PasswordInput = ({ value, onChange, placeholder, className, required = false, onInvalid, error, t, onFocus }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onInvalid={onInvalid}
                placeholder={placeholder}
                className={`${className} pr-10 ${error ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                required={required}
            />
            {error && (
                <div className="cyber-validation-bubble">
                    {t('auth.messages.input_required')}
                </div>
            )}
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
    const { t, i18n } = useTranslation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null, title: '', variant: '' });
    const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '', variant: 'cyan' });
    const [validationErrors, setValidationErrors] = useState({});

    const handleInvalid = (e, field) => {
        e.preventDefault();
        setValidationErrors(prev => ({ ...prev, [field]: true }));
    };

    const handleInputChange = (field, value, setter) => {
        setter(value);
        clearValidation();
    };

    const clearValidation = () => {
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors({});
        }
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return;

        setConfirmModal({
            show: true,
            title: t('profile.alerts.cypher_confirm'),
            variant: "pink",
            message: t('profile.alerts.cypher_confirm_msg'),
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch('api/auth.php?action=change_password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.cypher_success'),
                            message: t('auth.messages.password_updated'),
                            variant: 'pink'
                        });
                        setCurrentPassword('');
                        setNewPassword('');
                    } else {
                        const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.update_failed');
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: errorMsg,
                            variant: 'pink'
                        });
                    }
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: t('common.net_error'),
                        message: t('profile.messages.net_error'),
                        variant: 'pink'
                    });
                }
            }
        });
    };

    const handleDeleteAccount = async () => {
        setConfirmModal({
            show: true,
            title: t('profile.alerts.security_alert'),
            variant: "pink",
            message: t('profile.alerts.termination_confirm'),
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
                        setMessage(data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('profile.messages.identity_terminated'));
                        onLogout(); // Force logout/reset app
                    } else {
                        const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.termination_failed');
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: errorMsg,
                            variant: 'pink'
                        });
                    }
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: t('profile.alerts.security_alert'),
                        message: t('profile.messages.connection_refused'),
                        variant: 'pink'
                    });
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
        } catch (err) {
            setAlertModal({
                show: true,
                title: t('profile.alerts.security_alert'),
                message: t('profile.messages.fail_init_2fa'),
                variant: 'pink'
            });
        }
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
                setBackupCodes(null);
                if (data.message) setMessage(t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message));
            } else {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.fail_init_email_2fa');
                setAlertModal({
                    show: true,
                    title: t('profile.alerts.security_alert'),
                    message: errorMsg,
                    variant: 'pink'
                });
            }
        } catch (err) {
            setAlertModal({
                show: true,
                title: t('profile.alerts.security_alert'),
                message: t('profile.messages.fail_uplink'),
                variant: 'pink'
            });
        }
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
                setAlertModal({
                    show: true,
                    title: t('profile.alerts.security_alert'),
                    message: t('profile.messages.verify_digits'),
                    variant: 'pink'
                });
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
                setMessage(data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : (setupMethod === 'totp' ? t('profile.messages.2fa_active') : t('profile.messages.email_2fa_active')));
                if (onUserUpdate) onUserUpdate();
            } else {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.invalid_code');
                setAlertModal({
                    show: true,
                    title: t('profile.alerts.security_alert'),
                    message: errorMsg,
                    variant: 'pink'
                });
            }
        } catch (err) {
            console.error("2FA Error:", err);
            setAlertModal({
                show: true,
                title: t('profile.alerts.security_alert'),
                message: t('profile.messages.verify_net_error'),
                variant: 'pink'
            });
        }
    };

    const handleDisable2FA = async () => {
        setConfirmModal({
            show: true,
            title: t('profile.alerts.security_alert'),
            variant: "pink",
            message: t('profile.alerts.disable_2fa_confirm'),
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await fetch('api/auth.php?action=disable_2fa', { method: 'POST' });
                    const data = await res.json();
                    if (res.ok) {
                        setMessage(data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('profile.messages.2fa_disabled'));
                        if (onUserUpdate) onUserUpdate();
                    } else {
                        const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.fail_disable_2fa');
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: errorMsg,
                            variant: 'pink'
                        });
                    }
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: t('profile.alerts.security_alert'),
                        message: t('profile.messages.net_error'),
                        variant: 'pink'
                    });
                }
            }
        });
    };

    const handleUpdateEmail = async (newEmail, password) => {
        setConfirmModal({
            show: true,
            title: t('profile.alerts.security_alert'),
            variant: "purple",
            message: t('profile.alerts.identity_shift'),
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
                        const successMsg = data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('profile.messages.update_failed');
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.cypher_success'),
                            message: successMsg + " " + t('profile.messages.session_restart'),
                            variant: 'pink'
                        });
                        setTimeout(() => onLogout(), 2500);
                    } else {
                        const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('profile.messages.update_failed');
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: errorMsg,
                            variant: 'pink'
                        });
                    }
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: t('common.net_error'),
                        message: t('profile.messages.net_error'),
                        variant: 'pink'
                    });
                }
            }
        });
    };

    const UpdateEmailForm = ({ currentEmail, onUpdate, t }) => {
        const [email, setEmail] = useState(currentEmail || '');
        const [password, setPassword] = useState('');
        const [validationErrors, setValidationErrors] = useState({});

        const handleInvalid = (e, field) => {
            e.preventDefault();
            setValidationErrors(prev => ({ ...prev, [field]: true }));
        };

        const handleInputChange = (field, value, setter) => {
            setter(value);
            clearEmailValidation();
        };

        const clearEmailValidation = () => {
            if (Object.keys(validationErrors).length > 0) {
                setValidationErrors({});
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (email === currentEmail) return;
            onUpdate(email, password);
        };

        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 border border-gray-800 bg-black/20 rounded">
                <div className="relative">
                    <input
                        type="email"
                        placeholder={t('profile.contact.new_placeholder')}
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                        onFocus={(e) => { e.target.select(); clearEmailValidation(); }}
                        onInvalid={(e) => handleInvalid(e, 'email')}
                        className={`input-cyber text-sm w-full ${validationErrors.email ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                        required
                    />
                    {validationErrors.email && (
                        <div className="cyber-validation-bubble">
                            {t('auth.messages.input_required')}
                        </div>
                    )}
                </div>
                <PasswordInput
                    placeholder={t('profile.contact.confirm_password')}
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                    onFocus={clearEmailValidation}
                    onInvalid={(e) => handleInvalid(e, 'password')}
                    error={validationErrors.password}
                    t={t}
                    className="input-cyber text-sm w-full"
                    required
                />
                <button type="submit" className="btn-cyber text-cyber-neonCyan border-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black text-xs self-end">
                    {t('profile.contact.reroute')}
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
        } catch (err) {
            setAlertModal({
                show: true,
                title: t('profile.messages.fail_add_cat'),
                message: t('profile.messages.net_error'),
                variant: 'purple'
            });
        }
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
        } catch (err) {
            setAlertModal({
                show: true,
                title: t('profile.messages.fail_rename_cat'),
                message: t('profile.messages.net_error'),
                variant: 'purple'
            });
        }
    };

    const handleDeleteCategory = async (id) => {
        setConfirmModal({
            show: true,
            title: t('profile.alerts.category_purge'),
            variant: "purple",
            message: t('profile.alerts.category_purge_confirm'),
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
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.category_purge'),
                            message: t('profile.messages.fail_delete_cat'),
                            variant: 'pink'
                        });
                    }
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: t('common.net_error'),
                        message: t('profile.messages.net_error'),
                        variant: 'pink'
                    });
                }
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
        } catch (err) {
            setAlertModal({
                show: true,
                title: t('profile.messages.fail_set_default'),
                message: t('profile.messages.net_error'),
                variant: 'purple'
            });
        }
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
                    <span>{t('profile.title')}:</span>
                    <span className="text-white text-3xl mt-1">{user.username}</span>
                </h2>

                {message && <div className="text-cyber-neonGreen mb-4 font-mono">✓ {message}</div>}
                {error && <div className="text-red-500 mb-4 font-mono">⚠ {error}</div>}

                <div className="space-y-8">

                    {/* Visual Interface / Language */}
                    <div className="border border-cyber-neonCyan/30 bg-cyber-neonCyan/5 p-4 rounded">
                        <h3 className="text-cyber-neonCyan font-bold mb-3 flex items-center gap-2">
                            <span>👁</span> {t('profile.visual_interface')}
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{t('profile.language')}</span>
                            <div className="flex border border-cyber-gray overflow-hidden rounded">
                                <button
                                    onClick={() => i18n.changeLanguage('de')}
                                    className={`text-xs px-3 py-1 transition-colors ${i18n.language === 'de' ? 'bg-cyber-neonCyan text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    DEUTSCH
                                </button>
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={`text-xs px-3 py-1 transition-colors ${i18n.language === 'en' ? 'bg-cyber-neonCyan text-black font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                                >
                                    ENGLISH
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Management */}
                    <div className="border border-cyber-neonPurple/30 bg-cyber-neonPurple/5 p-4 rounded">
                        <h3 className="text-cyber-neonPurple font-bold mb-3 flex items-center gap-2">
                            <span>📂</span> {t('profile.categories.protocols')}
                        </h3>

                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-700">
                                    {editingCatId === cat.id ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSaveRename(cat.id);
                                            }}
                                            className="flex gap-2 w-full"
                                        >
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    value={editingCatName}
                                                    onChange={(e) => handleInputChange(`edit_cat_${cat.id}`, e.target.value, setEditingCatName)}
                                                    onFocus={(e) => e.target.select()}
                                                    onInvalid={(e) => handleInvalid(e, `edit_cat_${cat.id}`)}
                                                    className={`input-cyber text-xs p-1 w-full ${validationErrors[`edit_cat_${cat.id}`] ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                                                    autoFocus
                                                    required
                                                />
                                                {validationErrors[`edit_cat_${cat.id}`] && (
                                                    <div className="cyber-validation-bubble">
                                                        {t('auth.messages.input_required')}
                                                    </div>
                                                )}
                                            </div>
                                            <button type="submit" className="text-green-500 hover:text-green-400">✓</button>
                                            <button type="button" onClick={() => setEditingCatId(null)} className="text-red-500 hover:text-red-400">✕</button>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-300 font-mono text-sm">{cat.name}</span>
                                                {cat.is_default && (
                                                    <span className="text-[10px] bg-cyber-neonCyan/20 text-cyber-neonCyan px-1 rounded border border-cyber-neonCyan/30 animate-pulse font-bold">
                                                        {t('profile.categories.default')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {!cat.is_default && (
                                                    <button onClick={() => handleSetDefault(cat.id)} className="text-gray-500 hover:text-yellow-500" title={t('profile.categories.set_default')}>★</button>
                                                )}
                                                <button onClick={() => handleStartEdit(cat)} className="text-gray-500 hover:text-cyber-neonCyan" title={t('profile.categories.rename')}>✎</button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 hover:text-red-500" title={t('profile.categories.delete')}>🗑</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder={t('profile.categories.new_protocol_placeholder')}
                                    value={newCatName}
                                    onChange={(e) => handleInputChange('new_cat', e.target.value, setNewCatName)}
                                    onFocus={(e) => { e.target.select(); clearValidation(); }}
                                    onInvalid={(e) => handleInvalid(e, 'new_cat')}
                                    className={`input-cyber text-xs w-full ${validationErrors.new_cat ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                                    maxLength={20}
                                    required
                                />
                                {validationErrors.new_cat && (
                                    <div className="cyber-validation-bubble">
                                        {t('auth.messages.input_required')}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn-cyber text-cyber-neonPurple border-cyber-neonPurple hover:bg-cyber-neonPurple hover:text-black text-xs px-3">
                                {t('profile.categories.add')}
                            </button>
                        </form>
                    </div>

                    {/* 2FA Section */}
                    <div className="border border-cyber-neonGreen/30 bg-cyber-neonGreen/5 p-4 rounded shadow-[inset_0_0_15px_rgba(0,255,0,0.05)]">
                        <h3 className="text-cyber-neonGreen font-bold mb-4 flex items-center gap-2 tracking-widest text-sm">
                            <span className="animate-pulse">🛡</span> {t('profile.security.bio_lock')}
                        </h3>

                        {/* PHASE 0: ACTIVE STATUS */}
                        {user.two_factor_enabled && !show2FA && !backupCodes && (
                            <div className="text-center space-y-4 py-2">
                                <p className="text-cyber-neonGreen font-mono text-xs uppercase tracking-[0.2em] border-y border-cyber-neonGreen/20 py-2">
                                    ✓ {t('profile.security.protocols_active')} {user.two_factor_method === 'totp' ? t('profile.security.neural_auth') : t('profile.security.email_uplink')}
                                </p>
                                <button onClick={handleDisable2FA} className="btn-cyber border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-[10px] w-full py-2 transition-all">
                                    {t('profile.security.terminate_protocols')}
                                </button>
                            </div>
                        )}

                        {/* PHASE 1: SELECTION */}
                        {!user.two_factor_enabled && !show2FA && !backupCodes && (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleSetup2FA} className="btn-cyber btn-neon-cyan text-[10px] py-3 uppercase font-bold tracking-tighter">
                                    {t('profile.security.auth_app')}
                                </button>
                                <button onClick={handleSetupEmail2FA} className="btn-cyber btn-neon-purple text-[10px] py-3 uppercase font-bold tracking-tighter">
                                    {t('profile.security.email_security')}
                                </button>
                            </div>
                        )}

                        {/* PHASE 2: SETUP/VERIFICATION */}
                        {show2FA && !backupCodes && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEnable2FA();
                                }}
                                className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                                {setupMethod === 'totp' ? (
                                    <div className="flex flex-col items-center gap-3 bg-black/40 p-3 border border-cyber-neonCyan/20 rounded">
                                        <p className="text-[11px] text-gray-300 uppercase tracking-widest text-center">{t('profile.security.sync_link')}</p>
                                        <div id="qrcode" className="border-2 border-white p-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"></div>
                                        <p className="text-[11px] text-cyber-neonCyan font-mono break-all text-center px-4 py-1 bg-black/60 rounded border border-gray-800">{qrSecret}</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2 py-4 border-y border-cyber-neonPurple/20 bg-cyber-neonPurple/5">
                                        <p className="text-xs text-cyber-neonPurple uppercase font-bold tracking-[0.1em]">{t('profile.security.transmission_sent')}</p>
                                        <p className="text-[11px] text-gray-400 font-mono italic">{t('profile.security.signal_decay')}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 w-full">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder={t('profile.security.verify_code')}
                                            value={twoFaCode}
                                            onChange={e => handleInputChange('two_fa_code', e.target.value, setTwoFaCode)}
                                            onFocus={(e) => { e.target.select(); clearValidation(); }}
                                            onInvalid={e => handleInvalid(e, 'two_fa_code')}
                                            className={`input-cyber text-center w-full text-sm h-10 tracking-[0.3em] font-bold ${validationErrors.two_fa_code ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : 'border-cyber-neonGreen/40'}`}
                                            maxLength={6}
                                            required
                                            autoFocus
                                        />
                                        {validationErrors.two_fa_code && (
                                            <div className="cyber-validation-bubble">
                                                {t('auth.messages.input_required')}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-cyber bg-cyber-neonGreen text-black font-bold text-xs px-6 h-10 shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        {t('profile.security.bridge')}
                                    </button>
                                </div>
                                <button type="button" onClick={clearSetupState} className="text-[11px] text-gray-400 hover:text-white uppercase tracking-widest text-center transition-colors">
                                    {t('profile.security.abort_uplink')}
                                </button>
                            </form>
                        )}

                        {/* PHASE 3: BACKUP FRAGMENTS */}
                        {backupCodes && (
                            <div className="bg-black/60 p-4 border border-cyber-neonCyan rounded-lg space-y-4 animate-in zoom-in-95 duration-300 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
                                <div className="text-center border-b border-cyber-neonCyan/30 pb-3">
                                    <p className="text-cyber-neonPink text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                                        {t('profile.security.critical_backup')}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">{t('profile.security.emergency_override')}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono">
                                    {backupCodes.map((code, i) => (
                                        <div key={i} className="group relative bg-gray-900/80 p-2 border border-gray-800 text-center text-cyber-neonCyan hover:border-cyber-neonCyan transition-all duration-300">
                                            <span className="text-xs tracking-widest">{code}</span>
                                            <div
                                                onClick={() => {
                                                    navigator.clipboard.writeText(code);
                                                    setMessage(t('profile.messages.fragment_copied'));
                                                    setTimeout(() => setMessage(""), 2000);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-cyber-neonCyan/20 backdrop-blur-[1px] transition-opacity cursor-pointer border border-cyber-neonCyan scale-105"
                                            >
                                                <span className="bg-cyber-neonCyan text-black text-[9px] px-2 font-bold uppercase shadow-lg">{t('profile.security.copy_fragment')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={clearSetupState}
                                    className="btn-cyber btn-neon-cyan text-black font-bold text-xs w-full py-3 uppercase shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-[1.02] transition-transform"
                                >
                                    {t('profile.security.uplink_complete')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email Update Section */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-cyber-neonCyan">@</span> {t('profile.contact.channel')}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="text-xs text-gray-400 mb-1">
                                {t('profile.contact.current')} <span className="text-white font-mono">{user.email || 'N/A'}</span>
                            </div>
                            <UpdateEmailForm
                                currentEmail={user.email}
                                onUpdate={(email, pass) => handleUpdateEmail(email, pass)}
                                t={t}
                            />
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-cyber-neonPink">»</span> {t('profile.cypher.update_title')}
                        </h3>
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                            <PasswordInput
                                placeholder={t('profile.cypher.current_placeholder')}
                                value={currentPassword}
                                onChange={(e) => handleInputChange('current_pass', e.target.value, setCurrentPassword)}
                                onFocus={clearValidation}
                                onInvalid={(e) => handleInvalid(e, 'current_pass')}
                                error={validationErrors.current_pass}
                                t={t}
                                className="input-cyber text-sm w-full"
                                required
                            />
                            <PasswordInput
                                placeholder={t('profile.cypher.new_placeholder')}
                                value={newPassword}
                                onChange={(e) => handleInputChange('new_pass', e.target.value, setNewPassword)}
                                onFocus={clearValidation}
                                onInvalid={(e) => handleInvalid(e, 'new_pass')}
                                error={validationErrors.new_pass}
                                t={t}
                                className="input-cyber text-sm w-full"
                                required
                            />
                            <button type="submit" className="btn-cyber btn-neon-cyan text-xs self-end">
                                {t('profile.cypher.execute')}
                            </button>
                        </form>
                    </div>

                    {/* Delete Account Section */}
                    <div className="border border-red-900/50 bg-red-900/10 p-4 rounded">
                        <h3 className="text-red-500 font-bold mb-3 flex items-center gap-2">
                            <span className="text-red-500">⚠</span> {t('profile.danger.title')}
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                            {t('profile.danger.warning')}
                        </p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleDeleteAccount();
                            }}
                            className="flex gap-2"
                        >
                            <PasswordInput
                                placeholder={t('profile.danger.confirm_placeholder')}
                                value={deleteConfirmation}
                                onChange={(e) => handleInputChange('delete_confirm', e.target.value, setDeleteConfirmation)}
                                onFocus={clearValidation}
                                onInvalid={(e) => handleInvalid(e, 'delete_confirm')}
                                error={validationErrors.delete_confirm}
                                t={t}
                                className="input-cyber text-sm flex-1 border-red-900 focus:border-red-500 w-full"
                                required
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-900 text-white hover:bg-red-700 font-bold text-xs transition-colors border border-red-500"
                            >
                                {t('profile.danger.terminate_btn')}
                            </button>
                        </form>
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
            {alertModal.show && (
                <CyberAlert
                    title={alertModal.title}
                    message={alertModal.message}
                    variant={alertModal.variant}
                    onClose={() => setAlertModal({ ...alertModal, show: false })}
                />
            )}
        </div>
    );
};

export default ProfileModal;
