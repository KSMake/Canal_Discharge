import { Droplets, TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { SeasonalAnalytics } from '../lib/analytics';
import { MetricsCard } from './MetricsCard';

interface SeasonalAnalysisProps {
  season: 'vegetation' | 'non_vegetation';
  analytics: SeasonalAnalytics;
}

export function SeasonalAnalysis({ season, analytics }: SeasonalAnalysisProps) {
  const isVegetation = season === 'vegetation';
  const title = isVegetation ? 'Вегетационный сезон' : 'Межвегетационный сезон';
  const period = isVegetation ? 'Апрель - Сентябрь' : 'Октябрь - Март';

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            {period}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${
          isVegetation ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
        }`}>
          <Droplets className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricsCard
          title="Общий объём"
          value={analytics.totalVolumeMillion}
          unit="млн.м³"
          subtitle={`За ${analytics.daysCount} дней`}
          description="Суммарный объём воды за период. Рассчитывается как: Расход (м³/сек) × 86400 сек/день × количество дней. Данные: головные водозаборные сооружения (БВО Сырдарья)."
          icon={Droplets}
          color={isVegetation ? 'green' : 'blue'}
        />

        <MetricsCard
          title="Средний расход"
          value={analytics.avgDischarge}
          unit="м³/сек"
          subtitle={`За ${analytics.daysCount} дней`}
          description="Среднее арифметическое всех измерений расхода воды за период. Показывает типичную интенсивность водозабора."
          icon={Activity}
          color="teal"
        />

        <MetricsCard
          title="Максимальный расход"
          value={analytics.maxDischarge}
          unit="м³/сек"
          description="Максимальное зафиксированное значение расхода воды за период. Не должно превышать пропускную способность канала."
          icon={TrendingUp}
          color="orange"
        />

        <MetricsCard
          title="Минимальный расход"
          value={analytics.minDischarge}
          unit="м³/сек"
          description="Минимальное зафиксированное значение расхода воды за период. Показывает базовый уровень водозабора."
          icon={TrendingDown}
          color="blue"
        />

        <MetricsCard
          title="Индекс изменчивости"
          value={analytics.variabilityIndex}
          subtitle="Отношение (макс-мин)/среднее"
          description="Показатель вариативности расхода воды. Чем выше значение, тем больше колебания между минимальными и максимальными значениями."
          icon={Activity}
          color="red"
        />

        <MetricsCard
          title="Количество дней"
          value={analytics.daysCount}
          unit="дней"
          subtitle="Доступных измерений"
          description="Общее количество дней с измерениями за выбранный период. Показывает полноту данных."
          icon={Calendar}
          color="green"
        />
      </div>
    </div>
  );
}
