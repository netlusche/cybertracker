import React, { useState } from 'react';

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (requires2FA) {
            handle2FAVerify();
            return;
        }

        const endpoint = isLogin ? 'api/auth.php?action=login' : 'api/auth.php?action=register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
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
                alert('Registration successful! Please login.');
            }

        } catch (err) {
            setError('System Error. Connection failed.');
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
                    {requires2FA ? 'SECURITY CHECK' : (isLogin ? 'Netrunner Login' : 'New Identity')}
                </h2>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-2 mb-4 text-center text-sm font-mono">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!requires2FA ? (
                        <>
                            <input
                                type="text"
                                placeholder="CODENAME"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-cyber text-center tracking-widest"
                                required
                                autoFocus
                            />
                            <input
                                type="password"
                                placeholder="ACCESS KEY"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-cyber text-center tracking-widest"
                                required
                            />
                        </>
                    ) : (
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
                        {requires2FA ? 'VERIFY IDENTITY' : (isLogin ? 'JACK IN' : 'ESTABLISH LINK')}
                    </button>
                </form>

                {!requires2FA && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs text-gray-400 hover:text-cyber-neonGreen underline decoration-dotted underline-offset-4"
                        >
                            {isLogin ? 'NO IDENTITY? // CREATE NEW' : 'HAS IDENTITY? // LOGIN'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthForm;
