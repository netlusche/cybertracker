import React, { useState } from 'react';

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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
                onLogin(data.user);
            } else {
                // Auto login after register or ask to login?
                // Let's just switch to login mode with success message
                setIsLogin(true);
                setError('');
                alert('Registration successful! Please login.');
            }

        } catch (err) {
            setError('System Error. Connection failed.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="card-cyber w-full max-w-md p-8 border-cyber-neonPink shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                <h2 className="text-2xl font-bold text-center mb-6 text-cyber-neonCyan tracking-widest uppercase">
                    {isLogin ? 'Netrunner Login' : 'New Identity'}
                </h2>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 p-2 mb-4 text-center text-sm font-mono">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                    <button type="submit" className="btn-cyber btn-neon-pink mt-4">
                        {isLogin ? 'JACK IN' : 'ESTABLISH LINK'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-xs text-gray-400 hover:text-cyber-neonGreen underline decoration-dotted underline-offset-4"
                    >
                        {isLogin ? 'NO IDENTITY? // CREATE NEW' : 'HAS IDENTITY? // LOGIN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
