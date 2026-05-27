import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/primitives/Badge';
import { Card } from '@/components/primitives/Card';
import {
  policySections,
  usePolicies,
  type PolicySectionKey,
  type StandardPolicies,
} from '@/lib/mock/policies';
import { fadeUp, stagger, transitions } from '@/lib/motion';
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
  const { policies, update } = usePolicies();
  const [active, setActive] = useState<PolicySectionKey>('operatingTimings');

  const sectionMeta = policySections.find((s) => s.key === active)!;

  function renderSection() {
    switch (active) {
      case 'operatingTimings':
        return (
          <OperatingTimingsSection
            value={policies.operatingTimings}
            onChange={(p) => update('operatingTimings', p)}
          />
        );
      case 'waitingPolicy':
        return (
          <WaitingPolicySection
            value={policies.waitingPolicy}
            onChange={(p) => update('waitingPolicy', p)}
          />
        );
      case 'reservationPolicy':
        return (
          <ReservationPolicySection
            value={policies.reservationPolicy}
            onChange={(p) => update('reservationPolicy', p)}
          />
        );
      case 'tableHolding':
        return (
          <TableHoldingSection
            value={policies.tableHolding}
            onChange={(p) => update('tableHolding', p)}
          />
        );
      case 'diningRules':
        return (
          <DiningRulesSection
            value={policies.diningRules}
            onChange={(p) => update('diningRules', p)}
          />
        );
      case 'guestAccommodation':
        return (
          <GuestAccommodationSection
            value={policies.guestAccommodation}
            onChange={(p) => update('guestAccommodation', p)}
          />
        );
      case 'payments':
        return (
          <PaymentsSection
            value={policies.payments}
            onChange={(p) => update('payments', p)}
          />
        );
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
          <span className="eyebrow">Orientation · §3.1</span>
          <h1>Standard Policies</h1>
          <p className="ss-policies__lede">
            Define the service rules every member of staff and the AI assistant should follow.
            These policies become the single source of truth referenced during live conversations.
          </p>
        </div>
        <Badge tone="warning" subtle dot>
          Mandatory
        </Badge>
      </motion.header>

      <motion.div className="ss-policies__shell" variants={fadeUp}>
        <PolicyNav policies={policies} active={active} onSelect={setActive} />

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

          <SaveHint policies={policies} active={active} />
        </main>
      </motion.div>
    </motion.div>
  );
};

const SaveHint = ({ policies: _policies, active }: { policies: StandardPolicies; active: PolicySectionKey }) => (
  <motion.div
    className="ss-policies__save-hint"
    key={active}
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <span className="ss-policies__save-dot" aria-hidden="true" />
    Changes are saved automatically. The AI uses these rules on its next live session.
  </motion.div>
);

export default PoliciesPage;
