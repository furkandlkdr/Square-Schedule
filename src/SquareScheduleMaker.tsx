import React, { useState, useEffect, useRef } from 'react';
import {
    Trash2,
    Download,
    Plus,
    ChevronDown,
    Monitor,
    List,
    AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';

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

    // Form State
    const [formDay, setFormDay] = useState(0);
    const [formStartSlot, setFormStartSlot] = useState(0);
    const [formDuration, setFormDuration] = useState(1);
    const [formName, setFormName] = useState('');
    const [formInstructor, setFormInstructor] = useState('');
    const [formClassroom, setFormClassroom] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formIsRetake, setFormIsRetake] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

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

    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILE;

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

    const exportAsPng = async () => {
        if (!canvasRef.current) return;
        try {
            const canvas = await html2canvas(canvasRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `${activeProfile.profileName.replace(/\s+/g, '_')}_Schedule.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Hata oluştu.");
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
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">

            {/* SIDEBAR */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 md:overflow-y-auto z-10 shadow-lg">
                <div className="p-5 border-b border-slate-100">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        Ders Programı
                    </h1>

                    {/* Profile Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-slate-500" />
                                <span className="font-medium">{activeProfile.profileName}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-20">
                                {profiles.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => { setActiveProfileId(p.id); setShowProfileMenu(false); }}
                                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${activeProfileId === p.id ? 'bg-blue-50 text-blue-700' : ''}`}
                                    >
                                        <span>{p.profileName}</span>
                                        <button onClick={(e) => deleteProfile(p.id, e)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addProfile}
                                    className="w-full p-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-slate-100"
                                >
                                    <Plus className="w-4 h-4" /> Yeni Profil
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Course Form */}
                <div className="p-5 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Ders Ekle</h2>
                    <form onSubmit={addCourse} className="space-y-3">
                        <div>
                            <input
                                placeholder="Ders Adı"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={formName} onChange={e => setFormName(e.target.value)} required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <select
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                                    value={formDay} onChange={e => setFormDay(Number(e.target.value))}
                                >
                                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <select
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                                    value={formStartSlot} onChange={e => setFormStartSlot(Number(e.target.value))}
                                >
                                    {TIME_SLOTS.map((t, i) => <option key={i} value={i}>{t.split('-')[0]}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1 flex items-center gap-2">
                                <span className="text-xs text-slate-400">Süre:</span>
                                <input
                                    type="number" min="1" max="9"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                                    value={formDuration} onChange={e => setFormDuration(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <input
                            placeholder="Eğitmen (Opsiyonel)"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                            value={formInstructor} onChange={e => setFormInstructor(e.target.value)}
                        />

                        <input
                            placeholder="Derslik (Opsiyonel)"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                            value={formClassroom} onChange={e => setFormClassroom(e.target.value)}
                        />

                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
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
                </div>

                {/* Course List Wrapper */}
                <div className="flex-1 overflow-y-auto p-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dersler</h2>
                        <span className="text-xs font-mono text-slate-400">{activeProfile.courses.length} Ders</span>
                    </div>

                    <div className="space-y-2">
                        {activeProfile.courses.map(c => (
                            <div key={c.id} className="p-3 bg-white border border-slate-200 rounded shadow-sm hover:shadow-md transition-shadow group relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{c.name}</h3>
                                        <p className="text-xs text-slate-500">{DAYS[c.dayIndex]}, {TIME_SLOTS[c.startSlotIndex]}</p>
                                    </div>
                                    <button onClick={() => removeCourse(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeProfile.courses.length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                <div className="mb-2"><List className="w-8 h-8 mx-auto opacity-20" /></div>
                                <p className="text-sm">Henüz ders eklenmedi.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN STAGE */}
            <div className="flex-1 bg-slate-100 p-4 md:p-10 flex flex-col items-center justify-center overflow-auto">
                <div className="mb-6 flex gap-4">
                    <button onClick={exportAsPng} className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-900 transition-transform hover:-translate-y-1 flex items-center gap-2 font-medium">
                        <Download className="w-4 h-4" /> PNG İndir
                    </button>
                </div>

                {/* CANVAS CONTAINER - ASPECT RATIO 1/1 */}
                {/* We use a max-width to ensure it fits screen, but it will maintain square aspect */}
                <div className="w-full max-w-4xl aspect-square bg-white shadow-2xl relative overflow-hidden flex flex-col" ref={canvasRef}>

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
                        <div className="w-[80px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                            {TIME_SLOTS.map((slot, i) => {
                                const isLunch = i === 4;
                                return (
                                    <div key={i} className={`flex-1 flex items-center justify-center border-b border-slate-200 text-[9px] md:text-[10px] font-medium text-slate-500 p-1 text-center ${isLunch ? 'bg-orange-50 text-orange-600 font-bold' : ''}`}>
                                        {slot}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Days Grid - 5 Columns */}
                        <div className="flex-1 grid grid-cols-5 divide-x divide-slate-200">
                            {DAYS.map((_, dayIdx) => {
                                const blocks = getDayBlocks(dayIdx);

                                return (
                                    <div key={dayIdx} className="flex flex-col h-full bg-white relative">
                                        {/* Lunch Strip Overlay (behind content) */}
                                        <div
                                            className="absolute w-full bg-orange-100/50 pointer-events-none border-y border-orange-200/50 flex items-center justify-center"
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
                                                    className="w-full relative border-b border-slate-100 box-border p-1"
                                                >
                                                    {block.type === 'course' && (
                                                        <div className={`w-full h-full rounded-md p-1 md:p-2 border flex flex-col justify-center items-center text-center overflow-hidden
                                 ${isConflict ? 'bg-red-50 border-red-200 text-red-800' :
                                                                isRetake ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                                                    'bg-sky-50 border-sky-200 text-sky-800'
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
                                                                    <div className="font-bold text-[10px] md:text-xs leading-tight">{c.name}</div>
                                                                    {c.classroom && <div className="text-[9px] mt-0.5 opacity-80">{c.classroom}</div>}
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
                    <div className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-sky-100 border border-sky-300 rounded"></div> Ders</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div> Alttan</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> Çakışma</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div> Öğle Arası</div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                            Generated by SquareSchedule
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
