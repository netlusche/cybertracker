import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { triggerNeonConfetti } from '../utils/confetti';
import { useTheme } from '../utils/ThemeContext';
import HelpModal from './HelpModal';
import CyberAlert from './CyberAlert';


const AuthForm = ({ onLogin }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('totp');
    const [twoFaCode, setTwoFaCode] = useState('');

    // Forgot Password State
    const [isForgot, setIsForgot] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const [alert, setAlert] = useState({ show: false, message: '', title: '', variant: 'cyan', onClose: null });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});


    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        if (loading) return;
        setLoading(true);
        setError('');

        if (requires2FA) {
            handle2FAVerify();
            return;
        }

        if (isForgot) {
            handleForgotSubmit();
            return;
        }

        const endpoint = isLogin ? 'api/auth.php?action=login' : 'api/auth.php?action=register';
        const body = isLogin ? { username, password } : { username, password, email };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('auth.messages.fail_auth');
                setAlert({
                    show: true,
                    title: t('auth.security_check'),
                    message: errorMsg,
                    variant: 'pink'
                });
                return;
            }

            if (isLogin) {
                if (data.requires_2fa) {
                    setRequires2FA(true);
                    setTwoFactorMethod(data.two_factor_method || 'totp');
                } else {
                    triggerNeonConfetti(theme);
                    onLogin(data.user);
                }
            } else {
                setIsLogin(true);
                setAlert({
                    show: true,
                    title: t('auth.alerts.id_established'),
                    message: data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('auth.alerts.uplink_required'),
                    variant: 'cyan'
                });
            }


        } catch (err) {
            setAlert({
                show: true,
                title: t('auth.messages.system_error'),
                message: t('auth.messages.network_failure'),
                variant: 'pink'
            });
        } finally {
            setLoading(false);
        }
    };

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

    const handleForgotSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('api/auth.php?action=request_password_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                const successMsg = data.message ? t(`auth.messages.${data.message.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.message) : t('auth.messages.transmission_sent');
                setAlert({
                    show: true,
                    title: t('auth.alerts.transmission_sent'),
                    message: successMsg,
                    variant: 'pink',
                    onClose: () => {
                        setIsForgot(false);
                        setAlert(prev => ({ ...prev, show: false }));
                    }
                });
            } else {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('auth.messages.request_failed');
                setAlert({
                    show: true,
                    title: t('auth.recover_entry'),
                    message: errorMsg,
                    variant: 'pink'
                });
            }
        } catch (err) {
            setAlert({
                show: true,
                title: t('auth.recover_entry'),
                message: t('auth.messages.request_failed'),
                variant: 'pink'
            });
        } finally {
            setLoading(false);
        }
    };

    const handle2FAVerify = async () => {
        setLoading(true);
        try {
            const res = await fetch('api/auth.php?action=verify_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: twoFaCode })
            });
            const data = await res.json();

            if (res.ok) {
                triggerNeonConfetti(theme);
                onLogin(data.user);
            } else {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('auth.messages.invalid_access_code');
                setAlert({
                    show: true,
                    title: t('auth.security_check'),
                    message: errorMsg,
                    variant: 'pink'
                });
            }
        } catch (err) {
            setAlert({
                show: true,
                title: t('auth.security_check'),
                message: t('auth.messages.validation_error'),
                variant: 'pink'
            });
        }
        finally { setLoading(false); }
    };

    const handleResendEmail2FA = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('api/auth.php?action=resend_email_2fa', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setAlert({
                    show: true,
                    title: t('auth.alerts.signal_redispatched'),
                    message: t('auth.alerts.emergency_code_sent'),
                    variant: 'cyan'
                });
            } else {
                const errorMsg = data.error ? t(`auth.messages.${data.error.toLowerCase().replace(/[\s\W]+/g, '_')}`, data.error) : t('auth.messages.uplink_failed');
                setAlert({
                    show: true,
                    title: t('auth.security_check'),
                    message: errorMsg,
                    variant: 'pink'
                });
            }
        } catch (err) {
            setAlert({
                show: true,
                title: t('auth.security_check'),
                message: t('auth.messages.network_failure'),
                variant: 'pink'
            });
        }
        finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="card-cyber w-full max-w-md p-8 relative overflow-hidden">
                <h2 className="text-2xl font-bold text-center mb-6 text-cyber-neonCyan tracking-widest uppercase">
                    {requires2FA ? t('auth.security_check') : (isForgot ? t('auth.recover_entry') : (isLogin ? t('auth.title') : t('auth.new_identity')))}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!requires2FA && !isForgot && (
                        <>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={!isLogin ? t('auth.codename_only') : t('auth.codename')}
                                    value={username}
                                    onChange={(e) => handleInputChange('username', e.target.value, setUsername)}
                                    onFocus={(e) => { e.target.select(); clearValidation(); }}
                                    onInvalid={(e) => handleInvalid(e, 'username')}
                                    className={`input-cyber text-center tracking-widest w-full input-normal-case ${validationErrors.username ? 'border-cyber-neonPink' : ''}`}
                                    required={!isForgot}
                                    autoFocus
                                />
                                {validationErrors.username && (
                                    <div className="cyber-validation-bubble">
                                        {t('auth.messages.input_required')}
                                    </div>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder={t('auth.comlink_only')}
                                        value={email}
                                        onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                                        onFocus={(e) => { e.target.select(); clearValidation(); }}
                                        onInvalid={(e) => handleInvalid(e, 'email')}
                                        className={`input-cyber text-center tracking-widest w-full input-normal-case ${validationErrors.email ? 'border-cyber-neonPink' : ''}`}
                                        required
                                    />
                                    {validationErrors.email && (
                                        <div className="cyber-validation-bubble">
                                            {t('auth.messages.input_required')}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.access_key')}
                                    value={password}
                                    onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                                    onFocus={(e) => { e.target.select(); clearValidation(); }}
                                    onInvalid={(e) => handleInvalid(e, 'password')}
                                    className={`input-cyber text-center tracking-widest w-full pr-10 input-normal-case ${validationErrors.password ? 'border-cyber-neonPink' : ''}`}
                                    required={!isForgot}
                                />
                                {validationErrors.password && (
                                    <div className="cyber-validation-bubble">
                                        {t('auth.messages.input_required')}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-neonCyan hover:text-white transition-colors p-1"
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
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
                        </>
                    )}

                    {isForgot && (
                        <div className="relative">
                            <input
                                type="email"
                                placeholder={t('auth.placeholders.recovery_email')}
                                value={email}
                                onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                                onFocus={(e) => { e.target.select(); clearValidation(); }}
                                onInvalid={(e) => handleInvalid(e, 'email')}
                                className={`input-cyber text-center tracking-widest w-full input-normal-case ${validationErrors.email ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                                required
                                autoFocus
                            />
                            {validationErrors.email && (
                                <div className="cyber-validation-bubble">
                                    {t('auth.messages.input_required')}
                                </div>
                            )}
                        </div>
                    )}

                    {requires2FA && (
                        <div className="text-center space-y-4">
                            <p className="text-xs text-gray-400 font-mono">
                                {twoFactorMethod === 'totp'
                                    ? t('auth.messages.bio_lock_active')
                                    : t('auth.messages.override_required')}
                            </p>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('auth.placeholders.access_code')}
                                    value={twoFaCode}
                                    onChange={(e) => handleInputChange('twoFaCode', e.target.value, setTwoFaCode)}
                                    onFocus={(e) => { e.target.select(); clearValidation(); }}
                                    onInvalid={(e) => handleInvalid(e, 'twoFaCode')}
                                    className={`input-cyber text-center tracking-[0.3em] text-xl font-bold text-cyber-neonGreen w-full ${validationErrors.twoFaCode ? 'border-cyber-neonPink shadow-[0_0_10px_rgba(255,0,255,0.3)]' : ''}`}
                                    maxLength={16}
                                    required
                                    autoFocus
                                />
                                {validationErrors.twoFaCode && (
                                    <div className="cyber-validation-bubble">
                                        {t('auth.messages.input_required')}
                                    </div>
                                )}
                            </div>
                            {twoFactorMethod === 'email' && (
                                <button
                                    type="button"
                                    onClick={handleResendEmail2FA}
                                    disabled={loading}
                                    className={`text-[10px] text-cyber-neonCyan hover:underline block mx-auto uppercase animate-pulse ${loading ? 'opacity-50 cursor-wait' : ''}`}
                                >
                                    {loading ? t('auth.status.resyncing') : t('auth.status.resync_uplink')}
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-cyber btn-neon-pink btn-auth-submit mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? t('auth.working') : (requires2FA ? t('auth.verify_identity') : (isForgot ? t('auth.send_reset') : (isLogin ? t('auth.jack_in') : t('auth.establish_link'))))}
                    </button>
                </form>

                {!requires2FA && (
                    <div className="mt-6 text-center flex flex-col gap-2">
                        {!isForgot && isLogin && (
                            <button
                                onClick={() => setIsForgot(true)}
                                className="text-sm text-gray-300 hover:text-cyber-neonPink underline decoration-dotted underline-offset-4"
                            >
                                {t('auth.forgot_key')}
                            </button>
                        )}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setIsForgot(false); setError(''); setValidationErrors({}); }}
                            className="text-sm text-gray-300 hover:text-cyber-neonGreen underline decoration-dotted underline-offset-4"
                        >
                            {isForgot ? t('auth.remembered') : (isLogin ? t('auth.no_identity') : t('auth.has_identity'))}
                        </button>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-xs text-cyber-neonCyan hover:text-white transition-colors tracking-widest"
                    >
                        {t('header.system_help')}
                    </button>
                </div>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

            {alert.show && (
                <CyberAlert
                    title={alert.title}
                    message={alert.message}
                    variant={alert.variant}
                    onClose={() => {
                        if (alert.onClose) alert.onClose();
                        else setAlert({ ...alert, show: false });
                    }}
                />
            )}
        </div>
    );
};


export default AuthForm;
