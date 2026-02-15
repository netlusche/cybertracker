import React from 'react';
import { triggerNeonConfetti } from '../utils/confetti';

const HelpModal = ({ onClose }) => {
    const handleAcknowledge = () => {
        triggerNeonConfetti();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-cyber-black text-white p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyber-neonCyan shadow-[0_0_20px_rgba(0,255,255,0.3)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-cyber-neonPink hover:text-white font-bold text-xl"
                >
                    [X]
                </button>

                <h2 className="text-2xl font-bold mb-6 text-cyber-neonCyan border-b border-cyber-gray pb-2 uppercase tracking-widest">
                    CYBER_TASKER OPERATIVE HANDBOOK [VER. 1.4]
                </h2>

                <div className="space-y-6 font-mono text-sm">
                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// SYSTEM ACCESS [Auth Protocol]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>INITIATE NEW IDENTITY:</strong> Execute <span className="text-white">NEW IDENTITY</span> to register. Input <strong>CODENAME</strong> (username), <strong>COM-LINK</strong> (email), and <strong>ACCESS KEY</strong> (password). <span className="text-yellow-500">⚠ Verification required via email.</span></li>
                            <li><strong>JACK IN:</strong> Access the grid via <strong>CODENAME</strong> or <strong>COM-LINK</strong> and your <strong>ACCESS KEY</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// BIO-LOCK SECURITY [2FA]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li>Navigate to <strong>PROFILE</strong> &gt; <strong>ENABLE 2FA SECURITY</strong>.</li>
                            <li>Scan the <strong>QR MATRIX</strong> with your authenticator.</li>
                            <li>Input code to activate. Future logins will require this sync code.</li>
                            <li><span className="text-cyber-neonPink">⚠ SECURITY ALERT:</span> Terminating 2FA triggers a high-priority defensive warning.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// DIRECTIVE EXECUTION [Task Management]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>INITIALIZE:</strong> Input directive parameters and assign PRIORITY. Use <span className="text-white">ENTER</span> for rapid deployment.</li>
                            <li><strong>TERMINAL PULSE:</strong> Successful initialization triggers a <span className="text-cyber-neonCyan">CYAN FEEDBACK PULSE</span> and celebration.</li>
                            <li><strong>EDIT:</strong> Click task title to rename. efficient workflow.</li>
                            <li><strong>MODIFY:</strong> Click <span className="text-cyber-neonCyan">CATEGORY</span> or <span className="text-white">PRIORITY</span> badges for themed selection.</li>
                            <li><strong>EXECUTE:</strong> Mark directives as <strong>DONE</strong>. System provides <span className="text-cyber-neonPink">NEON FEEDBACK</span> upon completion.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// CATEGORY PROTOCOLS [Customization]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>MANAGE PROTOCOLS:</strong> Access your <strong>PROFILE</strong> to initialize, rename, or delete custom categories.</li>
                            <li><strong>DEFAULT OVERRIDE:</strong> Tag any protocol as <strong>STOCKED/DEFAULT</strong> (★) to prioritize it in the deployment terminal.</li>
                            <li><strong>RE-INITIALIZATION:</strong> Renaming a protocol will retroactively patch all associated archived directives.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// NEURAL SEARCH & FILTER [Data Retrieval]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>QUERY:</strong> Input keywords into the neural search bar to instantly isolate directives.</li>
                            <li><strong>VECTORS:</strong> Filter grid by <span className="text-white">PRIORITY</span>, <span className="text-cyber-neonCyan">CATEGORY</span>, or <span className="text-cyber-neonPink">OVERDUE</span> status.</li>
                            <li><strong>SYSTEM RESET:</strong> Execute <span className="text-cyber-neonCyan">RESET</span> to clear active filters and restore full data stream.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// CHRONO-SYNC [Scheduling]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><strong>DEADLINES:</strong> Assign execution dates via the <span className="text-cyber-neonPurple">CYBER CALENDAR</span> overlay.</li>
                            <li><strong>TIME JUMPS:</strong> Use year navigation controls for long-range planning.</li>
                            <li><strong>INTERACTIVE SYNC:</strong> Modify dates directly on active cards via <span className="text-white">CYBER CONFIRM</span> protocols.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-cyber-neonGreen font-bold text-lg mb-2">// PROGRESSION MATRIX [Gamification]</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li>Accumulate XP to increase your <strong>OPERATOR LEVEL</strong>.</li>
                            <li>Tracking bar visualizes progress to the next rank.</li>
                            <li><span className="text-cyber-neonCyan">LEVEL UP:</span> System celebrates rank advancement with full-spectrum neon feedback.</li>
                        </ul>
                    </section>

                    <section className="border-t border-cyber-gray pt-4 mt-8">
                        <h3 className="text-cyber-neonPink font-bold text-lg mb-2">// DANGER ZONE PROTOCOLS</h3>
                        <ul className="list-disc w-5/6 mx-auto space-y-1 text-gray-300">
                            <li><span className="text-cyber-neonPink">⚠ IDENTITY TERMINATION:</span> Confirming account deletion triggers the **TERMINAL SECURITY ALERT**. This action is irreversible.</li>
                            <li><strong>ESCAPE PROTOCOL:</strong> Use the neon-pink <span className="text-cyber-neonPink">[X]</span> in any terminal to immediately abort current operations.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleAcknowledge}
                        className="border border-cyber-neonCyan text-cyber-neonCyan hover:bg-cyber-neonCyan hover:text-black px-6 py-2 rounded transition-all duration-300 uppercase tracking-widest font-bold"
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
