import React from 'react';
import {
    LineChart,
    Line,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const ConnectionHealthChart = ({ data, title, type = 'line' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="h-8 w-8 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-slate-500 mt-1">Collecting real-time stream data...</p>
            </div>
        );
    }

    const ChartComponent = type === 'area' ? AreaChart : LineChart;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs font-bold">{entry.name}:</span>
                            </div>
                            <span className="text-xs font-black">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            {title && (
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Stream</span>
                    </div>
                </div>
            )}
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ChartComponent data={data}>
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis 
                            dataKey="timestamp" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
                        <Legend 
                            verticalAlign="top" 
                            align="right"
                            iconType="circle"
                            content={({ payload }) => (
                                <div className="flex gap-4 justify-end mb-4">
                                    {payload.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                        {type === 'area' ? (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="active"
                                    stackId="1"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fill="url(#colorActive)"
                                    name="Active"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="idle"
                                    stackId="1"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    fill="url(#colorIdle)"
                                    name="Idle"
                                />
                            </>
                        ) : (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="active"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name="Active"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="idle"
                                    stroke="#F59E0B"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name="Idle"
                                />
                            </>
                        )}
                    </ChartComponent>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ConnectionHealthChart;