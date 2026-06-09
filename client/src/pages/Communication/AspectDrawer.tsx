import { FormEvent, useEffect, useState } from 'react';
import { Drawer } from '@/components/primitives/Drawer';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/lib/toast';
import type { CommAspect } from '@/lib/mock/communication';

interface AspectDrawerProps {
  open: boolean;
  aspect: CommAspect | null;
  onClose: () => void;
  onSave: (key: CommAspect['key'], patch: { trainedBehavior: string; purpose: string }) => void;
}

export const AspectDrawer = ({ open, aspect, onClose, onSave }: AspectDrawerProps) => {
  const { notify } = useToast();
  const [trainedBehavior, setTrainedBehavior] = useState('');
  const [purpose, setPurpose] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && aspect) {
      setTrainedBehavior(aspect.trainedBehavior);
      setPurpose(aspect.purpose);
      setTouched(false);
    }
  }, [open, aspect]);

  if (!aspect) return <Drawer open={open} onClose={onClose} title="Edit standard" size="md"><div /></Drawer>;

  const behaviorError = touched && !trainedBehavior.trim() ? 'Trained behavior is required' : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!trainedBehavior.trim()) {
      notify({ tone: 'error', title: 'Add the trained behavior', description: 'Describe how staff should handle this aspect.' });
      return;
    }
    onSave(aspect.key, { trainedBehavior: trainedBehavior.trim(), purpose: purpose.trim() });
    notify({ tone: 'success', title: 'Standard updated', description: aspect.name });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={`Edit ${aspect.name} standard`} size="md">
      <form className="ss-comm-form" onSubmit={handleSubmit}>
        <Textarea
          label="Trained behavior"
          value={trainedBehavior}
          onChange={(e) => setTrainedBehavior(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder="How staff should sound or behave for this aspect."
          error={behaviorError}
          required
        />
        <Input
          label="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g. De-escalation"
          hint="Why this matters — shown as the aspect's tag."
        />

        <div className="ss-comm-form__actions">
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
