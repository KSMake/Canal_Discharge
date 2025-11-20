import { useState, useEffect, useMemo } from 'react';
import { loadDataFromGitHub, getUniqueValues, getAvailableCountriesForObject, getObjectsForSegment, DischargeRecord } from './lib/dataLoader';
import {
  calculateSeasonalAnalytics,
  calculateYearlyComparison,
  calculateMultiYearAverage,
} from './lib/analytics';
import { Filters, FilterState } from './components/Filters';
import { SeasonalAnalysis } from './components/SeasonalAnalysis';
import { YearlyComparison } from './components/YearlyComparison';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { MultiYearAverage } from './components/MultiYearAverage';
import { PeriodComparison } from './components/PeriodComparison';
import { EfficiencyMetrics } from './components/EfficiencyMetrics';
import { Droplets, Database, Loader2 } from 'lucide-react';

function App() {
  const [allData, setAllData] = useState<DischargeRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DischargeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [countries, setCountries] = useState<string[]>([]);
  const [segments, setSegments] = useState<string[]>([]);
  const [objects, setObjects] = useState<Array<{ code: string; name: string }>>([]);
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(2030);

  const [filters, setFilters] = useState<FilterState>({
    country: '',
    segment: '',
    objectCode: '',
    season: 'all',
    startDate: '',
    endDate: '',
    yearStart: 2000,
    yearEnd: 2030,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allData, filters]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await loadDataFromGitHub();
      setAllData(data);

      const metadata = getUniqueValues(data);
      setCountries(metadata.countries);

      const segmentsWithTranslations = metadata.segments.map(seg => {
        const record = data.find(r => r.segment === seg);
        return record?.segmentRu || seg;
      });
      setSegments([...new Set(segmentsWithTranslations)].sort());

      setObjects(metadata.objects);
      setMinYear(metadata.minYear);
      setMaxYear(metadata.maxYear);

      setFilters(prev => ({
        ...prev,
        yearStart: metadata.minYear,
        yearEnd: metadata.maxYear,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allData];

    if (filters.segment) {
      filtered = filtered.filter(r => r.segmentRu === filters.segment);
    }

    if (filters.objectCode) {
      filtered = filtered.filter(r => r.object_code === filters.objectCode);
    }

    if (filters.country) {
      const countryRecord = allData.find(r => r.countryRu === filters.country);
      const countryCode = countryRecord?.country || filters.country;
      filtered = filtered.filter(r => r.country === countryCode);
    } else {
      filtered = filtered.filter(r => r.country === 'all');
    }

    if (filters.season !== 'all') {
      filtered = filtered.filter(r => r.season === filters.season);
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => r.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => r.date <= filters.endDate);
    }

    filtered = filtered.filter(r => r.year >= filters.yearStart && r.year <= filters.yearEnd);

    setFilteredData(filtered);
  };

  const availableCountries = useMemo(() => {
    if (!filters.objectCode) return [];
    return getAvailableCountriesForObject(allData, filters.objectCode).map(c => {
      const record = allData.find(r => r.country === c);
      return record?.countryRu || c;
    });
  }, [allData, filters.objectCode]);

  const availableObjects = useMemo(() => {
    const segmentRecord = allData.find(r => r.segmentRu === filters.segment);
    const segmentCode = segmentRecord?.segment || filters.segment;
    return getObjectsForSegment(allData, segmentCode);
  }, [allData, filters.segment]);

  const vegetationData = filteredData.filter(r => r.season === 'vegetation');
  const nonVegetationData = filteredData.filter(r => r.season === 'non_vegetation');

  const vegetationAnalytics = calculateSeasonalAnalytics(vegetationData);
  const nonVegetationAnalytics = calculateSeasonalAnalytics(nonVegetationData);

  const yearlyComparison = calculateYearlyComparison(filteredData);
  const multiYearAvg = calculateMultiYearAverage(yearlyComparison);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Система анализа водозабора
              </h1>
              <p className="text-gray-600 mt-1">
                Мониторинг и аналитика каналов по реке Сырдарья (данные БВО "Сырдарья")
              </p>
            </div>
          </div>

          {!isLoading && (
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Database className="w-4 h-4 text-blue-600" />
                <span>
                  Всего записей: <span className="font-semibold text-gray-900">{allData.length.toLocaleString('ru-RU')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Droplets className="w-4 h-4 text-teal-600" />
                <span>
                  Отфильтровано: <span className="font-semibold text-gray-900">{filteredData.length.toLocaleString('ru-RU')}</span>
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-lg">Загрузка данных с GitHub...</p>
            </div>
          ) : (
            <>
              {maxYear === new Date().getFullYear() && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-900">Примечание о данных {maxYear} года</h3>
                      <p className="text-sm text-amber-800 mt-1">
                        Данные за {maxYear} год могут быть неполными. Расчеты среднемноголетних норм и годовых сравнений могут содержать погрешности для текущего года.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Filters
                filters={filters}
                onChange={setFilters}
                availableCountries={availableCountries}
                segments={segments}
                objects={availableObjects}
                minYear={minYear}
                maxYear={maxYear}
              />

              {filteredData.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <SeasonalAnalysis season="vegetation" analytics={vegetationAnalytics} />
                    <SeasonalAnalysis season="non_vegetation" analytics={nonVegetationAnalytics} />
                  </div>

                  {multiYearAvg && yearlyComparison.length > 1 && (
                    <MultiYearAverage data={multiYearAvg} yearsCount={yearlyComparison.length} />
                  )}

                  <TimeSeriesChart
                    data={filteredData}
                    title="Динамика расхода воды"
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <PeriodComparison data={filteredData} />
                    <EfficiencyMetrics data={filteredData} />
                  </div>

                  {yearlyComparison.length > 0 && (
                    <YearlyComparison data={yearlyComparison} />
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                  <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Нет данных для отображения
                  </h3>
                  <p className="text-gray-600">
                    Попробуйте изменить параметры фильтров
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2025 Система анализа водозабора • Данные: БВО "Сырдарья"</p>
          <p className="mt-2 text-xs text-gray-500">
            Расчеты: Общий объём = Расход (м³/сек) × 86400 сек/день × количество дней
          </p>
          <p className="mt-2 text-xs text-amber-600">
            ⚠ Данные проходят процесс очистки и проверки. Возможны неточности. Если обнаружили ошибку, пожалуйста, сообщите автору.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
