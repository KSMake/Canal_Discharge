import { useState, useRef } from 'react';
import { formatNumber } from '../lib/analytics';
import { DischargeRecord } from '../lib/dataLoader';
import { TrendingUp, Table as TableIcon } from 'lucide-react';

interface TimeSeriesChartProps {
  data: DischargeRecord[];
  title?: string;
}

export function TimeSeriesChart({ data, title = 'Динамика расхода воды' }: TimeSeriesChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length === 0) {
    return null;
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const validData = sortedData.filter(d => !d.isInvalid);

  if (validData.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">Все данные содержат ошибки и были отфильтрованы</p>
      </div>
    );
  }

  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const avgValue = validData.reduce((sum, d) => sum + d.value, 0) / validData.length;

  const chartWidth = 1000;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  const xScale = (index: number) =>
    padding.left + (index / (validData.length - 1)) * (chartWidth - padding.left - padding.right);

  const yScale = (value: number) =>
    chartHeight - padding.bottom - ((value - minValue) / (maxValue - minValue)) * (chartHeight - padding.top - padding.bottom);

  const pathD = validData.map((point, i) => {
    const x = xScale(i);
    const y = yScale(point.value);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const areaPathD = `${pathD} L ${xScale(validData.length - 1)} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const svgX = (mouseX / rect.width) * chartWidth;

    const dataX = ((svgX - padding.left) / (chartWidth - padding.left - padding.right)) * (validData.length - 1);
    const index = Math.max(0, Math.min(Math.round(dataX), validData.length - 1));

    if (svgX >= padding.left && svgX <= chartWidth - padding.right) {
      setHoveredPoint(index);
      setTooltipPos({ x: mouseX, y: e.clientY - rect.top });
    } else {
      setHoveredPoint(null);
    }
  };

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    minValue + (i / (yTicks - 1)) * (maxValue - minValue)
  );

  const xTickCount = Math.min(10, validData.length);
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.floor((i / (xTickCount - 1)) * (validData.length - 1))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'chart'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            График
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Таблица
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {viewMode === 'chart' ? (
          <>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 overflow-hidden">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {yTickValues.map((value, i) => (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={yScale(value)}
                      x2={chartWidth - padding.right}
                      y2={yScale(value)}
                      stroke="#334155"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                    <text
                      x={padding.left - 10}
                      y={yScale(value)}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="system-ui"
                    >
                      {formatNumber(value, 0)}
                    </text>
                  </g>
                ))}

                {xTickIndices.map((index) => {
                  const point = validData[index];
                  const x = xScale(index);
                  return (
                    <g key={index}>
                      <line
                        x1={x}
                        y1={chartHeight - padding.bottom}
                        x2={x}
                        y2={chartHeight - padding.bottom + 5}
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={chartHeight - padding.bottom + 20}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="system-ui"
                      >
                        {new Date(point.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </text>
                    </g>
                  );
                })}

                <path d={areaPathD} fill="url(#areaGradient)" />

                <path
                  d={pathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {hoveredPoint !== null && (
                  <>
                    <line
                      x1={xScale(hoveredPoint)}
                      y1={padding.top}
                      x2={xScale(hoveredPoint)}
                      y2={chartHeight - padding.bottom}
                      stroke="#06b6d4"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.5"
                    />
                    <circle
                      cx={xScale(hoveredPoint)}
                      cy={yScale(validData[hoveredPoint].value)}
                      r="5"
                      fill="#06b6d4"
                      stroke="#0e7490"
                      strokeWidth="2"
                    />
                  </>
                )}

                <line
                  x1={padding.left}
                  y1={chartHeight - padding.bottom}
                  x2={chartWidth - padding.right}
                  y2={chartHeight - padding.bottom}
                  stroke="#475569"
                  strokeWidth="2"
                />
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={chartHeight - padding.bottom}
                  stroke="#475569"
                  strokeWidth="2"
                />
              </svg>

              {hoveredPoint !== null && (
                <div
                  className="absolute bg-slate-800 border-cyan-500 text-white text-xs rounded-lg px-3 py-2 shadow-xl border pointer-events-none z-10"
                  style={{
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y - 60}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-semibold text-cyan-300">
                    {new Date(validData[hoveredPoint].date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-white font-bold mt-1">
                    {formatNumber(validData[hoveredPoint].value, 2)} м³/с
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-h-96 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">Дата</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-200">Расход (м³/сек)</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">Сезон</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((record, index) => (
                  <tr key={index} className={`hover:bg-gray-50 transition-colors ${record.isInvalid ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(record.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${record.isInvalid ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatNumber(record.value, 2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        record.season === 'vegetation'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {record.season === 'vegetation' ? 'Вегетация' : 'Межвегетация'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.isInvalid ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700" title={record.invalidReason}>
                          ⚠ Ошибка
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ✓ OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="text-xs font-medium text-orange-700 mb-1">Максимум</div>
            <div className="text-xl font-bold text-orange-900">{formatNumber(maxValue)}</div>
            <div className="text-xs text-orange-600 mt-1">м³/сек</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="text-xs font-medium text-blue-700 mb-1">Минимум</div>
            <div className="text-xl font-bold text-blue-900">{formatNumber(minValue)}</div>
            <div className="text-xs text-blue-600 mt-1">м³/сек</div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
            <div className="text-xs font-medium text-teal-700 mb-1">Среднее</div>
            <div className="text-xl font-bold text-teal-900">{formatNumber(avgValue)}</div>
            <div className="text-xs text-teal-600 mt-1">м³/сек</div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-1">Измерений</div>
            <div className="text-xl font-bold text-gray-900">{sortedData.length}</div>
            <div className="text-xs text-gray-600 mt-1">дней</div>
          </div>
        </div>
      </div>
    </div>
  );
}
