import { BellRing, CircleCheckBig, CircleX, Clock3, PhoneCall } from 'lucide-react';

// Sales pipeline every customer lead moves through (career CVs use the hiring pipeline).
export const LEAD_STAGES = {
  PENDING: { label: 'Pending', hint: 'Nobody has contacted them yet', icon: Clock3 },
  CONTACTED: { label: 'Contacted', hint: 'First call / email done', icon: PhoneCall },
  FOLLOW_UP: { label: 'Follow-up', hint: 'Interested — talk again on a date', icon: BellRing },
  CONVERTED: { label: 'Converted', hint: 'Booked / became a customer', icon: CircleCheckBig },
  REJECTED: { label: 'Rejected', hint: 'Not interested, spam or no answer', icon: CircleX }
};

export const STAGE_FLOW = ['PENDING', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED'];

export const stageClass = (stage) => `stage-${String(stage).toLowerCase().replace('_', '-')}`;

export function StagePill({ stage }) {
  if (!stage) return <span className="lead-stage is-none">Hiring</span>;
  const meta = LEAD_STAGES[stage] || { label: stage, icon: Clock3 };
  const Icon = meta.icon;
  return <span className={`lead-stage ${stageClass(stage)}`}><Icon size={12} />{meta.label}</span>;
}

// "YYYY-MM-DD" in local time, for date inputs and day comparisons.
export const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
