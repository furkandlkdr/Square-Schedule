import React, { useState, useEffect, useRef } from 'react';
import {
    Trash2,
    Download,
    Plus,
    ChevronDown,
    Monitor,
    List,
    AlertCircle,
    Sun,
    Moon,
    Edit2
} from 'lucide-react';
import { toPng } from 'html-to-image';

// --- Constants & Config ---

const TIME_SLOTS = [
    "08:30-09:15", // 0
    "09:30-10:15", // 1
    "10:30-11:15", // 2
    "11:30-12:15", // 3
    "ÖĞLE ARASI",  // 4
    "13:30-14:15", // 5
    "14:30-15:15", // 6
    "15:30-16:15", // 7
    "16:30-17:15"  // 8
];

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];

// --- Types ---

interface Course {
    id: string;
    name: string;
    instructor: string;
    classroom: string;
    dayIndex: number; // 0=Monday
    startSlotIndex: number; // 0 to 8
    durationSlots: number;
    description?: string;
    isRetake: boolean;
    customTimeRange?: string;
}

interface ScheduleProfile {
    id: string;
    profileName: string;
    courses: Course[];
    classroomLegend?: string;
}

interface VisualBlock {
    id: string;
    startSlotIndex: number;
    endSlotIndex: number; // Inclusive end index for rendering span calculation
    courses: Course[];
    type: 'course' | 'empty' | 'lunch';
}

// --- Helper Functions ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_PROFILE: ScheduleProfile = {
    id: 'default',
    profileName: 'Programım 1',
    courses: []
};

// --- Components ---

