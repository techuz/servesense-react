import { Drawer } from '@/components/primitives/Drawer';
import { OrientationUpload } from './OrientationUpload';
import type { OrientationModuleMeta, OrientationSource } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  module: OrientationModuleMeta;
  onComplete: (source: OrientationSource) => void;
}

/**
 * Drawer wrapper around OrientationUpload — used by the "Replace PDF" flow
 * once a module already has a source document. The empty-state flow renders
 * OrientationUpload inline (no drawer) so a brand-new manager lands on a
 * full-screen call to action.
 */
export const OrientationReplaceDrawer = ({ open, onClose, module, onComplete }: Props) => (
  <Drawer
    open={open}
    onClose={onClose}
    title={`Replace ${module.label} document`}
    description="Upload a new PDF. The current content is replaced once parsing completes."
    size="md"
  >
    <OrientationUpload
      module={module}
      variant="replace"
      onComplete={(source) => {
        onComplete(source);
        onClose();
      }}
    />
  </Drawer>
);
