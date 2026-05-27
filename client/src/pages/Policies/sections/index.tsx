import { motion } from 'framer-motion';
import { Input } from '@/components/primitives/Input';
import { Textarea } from '@/components/primitives/Textarea';
import { Switch } from '@/components/primitives/Switch';
import { Checkbox } from '@/components/primitives/Checkbox';
import { fadeUp, stagger } from '@/lib/motion';
import type {
  DiningRules,
  GuestAccommodation,
  Payments,
  ReservationPolicy,
  TableHolding,
  WaitingPolicy,
} from '@/lib/mock/policies';

/* ---------- Waiting Policy ----------------------------------------------- */
export const WaitingPolicySection = ({
  value,
  onChange,
}: {
  value: WaitingPolicy;
  onChange: (patch: Partial<WaitingPolicy>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <Switch
        checked={value.walkInsAllowed}
        onChange={(on) => onChange({ walkInsAllowed: on })}
        label="Allow walk-ins"
        description="Guests without a reservation can be seated subject to availability."
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Input
        label="Maximum wait time (minutes)"
        type="number"
        min={0}
        max={180}
        value={value.maxWaitMinutes}
        onChange={(e) => onChange({ maxWaitMinutes: Number(e.target.value) })}
        hint="The longest wait you commit to before suggesting an alternative outlet or time slot."
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="Queue & wait-list rules"
        value={value.queueRules}
        onChange={(e) => onChange({ queueRules: e.target.value })}
        rows={4}
        hint="How walk-ins are queued, group-size handling, wait-list notifications."
      />
    </motion.div>
  </motion.div>
);

/* ---------- Reservation Policy ------------------------------------------- */
export const ReservationPolicySection = ({
  value,
  onChange,
}: {
  value: ReservationPolicy;
  onChange: (patch: Partial<ReservationPolicy>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <Switch
        checked={value.bookingEnabled}
        onChange={(on) => onChange({ bookingEnabled: on })}
        label="Accept reservations"
        description="Allow guests to book in advance. Turn off for walk-ins only."
      />
    </motion.div>

    <motion.div variants={fadeUp} className="ss-policy-form__row">
      <Input
        label="Advance booking window (days)"
        type="number"
        min={1}
        max={365}
        value={value.advanceBookingDays}
        onChange={(e) => onChange({ advanceBookingDays: Number(e.target.value) })}
      />
      <Input
        label="Cancellation window (hours)"
        type="number"
        min={0}
        max={72}
        value={value.cancellationWindowHours}
        onChange={(e) => onChange({ cancellationWindowHours: Number(e.target.value) })}
      />
    </motion.div>

    <motion.div variants={fadeUp} className="ss-policy-form__row">
      <Input
        label="Minimum party size"
        type="number"
        min={1}
        value={value.minPartySize}
        onChange={(e) => onChange({ minPartySize: Number(e.target.value) })}
      />
      <Input
        label="Maximum party size"
        type="number"
        min={1}
        value={value.maxPartySize}
        onChange={(e) => onChange({ maxPartySize: Number(e.target.value) })}
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Input
        label="No-show fee"
        value={value.noShowFee}
        onChange={(e) => onChange({ noShowFee: e.target.value })}
        placeholder="e.g. ₹500 per person"
        hint="Communicated upfront and charged for missed reservations."
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="Reservation rules"
        value={value.rules}
        onChange={(e) => onChange({ rules: e.target.value })}
        rows={4}
        hint="Full text of the policy as it'll be quoted during a guest conversation."
      />
    </motion.div>
  </motion.div>
);

/* ---------- Table Holding ------------------------------------------------ */
export const TableHoldingSection = ({
  value,
  onChange,
}: {
  value: TableHolding;
  onChange: (patch: Partial<TableHolding>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <Input
        label="Hold time past reservation (minutes)"
        type="number"
        min={0}
        max={60}
        value={value.maxHoldMinutes}
        onChange={(e) => onChange({ maxHoldMinutes: Number(e.target.value) })}
        hint="How long a reserved table is held before it's released to walk-ins."
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="Holding rules"
        value={value.rules}
        onChange={(e) => onChange({ rules: e.target.value })}
        rows={4}
        hint="How late guests are contacted, escalation, when the table is released."
      />
    </motion.div>
  </motion.div>
);

/* ---------- Dining Rules ------------------------------------------------- */
export const DiningRulesSection = ({
  value,
  onChange,
}: {
  value: DiningRules;
  onChange: (patch: Partial<DiningRules>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <span className="ss-policy-form__label">Service modes</span>
      <div className="ss-policy-form__check-grid">
        <Checkbox
          checked={value.dineIn}
          onChange={(on) => onChange({ dineIn: on })}
          label="Dine-in"
          description="On-premise service"
        />
        <Checkbox
          checked={value.takeaway}
          onChange={(on) => onChange({ takeaway: on })}
          label="Takeaway"
          description="Self-pickup"
        />
        <Checkbox
          checked={value.delivery}
          onChange={(on) => onChange({ delivery: on })}
          label="Delivery"
          description="Direct or partner platforms"
        />
      </div>
    </motion.div>

    <motion.div variants={fadeUp}>
      <span className="ss-policy-form__label">Restrictions</span>
      <div className="ss-policy-form__check-grid">
        <Checkbox
          checked={value.outsideFoodAllowed}
          onChange={(on) => onChange({ outsideFoodAllowed: on })}
          label="Outside food allowed"
          description="Snacks, packed meals, etc."
        />
        <Checkbox
          checked={value.byob}
          onChange={(on) => onChange({ byob: on })}
          label="BYOB"
          description="Bring your own bottle"
        />
      </div>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="House rules"
        value={value.rules}
        onChange={(e) => onChange({ rules: e.target.value })}
        rows={4}
        hint="Other rules staff cannot override — cake plating fees, attire, photography, etc."
      />
    </motion.div>
  </motion.div>
);

/* ---------- Guest Accommodation ------------------------------------------ */
export const GuestAccommodationSection = ({
  value,
  onChange,
}: {
  value: GuestAccommodation;
  onChange: (patch: Partial<GuestAccommodation>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <span className="ss-policy-form__label">Accessibility & accommodation</span>
      <div className="ss-policy-form__check-grid">
        <Checkbox
          checked={value.childSeating}
          onChange={(on) => onChange({ childSeating: on })}
          label="Child-friendly seating"
        />
        <Checkbox
          checked={value.highChairs}
          onChange={(on) => onChange({ highChairs: on })}
          label="High chairs available"
        />
        <Checkbox
          checked={value.elderlyAssistance}
          onChange={(on) => onChange({ elderlyAssistance: on })}
          label="Elderly assistance"
        />
        <Checkbox
          checked={value.wheelchairAccessible}
          onChange={(on) => onChange({ wheelchairAccessible: on })}
          label="Wheelchair accessible"
        />
        <Checkbox
          checked={value.petFriendly}
          onChange={(on) => onChange({ petFriendly: on })}
          label="Pet friendly"
        />
        <Checkbox
          checked={value.groupBookings}
          onChange={(on) => onChange({ groupBookings: on })}
          label="Large group bookings"
        />
      </div>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="Outlet-specific notes"
        value={value.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={4}
        hint="Practical guidance the AI will share — entrance details, kid-menu, allergen handling for groups."
      />
    </motion.div>
  </motion.div>
);

/* ---------- Payments ----------------------------------------------------- */
export const PaymentsSection = ({
  value,
  onChange,
}: {
  value: Payments;
  onChange: (patch: Partial<Payments>) => void;
}) => (
  <motion.div className="ss-policy-form" variants={stagger(0.06)} initial="hidden" animate="visible">
    <motion.div variants={fadeUp}>
      <span className="ss-policy-form__label">Accepted payment methods</span>
      <div className="ss-policy-form__check-grid">
        <Checkbox checked={value.cash} onChange={(on) => onChange({ cash: on })} label="Cash" />
        <Checkbox checked={value.card} onChange={(on) => onChange({ card: on })} label="Credit / debit card" />
        <Checkbox checked={value.upi} onChange={(on) => onChange({ upi: on })} label="UPI" />
        <Checkbox checked={value.netBanking} onChange={(on) => onChange({ netBanking: on })} label="Net banking" />
        <Checkbox checked={value.wallets} onChange={(on) => onChange({ wallets: on })} label="Digital wallets" />
      </div>
    </motion.div>

    <motion.div variants={fadeUp}>
      <Switch
        checked={value.splitBills}
        onChange={(on) => onChange({ splitBills: on })}
        label="Split bills supported"
        description="Allow guests to split the bill across multiple payment methods or people."
      />
    </motion.div>

    <motion.div variants={fadeUp}>
      <Textarea
        label="Payment notes"
        value={value.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        rows={3}
        hint="Service charge, tipping policy, currency notes for tourists."
      />
    </motion.div>
  </motion.div>
);
