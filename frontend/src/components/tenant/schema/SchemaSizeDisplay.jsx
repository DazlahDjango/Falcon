export const SchemaSizeDisplay = ({ sizeMb }) => {
    if (!sizeMb && sizeMb !== 0) return <span className="text-slate-300 italic">Calculating...</span>;

    const formatSize = (value, unit) => (
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 leading-none">{value}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit}</span>
        </div>
    );

    if (sizeMb < 1024) return formatSize(sizeMb.toFixed(1), 'MB');
    
    const sizeGb = sizeMb / 1024;
    if (sizeGb < 1024) return formatSize(sizeGb.toFixed(2), 'GB');
    
    const sizeTb = sizeGb / 1024;
    return formatSize(sizeTb.toFixed(2), 'TB');
};