import { Calendar, MapPin, Layers, Globe } from 'lucide-react';

export interface FilterState {
  country: string;
  segment: string;
  objectCode: string;
  season: 'all' | 'vegetation' | 'non_vegetation';
  startDate: string;
  endDate: string;
  yearStart: number;
  yearEnd: number;
}

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableCountries: string[];
  segments: string[];
  objects: Array<{ code: string; name: string }>;
  minYear: number;
  maxYear: number;
}

export function Filters({ filters, onChange, availableCountries, segments, objects, minYear, maxYear }: FiltersProps) {
  const handleChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };

    if (key === 'segment') {
      newFilters.objectCode = '';
      newFilters.country = '';
    }

    if (key === 'objectCode') {
      newFilters.country = '';
    }

    onChange(newFilters);
  };

  const showCountryFilter = availableCountries.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
              </div>
              Участок
            </label>
            <select
              value={filters.segment}
              onChange={(e) => handleChange('segment', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            >
              <option value="">Все участки</option>
              {segments.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Layers className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
              </div>
              Объект
            </label>
            <select
              value={filters.objectCode}
              onChange={(e) => handleChange('objectCode', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            >
              <option value="">Все объекты</option>
              {objects.map((obj) => (
                <option key={obj.code} value={obj.code}>
                  {obj.name}
                </option>
              ))}
            </select>
          </div>

          {showCountryFilter && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600" strokeWidth={2.5} />
                </div>
                Страна
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
              >
                <option value="">Головное сооружение</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-600" strokeWidth={2.5} />
              </div>
              Сезон
            </label>
            <select
              value={filters.season}
              onChange={(e) => handleChange('season', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            >
              <option value="all">Все сезоны</option>
              <option value="vegetation">Вегетация (апр-сен)</option>
              <option value="non_vegetation">Межвегетация (окт-мар)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
              </div>
              Год (от)
            </label>
            <input
              type="number"
              value={filters.yearStart}
              onChange={(e) => handleChange('yearStart', parseInt(e.target.value) || minYear)}
              min={minYear}
              max={maxYear}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
              </div>
              Год (до)
            </label>
            <input
              type="number"
              value={filters.yearEnd}
              onChange={(e) => handleChange('yearEnd', parseInt(e.target.value) || maxYear)}
              min={minYear}
              max={maxYear}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
              </div>
              Дата начала
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
              </div>
              Дата окончания
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
