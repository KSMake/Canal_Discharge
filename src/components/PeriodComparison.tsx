import { ArrowUpRight, ArrowDownRight, Minus, Calendar } from 'lucide-react';
import { DischargeRecord } from '../lib/dataLoader';
import { formatNumber } from '../lib/analytics';

interface PeriodComparisonProps {
  data: DischargeRecord[];
}

export function PeriodComparison({ data }: PeriodComparisonProps) {
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const midPoint = Math.floor(sortedData.length / 2);
  const firstHalf = sortedData.slice(0, midPoint);
  const secondHalf = sortedData.slice(midPoint);

  const calcAvg = (records: DischargeRecord[]) => {
    if (records.length === 0) return 0;
    return records.reduce((sum, r) => sum + r.value, 0) / records.length;
  };

  const firstAvg = calcAvg(firstHalf);
  const secondAvg = calcAvg(secondHalf);
  const percentChange = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  const firstPeriod = `${new Date(firstHalf[0].date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })} - ${new Date(firstHalf[firstHalf.length - 1].date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}`;
  const secondPeriod = `${new Date(secondHalf[0].date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })} - ${new Date(secondHalf[secondHalf.length - 1].date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}`;

  const isIncrease = percentChange > 0;
  const isDecrease = percentChange < 0;
  const isStable = Math.abs(percentChange) < 5;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-50 rounded-lg">
          <Calendar className="w-5 h-5 text-violet-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Сравнение периодов</h3>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="text-xs font-medium text-blue-700 mb-2">Первая половина периода</div>
            <div className="text-2xl font-bold text-blue-900 mb-1">{formatNumber(firstAvg)} м³/сек</div>
            <div className="text-xs text-blue-600">{firstPeriod}</div>
            <div className="text-xs text-blue-500 mt-2">{firstHalf.length} измерений</div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border border-teal-200">
            <div className="text-xs font-medium text-teal-700 mb-2">Вторая половина периода</div>
            <div className="text-2xl font-bold text-teal-900 mb-1">{formatNumber(secondAvg)} м³/сек</div>
            <div className="text-xs text-teal-600">{secondPeriod}</div>
            <div className="text-xs text-teal-500 mt-2">{secondHalf.length} измерений</div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border-2 ${
          isIncrease ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' :
          isDecrease ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
          'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm font-medium mb-2 ${
                isIncrease ? 'text-orange-700' :
                isDecrease ? 'text-green-700' :
                'text-gray-700'
              }`}>
                Изменение расхода
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${
                  isIncrease ? 'text-orange-900' :
                  isDecrease ? 'text-green-900' :
                  'text-gray-900'
                }`}>
                  {percentChange > 0 ? '+' : ''}{formatNumber(percentChange, 1)}%
                </div>
                <div className={`p-2 rounded-lg ${
                  isIncrease ? 'bg-orange-200' :
                  isDecrease ? 'bg-green-200' :
                  'bg-gray-200'
                }`}>
                  {isIncrease && <ArrowUpRight className="w-6 h-6 text-orange-700" strokeWidth={3} />}
                  {isDecrease && <ArrowDownRight className="w-6 h-6 text-green-700" strokeWidth={3} />}
                  {!isIncrease && !isDecrease && <Minus className="w-6 h-6 text-gray-700" strokeWidth={3} />}
                </div>
              </div>
            </div>
            <div className={`text-sm ${
              isIncrease ? 'text-orange-600' :
              isDecrease ? 'text-green-600' :
              'text-gray-600'
            }`}>
              <div className="font-semibold">
                {isStable && 'Стабильный расход'}
                {!isStable && isIncrease && 'Увеличение расхода'}
                {!isStable && isDecrease && 'Снижение расхода'}
              </div>
              <div className="text-xs mt-1">
                {formatNumber(Math.abs(secondAvg - firstAvg), 2)} м³/сек
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Интерпретация</div>
          <div className="text-sm text-gray-600">
            {isStable && 'Расход воды остался относительно стабильным между двумя периодами (изменение менее 5%).'}
            {!isStable && isIncrease && 'Во второй половине периода наблюдается увеличение водозабора. Это может быть связано с сезонными факторами или изменением потребностей.'}
            {!isStable && isDecrease && 'Во второй половине периода наблюдается снижение водозабора. Это может указывать на улучшение эффективности использования или изменение условий.'}
          </div>
        </div>
      </div>
    </div>
  );
}
