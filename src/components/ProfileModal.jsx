import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CyberConfirm from './CyberConfirm';
import CyberAlert from './CyberAlert';
import { useTheme } from '../utils/ThemeContext';
import { apiFetch } from '../utils/api';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
                className={`${className} pr-10 input-normal-case ${error ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-primary hover:text-white transition-colors p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyber-primary focus-visible:outline-offset-2"
                data-tooltip-content={show ? t('tooltip.hide_password', 'Hide Password') : t('tooltip.show_password', 'Show Password')}
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



const ProfileModal = ({ user, onClose, onLogout, onUserUpdate, onCategoryUpdate, taskStatuses, onStatusUpdate }) => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const modalRef = useRef(null);
    useFocusTrap(modalRef);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null, title: '', variant: '' });
    const [alertModal, setAlertModal] = useState({ show: false, message: '', title: '', variant: 'cyan' });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                e.stopImmediatePropagation();
                if (onClose) onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

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
        if (!currentPassword || !newPassword || !confirmNewPassword) return;

        if (newPassword !== confirmNewPassword) {
            setAlertModal({
                show: true,
                title: t('profile.alerts.security_alert'),
                message: t('auth.messages.password_mismatch', 'Passwords do not match'),
                variant: 'pink'
            });
            return;
        }

        setConfirmModal({
            show: true,
            title: t('profile.alerts.cypher_confirm'),
            variant: "pink",
            message: t('profile.alerts.cypher_confirm_msg'),
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await apiFetch('api/index.php?route=auth/change_password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.cypher_success'),
                            message: t('auth.messages.password_updated') + " " + t('profile.messages.session_restart'),
                            variant: 'pink'
                        });
                        setTimeout(() => onLogout(), 2500);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
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
                    const res = await apiFetch('api/index.php?route=auth/delete_account', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: deleteConfirmation }),
                    });
                    const data = await res.json();

                    if (res.ok) {
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('profile.messages.identity_terminated'),
                            variant: 'pink',
                            onClose: () => {
                                onLogout();
                            }
                        });
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
            const res = await apiFetch('api/index.php?route=auth/setup_2fa');
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
            const res = await apiFetch('api/index.php?route=auth/setup_email_2fa');
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

            const res = await apiFetch(`api/index.php?route=auth/${action}`, {
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
                    const res = await apiFetch('api/index.php?route=auth/disable_2fa', { method: 'POST' });
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
                    const res = await apiFetch('api/index.php?route=auth/update_email', {
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
                        className={`input-cyber text-sm w-full input-normal-case ${validationErrors.email ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
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
                <button type="submit" className="btn-cyber text-cyber-primary border border-cyber-primary hover:bg-cyber-primary hover:text-black text-xs self-end">
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

    // --- Task Status Management ---
    const [newStatusName, setNewStatusName] = useState('');
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [editingStatusName, setEditingStatusName] = useState('');

    // --- WebCal Management ---
    const [calendarToken, setCalendarToken] = useState('');

    useEffect(() => {
        loadCategories();
        loadCalendarToken();
    }, []);

    const loadCalendarToken = async () => {
        try {
            const res = await apiFetch('api/index.php?route=user/calendar_token');
            const data = await res.json();
            if (res.ok && data.token) {
                setCalendarToken(data.token);
            }
        } catch (err) { console.error("Failed to load calendar token"); }
    };

    const handleRegenerateWebCalToken = async () => {
        const doGenerate = async () => {
            try {
                const res = await apiFetch('api/index.php?route=user/calendar_token', { method: 'POST' });
                const data = await res.json();
                if (res.ok) {
                    setCalendarToken(data.token);
                    setMessage(t('profile.webcal.generated_success', 'NEW WEBCAL LINK GENERATED'));
                    setTimeout(() => setMessage(''), 3000);
                } else {
                    setAlertModal({
                        show: true,
                        title: t('profile.alerts.security_alert'),
                        message: data.error || 'Failed to generate token',
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
        };

        if (calendarToken) {
            setConfirmModal({
                show: true,
                title: t('profile.alerts.security_alert'),
                variant: "purple",
                message: t('profile.alerts.webcal_regenerate_confirm', 'Are you sure? This will revoke access for all matching active feeds until you update them with the new link.'),
                onConfirm: async () => {
                    setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                    await doGenerate();
                }
            });
        } else {
            await doGenerate();
        }
    };

    const loadCategories = async () => {
        try {
            const res = await apiFetch('api/index.php?route=categories');
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) { console.error("Failed to load categories"); }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            const res = await apiFetch('api/index.php?route=categories', {
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
            const res = await apiFetch('api/index.php?route=categories', {
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
                    const res = await apiFetch(`api/index.php?route=categories&id=${id}`, {
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
            const res = await apiFetch(`api/index.php?route=categories/set_default`, {
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

    const handleAddStatus = async (e) => {
        e.preventDefault();
        if (!newStatusName.trim()) return;
        try {
            const res = await apiFetch('api/index.php?route=task_statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStatusName })
            });
            if (res.ok) {
                setNewStatusName('');
                if (onStatusUpdate) onStatusUpdate();
            } else {
                const data = await res.json();
                setAlertModal({
                    show: true,
                    title: t('profile.alerts.security_alert'),
                    message: data.error || 'Failed to add status',
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
    };

    const handleStartEditStatus = (status) => {
        if (status.is_system) return;
        setEditingStatusId(status.id);
        setEditingStatusName(status.name);
    };

    const handleSaveRenameStatus = async (id) => {
        if (!editingStatusName.trim()) return;
        try {
            const res = await apiFetch('api/index.php?route=task_statuses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editingStatusName })
            });
            if (res.ok) {
                setEditingStatusId(null);
                if (onStatusUpdate) onStatusUpdate();
            } else {
                const data = await res.json();
                setAlertModal({
                    show: true,
                    title: t('profile.alerts.security_alert'),
                    message: data.error || 'Failed to rename status',
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
    };

    const handleDeleteStatus = async (id) => {
        setConfirmModal({
            show: true,
            title: t('profile.alerts.security_alert'),
            variant: "purple",
            message: t('profile.alerts.status_purge_confirm', 'Are you sure you want to delete this status? Tasks with this status will revert to OPEN.'),
            onConfirm: async () => {
                setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' });
                try {
                    const res = await apiFetch(`api/index.php?route=task_statuses&id=${id}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        if (onStatusUpdate) onStatusUpdate();
                    } else {
                        setAlertModal({
                            show: true,
                            title: t('profile.alerts.security_alert'),
                            message: 'Failed to delete task status',
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

    const handleMoveStatus = async (index, direction) => {
        if (!taskStatuses) return;
        const newStatuses = [...taskStatuses];

        // Cannot move system status open/completed
        if (newStatuses[index].is_system) return;

        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= newStatuses.length) return;

        // Don't swap past "open" (index 0) or "completed" (last element)
        if (newStatuses[targetIndex].is_system) return;

        // Swap the array elements
        const temp = newStatuses[index];
        newStatuses[index] = newStatuses[targetIndex];
        newStatuses[targetIndex] = temp;

        // Reassign sort_orders sequentially 
        // Keep the same sort_orders but apply to the new arrangement
        const updatedOrder = newStatuses.map((s, i) => ({
            id: s.id,
            sort_order: i + 1
        }));

        try {
            const res = await apiFetch('api/index.php?route=task_statuses/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: updatedOrder })
            });
            if (res.ok) {
                if (onStatusUpdate) onStatusUpdate();
            }
        } catch (err) {
            console.error("Failed to reorder statuses", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transform-gpu flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="card-cyber w-full max-w-lg border-cyber-primary shadow-cyber-primary relative max-h-[90vh] flex flex-col p-1 overflow-x-hidden">
                <button
                    data-testid="profile-close-btn"
                    onClick={onClose}
                    className={`absolute font-bold text-xl transition-colors z-50 ${theme === 'lcars' ? 'top-0 right-0 bg-[#ffaa00] text-black px-3 py-1 rounded-tr-[1.5rem] hover:brightness-110' : `top-1 ${(theme === 'matrix' || theme === 'weyland' || theme === 'cyberpunk') ? 'right-6' : 'right-1'} text-cyber-secondary hover:text-white`}`}
                    data-tooltip-content={t('tooltip.close', 'Close')}
                    data-tooltip-pos="left"
                >
                    [X]
                </button>
                <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1 relative p-4 pl-5">

                    <h2 data-testid="modal-title" className="text-2xl font-bold text-cyber-primary mb-6 tracking-widest uppercase border-b border-cyber-gray pb-2 flex flex-col pt-2">
                        <span>{t('profile.title')}:</span>
                        <span className="text-white text-3xl mt-1">{user.username}</span>
                    </h2>

                    {message && <div className="text-cyber-success mb-4 font-mono">✓ {message}</div>}
                    {error && <div className="text-red-500 mb-4 font-mono">⚠ {error}</div>}

                    <div className="space-y-8">



                        {/* Category Management */}
                        <div className="border border-cyber-primary/30 bg-cyber-primary/5 p-4 rounded">
                            <h3 className="text-cyber-primary font-bold mb-3 flex items-center gap-2">
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
                                                        className={`input-cyber text-xs p-1 w-full input-normal-case ${validationErrors[`edit_cat_${cat.id}`] ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
                                                        autoFocus
                                                        required
                                                    />
                                                    {validationErrors[`edit_cat_${cat.id}`] && (
                                                        <div className="cyber-validation-bubble">
                                                            {t('auth.messages.input_required')}
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="submit" className="text-cyber-success hover:text-green-400">✓</button>
                                                <button type="button" onClick={() => setEditingCatId(null)} className="text-red-500 hover:text-red-400">✕</button>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-300 font-mono text-sm">{cat.name}</span>
                                                    {cat.is_default && (
                                                        <span className="text-[10px] bg-cyber-primary/20 text-cyber-primary px-1 rounded border border-cyber-primary/30 animate-pulse font-bold">
                                                            {t('profile.categories.default')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {!cat.is_default && (
                                                        <button onClick={() => handleSetDefault(cat.id)} className="text-gray-500 hover:text-yellow-500" data-tooltip-content={t('tooltip.set_default', 'Set Default')}>★</button>
                                                    )}
                                                    <button onClick={() => handleStartEdit(cat)} className="text-gray-500 hover:text-cyber-primary" data-tooltip-content={t('tooltip.rename', 'Rename')}>✎</button>
                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-500 hover:text-red-500 bg-cyber-danger/10 hover:bg-cyber-danger text-white rounded w-6 h-6 flex items-center justify-center hover:brightness-110 transition-colors" data-tooltip-content={t('tooltip.delete', 'Delete')} data-tooltip-pos="left">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
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
                                        className={`input-cyber text-xs w-full input-normal-case ${validationErrors.new_cat ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
                                        maxLength={20}
                                        required
                                    />
                                    {validationErrors.new_cat && (
                                        <div className="cyber-validation-bubble">
                                            {t('auth.messages.input_required')}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="btn-cyber text-cyber-primary border-cyber-primary hover:bg-cyber-primary hover:text-black text-xs px-3" data-tooltip-content={t('tooltip.add_task', 'Add')}>
                                    {t('profile.categories.add')}
                                </button>
                            </form>
                        </div>

                        {/* Task Status Management */}
                        {taskStatuses && (
                            <div className="border border-cyber-accent/30 bg-cyber-accent/5 p-4 rounded">
                                <h3 className="text-cyber-accent font-bold mb-3 flex items-center gap-2 tracking-widest text-sm">
                                    <span>🚦</span> {t('profile.task_statuses_tab', 'WORKFLOW STATUSES')}
                                </h3>

                                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                    {taskStatuses.map((status, index) => (
                                        <div key={status.id} className={`flex items-center justify-between p-2 rounded border ${status.is_system ? 'bg-black/80 border-gray-800' : 'bg-black/40 border-gray-700'}`}>
                                            {editingStatusId === status.id ? (
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        handleSaveRenameStatus(status.id);
                                                    }}
                                                    className="flex gap-2 w-full"
                                                >
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            data-testid="edit-status-input"
                                                            value={editingStatusName}
                                                            onChange={(e) => handleInputChange(`edit_status_${status.id}`, e.target.value, setEditingStatusName)}
                                                            onFocus={(e) => e.target.select()}
                                                            onInvalid={(e) => handleInvalid(e, `edit_status_${status.id}`)}
                                                            className={`input-cyber text-xs p-1 w-full input-normal-case ${validationErrors[`edit_status_${status.id}`] ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
                                                            autoFocus
                                                            required
                                                        />
                                                        {validationErrors[`edit_status_${status.id}`] && (
                                                            <div className="cyber-validation-bubble">
                                                                {t('auth.messages.input_required')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button type="submit" className="text-cyber-success hover:text-green-400">✓</button>
                                                    <button type="button" onClick={() => setEditingStatusId(null)} className="text-red-500 hover:text-red-400">✕</button>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        {status.is_system && (
                                                            <span className="text-[10px] text-gray-500 font-mono w-4">🔒</span>
                                                        )}
                                                        {!status.is_system && (
                                                            <div className="flex flex-col gap-1 w-4 mr-1">
                                                                {index > 1 && (
                                                                    <button onClick={() => handleMoveStatus(index, -1)} className="text-[8px] text-gray-500 hover:text-cyber-accent" data-tooltip-pos="right" data-tooltip-content={t('tooltip.move_up', 'Move Up')}>▲</button>
                                                                )}
                                                                {index < taskStatuses.length - 2 && (
                                                                    <button onClick={() => handleMoveStatus(index, 1)} className="text-[8px] text-gray-500 hover:text-cyber-accent" data-tooltip-pos="right" data-tooltip-content={t('tooltip.move_down', 'Move Down')}>▼</button>
                                                                )}
                                                            </div>
                                                        )}
                                                        <span className={`${status.is_system ? 'text-gray-500' : 'text-gray-300'} font-mono text-sm uppercase tracking-widest`}>
                                                            {status.is_system ? t(`tasks.status_${status.name.toLowerCase().replace(' ', '_')}`, status.name) : status.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!status.is_system && (
                                                            <>
                                                                <button onClick={() => handleStartEditStatus(status)} className="text-gray-500 hover:text-cyber-accent" data-tooltip-content={t('tooltip.rename', 'Rename')}>✎</button>
                                                                <button onClick={() => handleDeleteStatus(status.id)} className="text-gray-500 hover:text-red-500 bg-cyber-danger/10 hover:bg-cyber-danger text-white rounded w-6 h-6 flex items-center justify-center hover:brightness-110 transition-colors" data-tooltip-content={t('tooltip.delete', 'Delete')} data-tooltip-pos="left">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddStatus} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            data-testid="add-status-input"
                                            placeholder={t('profile.task_statuses.new_status_placeholder', 'NEW STATUS NAME')}
                                            value={newStatusName}
                                            onChange={(e) => handleInputChange('new_status', e.target.value, setNewStatusName)}
                                            onFocus={(e) => { e.target.select(); clearValidation(); }}
                                            onInvalid={(e) => handleInvalid(e, 'new_status')}
                                            className={`input-cyber text-xs w-full input-normal-case ${validationErrors.new_status ? 'border-cyber-secondary shadow-cyber-secondary' : ''}`}
                                            maxLength={30}
                                            required
                                        />
                                        {validationErrors.new_status && (
                                            <div className="cyber-validation-bubble">
                                                {t('auth.messages.input_required')}
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" data-testid="add-status-btn" className="btn-cyber text-cyber-accent border-cyber-accent hover:bg-cyber-accent hover:text-black text-xs px-3" data-tooltip-content={t('tooltip.add', 'Add')}>
                                        {t('profile.task_statuses.add', 'ADD')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* 2FA Section */}
                        <div className="border border-cyber-success/30 bg-cyber-success/5 p-4 rounded shadow-[inset_0_0_15px_rgba(0,255,0,0.05)]">
                            <h3 className="text-cyber-success font-bold mb-4 flex items-center gap-2 tracking-widest text-sm">
                                <span className="animate-pulse">🛡</span> {t('profile.security.bio_lock')}
                            </h3>

                            {/* PHASE 0: ACTIVE STATUS */}
                            {user.two_factor_enabled && !show2FA && !backupCodes && (
                                <div className="text-center space-y-4 py-2">
                                    <p className="text-cyber-success font-mono text-xs uppercase tracking-[0.2em] border-y border-cyber-success/20 py-2">
                                        ✓ {t('profile.security.protocols_active')} {user.two_factor_method === 'totp' ? t('profile.security.neural_auth') : t('profile.security.email_uplink')}
                                    </p>
                                    <button onClick={handleDisable2FA} className="btn-cyber border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-[10px] w-full py-2 transition-all btn-cyber-primary">
                                        {t('profile.security.terminate_protocols')}
                                    </button>
                                </div>
                            )}

                            {/* PHASE 1: SELECTION */}
                            {!user.two_factor_enabled && !show2FA && !backupCodes && (
                                <div className="space-y-3">
                                    {user.system_enforces_email_2fa && (
                                        <div className="bg-cyber-accent/20 border border-cyber-accent p-2 rounded text-center animate-pulse">
                                            <p className="text-cyber-accent text-[10px] font-bold tracking-widest uppercase">
                                                {t('profile.security.system_enforced', 'SYSTEM DIRECTIVE: EMAIL UPLINK ENFORCED')}
                                            </p>
                                            <p className="text-gray-300 text-[9px] mt-1">
                                                {t('profile.security.system_enforced_desc', 'Admins have mandated 2FA. You are currently on the fallback. Initialize a full uplink below.')}
                                            </p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={handleSetup2FA} className="btn-cyber btn-cyber-primary text-[10px] py-3 uppercase font-bold tracking-tighter" data-tooltip-content={t('tooltip.setup_app_2fa', 'Setup Authenticator App')}>
                                            {t('profile.security.auth_app')}
                                        </button>
                                        <button onClick={handleSetupEmail2FA} className="btn-cyber btn-cyber-accent text-[10px] py-3 uppercase font-bold tracking-tighter" data-tooltip-content={t('tooltip.setup_email_2fa', 'Setup Email 2FA')}>
                                            {t('profile.security.email_security')}
                                        </button>
                                    </div>
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
                                        <div className="flex flex-col items-center gap-3 bg-black/40 p-3 border border-cyber-primary/20 rounded">
                                            <p className="text-[11px] text-gray-300 uppercase tracking-widest text-center">{t('profile.security.sync_link')}</p>
                                            <div id="qrcode" className="border-2 border-white p-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"></div>
                                            <p className="text-[11px] text-cyber-primary font-mono break-all text-center px-4 py-1 bg-black/60 rounded border border-gray-800">{qrSecret}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-2 py-4 border-y border-cyber-accent/20 bg-cyber-accent/5">
                                            <p className="text-xs text-cyber-accent uppercase font-bold tracking-[0.1em]">{t('profile.security.transmission_sent')}</p>
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
                                                className={`input-cyber text-center w-full text-sm h-10 tracking-[0.3em] font-bold input-normal-case ${validationErrors.two_fa_code ? 'border-cyber-secondary shadow-cyber-secondary' : 'border-cyber-success/40'}`}
                                                maxLength={6}
                                                data-testid="2fa-setup-code-input"
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
                                            className="btn-cyber bg-cyber-success text-black font-bold text-xs px-6 h-10 shadow-cyber-success hover:brightness-110 active:scale-95 transition-all"
                                            data-tooltip-content={t('tooltip.verify_2fa', 'Verify Access Code')}
                                            data-testid="2fa-setup-verify-btn"
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
                                <div className="bg-black/60 p-4 border border-cyber-primary rounded-lg space-y-4 animate-in zoom-in-95 duration-300 shadow-cyber-primary">
                                    <div className="text-center border-b border-cyber-primary/30 pb-3">
                                        <p className="text-cyber-secondary text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                                            {t('profile.security.critical_backup')}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">{t('profile.security.emergency_override')}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 font-mono">
                                        {backupCodes.map((code, i) => (
                                            <div key={i} className="group relative bg-gray-900/80 p-2 border border-gray-800 text-center text-cyber-primary hover:border-cyber-primary transition-all duration-300">
                                                <span className="text-xs tracking-widest">{code}</span>
                                                <div
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(code);
                                                        setMessage(t('profile.messages.fragment_copied'));
                                                        setTimeout(() => setMessage(""), 2000);
                                                    }}
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-cyber-primary/20 backdrop-blur-[1px] transform-gpu transition-opacity cursor-pointer border border-cyber-primary scale-105"
                                                >
                                                    <span className="bg-cyber-primary text-black text-[9px] px-2 font-bold uppercase shadow-lg">{t('profile.security.copy_fragment')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearSetupState}
                                        className="btn-cyber btn-cyber-primary text-black font-bold text-xs w-full py-3 uppercase shadow-cyber-primary hover:scale-[1.02] transition-transform"
                                    >
                                        {t('profile.security.uplink_complete')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Update Section */}
                        <div>
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="text-cyber-primary">@</span> {t('profile.contact.channel')}
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

                        {/* WebCal Comlink Section */}
                        <div className="border border-cyber-accent/30 bg-cyber-accent/5 p-4 rounded">
                            <h3 className="text-cyber-accent font-bold mb-3 flex items-center gap-2 tracking-widest text-sm">
                                <span>📅</span> {t('profile.webcal.title', 'WEBCAL COMLINK')}
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">
                                {t('profile.webcal.description', 'Subscribe to an active feed of your open directives in any compatible Calendar application.')}
                            </p>

                            <div className="flex flex-col gap-3">
                                {calendarToken ? (
                                    <>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/api/index.php?route=calendar/feed&token=${calendarToken}`}
                                                className="input-cyber text-xs w-full p-2 bg-black/50 font-mono text-gray-300 cursor-copy"
                                                onClick={(e) => {
                                                    e.target.select();
                                                    navigator.clipboard.writeText(e.target.value);
                                                    setMessage(t('profile.webcal.copied', 'FEED URL COPIED'));
                                                    setTimeout(() => setMessage(''), 3000);
                                                }}
                                                title={t('tooltip.click_to_copy', 'Click to copy')}
                                            />
                                        </div>
                                        <button
                                            onClick={handleRegenerateWebCalToken}
                                            className="btn-cyber border-cyber-danger text-cyber-danger hover:bg-cyber-danger hover:text-white text-xs py-2 px-4 self-start"
                                        >
                                            {t('profile.webcal.regenerate', 'REGENERATE LINK / REVOKE ACCESS')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleRegenerateWebCalToken}
                                        className="btn-cyber btn-cyber-accent text-xs py-2 px-4 self-start"
                                    >
                                        {t('profile.webcal.generate', 'GENERATE WEBCAL LINK')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Theme Selection Overlay */}
                        <div className="border border-cyber-primary/30 bg-cyber-primary/5 p-4 rounded">
                            <h3 className="text-cyber-primary font-bold mb-4 flex items-center gap-2">
                                <span>👁</span> {t('profile.theme_selection')}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div data-tooltip-content={t('profile.themes.cyberpunk', 'CYBERPUNK')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-cyberpunk"
                                        onClick={() => setTheme('cyberpunk')}
                                        className={`theme-preview-card theme-cyberpunk transition-all duration-300 relative ${theme === 'cyberpunk' ? 'border border-[#00ffff] bg-[#00ffff]/20 shadow-[0_0_20px_rgba(0,255,255,0.4)] scale-[1.02]' : 'border-[#4b5563] bg-[#0a0a0a] hover:border-[#6b7280] scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            <div className="w-12 h-6 bg-[#00ffff]/20 border border-[#00ffff] relative relative">
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#ff00ff] animate-pulse shadow-[0_0_10px_#ff00ff,0_0_20px_#ff00ff]"></div>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-widest font-preview-cyberpunk ${theme === 'cyberpunk' ? 'text-[#00ffff]' : 'text-[#9ca3af]'}`}>
                                                {t('profile.themes.cyberpunk', 'CYBERPUNK')}
                                            </span>
                                        </div>
                                        {theme === 'cyberpunk' && (
                                            <div className="absolute top-0 right-0 bg-[#00ffff] text-[#000000] font-bold text-[8px] px-2 py-0.5 transform rotate-45 translate-x-3 translate-y-[-2px] z-20">
                                                ACTIVE
                                            </div>
                                        )}
                                    </button>
                                </div>

                                <div data-tooltip-content={t('profile.themes.lcars', 'LCARS')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-lcars"
                                        onClick={() => setTheme('lcars')}
                                        className={`theme-preview-card theme-lcars rounded-2xl transition-all duration-300 relative ${theme === 'lcars' ? 'border-[3px] border-[#ffcc33] bg-[#000000] scale-[1.02]' : 'border-[3px] border-[#4b5563] bg-[#0a0a0a] hover:border-[#6b7280] scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            <div className="w-12 h-6 bg-[#ffcc33] rounded-full flex items-center px-1">
                                                <div className="w-3 h-3 bg-[#000000] rounded-full"></div>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-widest font-preview-lcars ${theme === 'lcars' ? 'text-[#ffffff]' : 'text-[#9ca3af]'}`}>
                                                {t('profile.themes.lcars', 'LCARS')}
                                            </span>
                                        </div>
                                        {theme === 'lcars' && (
                                            <div className="absolute top-0 right-0 bg-[#ffcc33] text-[#000000] font-bold text-[8px] px-2 py-0.5 transform rotate-45 translate-x-3 translate-y-[-2px] z-20">
                                                ACTIVE
                                            </div>
                                        )}
                                    </button>
                                </div>

                                <div data-tooltip-content={t('profile.themes.matrix', 'MATRIX')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-matrix"
                                        onClick={() => setTheme('matrix')}
                                        className={`theme-preview-card theme-matrix transition-all duration-300 relative ${theme === 'matrix' ? 'border border-[#00ff41] bg-[#00ff41]/10 shadow-[0_0_20px_rgba(0,255,65,0.4)] scale-[1.02]' : 'border-[#4b5563] bg-[#0a0a0a] hover:border-[#6b7280] scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            <div className="text-[14px] text-[#00ff41] font-bold animate-pulse font-preview-matrix">
                                                &gt;_
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-widest font-preview-matrix ${theme === 'matrix' ? 'text-[#00ff41]' : 'text-[#9ca3af]'}`}>
                                                {t('profile.themes.matrix', 'MATRIX')}
                                            </span>
                                        </div>
                                        {theme === 'matrix' && (
                                            <div className="absolute top-0 right-0 bg-[#00ff41] text-[#000000] font-bold text-[8px] px-2 py-0.5 transform rotate-45 translate-x-3 translate-y-[-2px] z-20">
                                                ACTIVE
                                            </div>
                                        )}
                                    </button>
                                </div>

                                <div data-tooltip-content={t('profile.themes.weyland', 'WEY-YU')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-weyland"
                                        onClick={() => setTheme('weyland')}
                                        className={`theme-preview-card theme-weyland transition-all duration-300 relative ${theme === 'weyland' ? 'border border-[#ffb000] bg-[#ffb000]/10 shadow-[0_0_20px_rgba(255,176,0,0.4)] scale-[1.02]' : 'border-[#4b5563] bg-[#0a0a0a] hover:border-[#6b7280] scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            <div className="text-[14px] text-[#ffb000] font-bold tracking-[0.2em] font-preview-weyland opacity-80">
                                                W-Y
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-widest font-preview-weyland ${theme === 'weyland' ? 'text-[#ffb000]' : 'text-[#9ca3af]'}`}>
                                                {t('profile.themes.weyland', 'WEY-YU')}
                                            </span>
                                        </div>
                                        {theme === 'weyland' && (
                                            <div className="absolute top-0 right-0 bg-[#ffb000] text-[#000000] font-bold text-[8px] px-2 py-0.5 transform rotate-45 translate-x-3 translate-y-[-2px] z-20">
                                                ACTIVE
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* v2.1.0 Themes */}
                                {/* PIP-BOY Theme — RobCo Terminal CRT */}
                                <div data-tooltip-content={t('profile.themes.robco', 'PIP-BOY')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-robco"
                                        onClick={() => setTheme('robco')}
                                        className={`theme-preview-card theme-robco transition-all duration-300 relative ${theme === 'robco' ? 'border-2 border-green-500 bg-[#001100] shadow-[0_0_20px_rgba(26,255,26,0.5)] scale-[1.02]' : 'border-gray-700 bg-[#001100] hover:border-green-900 scale-100'}`}
                                    >
                                        {/* Scanline overlay */}
                                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)', zIndex: 5 }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="font-mono text-green-500 text-[10px] leading-tight text-center opacity-80">
                                                <div>ROBCO IND.</div>
                                                <div className="text-[8px] opacity-60">UNIFIED OS v1.4</div>
                                            </div>
                                            <div className="w-6 h-[1px] bg-green-500/40 my-0.5" />
                                            <span className={`text-[9px] font-bold tracking-[0.2em] font-mono flex items-center gap-1 ${theme === 'robco' ? 'text-green-400' : 'text-green-900'}`}>
                                                <span className="animate-pulse">▋</span> PIP-BOY
                                            </span>
                                        </div>
                                        {theme === 'robco' && (
                                            <div className="absolute top-0 right-0 bg-green-500 text-black font-bold text-[7px] px-1.5 py-0.5 font-mono">
                                                ✓ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* THE GRID Theme — TRON */}
                                <div data-tooltip-content={t('profile.themes.grid', 'THE GRID')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-grid"
                                        onClick={() => setTheme('grid')}
                                        className={`theme-preview-card theme-grid transition-all duration-300 relative ${theme === 'grid' ? 'border border-[#6fc3df] bg-[#020d1a] shadow-[0_0_20px_rgba(111,195,223,0.5),inset_0_0_20px_rgba(111,195,223,0.05)] scale-[1.02]' : 'border-[#1f2937] bg-[#020d1a] hover:border-[#6fc3df]/30 scale-100'}`}
                                    >
                                        {/* Background grid lines */}
                                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(111,195,223,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(111,195,223,0.5) 1px, transparent 1px)', backgroundSize: '12px 12px', zIndex: 1 }} />
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            {/* TRON disk */}
                                            <div className="relative w-9 h-9 flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-2 border-[#6fc3df] shadow-[0_0_8px_#6fc3df,inset_0_0_8px_rgba(111,195,223,0.2)]" />
                                                <div className="absolute inset-[6px] rounded-full border border-[#6fc3df]/60" />
                                                <div className="w-2 h-2 rounded-full bg-[#6fc3df] shadow-[0_0_6px_#6fc3df]" />
                                            </div>
                                            <span className={`text-[9px] font-bold tracking-[0.25em] ${theme === 'grid' ? 'text-[#6fc3df]' : 'text-[#6fc3df]/40'}`}>
                                                THE GRID
                                            </span>
                                        </div>
                                        {theme === 'grid' && (
                                            <div className="absolute top-0 right-0 bg-[#6fc3df] text-[#000000] font-bold text-[7px] px-1.5 py-0.5">
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* GHOST Theme — Section 9 */}
                                <div data-tooltip-content={t('profile.themes.section9', 'SECTION 9')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-section9"
                                        onClick={() => setTheme('section9')}
                                        className={`theme-preview-card theme-section9 transition-all duration-300 relative ${theme === 'section9' ? 'border-l-4 border-[#34e2e2] bg-[#0e0e12] shadow-[0_0_15px_rgba(52,226,226,0.3)] scale-[1.02]' : 'border-[#1f2937] bg-[#0e0e12] hover:border-[#34e2e2]/20 scale-100'}`}
                                    >
                                        {/* Glitch scan line */}
                                        <div className="absolute left-0 right-0 h-[1px] bg-[#34e2e2]/30 top-[40%] pointer-events-none z-5" />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="text-[16px] opacity-80 leading-none" style={{ color: '#34e2e2', textShadow: '0 0 8px #34e2e2, 2px 0 8px rgba(255,0,255,0.3)' }}>
                                                攻殻
                                            </div>
                                            <div className="text-[8px] italic tracking-widest" style={{ color: '#34e2e2', opacity: 0.5 }}>
                                                SEC∙9
                                            </div>
                                            <span className={`text-[9px] font-bold tracking-[0.2em] mt-0.5 ${theme === 'section9' ? 'text-[#34e2e2]' : 'text-[#4b5563]'}`}>
                                                GHOST
                                            </span>
                                        </div>
                                        {theme === 'section9' && (
                                            <div className="absolute top-0 right-0 bg-[#34e2e2] text-[#000000] font-bold text-[7px] px-1.5 py-0.5">
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* OUTRUN Theme — Retro Synthwave */}
                                <div data-tooltip-content={t('profile.themes.outrun', 'OUTRUN')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-outrun"
                                        onClick={() => setTheme('outrun')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'outrun' ? 'scale-[1.02]' : 'scale-100 hover:scale-[1.01]'}`}
                                        style={{
                                            background: 'linear-gradient(180deg, #1a0033 0%, #0d0021 40%, #1a0033 100%)',
                                            border: theme === 'outrun' ? '1px solid transparent' : '1px solid #444',
                                            borderImage: theme === 'outrun' ? 'linear-gradient(135deg, #ff00ff, #00ffff) 1' : 'none',
                                            boxShadow: theme === 'outrun' ? '0 0 20px rgba(255,0,255,0.4), 0 0 40px rgba(0,255,255,0.15)' : 'none',
                                        }}
                                    >
                                        {/* Sunset gradient sky */}
                                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,0,128,0.15) 0%, rgba(255,100,0,0.08) 35%, transparent 60%)', zIndex: 1 }} />
                                        {/* Horizon grid lines */}
                                        <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none relative" style={{ zIndex: 2 }}>
                                            <div style={{ width: '100%', height: '100%', backgroundImage: 'linear-gradient(transparent 0%, rgba(255,0,255,0.3) 100%), repeating-linear-gradient(90deg, rgba(255,0,255,0.2) 0px, rgba(255,0,255,0.2) 1px, transparent 1px, transparent 16px)', backgroundSize: '100% 100%, 100% 100%' }} />
                                        </div>
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            {/* Retro sun */}
                                            <div className="relative w-8 h-4 relative mb-0.5">
                                                <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, #ff9900 0%, #ff00ff 100%)', boxShadow: '0 0 10px rgba(255,0,255,0.6)', transform: 'translateY(25%)' }} />
                                                <div className="absolute left-0 right-0 h-[1px] bg-[#1a0033]" style={{ top: '45%' }} />
                                                <div className="absolute left-0 right-0 h-[1px] bg-[#1a0033]" style={{ top: '60%' }} />
                                                <div className="absolute left-0 right-0 h-[1px] bg-[#1a0033]" style={{ top: '75%' }} />
                                            </div>
                                            <span className={`text-[9px] font-black italic tracking-[0.2em] ${theme === 'outrun' ? '' : 'opacity-50'}`} style={{ background: 'linear-gradient(90deg, #ff00ff, #00ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                                OUTRUN
                                            </span>
                                        </div>
                                        {/* Fixed ACTIVE badge — small pill in corner instead of rotated (relative would clip it) */}
                                        {theme === 'outrun' && (
                                            <div className="absolute top-1 right-1 text-black font-bold text-[7px] px-1.5 py-0.5 rounded-sm z-20" style={{ background: 'linear-gradient(90deg, #ff00ff, #00ffff)' }}>
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Steampunk Theme */}
                                <div data-tooltip-content={t('profile.themes.steampunk', 'STEAMPUNK')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-steampunk"
                                        onClick={() => setTheme('steampunk')}
                                        className={`theme-preview-card theme-steampunk transition-all duration-300 relative ${theme === 'steampunk' ? 'border-2 border-[#c49e5d] shadow-[0_0_15px_rgba(196,158,93,0.4)] scale-[1.02]' : 'border border-[#3d2010] hover:border-[#c49e5d]/50 scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-2 relative z-10 w-full h-full justify-center">
                                            <div className="text-[14px] font-bold tracking-[0.15em]" style={{ color: '#c49e5d' }}>
                                                ⚙️
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-widest ${theme === 'steampunk' ? 'text-[#c49e5d]' : 'text-[#9ca3af]'}`}>
                                                STEAMPUNK
                                            </span>
                                        </div>
                                        {theme === 'steampunk' && (
                                            <div className="absolute top-0 right-0 bg-[#c49e5d] text-[#000000] font-bold text-[8px] px-2 py-0.5 transform rotate-45 translate-x-3 translate-y-[-2px] z-20">
                                                ACTIVE
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* FORCE Theme — Star Wars */}
                                <div data-tooltip-content={t('profile.themes.force', 'THE FORCE')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-force"
                                        onClick={() => setTheme('force')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'force' ? 'scale-[1.02] border-2 border-[#cc4422]' : 'border-[#1f2937] bg-[#0a0a0a] hover:border-[#cc4422]/40 scale-100'}`}
                                        style={{ background: '#05070a' }}
                                    >
                                        {/* Starfield effect */}
                                        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(1px 1px at 10px 10px, #fff, transparent), radial-gradient(1px 1px at 30px 40px, #fff, transparent), radial-gradient(1px 1px at 50px 20px, #fff, transparent)', backgroundSize: '60px 60px' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="relative w-10 h-1 bg-[#cc4422] rounded-full shadow-[0_0_10px_#cc4422]" style={{ transform: 'rotate(-45deg)' }} />
                                            <span className={`text-[9px] font-bold tracking-[0.2em] mt-2 ${theme === 'force' ? 'text-[#cc4422]' : 'text-[#9ca3af]'}`}>
                                                FORCE
                                            </span>
                                        </div>
                                        {theme === 'force' && (
                                            <div className="absolute top-0 right-0 bg-[#cc4422] text-[#ffffff] font-bold text-[7px] px-1.5 py-0.5">
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* ARRAKIS Theme — Dune */}
                                <div data-tooltip-content={t('profile.themes.arrakis', 'ARRAKIS')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-arrakis"
                                        onClick={() => setTheme('arrakis')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'arrakis' ? 'scale-[1.02] border-2 border-[#d97706]' : 'border-[#1f2937] bg-[#1c1917] hover:border-[#d97706]/40 scale-100'}`}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 100% 0%, #d97706 0%, transparent 70%)' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            {/* Arrakis Sun */}
                                            <div className="w-8 h-8 rounded-full bg-[#d97706] shadow-[0_0_15px_#d97706]" />
                                            <span className={`text-[9px] font-bold tracking-[0.2em] mt-1 ${theme === 'arrakis' ? 'text-[#d97706]' : 'text-[#78350f]'}`}>
                                                ARRAKIS
                                            </span>
                                        </div>
                                        {theme === 'arrakis' && (
                                            <div className="absolute top-0 right-0 bg-[#d97706] text-[#000000] font-bold text-[7px] px-1.5 py-0.5">
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* RENAISSANCE Theme — Deus Ex */}
                                <div data-tooltip-content={t('profile.themes.renaissance', 'RENAISSANCE')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-renaissance"
                                        onClick={() => setTheme('renaissance')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'renaissance' ? 'scale-[1.02] border-2 border-[#ffb000]' : 'border-[#1f2937] bg-[#000000] hover:border-[#ffb000]/40 scale-100'}`}
                                    >
                                        {/* Hex pattern bg */}
                                        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='17' viewBox='0 0 20 17' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 8.5L5 0h10l5 8.5L15 17H5L0 8.5z' fill='none' stroke='%23ffb000' stroke-width='1'/%3E%3C/svg%3E\")", backgroundSize: '10px 8.5px' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="grid grid-cols-2 gap-0.5 rotate-45">
                                                <div className="w-2.5 h-2.5 bg-[#ffb000]/80 shadow-[0_0_5px_#ffb000]" />
                                                <div className="w-2.5 h-2.5 border border-[#ffb000]/50" />
                                                <div className="w-2.5 h-2.5 border border-[#ffb000]/50" />
                                                <div className="w-2.5 h-2.5 bg-[#ffb000]/80 shadow-[0_0_5px_#ffb000]" />
                                            </div>
                                            <span className={`text-[9px] font-bold tracking-[0.15em] mt-2 ${theme === 'renaissance' ? 'text-[#ffb000]' : 'text-[#4b5563]'}`}>
                                                RENAISSANCE
                                            </span>
                                        </div>
                                        {theme === 'renaissance' && (
                                            <div className="absolute top-0 right-0 bg-[#ffb000] text-[#000000] font-bold text-[7px] px-1.5 py-0.5">
                                                ◉ ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Klingon Empire Theme (Qo'noS) */}
                                <div data-tooltip-content={t('profile.themes.klingon', "QO'NOS")} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-klingon"
                                        onClick={() => setTheme('klingon')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'klingon' ? 'scale-[1.02] border-2 border-[#ff0000] shadow-[0_0_15px_rgba(255,0,0,0.6)]' : 'border-[#4a0000] bg-[#140000] hover:border-[#ff0000]/60 scale-100'}`}
                                    >
                                        {/* Aggressive bg stripes */}
                                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ff0000 0px, #ff0000 2px, transparent 2px, transparent 8px)' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-8 h-8 relative flex items-center justify-center">
                                                <div className="absolute w-full h-full border-t-2 border-b-2 border-[#ff0000] rounded-full transform rotate-45 shadow-[0_0_5px_#ff0000]"></div>
                                                <div className="absolute w-2 h-full bg-[#ff0000] transform skew-x-12 shadow-[0_0_5px_#ff0000]"></div>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-[0.2em] mt-2 uppercase ${theme === 'klingon' ? 'text-[#ff0000]' : 'text-[#880000]'}`} style={{ fontFamily: "'Wallpoet', sans-serif" }}>
                                                QO'NOS
                                            </span>
                                        </div>
                                        {theme === 'klingon' && (
                                            <div className="absolute top-0 right-0 bg-[#ff0000] text-black font-bold text-[7px] px-1.5 py-0.5" style={{ fontFamily: "'Wallpoet', sans-serif" }}>
                                                BAT'LETH ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Game of Thrones Theme (Ice & Fire) */}
                                <div data-tooltip-content={t('profile.themes.got', 'WESTEROS')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-got"
                                        onClick={() => setTheme('got')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'got' ? 'scale-[1.02] border-2 border-[#8cb8cc] shadow-[0_0_15px_rgba(140,184,204,0.6)]' : 'border-[#1f3041] bg-[#111a24] hover:border-[#8cb8cc]/60 scale-100'}`}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at center, #8cb8cc 2px, transparent 2px)', backgroundSize: '15px 15px' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-8 h-8 relative flex items-center justify-center border-l border-r border-[#8cb8cc]">
                                                <div className="w-1 h-full bg-[#8cb8cc] shadow-[0_0_5px_#8cb8cc]"></div>
                                                <div className="absolute w-full h-1 bg-[#c0392b] shadow-[0_0_5px_#c0392b]"></div>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-[0.1em] mt-2 uppercase ${theme === 'got' ? 'text-[#8cb8cc]' : 'text-[#9ca3af]'}`} style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                                                WESTEROS
                                            </span>
                                        </div>
                                        {theme === 'got' && (
                                            <div className="absolute top-0 right-0 bg-[#8cb8cc] text-[#000000] font-bold text-[7px] px-1.5 py-0.5" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                                                WINTER
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Marvel Theme (Comic Halftone) */}
                                <div data-tooltip-content={t('profile.themes.marvel', 'COMIC')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-marvel"
                                        onClick={() => setTheme('marvel')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'marvel' ? 'scale-[1.02] border-[3px] border-[#e62429] bg-[#1a1a1a]' : 'border-[3px] border-[#1f2937] bg-[#111111] hover:border-[#e62429]/60 scale-100'}`}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'radial-gradient(#e62429 20%, transparent 20%)', backgroundSize: '10px 10px' }} />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-8 h-8 relative flex items-center justify-center bg-[#e62429] shadow-[2px_2px_0px_#f0e442]">
                                                <span className="text-[#ffffff] font-bold text-lg" style={{ fontFamily: "'Bangers', cursive" }}>M</span>
                                            </div>
                                            <span className={`text-[12px] font-bold tracking-[0.05em] mt-2 uppercase ${theme === 'marvel' ? 'text-[#ffffff]' : 'text-[#6b7280]'}`} style={{ fontFamily: "'Bangers', cursive" }}>
                                                COMIC
                                            </span>
                                        </div>
                                        {theme === 'marvel' && (
                                            <div className="absolute -top-1 -right-1 bg-[#f0e442] text-[#000000] font-bold text-[9px] px-2 py-0.5 border-2 border-[#e62429] shadow-[1px_1px_0px_#e62429] transform rotate-12" style={{ fontFamily: "'Bangers', cursive" }}>
                                                POW!
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* DC Theme (Gotham Dark) */}
                                <div data-tooltip-content={t('profile.themes.dc', 'GOTHAM')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-dc"
                                        onClick={() => setTheme('dc')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'dc' ? 'scale-[1.02] border-2 border-[#005ce6] shadow-[0_0_15px_rgba(0,92,230,0.6)]' : 'border-[#1a1a33] bg-[#0a0a14] hover:border-[#005ce6]/60 scale-100'}`}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-b from-transparent to-[#005ce6]/20" />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-8 h-8 relative flex items-center justify-center border-t-2 border-[#ffcc00] rounded-t-full shadow-[0_0_10px_#ffcc00]">
                                                <div className="absolute top-1 w-6 h-6 border-l-2 border-r-2 border-[#005ce6] transform scale-x-75"></div>
                                            </div>
                                            <span className={`text-[12px] font-bold tracking-[0.1em] mt-2 uppercase ${theme === 'dc' ? 'text-[#d9d9e6]' : 'text-[#6b7280]'}`} style={{ fontFamily: "'Anton', sans-serif" }}>
                                                GOTHAM
                                            </span>
                                        </div>
                                        {theme === 'dc' && (
                                            <div className="absolute top-0 right-0 bg-[#005ce6] text-[#ffffff] font-bold text-[8px] px-1.5 py-0.5" style={{ fontFamily: "'Anton', sans-serif" }}>
                                                NIGHT
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Computerwelt Theme (Kraftwerk 1981) */}
                                <div data-tooltip-content={t('profile.themes.computerwelt', 'COMPUTERWELT')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-computerwelt"
                                        onClick={() => setTheme('computerwelt')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'computerwelt' ? 'scale-[1.02] border-2 border-[#33ff33] shadow-[0_0_15px_rgba(51,255,51,0.6)]' : 'border-[#1e1e1e] bg-[#0a0a0a] hover:border-[#33ff33]/60 scale-100'}`}
                                    >
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-full flex items-center justify-center border-y border-[#33ff33] bg-[#111111] py-1">
                                                <span className="text-[#33ff33] text-[10px] tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>1 2 3 4</span>
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-[0.1em] mt-2 uppercase ${theme === 'computerwelt' ? 'text-[#33ff33]' : 'text-[#6b7280]'}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                {t('profile.themes.computerwelt', 'COMPUTERWELT')}
                                            </span>
                                        </div>
                                        {theme === 'computerwelt' && (
                                            <div className="absolute top-0 right-0 bg-[#33ff33] text-[#000000] font-bold text-[8px] px-1.5 py-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                                AKTIV
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Mensch-Maschine Theme (Kraftwerk 1978) */}
                                <div data-tooltip-content={t('profile.themes.mensch-maschine', 'MASCHINE')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-mensch-maschine"
                                        onClick={() => setTheme('mensch-maschine')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'mensch-maschine' ? 'scale-[1.02] border-2 border-[#ff0000] shadow-[0_0_15px_rgba(255,0,0,0.6)]' : 'border-[#333333] bg-[#000000] hover:border-[#ff0000]/60 scale-100'}`}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-[#ff0000]/20 to-transparent" />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="flex px-2 py-1 bg-[#ff0000] text-[#ffffff] tracking-[0.2em] font-bold text-[8px]" style={{ fontFamily: "'Antonio', sans-serif" }}>
                                                MENSCH
                                            </div>
                                            <span className={`text-[10px] font-bold tracking-[0.1em] uppercase mt-1 ${theme === 'mensch-maschine' ? 'text-[#ffffff]' : 'text-[#6b7280]'}`} style={{ fontFamily: "'Antonio', sans-serif" }}>
                                                {t('profile.themes.mensch-maschine', 'MASCHINE')}
                                            </span>
                                        </div>
                                        {theme === 'mensch-maschine' && (
                                            <div className="absolute top-0 right-0 bg-[#ffffff] text-[#000000] font-bold text-[8px] px-1.5 py-0.5" style={{ fontFamily: "'Antonio', sans-serif" }}>
                                                ON
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Neon Syndicate Theme (Synthwave) */}
                                <div data-tooltip-content={t('profile.themes.neon-syndicate', 'SYNDICATE')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-neon-syndicate"
                                        onClick={() => setTheme('neon-syndicate')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'neon-syndicate' ? 'scale-[1.02] border-2 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.6)]' : 'border-[#330066] bg-[#0b001a] hover:border-[#ff00ff]/60 scale-100'}`}
                                    >
                                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#00ffff]/20 to-transparent pointer-events-none" />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="text-[#00ffff] font-black italic text-[14px]" style={{ fontFamily: "'Righteous', cursive", textShadow: '0 0 5px #00ffff' }}>
                                                NEON
                                            </div>
                                            <span className={`text-[9px] tracking-[0.1em] uppercase ${theme === 'neon-syndicate' ? 'text-[#ff00ff]' : 'text-[#ff00ff]/50'}`} style={{ fontFamily: "'Righteous', cursive", textShadow: theme === 'neon-syndicate' ? '0 0 8px #ff00ff' : 'none' }}>
                                                {t('profile.themes.neon-syndicate', 'SYNDICATE')}
                                            </span>
                                        </div>
                                        {theme === 'neon-syndicate' && (
                                            <div className="absolute top-0 right-0 bg-[#00ffff] text-black font-bold text-[8px] px-1.5 py-0.5" style={{ fontFamily: "'Righteous', cursive" }}>
                                                PLAY
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Megacorp Executive Theme (Light Mode) */}
                                <div data-tooltip-content={t('profile.themes.megacorp-executive', 'MEGACORP')} className="w-full relative">
                                    <button
                                        data-testid="theme-switch-megacorp-executive"
                                        onClick={() => setTheme('megacorp-executive')}
                                        className={`theme-preview-card transition-all duration-300 relative ${theme === 'megacorp-executive' ? 'scale-[1.02] border border-[#212529] shadow-[0_4px_6px_rgba(0,0,0,0.1)]' : 'border-[#dee2e6] bg-[#f8f9fa] hover:border-[#adb5bd] scale-100'}`}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-[#0dcaf0]" />
                                        <div className="flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
                                            <div className="w-6 h-6 border-2 border-[#212529] flex items-center justify-center mb-1">
                                                <div className="w-2 h-2 bg-[#0dcaf0]" />
                                            </div>
                                            <span className={`text-[9px] font-bold tracking-tight uppercase ${theme === 'megacorp-executive' ? 'text-[#212529]' : 'text-[#6c757d]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                                                {t('profile.themes.megacorp-executive', 'MEGACORP')}
                                            </span>
                                        </div>
                                        {theme === 'megacorp-executive' && (
                                            <div className="absolute bottom-1 right-1 bg-[#212529] text-white font-bold text-[7px] px-1.5 py-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                                                EXEC
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div>
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <span className="text-cyber-secondary">»</span> {t('profile.cypher.update_title')}
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
                                <PasswordInput
                                    placeholder={t('profile.cypher.confirm_new_placeholder', 'Confirm new password')}
                                    value={confirmNewPassword}
                                    onChange={(e) => handleInputChange('confirm_new_pass', e.target.value, setConfirmNewPassword)}
                                    onFocus={clearValidation}
                                    onInvalid={(e) => handleInvalid(e, 'confirm_new_pass')}
                                    error={validationErrors.confirm_new_pass || (confirmNewPassword && newPassword !== confirmNewPassword)}
                                    t={t}
                                    className={`input-cyber text-sm w-full ${confirmNewPassword && newPassword !== confirmNewPassword ? 'border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : ''}`}
                                    required
                                />
                                <button type="submit" className="btn-cyber btn-cyber-primary text-xs self-end">
                                    {t('profile.cypher.execute')}
                                </button>
                            </form>
                        </div>

                        {/* Delete Account Section */}
                        <div className="border border-cyber-danger/50 bg-red-900/10 p-4 rounded">
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
                                className="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
                            >
                                <div className="flex-grow">
                                    <PasswordInput
                                        placeholder={t('profile.danger.confirm_placeholder')}
                                        value={deleteConfirmation}
                                        onChange={(e) => handleInputChange('delete_confirm', e.target.value, setDeleteConfirmation)}
                                        onFocus={clearValidation}
                                        onInvalid={(e) => handleInvalid(e, 'delete_confirm')}
                                        error={validationErrors.delete_confirm}
                                        t={t}
                                        className="input-cyber text-sm w-full border-red-900 focus:border-red-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-900 text-white font-bold text-xs transition-colors border border-red-500 whitespace-nowrap btn-terminate"
                                >
                                    {t('profile.danger.terminate_btn')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {
                confirmModal.show && (
                    <CyberConfirm
                        title={confirmModal.title}
                        variant={confirmModal.variant}
                        message={confirmModal.message}
                        onConfirm={confirmModal.onConfirm}
                        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null, title: '', variant: '' })}
                    />
                )
            }
            {
                alertModal.show && (
                    <CyberAlert
                        title={alertModal.title}
                        message={alertModal.message}
                        variant={alertModal.variant}
                        onClose={() => {
                            setAlertModal({ ...alertModal, show: false });
                            if (alertModal.onClose) alertModal.onClose();
                        }}
                    />
                )
            }
        </div >
    );
};

export default ProfileModal;
