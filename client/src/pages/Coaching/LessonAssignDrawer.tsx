import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/cn';
import {
  categoryAccent,
  categoryLabels,
  type Lesson,
  type LessonAssignment,
} from '@/lib/mock/coaching';
import {
  avatarTintFor,
  initialsOf,
  roleLabels,
  type StaffMember,
} from '@/lib/mock/staff';
import './LessonDrawer.css';

interface LessonAssignDrawerProps {
  open: boolean;
  lesson: Lesson | null;
  staff: StaffMember[];
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
}

/**
 * Dedicated assignment surface — split out from the create/edit form so adding
 * a lesson and assigning it to staff are two distinct actions (per dev request).
 * Edits only the lesson's `assignments` array; all other fields pass through.
 */
export const LessonAssignDrawer = ({
  open,
  lesson,
  staff,
  onClose,
  onSave,
}: LessonAssignDrawerProps) => {
  const [assignments, setAssignments] = useState<LessonAssignment[]>([]);
  const [staffSearch, setStaffSearch] = useState('');

  useEffect(() => {
    if (open && lesson) {
      setAssignments(lesson.assignments);
      setStaffSearch('');
    }
  }, [open, lesson]);

  const assignedSet = useMemo(
    () => new Set(assignments.map((a) => a.staffId)),
    [assignments],
  );

  const toggleAssignment = (staffId: string) => {
    setAssignments((list) => {
      const exists = list.find((a) => a.staffId === staffId);
      if (exists) return list.filter((a) => a.staffId !== staffId);
      const fresh: LessonAssignment = {
        staffId,
        completion: 0,
        completedAt: null,
        assignedAt: new Date().toISOString(),
      };
      return [...list, fresh];
    });
  };

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

  if (!lesson) return null;

  const accent = categoryAccent[lesson.category];

  const handleSave = () => {
    onSave({ ...lesson, assignments });
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assign staff"
      description="Choose who should take this lesson. The AI still auto-assigns it when a mapped KPI dips."
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSave}>
            Save assignments
          </Button>
        </>
      }
    >
      {/* Lesson context chip */}
      <div className="ss-lesson-assign__context" style={{ '--accent': accent } as React.CSSProperties}>
        <span className="ss-lesson-assign__cat" style={{ backgroundColor: accent }}>
          {categoryLabels[lesson.category]}
        </span>
        <span className="ss-lesson-assign__title">{lesson.title}</span>
      </div>

      <div className="ss-lesson-form__field">
        <div className="ss-lesson-form__picker-head">
          <label className="ss-lesson-form__label">
            Assigned staff
            <span className="ss-lesson-form__count">{assignments.length} selected</span>
          </label>
        </div>

        <Input
          placeholder="Search by name, email, or role..."
          value={staffSearch}
          onChange={(e) => setStaffSearch(e.target.value)}
          leadingIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />

        <div className="ss-lesson-picker">
          {filteredStaff.length === 0 ? (
            <div className="ss-lesson-picker__empty">No staff match "{staffSearch}"</div>
          ) : (
            filteredStaff.map((s) => {
              const checked = assignedSet.has(s.id);
              const tint = avatarTintFor(s.id);
              const assignment = assignments.find((a) => a.staffId === s.id);
              return (
                <label
                  key={s.id}
                  className={cn('ss-lesson-picker__row', checked && 'ss-lesson-picker__row--on')}
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
                      animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
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
    </Drawer>
  );
};
