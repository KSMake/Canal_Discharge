import { DischargeRecord } from './dataLoader';

export type Season = 'vegetation' | 'non_vegetation' | 'all';

export interface SeasonalAnalytics {
  totalVolume: number;
  totalVolumeMillion: number;
  avgDischarge: number;
  maxDischarge: number;
  minDischarge: number;
  daysCount: number;
  variabilityIndex: number;
}

export interface YearlyComparison {
  year: number;
  vegetation: SeasonalAnalytics;
  nonVegetation: SeasonalAnalytics;
  seasonalityCoefficient: number;
  totalAnnual: number;
}

export const calculateSeasonalAnalytics = (records: DischargeRecord[]): SeasonalAnalytics => {
  const validRecords = records.filter(r => !r.isInvalid);

  if (validRecords.length === 0) {
    return {
      totalVolume: 0,
      totalVolumeMillion: 0,
      avgDischarge: 0,
      maxDischarge: 0,
      minDischarge: 0,
      daysCount: 0,
      variabilityIndex: 0,
    };
  }

  const values = validRecords.map(r => r.value);
  const avgDischarge = values.reduce((a, b) => a + b, 0) / values.length;
  const maxDischarge = Math.max(...values);
  const minDischarge = Math.min(...values);

  const totalVolumeM3 = values.reduce((sum, val) => sum + (val * 86400), 0);
  const totalVolumeMillion = totalVolumeM3 / 1_000_000;

  const variabilityIndex = avgDischarge > 0 ? (maxDischarge - minDischarge) / avgDischarge : 0;

  return {
    totalVolume: totalVolumeM3,
    totalVolumeMillion,
    avgDischarge,
    maxDischarge,
    minDischarge,
    daysCount: validRecords.length,
    variabilityIndex,
  };
};

export const calculateYearlyComparison = (records: DischargeRecord[]): YearlyComparison[] => {
  const yearGroups = new Map<number, DischargeRecord[]>();

  records.forEach(record => {
    const year = record.year;
    if (!yearGroups.has(year)) {
      yearGroups.set(year, []);
    }
    yearGroups.get(year)!.push(record);
  });

  const comparisons: YearlyComparison[] = [];

  yearGroups.forEach((yearRecords, year) => {
    const vegetation = yearRecords.filter(r => r.season === 'vegetation');
    const nonVegetation = yearRecords.filter(r => r.season === 'non_vegetation');

    const vegAnalytics = calculateSeasonalAnalytics(vegetation);
    const nonVegAnalytics = calculateSeasonalAnalytics(nonVegetation);

    const seasonalityCoefficient = nonVegAnalytics.avgDailyDischarge > 0
      ? vegAnalytics.avgDailyDischarge / nonVegAnalytics.avgDailyDischarge
      : 0;

    comparisons.push({
      year,
      vegetation: vegAnalytics,
      nonVegetation: nonVegAnalytics,
      seasonalityCoefficient,
      totalAnnual: vegAnalytics.totalVolumeMillion + nonVegAnalytics.totalVolumeMillion,
    });
  });

  return comparisons.sort((a, b) => a.year - b.year);
};

export const calculateCountryShare = (records: DischargeRecord[]) => {
  const validRecords = records.filter(r => !r.isInvalid);
  const countryGroups = new Map<string, number>();

  validRecords.forEach(record => {
    const country = record.country;
    const volume = record.value * 86400;
    countryGroups.set(country, (countryGroups.get(country) || 0) + volume);
  });

  const total = Array.from(countryGroups.values()).reduce((a, b) => a + b, 0);

  return Array.from(countryGroups.entries()).map(([country, volume]) => ({
    country,
    volume: volume / 1_000_000,
    percentage: total > 0 ? (volume / total) * 100 : 0,
  }));
};

export const calculateMultiYearAverage = (yearlyData: YearlyComparison[]) => {
  if (yearlyData.length === 0) return null;

  const avgVegVolume = yearlyData.reduce((sum, y) => sum + y.vegetation.totalVolumeMillion, 0) / yearlyData.length;
  const avgNonVegVolume = yearlyData.reduce((sum, y) => sum + y.nonVegetation.totalVolumeMillion, 0) / yearlyData.length;
  const avgVegDischarge = yearlyData.reduce((sum, y) => sum + y.vegetation.avgDailyDischarge, 0) / yearlyData.length;
  const avgNonVegDischarge = yearlyData.reduce((sum, y) => sum + y.nonVegetation.avgDailyDischarge, 0) / yearlyData.length;

  return {
    vegetation: {
      avgVolume: avgVegVolume,
      avgDischarge: avgVegDischarge,
    },
    nonVegetation: {
      avgVolume: avgNonVegVolume,
      avgDischarge: avgNonVegDischarge,
    },
  };
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
