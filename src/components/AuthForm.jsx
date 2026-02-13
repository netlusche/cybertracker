import React, { useState } from 'react';

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState('');

    // Forgot Password State
    const [isForgot, setIsForgot] = useState(false);
    const [resetSent, setResetSent] = useState(false);

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
                    setError('');
                } else {
                    onLogin(data.user);
                }
            } else {
                setIsLogin(true);
                setError('');
                alert('Registration successful! Please check your email to verify account.');
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
                onLogin(data.user);
            } else {
                setError('Invalid 2FA Code');
            }
        } catch (err) { setError('Validation Error'); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="card-cyber w-full max-w-md p-8 border-cyber-neonPink shadow-[0_0_20px_rgba(255,0,255,0.2)]">
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
                                    placeholder="CODENAME"
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
                                <input
                                    type="password"
                                    placeholder="ACCESS KEY"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-cyber text-center tracking-widest"
                                    required={!isForgot}
                                />
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
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-2">ENTER AUTHENTICATOR CODE</p>
                                <input
                                    type="text"
                                    placeholder="000 000"
                                    value={twoFaCode}
                                    onChange={(e) => setTwoFaCode(e.target.value)}
                                    className="input-cyber text-center tracking-[0.5em] text-xl font-bold text-cyber-neonGreen"
                                    maxLength={6}
                                    autoFocus
                                />
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
                                className="text-xs text-gray-400 hover:text-cyber-neonPink underline decoration-dotted underline-offset-4"
                            >
                                FORGOT ACCESS KEY?
                            </button>
                        )}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setIsForgot(false); setError(''); }}
                            className="text-xs text-gray-400 hover:text-cyber-neonGreen underline decoration-dotted underline-offset-4"
                        >
                            {isForgot ? 'REMEMBERED? // RETURN TO LOGIN' : (isLogin ? 'NO IDENTITY? // CREATE NEW' : 'HAS IDENTITY? // LOGIN')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthForm;
