import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Select } from '@/components/primitives/Select';
import { Button } from '@/components/primitives/Button';
import { Switch } from '@/components/primitives/Switch';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import {
  categoryAccent,
  categoryLabels,
  categoryOrder,
  emptyLesson,
  kpiLabels,
  youtubeIdFromUrl,
  youtubeThumb,
  type Lesson,
  type LessonAssignment,
  type LessonCategory,
  type MappedKpi,
} from '@/lib/mock/coaching';
import {
  avatarTintFor,
  initialsOf,
  roleLabels,
  type StaffMember,
} from '@/lib/mock/staff';
import './LessonDrawer.css';

interface LessonDrawerProps {
  open: boolean;
  lesson: Lesson | null;
  staff: StaffMember[];
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  onDelete?: (id: string) => void;
}

export const LessonDrawer = ({
  open,
  lesson,
  staff,
  onClose,
  onSave,
  onDelete,
}: LessonDrawerProps) => {
  const { notify } = useToast();
  const [draft, setDraft] = useState<Lesson>(() => lesson ?? emptyLesson());
  const [staffSearch, setStaffSearch] = useState('');
  const isEdit = !!lesson;

  useEffect(() => {
    if (open) {
      setDraft(lesson ?? emptyLesson());
      setStaffSearch('');
    }
  }, [open, lesson]);

  const update = (patch: Partial<Lesson>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleAssignment = (staffId: string) => {
    setDraft((d) => {
      const exists = d.assignments.find((a) => a.staffId === staffId);
      if (exists) {
        return { ...d, assignments: d.assignments.filter((a) => a.staffId !== staffId) };
      }
      const fresh: LessonAssignment = {
        staffId,
        completion: 0,
        completedAt: null,
        assignedAt: new Date().toISOString(),
      };
      return { ...d, assignments: [...d.assignments, fresh] };
    });
  };

  /* --- Filtered staff for picker ------------------------------------ */
  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        roleLabels[s.role].toLowerCase().includes(q),
    );
  }, [staff, staffSearch]);

  const assignedSet = useMemo(
    () => new Set(draft.assignments.map((a) => a.staffId)),
    [draft.assignments],
  );

  /* --- Live thumbnail preview --------------------------------------- */
  const thumb = useMemo(() => youtubeThumb(draft.youtubeUrl), [draft.youtubeUrl]);
  const ytId = useMemo(() => youtubeIdFromUrl(draft.youtubeUrl), [draft.youtubeUrl]);

  /* --- Validation --------------------------------------------------- */
  const errors = useMemo(() => {
    const e: Partial<Record<keyof Lesson, string>> = {};
    if (!draft.title.trim()) e.title = 'Title is required';
    if (!draft.youtubeUrl.trim()) e.youtubeUrl = 'YouTube link is required';
    else if (!ytId) e.youtubeUrl = 'Could not detect a YouTube video ID';
    return e;
  }, [draft, ytId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      notify({
        tone: 'error',
        title: 'Fix the highlighted fields',
        description: Object.values(errors)[0],
      });
      return;
    }
    onSave(draft);
    onClose();
  };

  const accent = categoryAccent[draft.category];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit lesson' : 'New lesson'}
      description="A short, KPI-mapped video the AI can auto-recommend when scores dip."
      size="lg"
      footer={
        <>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onDelete(draft.id);
                onClose();
              }}
              style={{ marginRight: 'auto', color: 'var(--ss-danger-500)' }}
            >
              Delete lesson
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="ss-lesson-form" variant="primary">
            {isEdit ? 'Save changes' : 'Create lesson'}
          </Button>
        </>
      }
    >
      <form
        id="ss-lesson-form"
        className="ss-lesson-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* --- Live thumbnail preview ------------------------------- */}
        <div className="ss-lesson-form__preview" style={{ '--accent': accent } as React.CSSProperties}>
          {thumb ? (
            <img src={thumb} alt="" className="ss-lesson-form__preview-img" />
          ) : (
            <div className="ss-lesson-form__preview-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
              </svg>
              <span>Paste a YouTube URL to preview</span>
            </div>
          )}
          <div className="ss-lesson-form__preview-meta">
            <span
              className="ss-lesson-form__cat"
              style={{ backgroundColor: accent }}
            >
              {categoryLabels[draft.category]}
            </span>
            <span className="ss-lesson-form__preview-title">
              {draft.title.trim() || 'Untitled lesson'}
            </span>
          </div>
        </div>

        <Input
          label="Lesson title"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="e.g. Reading guest tone — the first 10 seconds"
          error={errors.title}
          required
        />

        <Textarea
          label="Description"
          value={draft.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What does this lesson cover? Why does it matter for the floor?"
          rows={3}
        />

        <Input
          label="YouTube link"
          value={draft.youtubeUrl}
          onChange={(e) => update({ youtubeUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          error={errors.youtubeUrl}
          hint={ytId ? `Video ID: ${ytId}` : undefined}
          required
        />

        <div className="ss-lesson-form__row">
          <Select
            label="Lesson type"
            value={draft.category}
            onChange={(e) => update({ category: e.target.value as LessonCategory })}
            options={categoryOrder.map((c) => ({ value: c, label: categoryLabels[c] }))}
          />
          <Select
            label="Mapped KPI"
            value={draft.mappedKpi}
            onChange={(e) => update({ mappedKpi: e.target.value as MappedKpi })}
            options={categoryOrder.map((k) => ({ value: k, label: kpiLabels[k] }))}
          />
        </div>

        {/* --- Staff multi-select ----------------------------------- */}
        <div className="ss-lesson-form__field">
          <div className="ss-lesson-form__picker-head">
            <label className="ss-lesson-form__label">
              Assigned staff
              <span className="ss-lesson-form__count">
                {draft.assignments.length} selected
              </span>
            </label>
          </div>

          <Input
            placeholder="Search by name, email, or role..."
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            leadingIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <div className="ss-lesson-picker">
            {filteredStaff.length === 0 ? (
              <div className="ss-lesson-picker__empty">
                No staff match "{staffSearch}"
              </div>
            ) : (
              filteredStaff.map((s) => {
                const checked = assignedSet.has(s.id);
                const tint = avatarTintFor(s.id);
                const assignment = draft.assignments.find((a) => a.staffId === s.id);
                return (
                  <label
                    key={s.id}
                    className={cn(
                      'ss-lesson-picker__row',
                      checked && 'ss-lesson-picker__row--on',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAssignment(s.id)}
                      className="ss-lesson-picker__cb-input"
                    />
                    <span className="ss-lesson-picker__cb" aria-hidden="true">
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        initial={false}
                        animate={{
                          scale: checked ? 1 : 0.4,
                          opacity: checked ? 1 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                      >
                        <path
                          d="M3 7.5l2.5 2.5L11 4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </span>
                    <span
                      className="ss-lesson-picker__avatar"
                      aria-hidden="true"
                      style={{ backgroundColor: tint.bg, color: tint.fg }}
                    >
                      {initialsOf(s.name)}
                    </span>
                    <div className="ss-lesson-picker__name-block">
                      <span className="ss-lesson-picker__name">{s.name}</span>
                      <span className="ss-lesson-picker__role">{roleLabels[s.role]}</span>
                    </div>
                    {checked && assignment && (
                      <span className="ss-lesson-picker__status">
                        {assignment.completion >= 0.9
                          ? 'Completed'
                          : assignment.completion > 0
                            ? `${Math.round(assignment.completion * 100)}%`
                            : 'Not started'}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="ss-lesson-form__divider" />

        <Switch
          checked={draft.isActive}
          onChange={(on) => update({ isActive: on })}
          label="Lesson is active"
          description="Archived lessons stop appearing in AI recommendations but stay assigned to staff already in progress."
        />
      </form>
    </Drawer>
  );
};
