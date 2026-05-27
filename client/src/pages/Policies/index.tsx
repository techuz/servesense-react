import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Card } from '@/components/primitives/Card';
import {
  policySections,
  usePolicies,
  type PolicySectionKey,
} from '@/lib/mock/policies';
import { useOrientationSource } from '@/lib/mock/orientationSource';
import { useToast } from '@/lib/toast';
import { fadeUp, stagger, transitions } from '@/lib/motion';
import {
  OrientationReplaceDrawer,
  OrientationSourceBanner,
  OrientationUpload,
} from '@/components/orientation';
import { PolicyNav } from './PolicyNav';
import { OperatingTimingsSection } from './sections/OperatingTimings';
import {
  DiningRulesSection,
  GuestAccommodationSection,
  PaymentsSection,
  ReservationPolicySection,
  TableHoldingSection,
  WaitingPolicySection,
} from './sections';
import './Policies.css';

export const PoliciesPage = () => {
  const { policies } = usePolicies();
  const { source, uploadSource, clearSource, meta } = useOrientationSource('policies');
  const { notify } = useToast();
  const [active, setActive] = useState<PolicySectionKey>('operatingTimings');
  const [replaceOpen, setReplaceOpen] = useState(false);

  const handleRemove = () => {
    clearSource();
    notify({
      tone: 'info',
      title: 'Policy document removed',
      description: 'Upload a new PDF to populate this section.',
    });
  };

  const sectionMeta = policySections.find((s) => s.key === active)!;

  function renderSection() {
    switch (active) {
      case 'operatingTimings':
        return <OperatingTimingsSection value={policies.operatingTimings} />;
      case 'waitingPolicy':
        return <WaitingPolicySection value={policies.waitingPolicy} />;
      case 'reservationPolicy':
        return <ReservationPolicySection value={policies.reservationPolicy} />;
      case 'tableHolding':
        return <TableHoldingSection value={policies.tableHolding} />;
      case 'diningRules':
        return <DiningRulesSection value={policies.diningRules} />;
      case 'guestAccommodation':
        return <GuestAccommodationSection value={policies.guestAccommodation} />;
      case 'payments':
        return <PaymentsSection value={policies.payments} />;
    }
  }

  return (
    <motion.div
      className="ss-policies"
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="ss-policies__page-header" variants={fadeUp}>
        <div>
          <span className="eyebrow">Orientation · {meta.sowRef}</span>
          <h1>Standard Policies</h1>
          <p className="ss-policies__lede">
            The service rules every staff member and the AI assistant follow. Content is parsed
            from the policy PDF you uploaded — replace the document to update.
          </p>
        </div>
        <Badge tone="warning" subtle dot>
          Mandatory
        </Badge>
      </motion.header>

      {source ? (
        <>
          <OrientationSourceBanner
            source={source}
            onReplace={() => setReplaceOpen(true)}
            onRemove={handleRemove}
          />

          <motion.div className="ss-policies__shell" variants={fadeUp}>
            <PolicyNav active={active} onSelect={setActive} />

            <main className="ss-policies__content">
              <Card padding="lg">
                <header className="ss-policies__section-header">
                  <h2>{sectionMeta.title}</h2>
                  <p className="ss-policies__section-desc">{sectionMeta.description}</p>
                </header>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={transitions.base}
                  >
                    {renderSection()}
                  </motion.div>
                </AnimatePresence>
              </Card>
            </main>
          </motion.div>
        </>
      ) : (
        <motion.div variants={fadeUp}>
          <OrientationUpload module={meta} onComplete={uploadSource} />
        </motion.div>
      )}

      <OrientationReplaceDrawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        module={meta}
        onComplete={uploadSource}
      />
    </motion.div>
  );
};

export default PoliciesPage;
