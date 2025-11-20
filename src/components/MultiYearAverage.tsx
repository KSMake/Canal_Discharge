import { TrendingUp } from 'lucide-react';
import { formatNumber } from '../lib/analytics';

interface MultiYearAverageData {
  vegetation: {
    avgVolume: number;
    avgDischarge: number;
  };
  nonVegetation: {
    avgVolume: number;
    avgDischarge: number;
  };
}

interface MultiYearAverageProps {
  data: MultiYearAverageData;
  yearsCount: number;
}

export function MultiYearAverage({ data, yearsCount }: MultiYearAverageProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Среднемноголетние нормы</h3>
          <p className="text-sm text-gray-600">За {yearsCount} {yearsCount === 1 ? 'год' : yearsCount < 5 ? 'года' : 'лет'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-5 border-2 border-green-200">
          <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            Вегетационный период
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Средний объём за сезон</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.vegetation.avgVolume)} <span className="text-sm text-gray-600">млн.м³</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Средний расход</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.vegetation.avgDischarge)} <span className="text-sm text-gray-600">м³/сек</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
          <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            Межвегетационный период
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Средний объём за сезон</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.nonVegetation.avgVolume)} <span className="text-sm text-gray-600">млн.м³</span></p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Средний расход</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.nonVegetation.avgDischarge)} <span className="text-sm text-gray-600">м³/сек</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Соотношение вегетация / межвегетация:</span>
          <span className="text-lg font-bold text-blue-600">
            {formatNumber(data.vegetation.avgVolume / data.nonVegetation.avgVolume, 2)}x
          </span>
        </div>
      </div>
    </div>
  );
}
