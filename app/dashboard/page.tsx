'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Kid, Skill, Grade, Accomplishment, CommunityComment, EmploymentEntry, EducationEntry } from '@/lib/types';

type CategoryOption = 'education' | 'health' | 'housing';

const CATEGORY_COLOR: Record<CategoryOption, string> = {
  education: 'from-emerald-500 to-teal-400',
  health: 'from-teal-500 to-cyan-400',
  housing: 'from-cyan-500 to-emerald-400',
};
const CATEGORY_ICON: Record<CategoryOption, string> = {
  education: '📚',
  health: '❤️',
  housing: '🏠',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<{ kids: Kid[] } | null>(null);
  const [selectedKid, setSelectedKid] = useState(0);
  const [activeTab, setActiveTab] = useState<'resume' | 'comments'>('resume');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Add-entry state
  const [newSkill, setNewSkill] = useState<Omit<Skill, 'id' | 'earnedAt'>>({ name: '', category: '', level: 'beginner' });
  const [newGrade, setNewGrade] = useState<Omit<Grade, 'id'>>({ subject: '', grade: '', period: '' });
  const [newAccomplishment, setNewAccomplishment] = useState<Omit<Accomplishment, 'id'>>({ title: '', description: '', date: '', category: '' });
  const [newEmployment, setNewEmployment] = useState<Omit<EmploymentEntry, 'id'>>({ employer: '', title: '', startDate: '', endDate: '', description: '' });
  const [newEducation, setNewEducation] = useState<Omit<EducationEntry, 'id'>>({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' });
  const [showAddKid, setShowAddKid] = useState(false);
  const [newKidForm, setNewKidForm] = useState({ name: '', age: '', rank: '', program: '' });
  const [addKidError, setAddKidError] = useState('');
  const [confirmRemoveKid, setConfirmRemoveKid] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((d) => setProfile(d));
    }
  }, [status]);

  const kid: Kid | undefined = profile?.kids[selectedKid];

  useEffect(() => {
    if (!kid) return;
    fetch(`/api/kids/${kid.kidId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  }, [kid?.kidId]);

  const save = async (updatedKids: Kid[]) => {
    setSaving(true);
    setMsg('');
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kids: updatedKids }),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) {
      setProfile(d);
      setMsg('Saved!');
      setTimeout(() => setMsg(''), 2000);
    } else {
      setMsg(d.error ?? 'Save failed.');
    }
  };

  /** Resize an image file client-side to max 800×800 WebP (≤ 4 MB) before uploading */
  const resizeImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const MAX_PX = 800;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
            'image/webp',
            0.88,
          );
        };
        img.onerror = reject;
        img.src = e.target!.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !kid) return;
    e.target.value = '';

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const resized = await resizeImage(file);
      const form = new FormData();
      form.append('file', resized, `avatar-${Date.now()}.webp`);

      const res = await fetch(`/api/kids/${kid.kidId}/avatar`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      // Patch local state so the UI updates immediately without a full refetch
      setProfile((prev) => {
        if (!prev) return prev;
        const updatedKids = prev.kids.map((k, i) =>
          i === selectedKid ? { ...k, avatarUrl: data.url } : k,
        );
        return { ...prev, kids: updatedKids };
      });
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const updateKidField = (field: keyof Kid, value: unknown) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, [field]: value } : k));
    save(updated);
  };

  const addSkill = () => {
    if (!kid || !newSkill.name.trim()) return;
    const skill: Skill = { id: crypto.randomUUID(), ...newSkill, earnedAt: new Date().toISOString() };
    const updated = profile!.kids.map((k, i) => (i === selectedKid ? { ...k, skills: [...k.skills, skill] } : k));
    save(updated);
    setNewSkill({ name: '', category: '', level: 'beginner' });
  };

  const removeSkill = (id: string) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, skills: k.skills.filter((s) => s.id !== id) } : k));
    save(updated);
  };

  const addGrade = () => {
    if (!kid || !newGrade.subject.trim()) return;
    const grade: Grade = { id: crypto.randomUUID(), ...newGrade };
    const updated = profile!.kids.map((k, i) => (i === selectedKid ? { ...k, grades: [...k.grades, grade] } : k));
    save(updated);
    setNewGrade({ subject: '', grade: '', period: '' });
  };

  const addAccomplishment = () => {
    if (!kid || !newAccomplishment.title.trim()) return;
    const a: Accomplishment = { id: crypto.randomUUID(), ...newAccomplishment };
    const updated = profile!.kids.map((k, i) => (i === selectedKid ? { ...k, accomplishments: [...k.accomplishments, a] } : k));
    save(updated);
    setNewAccomplishment({ title: '', description: '', date: '', category: '' });
  };

  const removeGrade = (id: string) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, grades: k.grades.filter((g) => g.id !== id) } : k));
    save(updated);
  };

  const removeAccomplishment = (id: string) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, accomplishments: k.accomplishments.filter((a) => a.id !== id) } : k));
    save(updated);
  };

  const addEmployment = () => {
    if (!kid || !newEmployment.employer.trim() || !newEmployment.title.trim()) return;
    const entry: EmploymentEntry = { id: crypto.randomUUID(), ...newEmployment };
    const updated = profile!.kids.map((k, i) => (i === selectedKid ? { ...k, employment: [...(k.employment ?? []), entry] } : k));
    save(updated);
    setNewEmployment({ employer: '', title: '', startDate: '', endDate: '', description: '' });
  };

  const removeEmployment = (id: string) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, employment: (k.employment ?? []).filter((e) => e.id !== id) } : k));
    save(updated);
  };

  const addEducation = () => {
    if (!kid || !newEducation.institution.trim()) return;
    const entry: EducationEntry = { id: crypto.randomUUID(), ...newEducation };
    const updated = profile!.kids.map((k, i) => (i === selectedKid ? { ...k, education: [...(k.education ?? []), entry] } : k));
    save(updated);
    setNewEducation({ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' });
  };

  const removeEducation = (id: string) => {
    if (!profile) return;
    const updated = profile.kids.map((k, i) => (i === selectedKid ? { ...k, education: (k.education ?? []).filter((e) => e.id !== id) } : k));
    save(updated);
  };

  const addKid = async () => {
    if (!newKidForm.name.trim() || !newKidForm.age || !newKidForm.rank.trim()) {
      setAddKidError('Name, age, and rank are required.');
      return;
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let kidId = 'GD-';
    for (let i = 0; i < 6; i++) kidId += chars[Math.floor(Math.random() * chars.length)];
    const newKid: Kid = {
      kidId,
      name: newKidForm.name.trim(),
      age: parseInt(newKidForm.age),
      rank: newKidForm.rank.trim(),
      program: newKidForm.program.trim() || undefined,
      status: 'pending',
      skills: [],
      grades: [],
      accomplishments: [],
      employment: [],
      education: [],
      communityFunds: { education: 0, health: 0, housing: 0 },
      selectedCategory: 'education',
      hideContactInfo: parseInt(newKidForm.age) < 18,
    };
    const updatedKids = [...(profile?.kids ?? []), newKid];
    await save(updatedKids);
    setShowAddKid(false);
    setNewKidForm({ name: '', age: '', rank: '', program: '' });
    setAddKidError('');
    setSelectedKid(updatedKids.length - 1);
  };

  const removeKid = async (index: number) => {
    if (!profile) return;
    const updated = profile.kids.filter((_, i) => i !== index);
    await save(updated);
    setSelectedKid(0);
    setConfirmRemoveKid(null);
  };

  const moderateComment = async (commentId: string, action: 'approved' | 'rejected') => {
    if (!kid) return;
    await fetch(`/api/kids/${kid.kidId}/comments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, action }),
    });
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, status: action } : c)));
  };

  if (status === 'loading' || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950">
        <div className="text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-slate-100 text-base">
          <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm select-none">💡</span> Good Deeds
        </a>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {session?.user?.username}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Kid selector */}
        <div className="flex items-center gap-3 flex-wrap">
          {profile.kids.map((k, i) => (
            <button
              key={k.kidId}
              onClick={() => { setSelectedKid(i); setActiveTab('resume'); setConfirmRemoveKid(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                i === selectedKid
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
              }`}
            >
              {k.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddKid(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            ＋ Add Kid
          </button>
          {msg && (
            <span className={`text-xs font-semibold ml-auto ${msg === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>
              {saving ? 'Saving…' : msg}
            </span>
          )}
        </div>

        {kid && (
          <>
            {/* Kid card header */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Clickable avatar — click to replace photo */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md group focus:outline-none focus:ring-2 focus:ring-emerald-500 shrink-0"
                title="Click to change photo"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl select-none border border-slate-200 dark:border-slate-600">
                  {kid.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={kid.avatarUrl} alt={kid.name} className="w-20 h-20 rounded-2xl object-cover" />
                  ) : '🌟'}
                </div>
                {/* Hover / uploading overlay */}
                <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-black/50 text-white text-xs font-semibold transition-opacity ${
                  avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {avatarUploading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.172a2 2 0 001.414-.586l.828-.828A2 2 0 018.828 5h6.344a2 2 0 011.414.586l.828.828A2 2 0 0019.828 7H20a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Edit
                    </>
                  )}
                </div>
              </button>
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
              />
              {avatarError && (
                <p className="text-xs text-red-500 mt-1 text-center w-20">{avatarError}</p>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kid.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {kid.rank} {kid.program ? `· ${kid.program}` : ''} · Age {kid.age}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1 font-mono font-semibold">
                    {kid.kidId}
                  </span>
                  <a
                    href={`/resume/${kid.kidId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    View Public Resume ↗
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-emerald-600"
                    checked={kid.hideContactInfo}
                    onChange={(e) => updateKidField('hideContactInfo', e.target.checked)}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">Hide contact info (privacy)</span>
                </label>
                <select
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-slate-700 dark:text-slate-300"
                  value={kid.selectedCategory}
                  onChange={(e) => updateKidField('selectedCategory', e.target.value)}
                >
                  <option value="education">Funds → Education</option>
                  <option value="health">Funds → Health</option>
                  <option value="housing">Funds → Housing</option>
                </select>
                {confirmRemoveKid === selectedKid ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Remove {kid.name}?</p>
                    <div className="flex gap-2">
                      <button onClick={() => removeKid(selectedKid)} className="text-xs rounded-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 font-semibold transition-colors">Yes, Remove</button>
                      <button onClick={() => setConfirmRemoveKid(null)} className="text-xs rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 font-semibold transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRemoveKid(selectedKid)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors mt-1 text-left">
                    Remove student…
                  </button>
                )}
              </div>
            </div>

            {/* Community Funds Progress */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Community Funds Raised</h2>
              <div className="space-y-4">
                {(['education', 'health', 'housing'] as CategoryOption[]).map((cat) => {
                  const total =
                    (kid.communityFunds.education ?? 0) +
                    (kid.communityFunds.health ?? 0) +
                    (kid.communityFunds.housing ?? 0);
                  const amount = kid.communityFunds[cat] ?? 0;
                  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {CATEGORY_ICON[cat]} {cat}
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          ${(amount / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLOR[cat]} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(kid.communityFunds.education + kid.communityFunds.health + kid.communityFunds.housing) === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
                    No tips received yet. Share your resume to get started!
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
              {(['resume', 'comments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab}
                  {tab === 'comments' && comments.filter((c) => c.status === 'pending').length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {comments.filter((c) => c.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                {/* Bio */}
                <Section title="Bio">
                  <textarea
                    className={input + ' h-28 resize-none'}
                    placeholder="Write a short bio for this student…"
                    value={kid.bio ?? ''}
                    onChange={(e) => {
                      if (!profile) return;
                      const updated = profile.kids.map((k, i) =>
                        i === selectedKid ? { ...k, bio: e.target.value } : k,
                      );
                      setProfile({ ...profile, kids: updated });
                    }}
                    onBlur={() => updateKidField('bio', kid.bio)}
                  />
                </Section>

                {/* Skills */}
                <Section title="Skills">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {kid.skills.map((s) => (
                      <div key={s.id} className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {s.name} <span className="opacity-60">· {s.level}</span>
                        <button onClick={() => removeSkill(s.id)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className={inputSm} placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))} />
                    <input className={inputSm} placeholder="Category" value={newSkill.category} onChange={(e) => setNewSkill((p) => ({ ...p, category: e.target.value }))} />
                    <select className={inputSm} value={newSkill.level} onChange={(e) => setNewSkill((p) => ({ ...p, level: e.target.value as Skill['level'] }))}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button onClick={addSkill} className={btnAdd}>+ Add Skill</button>
                  </div>
                </Section>

                {/* Grades */}
                <Section title="Grades">
                  <div className="space-y-2 mb-4">
                    {kid.grades.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-2 text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">{g.subject}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{g.grade}</span>
                        <span className="text-slate-400 text-xs">{g.period}</span>
                        <button onClick={() => removeGrade(g.id)} className="text-red-400 hover:text-red-600 ml-1 text-base leading-none">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className={inputSm} placeholder="Subject" value={newGrade.subject} onChange={(e) => setNewGrade((p) => ({ ...p, subject: e.target.value }))} />
                    <input className={inputSm} placeholder="Grade (A, 95…)" value={newGrade.grade} onChange={(e) => setNewGrade((p) => ({ ...p, grade: e.target.value }))} />
                    <input className={inputSm} placeholder="Period (Fall 2025…)" value={newGrade.period} onChange={(e) => setNewGrade((p) => ({ ...p, period: e.target.value }))} />
                    <button onClick={addGrade} className={btnAdd}>+ Add Grade</button>
                  </div>
                </Section>

                {/* Accomplishments */}
                <Section title="Accomplishments">
                  <div className="space-y-3 mb-4">
                    {kid.accomplishments.map((a) => (
                      <div key={a.id} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{a.title}</div>
                          <button onClick={() => removeAccomplishment(a.id)} className="text-red-400 hover:text-red-600 shrink-0 leading-none">×</button>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.description}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.date} {a.category && `· ${a.category}`}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className={inputSm} placeholder="Title" value={newAccomplishment.title} onChange={(e) => setNewAccomplishment((p) => ({ ...p, title: e.target.value }))} />
                    <input className={inputSm} placeholder="Description" value={newAccomplishment.description} onChange={(e) => setNewAccomplishment((p) => ({ ...p, description: e.target.value }))} />
                    <input className={inputSm} type="date" value={newAccomplishment.date} onChange={(e) => setNewAccomplishment((p) => ({ ...p, date: e.target.value }))} />
                    <input className={inputSm} placeholder="Category" value={newAccomplishment.category} onChange={(e) => setNewAccomplishment((p) => ({ ...p, category: e.target.value }))} />
                    <button onClick={addAccomplishment} className={btnAdd}>+ Add</button>
                  </div>
                </Section>

                {/* Work Experience */}
                <Section title="Work Experience">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Optional — add jobs, internships, or volunteer roles as the student grows.</p>
                  <div className="space-y-2 mb-4">
                    {(kid.employment ?? []).map((e) => (
                      <div key={e.id} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{e.title}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm"> at {e.employer}</span>
                          </div>
                          <button onClick={() => removeEmployment(e.id)} className="text-red-400 hover:text-red-600 shrink-0 leading-none">×</button>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — Present'}</div>
                        {e.description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{e.description}</div>}
                      </div>
                    ))}
                    {!(kid.employment?.length) && <p className="text-sm text-slate-400 dark:text-slate-500 italic">No work experience added yet.</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className={inputSm} placeholder="Employer" value={newEmployment.employer} onChange={(e) => setNewEmployment((p) => ({ ...p, employer: e.target.value }))} />
                    <input className={inputSm} placeholder="Job Title" value={newEmployment.title} onChange={(e) => setNewEmployment((p) => ({ ...p, title: e.target.value }))} />
                    <input className={inputSm} placeholder="Start (2024-06)" value={newEmployment.startDate} onChange={(e) => setNewEmployment((p) => ({ ...p, startDate: e.target.value }))} />
                    <input className={inputSm} placeholder="End (blank = Present)" value={newEmployment.endDate ?? ''} onChange={(e) => setNewEmployment((p) => ({ ...p, endDate: e.target.value }))} />
                    <input className={inputSm} placeholder="Description (optional)" value={newEmployment.description ?? ''} onChange={(e) => setNewEmployment((p) => ({ ...p, description: e.target.value }))} />
                    <button onClick={addEmployment} className={btnAdd}>+ Add</button>
                  </div>
                </Section>

                {/* Education History */}
                <Section title="Education History">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Optional — track schools, colleges, and certifications over time.</p>
                  <div className="space-y-2 mb-4">
                    {(kid.education ?? []).map((e) => (
                      <div key={e.id} className="rounded-xl bg-slate-50 dark:bg-slate-700/50 px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{e.institution}</span>
                            {e.degree && <span className="text-slate-500 dark:text-slate-400 text-sm"> · {e.degree}{e.field ? `, ${e.field}` : ''}</span>}
                          </div>
                          <button onClick={() => removeEducation(e.id)} className="text-red-400 hover:text-red-600 shrink-0 leading-none">×</button>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ' — In Progress'}</div>
                        {e.description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{e.description}</div>}
                      </div>
                    ))}
                    {!(kid.education?.length) && <p className="text-sm text-slate-400 dark:text-slate-500 italic">No education history added yet.</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input className={inputSm} placeholder="Institution" value={newEducation.institution} onChange={(e) => setNewEducation((p) => ({ ...p, institution: e.target.value }))} />
                    <input className={inputSm} placeholder="Degree / Program" value={newEducation.degree ?? ''} onChange={(e) => setNewEducation((p) => ({ ...p, degree: e.target.value }))} />
                    <input className={inputSm} placeholder="Field of Study" value={newEducation.field ?? ''} onChange={(e) => setNewEducation((p) => ({ ...p, field: e.target.value }))} />
                    <input className={inputSm} placeholder="Start (2024-09)" value={newEducation.startDate} onChange={(e) => setNewEducation((p) => ({ ...p, startDate: e.target.value }))} />
                    <input className={inputSm} placeholder="End (blank = In Progress)" value={newEducation.endDate ?? ''} onChange={(e) => setNewEducation((p) => ({ ...p, endDate: e.target.value }))} />
                    <button onClick={addEducation} className={btnAdd}>+ Add</button>
                  </div>
                </Section>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Community members can leave positive comments on {kid.name}&apos;s public resume. Approve or reject them here before they appear publicly.
                </p>
                {comments.length === 0 && (
                  <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No comments yet.
                  </div>
                )}
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-2xl bg-white dark:bg-slate-800 border p-5 ${
                      c.status === 'pending'
                        ? 'border-amber-200 dark:border-amber-800'
                        : c.status === 'approved'
                        ? 'border-emerald-200 dark:border-emerald-800'
                        : 'border-red-200 dark:border-red-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{c.authorName}</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.body}</p>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(c.createdAt).toLocaleDateString()}
                          {' · '}
                          <span
                            className={
                              c.status === 'approved'
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : c.status === 'pending'
                                ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
                                : 'text-red-500 dark:text-red-400 font-semibold'
                            }
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                      {c.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => moderateComment(c.id, 'approved')}
                            className="text-xs rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => moderateComment(c.id, 'rejected')}
                            className="text-xs rounded-full border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Kid Modal */}
      {showAddKid && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-7 relative">
            <button
              onClick={() => { setShowAddKid(false); setAddKidError(''); setNewKidForm({ name: '', age: '', rank: '', program: '' }); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-5">Add a Student</h2>
            {addKidError && <p className="text-sm text-red-500 mb-3">{addKidError}</p>}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Full Name *</label>
                <input className={input} placeholder="Student's full name" value={newKidForm.name} onChange={(e) => setNewKidForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Age *</label>
                <input className={input} type="number" min="1" max="25" placeholder="Age" value={newKidForm.age} onChange={(e) => setNewKidForm((p) => ({ ...p, age: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Rank / Level *</label>
                <input className={input} placeholder="e.g. White Belt, Grade 3, Sophomore" value={newKidForm.rank} onChange={(e) => setNewKidForm((p) => ({ ...p, rank: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Program (optional)</label>
                <input className={input} placeholder="e.g. Martial Arts, STEM Club" value={newKidForm.program} onChange={(e) => setNewKidForm((p) => ({ ...p, program: e.target.value }))} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                The student will be added with <strong>pending</strong> status.
              </p>
              <button
                onClick={addKid}
                disabled={saving}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 text-sm transition-colors"
              >
                {saving ? 'Adding…' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

const input =
  'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';
const inputSm =
  'rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500';
const btnAdd =
  'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 transition-colors';
