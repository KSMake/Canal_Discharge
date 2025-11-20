import { Globe } from 'lucide-react';
import { formatNumber } from '../lib/analytics';

interface CountryShare {
  country: string;
  volume: number;
  percentage: number;
}

interface CountryAnalysisProps {
  data: CountryShare[];
}

const countryColors: Record<string, string> = {
  'Uzbekistan': 'bg-blue-500',
  'Kazakhstan': 'bg-green-500',
  'Tajikistan': 'bg-orange-500',
  'Kyrgyzstan': 'bg-red-500',
  'Turkmenistan': 'bg-teal-500',
};

export function CountryAnalysis({ data }: CountryAnalysisProps) {
  if (data.length === 0) {
    return null;
  }

  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Анализ по странам</h3>
      </div>

      <div className="space-y-4">
        {data.map((country) => (
          <div key={country.country} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{country.country}</span>
              <span className="text-sm text-gray-600">
                {formatNumber(country.volume)} млн.м³ ({formatNumber(country.percentage, 1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className={`h-full ${countryColors[country.country] || 'bg-gray-500'} transition-all duration-500 flex items-center justify-end px-3`}
                style={{ width: `${country.percentage}%` }}
              >
                <span className="text-white text-xs font-semibold">
                  {country.percentage > 10 ? `${formatNumber(country.percentage, 1)}%` : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-lg font-bold">
          <span className="text-gray-900">Общий объём:</span>
          <span className="text-blue-600">{formatNumber(totalVolume)} млн.м³</span>
        </div>
      </div>
    </div>
  );
}
