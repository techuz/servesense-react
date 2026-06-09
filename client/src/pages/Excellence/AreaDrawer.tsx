import { FormEvent, useEffect, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Textarea } from '@/components/primitives/Textarea';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/lib/toast';
import type { ExcellenceArea } from '@/lib/mock/excellence';

interface AreaDrawerProps {
  open: boolean;
  area: ExcellenceArea | null;
  onClose: () => void;
  onSave: (key: ExcellenceArea['key'], patch: { focus: string }) => void;
}

export const AreaDrawer = ({ open, area, onClose, onSave }: AreaDrawerProps) => {
  const { notify } = useToast();
  const [focus, setFocus] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && area) {
      setFocus(area.focus);
      setTouched(false);
    }
  }, [open, area]);

  if (!area) return <Drawer open={open} onClose={onClose} title="Edit area" size="md"><div /></Drawer>;

  const focusError = touched && !focus.trim() ? 'Focus is required' : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!focus.trim()) {
      notify({ tone: 'error', title: 'Add the focus', description: 'Describe the advanced standard for this area.' });
      return;
    }
    onSave(area.key, { focus: focus.trim() });
    notify({ tone: 'success', title: 'Area updated', description: area.name });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={`Edit ${area.name}`} size="md">
      <form className="ss-area-form" onSubmit={handleSubmit}>
        <Textarea
          label="Focus"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder="The advanced standard for this area."
          error={focusError}
          required
        />
        <div className="ss-area-form__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
