import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/primitives/Switch';
import { fadeUp, transitions } from '@/lib/motion';
import { cn } from '@/lib/cn';
import {
  categoryAccent,
  categoryLabels,
  kpiLabels,
  lessonCompletedCount,
  lessonCompletionPct,
  youtubeThumb,
  type Lesson,
} from '@/lib/mock/coaching';
import {
  avatarTintFor,
  initialsOf,
  type StaffMember,
} from '@/lib/mock/staff';

interface LessonCardProps {
  lesson: Lesson;
  staff: StaffMember[];
  onEdit: () => void;
  onToggleActive: () => void;
}

const MAX_AVATAR_STACK = 4;

export const LessonCard = ({ lesson, staff, onEdit, onToggleActive }: LessonCardProps) => {
  const [thumbBroken, setThumbBroken] = useState(false);
  const thumb = useMemo(() => youtubeThumb(lesson.youtubeUrl), [lesson.youtubeUrl]);
  const pct = lessonCompletionPct(lesson);
  const completed = lessonCompletedCount(lesson);
  const accent = categoryAccent[lesson.category];

  const assignees = useMemo(() => {
    const map = new Map(staff.map((s) => [s.id, s]));
    return lesson.assignments
      .map((a) => map.get(a.staffId))
      .filter((s): s is StaffMember => !!s);
  }, [staff, lesson.assignments]);

  return (
    <motion.article
      className={cn(
        'ss-lesson',
        !lesson.isActive && 'ss-lesson--archived',
      )}
      style={{ '--lesson-accent': accent } as React.CSSProperties}
      variants={fadeUp}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={transitions.base}
      whileHover={{ y: -2 }}
    >
      <button
        type="button"
        className="ss-lesson__hit"
        onClick={onEdit}
        aria-label={`Edit ${lesson.title}`}
      />

      {/* --- Header: small thumb + meta + title --------------------- */}
      <header className="ss-lesson__header">
        <div className="ss-lesson__thumb">
          {thumb && !thumbBroken ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              onError={() => setThumbBroken(true)}
              className="ss-lesson__thumb-img"
            />
          ) : (
            <div className="ss-lesson__thumb-fallback" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
              </svg>
            </div>
          )}
          <div className="ss-lesson__thumb-overlay" aria-hidden="true">
            <div className="ss-lesson__play">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="ss-lesson__head-text">
          <div className="ss-lesson__meta">
            <span className="ss-lesson__cat" style={{ color: accent }}>
              <span
                className="ss-lesson__cat-dot"
                aria-hidden="true"
                style={{ backgroundColor: accent }}
              />
              {categoryLabels[lesson.category]}
            </span>
            <span className="ss-lesson__meta-sep" aria-hidden="true">·</span>
            <span className="ss-lesson__kpi">KPI: {kpiLabels[lesson.mappedKpi]}</span>
          </div>
          <h3 className="ss-lesson__title">{lesson.title}</h3>
          {lesson.description && (
            <p className="ss-lesson__desc">{lesson.description}</p>
          )}
        </div>
      </header>

      {/* --- Stats row: assignees + progress ------------------------- */}
      <div className="ss-lesson__stats">
        <div className="ss-lesson__assignees">
          {assignees.length === 0 ? (
            <span className="ss-lesson__assignees-empty">No staff assigned</span>
          ) : (
            <>
              <div className="ss-lesson__avatars">
                {assignees.slice(0, MAX_AVATAR_STACK).map((s) => {
                  const tint = avatarTintFor(s.id);
                  return (
                    <span
                      key={s.id}
                      className="ss-lesson__avatar"
                      title={s.name}
                      style={{ backgroundColor: tint.bg, color: tint.fg }}
                    >
                      {initialsOf(s.name)}
                    </span>
                  );
                })}
                {assignees.length > MAX_AVATAR_STACK && (
                  <span className="ss-lesson__avatar ss-lesson__avatar--more">
                    +{assignees.length - MAX_AVATAR_STACK}
                  </span>
                )}
              </div>
              <span className="ss-lesson__assignee-count">
                <strong>{completed}</strong>
                <span className="ss-lesson__assignee-count-sep">/</span>
                {assignees.length} done
              </span>
            </>
          )}
        </div>

        <div className="ss-lesson__progress">
          <div className="ss-lesson__progress-track" aria-hidden="true">
            <motion.div
              className="ss-lesson__progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="ss-lesson__progress-pct">{Math.round(pct * 100)}%</span>
        </div>
      </div>

      {/* --- Action bar: status + edit ------------------------------ */}
      <div className="ss-lesson__actions" onClick={(e) => e.stopPropagation()}>
        <div className="ss-lesson__status">
          <Switch
            checked={lesson.isActive}
            onChange={onToggleActive}
            size="sm"
            aria-label={lesson.isActive ? 'Archive lesson' : 'Reactivate lesson'}
          />
          <span
            className={cn(
              'ss-lesson__status-label',
              lesson.isActive
                ? 'ss-lesson__status-label--on'
                : 'ss-lesson__status-label--off',
            )}
          >
            <span className="ss-lesson__status-dot" aria-hidden="true" />
            {lesson.isActive ? 'Active' : 'Archived'}
          </span>
        </div>

        <button
          type="button"
          className="ss-lesson__edit-btn"
          onClick={onEdit}
        >
          Edit
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </motion.article>
  );
};
