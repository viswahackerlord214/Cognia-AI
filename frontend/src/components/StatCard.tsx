import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'text-blue-400',
}) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-blue-500/50 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-[#8b949e] font-semibold">{title}</span>
        <div className={`p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-xs text-[#8b949e]">{subtitle}</p>}
    </div>
  );
};
