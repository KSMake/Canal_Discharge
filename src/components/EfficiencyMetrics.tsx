import { Gauge } from 'lucide-react';
import { DischargeRecord } from '../lib/dataLoader';
import { formatNumber } from '../lib/analytics';

interface EfficiencyMetricsProps {
  data: DischargeRecord[];
}

const channelCapacities: Record<string, number> = {
  'LNK': 32,
  'BNK': 61.9,
  'BFK_KDP': 150,
  'SFK': 110,
  'Zardarya': 70,
  'YGK': 330,
  'NDK': 75,
  'VDK': 43,
  'Dustlik_canal': 230,
  'Bekabad_canal': 6.0,
  'NST_Mekhnat_Zafarabad': 6.0,
};

export function EfficiencyMetrics({ data }: EfficiencyMetricsProps) {
  if (data.length === 0) return null;

  const objectCode = data[0]?.object_code;
  const channelCapacity = channelCapacities[objectCode];

  if (!channelCapacity) return null;

  const avgDischarge = data.reduce((sum, r) => sum + r.value, 0) / data.length;
  const utilizationRate = (avgDischarge / channelCapacity) * 100;

  const getUtilizationColor = () => {
    if (utilizationRate > 90) return 'orange';
    if (utilizationRate < 30) return 'blue';
    return 'green';
  };

  const color = getUtilizationColor();

  const colorClasses = {
    orange: {
      bg: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-900',
      subtext: 'text-orange-700',
      icon: 'bg-orange-200 text-orange-700',
      bar: 'from-orange-500 to-orange-600',
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-900',
      subtext: 'text-green-700',
      icon: 'bg-green-200 text-green-700',
      bar: 'from-green-500 to-green-600',
    },
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-900',
      subtext: 'text-blue-700',
      icon: 'bg-blue-200 text-blue-700',
      bar: 'from-blue-500 to-blue-600',
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-50 rounded-lg">
          <Gauge className="w-5 h-5 text-teal-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Загруженность канала</h3>
      </div>

      <div className="space-y-6">
        <div className={`bg-gradient-to-br ${colorClasses[color].bg} rounded-xl p-6 border ${colorClasses[color].border}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm font-medium ${colorClasses[color].subtext} mb-2`}>
                Средняя загруженность канала
              </div>
              <div className={`text-4xl font-bold ${colorClasses[color].text}`}>
                {formatNumber(utilizationRate, 1)}%
              </div>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color].icon}`}>
              <Gauge className="w-8 h-8" strokeWidth={2.5} />
            </div>
          </div>

          <div className="h-3 bg-white bg-opacity-50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colorClasses[color].bar} transition-all duration-500`}
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>

          <div className={`text-sm ${colorClasses[color].subtext} mt-3 font-medium`}>
            {formatNumber(avgDischarge, 2)} м³/сек из {channelCapacity} м³/сек
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Пропускная способность</div>
            <div className="text-3xl font-bold text-gray-900">{channelCapacity}</div>
            <div className="text-xs text-gray-600 mt-1">м³/сек</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="text-xs font-medium text-blue-700 mb-2">Средний расход</div>
            <div className="text-3xl font-bold text-blue-900">{formatNumber(avgDischarge, 2)}</div>
            <div className="text-xs text-blue-600 mt-1">м³/сек</div>
          </div>
        </div>
      </div>
    </div>
  );
}
