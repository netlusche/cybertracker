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
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150]">
            <div className="bg-gray-900 border border-cyber-neonCyan p-6 max-w-sm w-full shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                <h3 className="text-cyber-neonCyan font-bold text-xl mb-4">INPUT REQUIRED</h3>
                <p className="text-gray-300 mb-2 font-mono">{message}</p>
                <input
                    type="password" // Assuming password mostly, otherwise make prop
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-black/50 border border-gray-600 text-white p-2 mb-6 focus:border-cyber-neonCyan outline-none font-mono"
                />
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Modal States
    const [confirmAction, setConfirmAction] = useState(null); // { message, onConfirm }
    const [promptAction, setPromptAction] = useState(null);   // { message, onConfirm }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('api/admin.php?action=list');
            if (res.ok) {
                setUsers(await res.json());
            } else {
                setError('Unauthorized Access');
            }
        } catch (err) {
            setError('Connection refused');
        } finally {
            setLoading(false);
        }
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
                fetchUsers();
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
                fetchUsers();
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
                fetchUsers(); // Refresh list to show new status
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
                <div className="flex justify-between items-center border-b border-yellow-900/50 pb-4 mb-4">
                    <h2 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">
                        ADMINISTRATION CONSOLE
                    </h2>
                    <button onClick={onClose} className="text-yellow-500 hover:text-white text-xl">✖</button>
                </div>

                {error && <div className="bg-red-900/20 text-red-500 p-2 border border-red-900 mb-4">⚠ {error}</div>}
                {message && <div className="bg-green-900/20 text-green-500 p-2 border border-green-900 mb-4">✓ {message}</div>}

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-yellow-700 border-b border-yellow-900/30">
                                <th className="p-2">ID</th>
                                <th className="p-2">CODENAME</th>
                                <th className="p-2">ROLE</th>
                                <th className="p-2 text-center">VERIFIED</th>
                                <th className="p-2">CREATED</th>
                                <th className="p-2 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                    <td className="p-2 text-gray-500">#{u.id}</td>
                                    <td className="p-2 text-white font-bold">{u.username}</td>
                                    <td className="p-2">
                                        <span className={`text-xs px-2 py-1 rounded border ${u.role === 'admin' ? 'border-yellow-500 text-yellow-500' : 'border-gray-600 text-gray-400'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
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
                                    <td className="p-2 text-xs text-gray-500">{u.created_at}</td>
                                    <td className="p-2 text-right space-x-2">
                                        <button
                                            onClick={() => handleToggleRoleClick(u)}
                                            className="text-xs px-2 py-1 border border-blue-900 text-blue-500 hover:bg-blue-900 hover:text-white transition-colors"
                                        >
                                            {u.role === 'admin' ? 'DOWNGRADE' : 'PROMOTE'}
                                        </button>
                                        <button
                                            onClick={() => handleResetPasswordClick(u)}
                                            className="text-xs px-2 py-1 border border-gray-600 text-gray-400 hover:border-white hover:text-white transition-colors"
                                        >
                                            RESET PWD
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUserClick(u)}
                                            className="text-xs px-2 py-1 border border-red-900 text-red-700 hover:bg-red-900 hover:text-white transition-colors"
                                        >
                                            ERASE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
