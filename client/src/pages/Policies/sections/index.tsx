import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';
import type {
  DiningRules,
  GuestAccommodation,
  Payments,
  ReservationPolicy,
  TableHolding,
  WaitingPolicy,
} from '@/lib/mock/policies';
import {
  BoolGrid,
  BoolPill,
  Fact,
  FactGrid,
  RulesBlock,
  SubsectionLabel,
} from '../Display';

/* ============================================================================
   Read-only policy section views. Content is the PDF the manager uploaded
   on the orientation upload step (SOW §3.1). No editable inputs here.
   ============================================================================ */

/* ---------- Waiting Policy ----------------------------------------------- */
export const WaitingPolicySection = ({ value }: { value: WaitingPolicy }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <FactGrid>
        <Fact
          label="Walk-ins"
          value={<BoolPill on={value.walkInsAllowed} label={value.walkInsAllowed ? 'Allowed' : 'Reservations only'} />}
        />
        <Fact label="Maximum wait time" value={`${value.maxWaitMinutes} minutes`} />
      </FactGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="Queue & wait-list rules" body={value.queueRules} />
    </motion.div>
  </motion.div>
);

/* ---------- Reservation Policy ------------------------------------------- */
export const ReservationPolicySection = ({ value }: { value: ReservationPolicy }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <FactGrid>
        <Fact
          label="Reservations"
          value={<BoolPill on={value.bookingEnabled} label={value.bookingEnabled ? 'Accepted' : 'Walk-ins only'} />}
        />
        <Fact label="Advance booking window" value={`${value.advanceBookingDays} days`} />
        <Fact label="Cancellation window" value={`${value.cancellationWindowHours} hours`} />
        <Fact label="Min / max party size" value={`${value.minPartySize} – ${value.maxPartySize} guests`} />
        <Fact label="No-show fee" value={value.noShowFee || '—'} fullWidth />
      </FactGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="Reservation rules" body={value.rules} />
    </motion.div>
  </motion.div>
);

/* ---------- Table Holding ------------------------------------------------ */
export const TableHoldingSection = ({ value }: { value: TableHolding }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <FactGrid>
        <Fact label="Hold time past reservation" value={`${value.maxHoldMinutes} minutes`} fullWidth />
      </FactGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="Holding rules" body={value.rules} />
    </motion.div>
  </motion.div>
);

/* ---------- Dining Rules ------------------------------------------------- */
export const DiningRulesSection = ({ value }: { value: DiningRules }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <SubsectionLabel>Service modes</SubsectionLabel>
      <BoolGrid>
        <BoolPill on={value.dineIn} label="Dine-in" />
        <BoolPill on={value.takeaway} label="Takeaway" />
        <BoolPill on={value.delivery} label="Delivery" />
      </BoolGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <SubsectionLabel>Restrictions</SubsectionLabel>
      <BoolGrid>
        <BoolPill on={value.outsideFoodAllowed} label="Outside food allowed" />
        <BoolPill on={value.byob} label="BYOB" />
      </BoolGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="House rules" body={value.rules} />
    </motion.div>
  </motion.div>
);

/* ---------- Guest Accommodation ------------------------------------------ */
export const GuestAccommodationSection = ({ value }: { value: GuestAccommodation }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <SubsectionLabel>Accessibility & accommodation</SubsectionLabel>
      <BoolGrid>
        <BoolPill on={value.childSeating} label="Child-friendly seating" />
        <BoolPill on={value.highChairs} label="High chairs available" />
        <BoolPill on={value.elderlyAssistance} label="Elderly assistance" />
        <BoolPill on={value.wheelchairAccessible} label="Wheelchair accessible" />
        <BoolPill on={value.petFriendly} label="Pet friendly" />
        <BoolPill on={value.groupBookings} label="Large group bookings" />
      </BoolGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="Outlet-specific notes" body={value.notes} />
    </motion.div>
  </motion.div>
);

/* ---------- Payments ----------------------------------------------------- */
export const PaymentsSection = ({ value }: { value: Payments }) => (
  <motion.div className="ss-policy-view" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <SubsectionLabel>Accepted payment methods</SubsectionLabel>
      <BoolGrid>
        <BoolPill on={value.cash} label="Cash" />
        <BoolPill on={value.card} label="Credit / debit card" />
        <BoolPill on={value.upi} label="UPI" />
        <BoolPill on={value.netBanking} label="Net banking" />
        <BoolPill on={value.wallets} label="Digital wallets" />
      </BoolGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <FactGrid>
        <Fact
          label="Split bills"
          value={<BoolPill on={value.splitBills} label={value.splitBills ? 'Supported' : 'Not supported'} />}
          fullWidth
        />
      </FactGrid>
    </motion.div>
    <motion.div variants={fadeUp}>
      <RulesBlock label="Payment notes" body={value.notes} />
    </motion.div>
  </motion.div>
);