export default function SquareScheduleMaker() {
    // State
    const [profiles, setProfiles] = useState<ScheduleProfile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string>('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
    const [editingProfileName, setEditingProfileName] = useState('');
    const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
    const [sidebarTab, setSidebarTab] = useState<'add' | 'list'>('add');
    const [isMobile, setIsMobile] = useState(false);
    const [dismissMobileWarning, setDismissMobileWarning] = useState(false);

    // Form State
    const [formDay, setFormDay] = useState(0);
    const [formStartSlot, setFormStartSlot] = useState(0);
    const [formDuration, setFormDuration] = useState(1);
    const [formName, setFormName] = useState('');
    const [formInstructor, setFormInstructor] = useState('');
    const [formClassroom, setFormClassroom] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formIsRetake, setFormIsRetake] = useState(false);

    const [scheduleTitle, setScheduleTitle] = useState('');
    const [includeTitleInSquare, setIncludeTitleInSquare] = useState(true);


    const canvasRef = useRef<HTMLDivElement>(null);

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILE;

    // Theme: default to user's interface preference unless user has saved a choice
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const stored = localStorage.getItem('theme');
            if (stored === 'light' || stored === 'dark') return stored;
        } catch (e) { }
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        try {
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) { }
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) { }
    };

    // --- Effects ---

    useEffect(() => {
        // Load from local storage
        const saved = localStorage.getItem('schedule_profiles');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) {
                setProfiles(parsed);
                setActiveProfileId(parsed[0].id);
                return;
            }
        }
        // Init default
        setProfiles([INITIAL_PROFILE]);
        setActiveProfileId(INITIAL_PROFILE.id);
    }, []);

    useEffect(() => {
        if (profiles.length > 0) {
            localStorage.setItem('schedule_profiles', JSON.stringify(profiles));
        }
    }, [profiles]);



    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);



    // --- Actions ---

    const addProfile = () => {
        const newProfile: ScheduleProfile = {
            id: generateId(),
            profileName: `Programım ${profiles.length + 1}`,
            courses: []
        };
        setProfiles([...profiles, newProfile]);
        setActiveProfileId(newProfile.id);
        setShowProfileMenu(false);
    };

    const deleteProfile = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (profiles.length === 1) {
            alert("Son profili silemezsiniz.");
            return;
        }
        const newProfiles = profiles.filter(p => p.id !== id);
        setProfiles(newProfiles);
        if (activeProfileId === id) {
            setActiveProfileId(newProfiles[0].id);
        }
    };

    const startEditProfile = (id: string, currentName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProfileId(id);
        setEditingProfileName(currentName);
    };

    const saveProfileName = (id: string) => {
        if (editingProfileName.trim()) {
            const updatedProfiles = profiles.map(p =>
                p.id === id ? { ...p, profileName: editingProfileName.trim() } : p
            );
            setProfiles(updatedProfiles);
        }
        setEditingProfileId(null);
        setEditingProfileName('');
    };

    const cancelEditProfile = () => {
        setEditingProfileId(null);
        setEditingProfileName('');
    };

    const addCourse = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName) return;

        const newCourse: Course = {
            id: generateId(),
            name: formName,
            instructor: formInstructor,
            classroom: formClassroom,
            dayIndex: Number(formDay),
            startSlotIndex: Number(formStartSlot),
            durationSlots: Number(formDuration),
            description: formDesc,
            isRetake: formIsRetake,
        };

        const updatedCourses = [...activeProfile.courses, newCourse];
        updateActiveProfileCourses(updatedCourses);

        // Reset some form fields
        setFormName('');
        setFormInstructor('');
        setFormClassroom('');
        setFormDesc('');
        setFormIsRetake(false);
    };

    const removeCourse = (courseId: string) => {
        const updatedCourses = activeProfile.courses.filter(c => c.id !== courseId);
        updateActiveProfileCourses(updatedCourses);
    };

    const updateActiveProfileCourses = (courses: Course[]) => {
        const updatedProfiles = profiles.map(p =>
            p.id === activeProfileId ? { ...p, courses } : p
        );
        setProfiles(updatedProfiles);
    };

    const updateClassroomLegend = (legend: string) => {

        const updatedProfiles = profiles.map(p =>
            p.id === activeProfileId ? { ...p, classroomLegend: legend } : p
        );
        setProfiles(updatedProfiles);
    };

    const exportAsPng = async () => {
        if (!canvasRef.current) return;
        try {
            const dataUrl = await toPng(canvasRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: theme === 'dark' ? '#334155' : '#ffffff'
            });

            const link = document.createElement('a');
            const fileName = scheduleTitle ? scheduleTitle.replace(/\s+/g, '_') : activeProfile.profileName.replace(/\s+/g, '_');
            link.download = `${fileName}_Schedule.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Dışa aktarım başarısız. Lütfen tekrar deneyin.");
        }
    };

    // --- Algorithm: Union Merge ---

    const getDayBlocks = (dayIndex: number): VisualBlock[] => {
        const dayCourses = activeProfile.courses.filter(c => c.dayIndex === dayIndex);
        const blocks: VisualBlock[] = [];

        // We need to cover slots 0 to 8
        const totalSlots = 9;

        // Helper to check overlap
        // A simplified approach: create an array of 9 slots, assign courses to them. 
        // If a slot has multiple, mark as conflict.
        // Then simplify/merge adjacent identical chunks? 
        // But the Union Merge says: "Merge... Min Start to Max End".

        // Let's stick to the prompt's algorithm explicitly
        // 1. Sort
        dayCourses.sort((a, b) => a.startSlotIndex - b.startSlotIndex);

        // 2. Merge overlapping intervals
        const mergedIntervals: { start: number; end: number; courses: Course[] }[] = [];

        if (dayCourses.length > 0) {
            let currentStart = dayCourses[0].startSlotIndex;
            // Note: duration is slots count. So end index (exclusive) is start + duration.
            // But for our grid logic, let's track exclusive end.
            let currentEnd = currentStart + dayCourses[0].durationSlots;
            let currentCourses = [dayCourses[0]];

            for (let i = 1; i < dayCourses.length; i++) {
                const c = dayCourses[i];
                const cEnd = c.startSlotIndex + c.durationSlots;

                // Check strict overlap
                if (c.startSlotIndex < currentEnd) {
                    // Overlap detected
                    currentEnd = Math.max(currentEnd, cEnd);
                    currentCourses.push(c);
                } else {
                    // No overlap, push current
                    mergedIntervals.push({ start: currentStart, end: currentEnd, courses: currentCourses });

                    currentStart = c.startSlotIndex;
                    currentEnd = cEnd;
                    currentCourses = [c];
                }
            }
            mergedIntervals.push({ start: currentStart, end: currentEnd, courses: currentCourses });
        }

        // 3. Fill gaps and build VisualBlocks
        // We iterate through 0..8
        let ptr = 0;
        for (const m of mergedIntervals) {
            // Gap before?
            if (m.start > ptr) {
                // Create gaps.
                // Special check: Lunch is at index 4.
                // If the gap crosses 4, we might want to split it (optional, but cleaner if we want to style lunch row distinct).
                // Let's just create a block for [ptr, m.start)
                blocks.push({
                    id: `gap-${dayIndex}-${ptr}`,
                    startSlotIndex: ptr,
                    endSlotIndex: m.start,
                    courses: [],
                    type: 'empty'
                });
            }

            // The merged block
            blocks.push({
                id: `block-${dayIndex}-${m.start}`,
                startSlotIndex: m.start,
                endSlotIndex: m.end,
                courses: m.courses,
                type: 'course'
            });

            ptr = m.end;
        }

        // Final gap
        if (ptr < totalSlots) {
            blocks.push({
                id: `gap-${dayIndex}-${ptr}`,
                startSlotIndex: ptr,
                endSlotIndex: totalSlots,
                courses: [],
                type: 'empty'
            });
        }

        // Now we have a set of continuous blocks covering 0 -> 9.
        // However, the LUNCH row (index 4) has a special style. 
        // If we have a block that is 'empty' and covers index 4, we should split it or style it?
        // The prompt says "Row 4: Orange-200".
        // If a course is ON index 4, it overrides lunch.
        // If it's empty, we should show the lunch bar.
        // This dictates we should probably respect the grid rows in rendering.

        return blocks;
    };

    // --- Rendering ---

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex flex-col">

            {/* Mobile Warning Banner */}
            {isMobile && !dismissMobileWarning && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3 md:hidden">
                    <div className="text-amber-600 font-semibold text-lg">⚠️</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-900 mb-2">En iyi deneyim için masaüstü sitesini ziyaret edin!</p>
                        <p className="text-xs text-amber-800 mb-3">Mobil cihazda sınırlı işlevsellik. Tarayıcınızda "Masaüstü Sitesi" modunu etkinleştirin.</p>
                        <button
                            onClick={() => setDismissMobileWarning(true)}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* MOBILE TAB NAVIGATION */}
            <div className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex">
                    <button
                        onClick={() => setMobileTab('edit')}
                        className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${mobileTab === 'edit'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        ✏️ Düzenle
                    </button>
                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${mobileTab === 'preview'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        👁️ Önizleme
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* SIDEBAR */}
                <div className={`w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col md:h-screen md:sticky md:top-0 z-10 shadow-lg overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : ''
                    }`}>
                    <div className="p-5 border-b border-slate-100 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Ders Programı
                            </h1>
                            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                            </button>
                        </div>

                        {/* Profile Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{activeProfile.profileName}</span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-20">
                                    {profiles.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                if (editingProfileId !== p.id) {
                                                    setActiveProfileId(p.id);
                                                    setShowProfileMenu(false);
                                                }
                                            }}
                                            className={`p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${activeProfileId === p.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            {editingProfileId === p.id ? (
                                                <input
                                                    type="text"
                                                    value={editingProfileName}
                                                    onChange={(e) => setEditingProfileName(e.target.value)}
                                                    onBlur={() => saveProfileName(p.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveProfileName(p.id);
                                                        if (e.key === 'Escape') cancelEditProfile();
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                    className="flex-1 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-blue-500"
                                                />
                                            ) : (
                                                <span className="flex-1">{p.profileName}</span>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => startEditProfile(p.id, p.profileName, e)}
                                                    className="text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => deleteProfile(p.id, e)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addProfile}
                                        className="w-full p-3 text-left text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
                                    >
                                        <Plus className="w-4 h-4" /> Yeni Profil
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Tabs - Add Course and Course List */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setSidebarTab('add')}
                            className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${sidebarTab === 'add'
                                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                        >
                            ➕ Ekle
                        </button>
                        <button
                            onClick={() => setSidebarTab('list')}
                            className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${sidebarTab === 'list'
                                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                        >
                            📚 Dersler ({activeProfile.courses.length})
                        </button>
                    </div>

                    {/* Add Course Form */}
                    <div className={`p-5 space-y-4 shrink-0 overflow-y-auto ${sidebarTab === 'add' ? '' : 'hidden'}`}>
                        <form onSubmit={addCourse} className="space-y-3">
                            <div>
                                <input
                                    placeholder="Ders Adı"
                                    className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={formName} onChange={e => setFormName(e.target.value)} required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2">
                                    <select
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                        value={formDay} onChange={e => setFormDay(Number(e.target.value))}
                                    >
                                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-1">
                                    <select
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                        value={formStartSlot} onChange={e => setFormStartSlot(Number(e.target.value))}
                                    >
                                        {TIME_SLOTS.map((t, i) => <option key={i} value={i}>{t.split('-')[0]}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-1 flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Süre:</span>
                                    <input
                                        type="number" min="1" max="9"
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                        value={formDuration} onChange={e => setFormDuration(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <input
                                placeholder="Eğitmen (Opsiyonel)"
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                value={formInstructor} onChange={e => setFormInstructor(e.target.value)}
                            />

                            <input
                                placeholder="Derslik (Opsiyonel)"
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                value={formClassroom} onChange={e => setFormClassroom(e.target.value)}
                            />

                            <input
                                placeholder="Açıklama (Opsiyonel)"
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded"
                                value={formDesc} onChange={e => setFormDesc(e.target.value)}
                            />

                            <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                                <input
                                    type="checkbox"
                                    checked={formIsRetake}
                                    onChange={e => setFormIsRetake(e.target.checked)}
                                    className="rounded text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium">Alttan Ders</span>
                            </label>

                            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Plus className="w-4 h-4" /> Ekle
                            </button>
                        </form>

                        {/* Classroom Legend Input */}
                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Derslik Açıklamaları</h3>
                            <textarea
                                placeholder="Örnek:&#10;A101: Ana Bina 1. Kat&#10;B203: Yeni Bina 2. Kat"
                                className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded text-xs resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                rows={4}
                                value={activeProfile.classroomLegend || ''}
                                onChange={(e) => updateClassroomLegend(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-1">Her satırda "Kod: Açıklama" formatında yazın</p>
                        </div>
                    </div>

                    {/* General Settings: Title */}
                    <div className={`p-5 space-y-4 shrink-0 overflow-y-auto ${sidebarTab === 'add' ? '' : 'hidden'} border-t border-slate-200`}>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Program Başlığı</h3>
                        <input
                            placeholder="Program Başlığı (Örn: 2024 Güz)"
                            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={scheduleTitle}
                            onChange={e => setScheduleTitle(e.target.value)}
                        />
                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 mt-2">
                            <input
                                type="checkbox"
                                checked={includeTitleInSquare}
                                onChange={e => setIncludeTitleInSquare(e.target.checked)}
                                className="rounded text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium dark:text-slate-300">Başlığı Kareye Dahil Et</span>
                        </label>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Seçili ise: Tüm görsel kare olur.<br />
                            Değilse: Program kare kalır, başlık üste eklenir.
                        </p>
                    </div>

                    {/* Course List Wrapper */}
                    <div className={`flex-1 overflow-y-auto p-5 min-h-0 ${sidebarTab === 'list' ? '' : 'hidden'}`}>
                        <div className="space-y-2">
                            {activeProfile.courses.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                                    <div className="mb-2"><List className="w-8 h-8 mx-auto opacity-20" /></div>
                                    <p className="text-sm">Henüz ders eklenmedi.</p>
                                </div>
                            ) : (
                                activeProfile.courses.map(c => (
                                    <div key={c.id} className="p-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md dark:hover:bg-slate-800 transition-all group relative">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{DAYS[c.dayIndex]}, {TIME_SLOTS[c.startSlotIndex]}</p>
                                                {c.instructor && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">{c.instructor}</p>}
                                                {c.classroom && <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">{c.classroom}</p>}
                                                {c.description && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{c.description}</p>}
                                                {c.isRetake && <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">Alttan Ders</p>}
                                            </div>
                                            <button onClick={() => removeCourse(c.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN STAGE */}
                <div className={`flex-1 bg-slate-100 dark:bg-slate-800 p-2 md:p-10 flex flex-col items-center overflow-y-auto ${mobileTab === 'edit' ? 'hidden md:flex' : ''
                    }`}>
                    <div className="mb-2 md:mb-6 flex gap-2 md:gap-4 sticky top-0 z-10 bg-slate-100 py-2">
                        <button onClick={exportAsPng} className="px-4 md:px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-900 transition-transform hover:-translate-y-1 flex items-center gap-2 font-medium text-sm md:text-base">
                            <Download className="w-4 h-4" /> PNG İndir
                        </button>
                    </div>

                    {/* CANVAS CONTAINER */}
                    <div
                        className={`w-full max-w-4xl bg-white dark:bg-slate-800 shadow-2xl relative overflow-hidden flex flex-col mb-4 ${includeTitleInSquare ? 'aspect-square' : ''}`}
                        ref={canvasRef}
                        data-export-canvas="true"
                    >
                        {/* Schedule Title */}
                        {scheduleTitle && (
                            <div className="w-full p-4 text-center bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shrink-0">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{scheduleTitle}</h2>
                            </div>
                        )}

                        {/* Header Row */}
                        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] h-12 bg-slate-900 text-white shrink-0">
                            <div className="font-bold flex items-center justify-center border-r border-slate-700 text-xs tracking-wider">SAAT</div>
                            {DAYS.map(d => (
                                <div key={d} className="font-bold flex items-center justify-center border-r border-slate-700 last:border-r-0 text-sm tracking-wide uppercase">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Grid Body */}
                        {/* We use CSS grid for the main area. */}
                        {/* 5 columns corresponding to DAYS */}
                        {/* The time column is separate or part of grid? Let's make it a flex container with Time Col + 5 Col Grid */}

                        <div className="flex-1 flex min-h-0">
                            {/* Time Column */}
                            <div className="w-[80px] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                                {TIME_SLOTS.map((slot, i) => {
                                    const isLunch = i === 4;
                                    return (
                                        <div key={i} className={`flex-1 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 p-1 text-center ${isLunch ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold' : ''}`}>
                                            {slot}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Days Grid - 5 Columns */}
                            <div className={`flex-1 grid grid-cols-5 divide-x divide-slate-200 dark:divide-slate-700 ${!includeTitleInSquare && !scheduleTitle ? 'aspect-square' : (!includeTitleInSquare ? 'aspect-square' : '')}`}>
                                {DAYS.map((_, dayIdx) => {
                                    const blocks = getDayBlocks(dayIdx);

                                    return (
                                        <div key={dayIdx} className="flex flex-col h-full bg-white dark:bg-slate-800 relative">
                                            {/* Lunch Strip Overlay (behind content) */}
                                            <div
                                                className="absolute w-full bg-indigo-50/50 pointer-events-none border-y border-indigo-200/50 flex items-center justify-center"
                                                style={{ top: `${(4 / 9) * 100}%`, height: `${(1 / 9) * 100}%`, zIndex: 0 }}
                                            />

                                            {blocks.map(block => {
                                                const span = block.endSlotIndex - block.startSlotIndex;
                                                const heightPct = (span / 9) * 100;

                                                const isConflict = block.courses.length > 1;
                                                const isRetake = block.courses.some(c => c.isRetake);

                                                return (
                                                    <div
                                                        key={block.id}
                                                        style={{ height: `${heightPct}%`, zIndex: 1 }}
                                                        className="w-full relative border-b border-slate-100 dark:border-slate-700 box-border p-1"
                                                    >
                                                        {block.type === 'course' && (
                                                            <div className={`w-full h-full rounded-md p-1 md:p-2 border flex flex-col justify-center items-center text-center overflow-hidden
                                 ${isConflict ? 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' :
                                                                    isRetake ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200' :
                                                                        'bg-sky-50 dark:bg-blue-900/40 border-sky-200 dark:border-blue-800 text-sky-800 dark:text-blue-200'
                                                                }
                               `}>
                                                                {isConflict && (
                                                                    <div className="absolute top-1 right-1 text-red-400">
                                                                        <AlertCircle className="w-3 h-3" />
                                                                    </div>
                                                                )}

                                                                {/* Content */}
                                                                {block.courses.map((c, idx) => (
                                                                    <div key={idx} className={idx > 0 ? "mt-2 pt-2 border-t border-red-200 w-full" : "w-full"}>
                                                                        <div className="font-bold text-xs md:text-sm leading-tight text-slate-900 dark:text-slate-100">{c.name}</div>
                                                                        {c.instructor && <div className="text-[10px] md:text-xs mt-0.5 font-semibold text-slate-700 dark:text-slate-300">{c.instructor}</div>}
                                                                        {c.classroom && <div className="text-[10px] md:text-xs mt-0.5 font-bold text-slate-800 dark:text-slate-200">{c.classroom}</div>}
                                                                        {c.description && <div className="text-[9px] md:text-[10px] mt-0.5 opacity-80 font-medium dark:text-slate-300">{c.description}</div>}
                                                                        {(block.endSlotIndex - block.startSlotIndex) * 1 !== c.durationSlots && (
                                                                            <div className="text-[9px] mt-0.5 font-mono opacity-70">
                                                                                {TIME_SLOTS[c.startSlotIndex].split('-')[0]} - {TIME_SLOTS[c.startSlotIndex + c.durationSlots - 1].split('-')[1]}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Legend */}
                        <div className="h-auto min-h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-8 py-4 shrink-0 gap-3 md:gap-6">
                            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-sky-100 border border-sky-300 rounded"></div> Ders</div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-amber-100 border border-amber-300 rounded"></div> Alttan</div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-red-100 border border-red-300 rounded"></div> Çakışma</div>
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-indigo-100 border border-indigo-200 rounded"></div> Öğle Arası</div>
                            </div>
                            {activeProfile.classroomLegend && (
                                <div className="flex-1 text-[10px] md:text-xs text-slate-700 dark:text-slate-300 max-w-sm">
                                    <div className="font-bold mb-1 text-slate-800 dark:text-slate-200">Derslikler:</div>
                                    {activeProfile.classroomLegend.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <div key={i} className="truncate font-medium text-slate-600 dark:text-slate-400">{line}</div>
                                    ))}
                                </div>
                            )}
                            <div className="text-xs md:text-sm text-slate-500 font-mono whitespace-nowrap w-full md:w-auto text-center md:text-right font-medium">
                                Made with ❤️ by <a href="https://furkan.software" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Nafair</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
