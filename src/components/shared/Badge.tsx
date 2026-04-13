type BadgeVariant = 'streak' | 'milestone' | 'goal' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, string> = {
  streak: 'bg-orange-100 text-orange-700',
  milestone: 'bg-yellow-100 text-yellow-700',
  goal: 'bg-emerald-100 text-emerald-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ label, variant = 'info', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantMap[variant]} ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      {label}
    </span>
  );
}
