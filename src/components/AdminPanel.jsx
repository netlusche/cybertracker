import React, { useState, useEffect } from 'react';

// --- Sub-components for Modals ---

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150]">
        <div className="bg-gray-900 border border-yellow-500 p-6 max-w-sm w-full shadow-[0_0_20px_rgba(255,200,0,0.5)]">
            <h3 className="text-yellow-500 font-bold text-xl mb-4">CONFIRMATION REQUIRED</h3>
            <p className="text-gray-300 mb-6 font-mono">{message}</p>
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-white/10">
                    CANCEL
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-yellow-600/20 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold">
                    CONFIRM
                </button>
            </div>
        </div>
    </div>
);

const PromptModal = ({ message, onConfirm, onCancel }) => {
    const [value, setValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150]">
            <div className="bg-gray-900 border border-cyber-neonCyan p-6 max-w-sm w-full shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                <h3 className="text-cyber-neonCyan font-bold text-xl mb-4">INPUT REQUIRED</h3>
                <p className="text-gray-300 mb-2 font-mono">{message}</p>

                <div className="relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white p-2 pr-10 focus:border-cyber-neonCyan outline-none font-mono"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-cyber-neonCyan hover:text-white transition-colors"
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

                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 border border-gray-600 text-gray-400 hover:bg-white/10">
                        CANCEL
                    </button>
                    <button onClick={() => onConfirm(value)} className="px-4 py-2 bg-cyan-900/20 border border-cyber-neonCyan text-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black font-bold">
                        SUBMIT
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminPanel = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ totalUsers: 0, totalPages: 1, currentPage: 1 });
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ASC' });
    const [searchQuery, setSearchQuery] = useState(''); // [NEW] Search State
    const [debouncedSearch, setDebouncedSearch] = useState(''); // [NEW] Debounced Search State
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Modal States
    const [confirmAction, setConfirmAction] = useState(null); // { message, onConfirm }
    const [promptAction, setPromptAction] = useState(null);   // { message, onConfirm }

    useEffect(() => {
        fetchUsers();
        fetchSettings();
    }, []);

    // Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            fetchUsers(1, sortConfig.key, sortConfig.direction, searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('api/admin.php?action=get_settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (err) { console.error("Failed to load settings", err); }
    };

    const handleToggleSetting = async (key, newValue) => {
        try {
            const res = await fetch('api/admin.php?action=update_setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: newValue })
            });
            if (res.ok) {
                setSettings(prev => ({ ...prev, [key]: newValue }));
                setMessage(`System Policy Updated: ${key}`);
            } else {
                setError('Failed to update setting');
            }
        } catch (err) { setError('Connection Error'); }
    };

    const fetchUsers = async (page = 1, sortKey = sortConfig.key, sortDir = sortConfig.direction, search = debouncedSearch) => {
        try {
            const res = await fetch(`api/admin.php?action=list&page=${page}&sort=${sortKey}&dir=${sortDir}&search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
                setPagination({
                    totalUsers: data.totalUsers,
                    totalPages: data.totalPages,
                    currentPage: data.currentPage
                });
            } else {
                setError('Unauthorized Access');
            }
        } catch (err) {
            setError('Connection refused');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'ASC';
        if (sortConfig.key === key && sortConfig.direction === 'ASC') {
            direction = 'DESC';
        }
        setSortConfig({ key, direction });
        fetchUsers(pagination.currentPage, key, direction, debouncedSearch); // Fetch with new sort
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="text-gray-500">↕</span>;
        return <span className="text-yellow-500">{sortConfig.direction === 'ASC' ? '↑' : '↓'}</span>;
    };

    // --- Wrapper Handlers ---

    const handleToggleRoleClick = (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (user.role === 'admin') {
            const remainingAdmins = users.filter(u => u.role === 'admin').length;
            if (remainingAdmins <= 1) {
                setError("Cannot downgrade the last Admin!");
                return;
            }
            setConfirmAction({
                message: "Downgrade this Admin? They will lose access to this panel.",
                onConfirm: () => performToggleRole(user, newRole)
            });
        } else {
            // Promote doesn't strictly need confirm, but let's be safe or just do it. 
            // Let's just do it for speed unless defined otherwise.
            performToggleRole(user, newRole);
        }
    };

    const performToggleRole = async (user, newRole) => {
        try {
            const res = await fetch('api/admin.php?action=update_role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_id: user.id, new_role: newRole })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`Role updated for ${user.username}`);
                fetchUsers(pagination.currentPage);
            } else {
                setError(data.error || 'Failed to update role');
            }
        } catch (err) { setError('Network Error'); }
    };

    const handleDeleteUserClick = (user) => {
        setConfirmAction({
            message: `ERASE USER ${user.username} PERMANENTLY? This cannot be undone.`,
            onConfirm: () => performDeleteUser(user.id, user.username)
        });
    };

    const performDeleteUser = async (id, username) => {
        try {
            const res = await fetch('api/admin.php?action=delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_id: id })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`User ${username} terminated.`);
                fetchUsers(pagination.currentPage);
            } else {
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) { setError('Network Error'); }
    };

    const handleToggleVerified = async (user) => {
        try {
            const res = await fetch('api/admin.php?action=toggle_verified', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_id: user.id })
            });
            const data = await res.json();
            if (res.ok) {
                fetchUsers(pagination.currentPage); // Refresh list to show new status
            } else {
                setError(data.error || 'Failed to toggle verification');
            }
        } catch (err) { setError('Network Error'); }
    };


    const handleResetPasswordClick = (user) => {
        setPromptAction({
            message: `Enter new password for ${user.username}:`,
            onConfirm: (val) => performResetPassword(user.id, user.username, val)
        });
    };

    const performResetPassword = async (id, username, newPass) => {
        if (!newPass) return;
        try {
            const res = await fetch('api/admin.php?action=reset_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_id: id, new_password: newPass })
            });
            if (res.ok) {
                setMessage(`Password reset for ${username}.`);
            }
        } catch (err) { setError('Network Error'); }
    };

    const handleDisable2FAClick = (user) => {
        setConfirmAction({
            message: `DISABLE 2FA FOR ${user.username}? This will remove secondary verification protocols.`,
            onConfirm: () => performDisable2FA(user.id, user.username)
        });
    };

    const performDisable2FA = async (id, username) => {
        try {
            const res = await fetch('api/admin.php?action=disable_2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_id: id })
            });
            if (res.ok) {
                setMessage(`2FA Disabled for ${username}.`);
                fetchUsers(pagination.currentPage);
            } else {
                setError('Failed to disable 2FA');
            }
        } catch (err) { setError('Network Error'); }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-[100] p-4 font-mono">
            {/* Modals */}
            {confirmAction && (
                <ConfirmModal
                    message={confirmAction.message}
                    onConfirm={() => { confirmAction.onConfirm(); setConfirmAction(null); }}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
            {promptAction && (
                <PromptModal
                    message={promptAction.message}
                    onConfirm={(val) => { promptAction.onConfirm(val); setPromptAction(null); }}
                    onCancel={() => setPromptAction(null)}
                />
            )}

            <div className="card-cyber w-full max-w-4xl h-[80vh] flex flex-col border-yellow-500 shadow-[0_0_30px_rgba(255,200,0,0.3)]">
                <div className="flex justify-between items-center border-b border-yellow-700/50 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">
                        ADMINISTRATION CONSOLE
                    </h2>
                    <button onClick={onClose} className="text-yellow-500 hover:text-white text-xl">✖</button>
                </div>

                {/* Search Input */}
                <div className="flex justify-end mb-4 relative">
                    <input
                        type="text"
                        placeholder="SEARCH RECRUITS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/50 border border-yellow-700/50 text-yellow-400 px-3 py-1 pr-8 text-sm focus:outline-none focus:border-yellow-500 w-64 rounded-sm tracking-widest placeholder-yellow-700"
                    />
                    <span className="absolute right-2 top-1 text-yellow-600 pointer-events-none">🔍</span>
                </div>

                {error && <div className="bg-red-900/20 text-red-500 p-2 border border-red-900 mb-4">⚠ {error}</div>}
                {message && <div className="bg-green-900/20 text-green-500 p-2 border border-green-900 mb-4">✓ {message}</div>}

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-yellow-600 border-b border-yellow-700/30">
                                <th
                                    className={`p-2 cursor-pointer select-none hover:text-yellow-400 ${sortConfig.key === 'id' ? 'text-yellow-500' : ''}`}
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center gap-1">
                                        ID <SortIcon columnKey="id" />
                                    </div>
                                </th>
                                <th
                                    className={`p-2 cursor-pointer select-none hover:text-yellow-400 ${sortConfig.key === 'username' ? 'text-yellow-500' : ''}`}
                                    onClick={() => handleSort('username')}
                                >
                                    <div className="flex items-center gap-1">
                                        CODENAME <SortIcon columnKey="username" />
                                    </div>
                                </th>
                                <th className="p-2">ROLE</th>
                                <th
                                    className={`p-2 cursor-pointer select-none hover:text-yellow-400 ${sortConfig.key === 'is_verified' ? 'text-yellow-500' : ''}`}
                                    onClick={() => handleSort('is_verified')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        VERIFIED <SortIcon columnKey="is_verified" />
                                    </div>
                                </th>
                                <th
                                    className={`p-2 cursor-pointer select-none hover:text-yellow-400 ${sortConfig.key === 'last_login' ? 'text-yellow-500' : ''}`}
                                    onClick={() => handleSort('last_login')}
                                >
                                    <div className="flex items-center gap-1">
                                        HISTORY <SortIcon columnKey="last_login" />
                                    </div>
                                </th>
                                <th className="p-2 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className="p-2 text-gray-400">#{u.id}</td>
                                    <td className="p-2 text-white font-bold">{u.username}</td>
                                    <td className="p-2">
                                        <span className={`text-xs px-2 py-1 rounded border ${u.role === 'admin' ? 'border-yellow-500 text-yellow-500' : 'border-gray-500 text-gray-300'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                        {u.two_factor_enabled == 1 && (
                                            <span className="ml-2 text-[10px] bg-green-900/30 text-green-500 border border-green-900 px-1 font-bold">2FA</span>
                                        )}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleToggleVerified(u)}
                                            className={`text-xs font-bold ${u.is_verified == 1 ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'}`}
                                            title="Toggle Verification"
                                        >
                                            {u.is_verified == 1 ? '✓ VERIFIED' : '✖ UNVERIFIED'}
                                        </button>
                                    </td>
                                    <td className="p-2 align-top">
                                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[10px] leading-none">
                                            <span className="text-gray-400 uppercase">Jo</span>
                                            <span className="text-gray-300">{u.created_at?.split(' ')[0]}</span>
                                            <span className="text-gray-400 uppercase">Lg</span>
                                            <span className="text-cyan-500">{u.last_login ? u.last_login.split(' ')[0] : 'NEVER'}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 text-right">
                                        <div className="flex flex-wrap justify-end gap-1">
                                            <button
                                                onClick={() => handleToggleRoleClick(u)}
                                                className="text-[10px] px-2 py-1 border border-blue-900 text-blue-500 hover:bg-blue-900 hover:text-white transition-colors min-w-[70px] uppercase"
                                            >
                                                {u.role === 'admin' ? 'DOWNGRADE' : 'PROMOTE'}
                                            </button>
                                            <button
                                                onClick={() => handleResetPasswordClick(u)}
                                                className="text-[10px] px-2 py-1 border border-gray-500 text-gray-300 hover:border-white hover:text-white transition-colors min-w-[70px] uppercase"
                                            >
                                                RESET PWD
                                            </button>
                                            {u.two_factor_enabled == 1 && (
                                                <button
                                                    onClick={() => handleDisable2FAClick(u)}
                                                    className="text-[10px] px-2 py-1 border border-orange-900 text-orange-600 hover:bg-orange-900 hover:text-white transition-colors min-w-[70px] uppercase"
                                                >
                                                    2FA OFF
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUserClick(u)}
                                                className="text-[10px] px-2 py-1 border border-red-900 text-red-700 hover:bg-red-900 hover:text-white transition-colors min-w-[70px] uppercase"
                                            >
                                                ERASE
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-yellow-700/30 pt-4 mb-4 text-xs font-mono">
                    <div className="text-gray-400">
                        TOTAL RECRUITS: <span className="text-yellow-500">{pagination.totalUsers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.currentPage <= 1}
                            onClick={() => fetchUsers(1)}
                            className="px-3 py-1 border border-yellow-700/50 text-yellow-600 hover:bg-yellow-700/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold"
                            title="First Page"
                        >
                            &laquo;
                        </button>
                        <button
                            disabled={pagination.currentPage <= 1}
                            onClick={() => fetchUsers(pagination.currentPage - 1)}
                            className="px-3 py-1 border border-yellow-700/50 text-yellow-600 hover:bg-yellow-700/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold"
                            title="Previous Page"
                        >
                            &lsaquo;
                        </button>

                        <span className="text-yellow-600 px-2">
                            {pagination.currentPage} / {pagination.totalPages}
                        </span>

                        <button
                            disabled={pagination.currentPage >= pagination.totalPages}
                            onClick={() => fetchUsers(pagination.currentPage + 1)}
                            className="px-3 py-1 border border-yellow-700/50 text-yellow-600 hover:bg-yellow-700/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold"
                            title="Next Page"
                        >
                            &rsaquo;
                        </button>
                        <button
                            disabled={pagination.currentPage >= pagination.totalPages}
                            onClick={() => fetchUsers(pagination.totalPages)}
                            className="px-3 py-1 border border-yellow-700/50 text-yellow-600 hover:bg-yellow-700/20 disabled:opacity-30 disabled:hover:bg-transparent font-bold"
                            title="Last Page"
                        >
                            &raquo;
                        </button>
                    </div>
                </div>

                {/* System Policies Section */}
                <div className="border-t border-yellow-700/50 pt-4 mt-4">
                    <h3 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
                        <span>⚙</span> SYSTEM POLICIES
                    </h3>
                    <div className="flex items-center gap-4 bg-yellow-700/10 p-3 rounded border border-yellow-700/30">
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">Strict Password Policy</h4>
                            <p className="text-xs text-gray-300">
                                Enforce heavy encryption protocols (Min 12 chars, Upper, Number, Special).
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={String(settings.strict_password_policy) === '1'}
                                onChange={() => handleToggleSetting('strict_password_policy', String(settings.strict_password_policy) === '1' ? '0' : '1')}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
