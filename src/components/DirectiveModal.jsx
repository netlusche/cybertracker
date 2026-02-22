import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/ThemeContext';
import { apiFetch } from '../utils/api';
import CyberCalendar from './CyberCalendar';
import CyberConfirm from './CyberConfirm';
import CyberSelect from './CyberSelect';

const DirectiveModal = ({ task, categories, onClose, onUpdate }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const fileInputRef = useRef(null);
    const [editingField, setEditingField] = useState(null);
    const [title, setTitle] = useState(task.title || '');
    const [description, setDescription] = useState(task.description || '');
    const [attachments, setAttachments] = useState([]);
    const [tempLinks, setTempLinks] = useState([]);
    const [files, setFiles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Date/Calendar state
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [pendingDate, setPendingDate] = useState(null);
    const [showDateConfirm, setShowDateConfirm] = useState(false);
    const dateContainerRef = useRef(null);

    // Priority state
    const [pendingPriority, setPendingPriority] = useState(null);
    const [showPriorityConfirm, setShowPriorityConfirm] = useState(false);

    useEffect(() => {
        try {
            const parsedLinks = task.attachments ? JSON.parse(task.attachments) : [];
            const links = Array.isArray(parsedLinks) ? parsedLinks : [];
            setAttachments(links);
            setTempLinks(JSON.parse(JSON.stringify(links)));

            const parsedFiles = task.files ? JSON.parse(task.files) : [];
            setFiles(Array.isArray(parsedFiles) ? parsedFiles : []);

            // Sync description when task prop updates (e.g. after a save)
            // But only if we are not actively editing it right now to avoid overwriting typed text
            if (editingField !== 'description' && editingField !== 'title') {
                setTitle(task.title || '');
                setDescription(task.description || '');
            }
        } catch (e) {
            setAttachments([]);
            setTempLinks([]);
            setFiles([]);
        }
    }, [task.attachments, task.files]);

    const handleSave = async (updatedTitle = title, updatedDesc = description, updatedLinks = tempLinks, updatedFiles = files) => {
        setIsSaving(true);
        const success = await onUpdate(task, {
            title: updatedTitle,
            description: updatedDesc,
            attachments: JSON.stringify(updatedLinks),
            files: JSON.stringify(updatedFiles)
        });
        setIsSaving(false);
        if (success) {
            setEditingField(null);
        }
    };

    const handleBlur = (e, field) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
            return;
        }
        if (editingField === field) {
            handleSave();
        }
    };

    // --- Date Methods ---
    useEffect(() => {
        if (!isDatePickerOpen) return;
        const handleClickOutside = (event) => {
            if (dateContainerRef.current && !dateContainerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDatePickerOpen]);

    const handleDateSelect = (date) => {
        setPendingDate(date);
        setIsDatePickerOpen(false);
        setShowDateConfirm(true);
    };

    const confirmDateUpdate = async () => {
        const dateStr = pendingDate;
        setShowDateConfirm(false);
        setPendingDate(null);

        try {
            await onUpdate(task, { due_date: dateStr });
        } catch (err) {
            console.error("Date update error:", err);
        }
    };

    const cancelDateUpdate = () => {
        setShowDateConfirm(false);
        setPendingDate(null);
    };

    // --- Priority Methods ---
    const handlePriorityChange = (val) => {
        setPendingPriority(Number(val));
        setShowPriorityConfirm(true);
    };

    const confirmPriorityUpdate = async () => {
        const p = pendingPriority;
        setShowPriorityConfirm(false);
        setPendingPriority(null);
        try {
            await onUpdate(task, { priority: p });
        } catch (err) {
            console.error("Priority update error:", err);
        }
    };

    const cancelPriorityUpdate = () => {
        setShowPriorityConfirm(false);
        setPendingPriority(null);
    };

    const handleCategoryChange = async (val) => {
        if (!val) return;
        try {
            await onUpdate(task, { category: val });
        } catch (err) {
            console.error("Category update error:", err);
        }
    };

    const priorityNeonColors = {
        1: 'pink',
        2: 'cyan',
        3: 'green'
    };
    // ------------------------

    const addLink = () => {
        const newLinks = [...tempLinks, { label: '', url: '' }];
        setTempLinks(newLinks);
        setEditingField(`link-${newLinks.length - 1}`);
    };

    const updateLink = (index, field, value) => {
        const newLinks = [...tempLinks];
        newLinks[index][field] = value;
        setTempLinks(newLinks);
    };

    const removeLink = (index) => {
        const newLinks = tempLinks.filter((_, i) => i !== index);
        setTempLinks(newLinks);
        handleSave(title, description, newLinks, files);
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files[]', file));

        try {
            const response = await apiFetch('api/index.php?route=tasks/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.status === 'success') {
                const newFiles = [...files, ...result.files];
                setFiles(newFiles);
                await handleSave(title, description, tempLinks, newFiles);
            } else {
                alert(result.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Connection error during upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        handleSave(title, description, tempLinks, newFiles);
    };

    const renderMarkdown = (text) => {
        if (!text) return null;
        let html = text
            .replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m])
            .replace(/^###\s*(.*$)/gim, '<h3 class="text-lg font-bold text-cyber-success mt-4 mb-2">$1</h3>')
            .replace(/^##\s*(.*$)/gim, '<h2 class="text-xl font-bold text-cyber-primary mt-4 mb-2">$1</h2>')
            .replace(/^#\s*(.*$)/gim, '<h1 class="text-2xl font-bold text-cyber-secondary mt-5 mb-3 uppercase tracking-wider border-b border-cyber-secondary/30 pb-1">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyber-primary underline">$1</a>')
            .replace(/\n/g, '<br />');

        html = html.replace(/(<\/h[1-3]>)(<br \/>)+/g, '$1');

        return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const getFileIcon = (type) => {
        if (type.includes('image')) return '🖼️';
        if (type.includes('pdf')) return '📕';
        return '📄';
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-sm" onClick={() => handleSave()}>
                <div className="card-cyber text-white max-w-3xl w-full max-h-[90vh] flex flex-col p-1 overflow-hidden border-cyber-primary shadow-cyber-primary relative animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>

                    <button onClick={onClose} className={`absolute font-bold text-xl transition-colors z-50 ${theme === 'lcars' ? 'top-0 right-0 bg-[#ffaa00] text-black px-3 py-1 rounded-tr-[1.5rem] hover:brightness-110' : `top-1 ${(theme === 'matrix' || theme === 'weyland' || theme === 'cyberpunk') ? 'right-6' : 'right-1'} text-cyber-secondary hover:text-white`}`}>
                        [X]
                    </button>

                    <div className="overflow-y-auto custom-scrollbar flex-1 relative p-6 pr-8">
                        <div className="flex justify-between items-start mb-6 border-b border-cyber-gray pb-2 relative">
                            <div className="w-full pr-8">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-2">
                                    {t('tasks.dossier.title')}:
                                </span>
                                {editingField === 'title' ? (
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            onBlur={(e) => handleBlur(e, 'title')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                            className="w-full bg-black/40 border border-cyber-primary p-2 text-2xl font-bold text-white uppercase tracking-widest focus:outline-none focus:border-cyber-secondary shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-cyber-primary opacity-50 bg-black/60 px-1">ENTER to save</div>
                                    </div>
                                ) : (
                                    <div className="group relative inline-block cursor-pointer" onClick={() => setEditingField('title')} title="Click to edit title">
                                        <h2 className="text-2xl font-bold text-cyber-primary uppercase tracking-widest break-words leading-tight group-hover:text-white transition-colors">
                                            {title}
                                        </h2>
                                        <div className="absolute top-0 -right-12 opacity-0 group-hover:opacity-100 transition-opacity text-cyber-primary text-[10px] font-bold bg-black/40 border border-cyber-primary/50 px-1 py-0.5 whitespace-nowrap">
                                            [ EDIT ]
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="relative" ref={dateContainerRef}>
                                <div
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className="flex items-center gap-2 font-mono text-base px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors border border-gray-700/50 rounded"
                                    title={t('tasks.change_date')}
                                >
                                    <span className="text-cyber-secondary xp-text">🕒</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">
                                        {t('tasks.due_date')}:
                                    </span>
                                    <span className={
                                        task.due_date && new Date(task.due_date) < new Date()
                                            ? "text-red-500 font-bold"
                                            : "text-gray-300"
                                    }>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : t('tasks.no_date')}
                                    </span>
                                </div>

                                {isDatePickerOpen && (
                                    <div className="absolute left-0 z-[100] mt-1 top-full">
                                        <CyberCalendar
                                            value={task.due_date}
                                            onChange={handleDateSelect}
                                            onClose={() => setIsDatePickerOpen(false)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 font-mono text-base px-3 py-1.5 border border-gray-700/50 rounded bg-black/20">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">
                                    {t('tasks.priority')}:
                                </span>
                                <div className="w-24">
                                    <CyberSelect
                                        value={String(task.priority)}
                                        onChange={handlePriorityChange}
                                        options={[
                                            { value: '1', label: t('common.high') },
                                            { value: '2', label: t('common.med') },
                                            { value: '3', label: t('common.low') }
                                        ]}
                                        neonColor={priorityNeonColors[task.priority]}
                                        className="text-[10px] font-bold h-7"
                                        wrapperClassName={`marvel-select-prio-${task.priority}`}
                                        disabled={task.status == 1}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-base px-3 py-1.5 border border-gray-700/50 rounded bg-black/20">
                                <span className="text-cyber-secondary xp-text">📁</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-1">
                                    {t('tasks.category')}:
                                </span>
                                <div className="w-32">
                                    <CyberSelect
                                        value={task.category}
                                        onChange={handleCategoryChange}
                                        options={(categories || []).map(c => {
                                            const catName = c.name || c;
                                            return { value: catName, label: catName };
                                        })}
                                        neonColor="green"
                                        className="text-[10px] font-bold h-7"
                                        disabled={task.status == 1}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Description */}
                            <section>
                                <h3 className="text-cyber-success font-bold text-lg mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-xl">📄</span> {t('tasks.dossier.description')}
                                </h3>
                                {editingField === 'description' ? (
                                    <div className="relative group">
                                        <textarea autoFocus className="w-full h-64 bg-black/40 border border-cyber-primary p-4 text-gray-200 font-mono resize-none focus:outline-none transition-colors custom-scrollbar" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={(e) => handleBlur(e, 'description')} placeholder="Enter description..." />
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            <button title="Cancel Changes" onClick={(e) => { e.stopPropagation(); setDescription(task.description || ''); setEditingField(null); }} className="bg-red-900/80 text-white p-2 rounded hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                            </button>
                                            <button title="Save Protocol" onClick={(e) => { e.stopPropagation(); handleSave(); }} className="bg-cyber-success text-black p-2 rounded hover:brightness-110 transition-all shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black/20 border border-cyber-gray/30 p-4 rounded min-h-[100px] font-mono text-sm leading-relaxed text-gray-300 cursor-pointer hover:border-cyber-primary/50 transition-colors group relative" onClick={() => setEditingField('description')}>
                                        {description ? renderMarkdown(description) : <span className="opacity-40 italic">No description provided.</span>}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-cyber-primary text-[10px] font-bold">[ EDIT ]</div>
                                    </div>
                                )}
                            </section>

                            {/* Web Uplinks */}
                            <section>
                                <h3 className="text-cyber-success font-bold text-lg mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-xl">🔗</span> {t('tasks.dossier.attachments')}
                                </h3>
                                <div className="space-y-3">
                                    {tempLinks.map((link, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            {editingField === `link-${idx}` ? (
                                                <div className="flex gap-2 w-full bg-black/40 border border-cyber-primary p-2 group relative" onBlur={(e) => handleBlur(e, `link-${idx}`)} tabIndex="-1">
                                                    <input autoFocus type="text" placeholder="Label" value={link.label} onChange={(e) => updateLink(idx, 'label', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent border-b border-cyber-gray p-2 text-xs flex-1 focus:border-cyber-primary outline-none text-white" />
                                                    <input type="text" placeholder="URL" value={link.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="bg-transparent border-b border-cyber-gray p-2 text-xs flex-[2] focus:border-cyber-primary outline-none text-white" />
                                                    <div className="flex gap-2 pl-2 border-l border-cyber-gray">
                                                        <button title="Cancel Changes" onClick={(e) => { e.stopPropagation(); const orig = task.attachments ? JSON.parse(task.attachments) : []; setTempLinks(orig); setEditingField(null); }} className="text-red-500 hover:text-white px-1 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                                                        <button title="Save" onClick={(e) => { e.stopPropagation(); handleSave(); }} className="text-cyber-success hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full flex gap-2 group">
                                                    <div className="bg-black/30 border border-cyber-primary/30 p-3 rounded flex-1 flex justify-between items-center hover:bg-cyber-primary/50 transition-all border-l-4 border-l-cyber-primary cursor-pointer overflow-hidden" onClick={() => setEditingField(`link-${idx}`)}>
                                                        <div className="flex flex-col truncate">
                                                            <span className="font-bold text-cyber-primary text-sm uppercase truncate">{link.label || 'LINK ' + (idx + 1)}</span>
                                                            <span className="text-[10px] opacity-40 font-mono truncate">{link.url || 'No URL'}</span>
                                                        </div>
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="ml-4 p-2 bg-cyber-primary/10 rounded hover:bg-cyber-primary hover:text-black transition-colors" onClick={(e) => e.stopPropagation()}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg></a>
                                                    </div>
                                                    <button title="Remove Uplink" onClick={(e) => { e.stopPropagation(); removeLink(idx); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={(e) => { e.stopPropagation(); addLink(); }} className="w-full border border-dashed border-cyber-secondary p-2 text-xs text-cyber-secondary hover:bg-cyber-secondary/10 transition-all uppercase">+ ADD UPLINK</button>
                                </div>
                            </section>

                            {/* File Repository */}
                            <section>
                                <h3 className="text-cyber-success font-bold text-lg mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-xl">🗄️</span> FILES
                                </h3>
                                <div className="space-y-3">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex gap-2 items-center group">
                                            <div className="bg-black/30 border border-cyber-secondary/30 p-3 rounded flex-1 flex justify-between items-center hover:bg-cyber-secondary/20 transition-all border-l-4 border-l-cyber-secondary overflow-hidden">
                                                <div className="flex items-center gap-3 truncate">
                                                    <span className="text-xl">{getFileIcon(file.type)}</span>
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-bold text-cyber-secondary text-sm uppercase truncate">{file.name}</span>
                                                        <span className="text-[10px] opacity-40 font-mono">{(file.size / 1024).toFixed(1)} KB | {file.uploaded_at}</span>
                                                    </div>
                                                </div>
                                                <a href={file.path} target="_blank" rel="noopener noreferrer" className="ml-4 p-2 bg-cyber-secondary/10 rounded hover:bg-cyber-secondary hover:text-black transition-colors" onClick={(e) => e.stopPropagation()}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 11.75 12 16.25l4.5-4.5M12 3v13.25" /></svg>
                                                </a>
                                            </div>
                                            <button title="Remove File" onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                                        </div>
                                    ))}

                                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp" />
                                    <button onClick={(e) => { e.stopPropagation(); handleFileClick(); }} disabled={isUploading} className={`w-full border border-dashed border-cyber-secondary p-2 text-xs text-cyber-secondary hover:bg-cyber-secondary/10 transition-all uppercase ${isUploading ? 'opacity-50 animate-pulse' : ''}`}>
                                        {isUploading ? '[ UPLOADING EVIDENCE... ]' : '+ ATTACH FILE'}
                                    </button>
                                </div>
                            </section>
                        </div>

                        {isSaving && (
                            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-cyber-primary animate-pulse">
                                [ UPDATING PERSISTENT STORAGE... ]
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDateConfirm && (
                <CyberConfirm
                    message={t('tasks.date_confirm')}
                    onConfirm={confirmDateUpdate}
                    onCancel={cancelDateUpdate}
                    inline={false}
                    zIndex="z-[250]"
                />
            )}

            {showPriorityConfirm && (
                <CyberConfirm
                    message={t('tasks.priority_confirm')}
                    onConfirm={confirmPriorityUpdate}
                    onCancel={cancelPriorityUpdate}
                    inline={false}
                    zIndex="z-[250]"
                />
            )}
        </>
    );
};

export default DirectiveModal;
