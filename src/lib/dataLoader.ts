export interface DischargeRecord {
  segment: string;
  segmentRu: string;
  object_code: string;
  object_name: string;
  country: string;
  countryRu: string;
  parameter: string;
  date: string;
  value: number;
  source_file: string;
  year: number;
  month: number;
  season: 'vegetation' | 'non_vegetation';
  isInvalid?: boolean;
  invalidReason?: string;
}

const CSV_URL = 'https://raw.githubusercontent.com/KSMake/Canal_Discharge/main/BWO_merged_long.csv';

let cachedData: DischargeRecord[] | null = null;

const CANAL_CAPACITIES: Record<string, number> = {
  'LNK': 32,
  'BNK': 61.9,
  'BFK': 150,
  'KDP': 330,
  'SFK': 110,
  'Zardara': 70,
  'YuGK': 330,
  'NDK': 75,
  'VDK': 43,
  'Dustlik': 230,
  'Mekhnat': 6.0,
  'Zafarabad': 6.0,
};

const countryTranslations: Record<string, string> = {
  'all': 'Все страны',
  'Uzbekistan': 'Узбекистан',
  'Kazakhstan': 'Казахстан',
  'Tajikistan': 'Таджикистан',
  'Kyrgyzstan': 'Кыргызстан',
  'Turkmenistan': 'Туркменистан',
};

const segmentTranslations: Record<string, string> = {
  'Toktogul–Shardara': 'Токтогул - Шардара',
  'Toktogul–BahriTojik': 'Токтогул - Бахри Точик',
  'BahriTojik–Shardara': 'Бахри Точик - Шардара',
  'Farkhad': 'Фархадская плотина',
  'Upper': 'Верхний',
  'Middle': 'Средний',
  'Lower': 'Нижний',
  'Head': 'Головной',
  'Tail': 'Хвостовой',
};

const validateDischargeValue = (objectCode: string, value: number): { isValid: boolean; reason?: string } => {
  if (value < 0) {
    return { isValid: false, reason: 'Отрицательное значение' };
  }

  const maxCapacity = CANAL_CAPACITIES[objectCode];

  if (maxCapacity && value > maxCapacity * 1.1) {
    return {
      isValid: false,
      reason: `Превышает пропускную способность канала (max: ${maxCapacity} м³/с)`
    };
  }

  return { isValid: true };
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

export const loadDataFromGitHub = async (): Promise<DischargeRecord[]> => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const records: DischargeRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      if (values.length < 8) continue;

      const country = values[3] || '';

      const dateStr = values[5];
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const season: 'vegetation' | 'non_vegetation' =
        month >= 4 && month <= 9 ? 'vegetation' : 'non_vegetation';

      const segment = values[0] || '';
      const objectCode = values[1] || '';
      const value = parseFloat(values[6]) || 0;

      const validation = validateDischargeValue(objectCode, value);

      records.push({
        segment,
        segmentRu: segmentTranslations[segment] || segment,
        object_code: objectCode,
        object_name: values[2] || '',
        country,
        countryRu: countryTranslations[country] || country,
        parameter: values[4] || '',
        date: dateStr,
        value: value,
        source_file: values[7] || '',
        year,
        month,
        season,
        isInvalid: !validation.isValid,
        invalidReason: validation.reason,
      });
    }

    const deduplicatedRecords = deduplicateRecords(records);
    cachedData = deduplicatedRecords;
    return deduplicatedRecords;
  } catch (error) {
    console.error('Error loading data from GitHub:', error);
    throw error;
  }
};

const deduplicateRecords = (records: DischargeRecord[]): DischargeRecord[] => {
  const recordMap = new Map<string, DischargeRecord>();

  for (const record of records) {
    const key = `${record.object_code}_${record.country}_${record.date}`;
    const existing = recordMap.get(key);

    if (!existing) {
      recordMap.set(key, record);
    } else {
      if (existing.isInvalid && !record.isInvalid) {
        recordMap.set(key, record);
      } else if (!existing.isInvalid && record.isInvalid) {
        continue;
      } else if (existing.isInvalid && record.isInvalid) {
        continue;
      } else {
        const existingFileMatchesDate = fileMatchesDate(existing.source_file, existing.year, existing.month);
        const currentFileMatchesDate = fileMatchesDate(record.source_file, record.year, record.month);

        if (currentFileMatchesDate && !existingFileMatchesDate) {
          recordMap.set(key, record);
        } else if (existingFileMatchesDate && !currentFileMatchesDate) {
          continue;
        }
      }
    }
  }

  return Array.from(recordMap.values());
};

const fileMatchesDate = (filename: string, year: number, month: number): boolean => {
  const fileYear = extractYearFromFilename(filename);
  const fileMonth = extractMonthFromFilename(filename);

  return fileYear === year && fileMonth === month;
};

const extractYearFromFilename = (filename: string): number => {
  const match = filename.match(/\d{4}/);
  return match ? parseInt(match[0]) : 0;
};

const extractMonthFromFilename = (filename: string): number => {
  const monthMap: Record<string, number> = {
    'январь': 1, 'февраль': 2, 'март': 3, 'апрель': 4,
    'май': 5, 'июнь': 6, 'июль': 7, 'август': 8,
    'сентябрь': 9, 'октябрь': 10, 'ноябрь': 11, 'декабрь': 12,
  };

  for (const [month, number] of Object.entries(monthMap)) {
    if (filename.toLowerCase().includes(month)) {
      return number;
    }
  }

  return 0;
};

export const getUniqueValues = (records: DischargeRecord[]) => {
  const countries = [...new Set(records.map(r => r.country))].filter(c => c !== 'all').sort();
  const segments = [...new Set(records.map(r => r.segment))].sort();
  const objects = Array.from(
    new Map(records.map(r => [r.object_code, { code: r.object_code, name: r.object_name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const years = [...new Set(records.map(r => r.year))].sort((a, b) => a - b);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return {
    countries,
    segments,
    objects,
    minYear,
    maxYear,
  };
};

export const getAvailableCountriesForObject = (records: DischargeRecord[], objectCode: string): string[] => {
  const objectRecords = records.filter(r => r.object_code === objectCode);
  const countries = [...new Set(objectRecords.map(r => r.country))].filter(c => c !== 'all');
  return countries.sort();
};

export const getObjectsForSegment = (records: DischargeRecord[], segment: string) => {
  const filtered = segment ? records.filter(r => r.segment === segment) : records;
  return Array.from(
    new Map(filtered.map(r => [r.object_code, { code: r.object_code, name: r.object_name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));
};
