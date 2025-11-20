import { BarChart3, TrendingUp } from 'lucide-react';
import { YearlyComparison as YearlyData } from '../lib/analytics';
import { formatNumber } from '../lib/analytics';

interface YearlyComparisonProps {
  data: YearlyData[];
}

export function YearlyComparison({ data }: YearlyComparisonProps) {
  if (data.length === 0) {
    return null;
  }

  const maxVolume = Math.max(...data.map(d => d.totalAnnual));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Сравнение по годам</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Год</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Вегетация<br/><span className="text-xs font-normal">(млн.м³)</span></th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Межвегетация<br/><span className="text-xs font-normal">(млн.м³)</span></th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Всего<br/><span className="text-xs font-normal">(млн.м³)</span></th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Коэфф.<br/>сезонности</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Визуализация</th>
            </tr>
          </thead>
          <tbody>
            {data.map((year) => {
              const barWidth = (year.totalAnnual / maxVolume) * 100;
              const vegPercent = (year.vegetation.totalVolumeMillion / year.totalAnnual) * 100;

              return (
                <tr key={year.year} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{year.year}</td>
                  <td className="py-3 px-4 text-right text-green-700 font-medium">
                    {formatNumber(year.vegetation.totalVolumeMillion)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-700 font-medium">
                    {formatNumber(year.nonVegetation.totalVolumeMillion)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    {formatNumber(year.totalAnnual)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      year.seasonalityCoefficient > 1.5 ? 'bg-orange-100 text-orange-700' :
                      year.seasonalityCoefficient > 1.2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {year.seasonalityCoefficient > 1 && <TrendingUp className="w-3 h-3" />}
                      {formatNumber(year.seasonalityCoefficient, 2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden" style={{ width: `${barWidth}%`, minWidth: '80px' }}>
                      <div className="flex h-full">
                        <div
                          className="bg-green-500 transition-all duration-300"
                          style={{ width: `${vegPercent}%` }}
                        />
                        <div
                          className="bg-blue-500 transition-all duration-300"
                          style={{ width: `${100 - vegPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-600">Вегетация</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-gray-600">Межвегетация</span>
        </div>
      </div>
    </div>
  );
}
