import { useState } from 'react';
import { LucideIcon, Info } from 'lucide-react';
import { formatNumber } from '../lib/analytics';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-violet-100 text-violet-600',
  teal: 'bg-teal-100 text-teal-600',
};

export function MetricsCard({ title, value, unit, subtitle, description, icon: Icon, color = 'blue' }: MetricsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all relative group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {description && (
              <div className="relative">
                <Info
                  className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute left-0 top-6 z-50 w-64 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3">
                    <div className="absolute -top-2 left-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                    {description}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
            {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
