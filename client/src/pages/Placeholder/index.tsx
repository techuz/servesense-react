import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/primitives/Card';
import { Badge } from '@/components/primitives/Badge';
import { fadeUp, stagger } from '@/lib/motion';

export const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}
      variants={stagger(0.08, 0)}
      initial="hidden"
      animate="visible"
    >
      <motion.header
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}
        variants={fadeUp}
      >
        <h1>{title}</h1>
        <Badge tone="neutral" dot>
          Pending module
        </Badge>
      </motion.header>
      <motion.div variants={fadeUp}>
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Module placeholder</CardTitle>
            <CardDescription>
              This screen is reserved for a SOW-defined module. It will be implemented in its
              corresponding step (see roadmap in <code>CLAUDE.md</code>).
            </CardDescription>
          </CardHeader>
          <CardBody>
            <p style={{ color: 'var(--color-text-muted)' }}>
              The Arivex design system is live — once this module is in scope, the UI for{' '}
              {title.toLowerCase()} will be designed and animated here.
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};
