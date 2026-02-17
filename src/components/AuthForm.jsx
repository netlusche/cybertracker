import React, { useState } from 'react';
import { triggerNeonConfetti } from '../utils/confetti';
import HelpModal from './HelpModal';
import CyberAlert from './CyberAlert';


const AuthForm = ({ onLogin }) => {
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

    // Custom Alert State
    const [alert, setAlert] = useState({ show: false, message: '', title: '', variant: 'cyan' });


    const handleSubmit = async (e) => {
        e.preventDefault();
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
                setError(data.error || 'Authentication failed');
                return;
            }

            if (isLogin) {
                if (data.requires_2fa) {
                    setRequires2FA(true);
                    setTwoFactorMethod(data.two_factor_method || 'totp');
                    setError('');
                } else {
                    triggerNeonConfetti();
                    onLogin(data.user);
                }
            } else {
                setIsLogin(true);
                setError('');
                setAlert({
                    show: true,
                    title: 'IDENTITY ESTABLISHED',
                    message: data.message || 'NEW IDENTITY ESTABLISHED. UPLINK REQUIRED: CHECK COM-LINK FOR VERIFICATION SIGNAL.',
                    variant: 'cyan'
                });
            }


        } catch (err) {
            setError('System Error. Connection failed.');
        }
    };

    const handleForgotSubmit = async () => {
        try {
            const res = await fetch('api/auth.php?action=request_password_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setResetSent(true);
            setError('');
        } catch (err) {
            setError('Request failed.');
        }
    };

    const handle2FAVerify = async () => {
        try {
            const res = await fetch('api/auth.php?action=verify_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: twoFaCode })
            });
            const data = await res.json();

            if (res.ok) {
                triggerNeonConfetti();
                onLogin(data.user);
            } else {
                setError(data.error || 'Invalid or expired access code.');
            }
        } catch (err) { setError('Validation Error. Neural link unstable.'); }
    };

    const handleResendEmail2FA = async () => {
        setError('');
        try {
            const res = await fetch('api/auth.php?action=resend_email_2fa', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                // We'll use a temporary message or alert
                setAlert({
                    show: true,
                    title: 'SIGNAL RE-DISPATCHED',
                    message: 'A NEW EMERGENCY OVERRIDE CODE HAS BEEN SENT TO YOUR COM-LINK.',
                    variant: 'cyan'
                });
            } else {
                setError(data.error || "Uplink failed.");
            }
        } catch (err) { setError("Network failure."); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="card-cyber w-full max-w-md p-8 border-cyber-neonPink shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                {/* ... (existing form content) ... */}
                <h2 className="text-2xl font-bold text-center mb-6 text-cyber-neonCyan tracking-widest uppercase">
                    {requires2FA ? 'SECURITY CHECK' : (isForgot ? 'RECOVER ENTRY' : (isLogin ? 'Netrunner Login' : 'New Identity'))}
                </h2>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-2 mb-4 text-center text-sm font-mono">
                        ⚠ {error}
                    </div>
                )}

                {isForgot && resetSent ? (
                    <div className="text-center text-cyber-neonGreen">
                        <p>TRANSMISSION SENT.</p>
                        <p className="text-sm mt-2">Check your com-link (email) for reset instructions.</p>
                        <button onClick={() => { setIsForgot(false); setResetSent(false); }} className="btn-cyber btn-neon-blue mt-4">
                            RETURN TO LOGIN
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {!requires2FA && !isForgot && (
                            <>
                                <input
                                    type="text"
                                    placeholder={!isLogin ? "CODENAME (USERNAME)" : "CODENAME / COM-LINK"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-cyber text-center tracking-widest"
                                    required={!isForgot}
                                    autoFocus
                                />
                                {!isLogin && (
                                    <input
                                        type="email"
                                        placeholder="COM-LINK (EMAIL)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-cyber text-center tracking-widest"
                                        required
                                    />
                                )}
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="ACCESS KEY"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-cyber text-center tracking-widest w-full pr-10"
                                        required={!isForgot}
                                    />
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
                            <input
                                type="email"
                                placeholder="COM-LINK (EMAIL) FOR RECOVERY"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-cyber text-center tracking-widest"
                                required
                                autoFocus
                            />
                        )}

                        {requires2FA && (
                            <div className="text-center space-y-4">
                                <p className="text-xs text-gray-400 font-mono">
                                    {twoFactorMethod === 'totp'
                                        ? "BIO-LOCK ACTIVE. ENTER AUTHENTICATOR CODE OR BACKUP FRAGMENT."
                                        : "EMERGENCY OVERRIDE REQUIRED. CHECK COM-LINK FREQUENCY."}
                                </p>
                                <input
                                    type="text"
                                    placeholder="ACCESS CODE"
                                    value={twoFaCode}
                                    onChange={(e) => setTwoFaCode(e.target.value)}
                                    className="input-cyber text-center tracking-[0.3em] text-xl font-bold text-cyber-neonGreen w-full"
                                    maxLength={16}
                                    autoFocus
                                />
                                {twoFactorMethod === 'email' && (
                                    <button
                                        type="button"
                                        onClick={handleResendEmail2FA}
                                        className="text-[10px] text-cyber-neonCyan hover:underline block mx-auto uppercase animate-pulse"
                                    >
                                        [ RESYNC UPLINK ]
                                    </button>
                                )}
                            </div>
                        )}

                        <button type="submit" className="btn-cyber btn-neon-pink mt-4">
                            {requires2FA ? 'VERIFY IDENTITY' : (isForgot ? 'SEND RESET SIGNAL' : (isLogin ? 'JACK IN' : 'ESTABLISH LINK'))}
                        </button>
                    </form>
                )}

                {!requires2FA && !resetSent && (
                    <div className="mt-6 text-center flex flex-col gap-2">
                        {!isForgot && isLogin && (
                            <button
                                onClick={() => setIsForgot(true)}
                                className="text-sm text-gray-300 hover:text-cyber-neonPink underline decoration-dotted underline-offset-4"
                            >
                                FORGOT ACCESS KEY?
                            </button>
                        )}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setIsForgot(false); setError(''); }}
                            className="text-sm text-gray-300 hover:text-cyber-neonGreen underline decoration-dotted underline-offset-4"
                        >
                            {isForgot ? 'REMEMBERED? // RETURN TO LOGIN' : (isLogin ? 'NO IDENTITY? // CREATE NEW' : 'HAS IDENTITY? // LOGIN')}
                        </button>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-xs text-cyber-neonCyan hover:text-white transition-colors tracking-widest"
                    >
                        [ SYSTEM HELP ]
                    </button>
                </div>
            </div>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

            {alert.show && (
                <CyberAlert
                    title={alert.title}
                    message={alert.message}
                    variant={alert.variant}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}
        </div>
    );
};


export default AuthForm;
