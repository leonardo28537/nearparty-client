const STEPS = [500, 1000, 2000, 5000, 10000, 20000]

const fmt = (m) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`

export const RadiusSlider = ({ value, onChange }) => {
  const idx = STEPS.indexOf(value) !== -1 ? STEPS.indexOf(value) : 3

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-display font-semibold uppercase tracking-widest text-ink-400">
          Radio
        </span>
        <span className="text-sm font-display font-bold text-spark">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(STEPS[+e.target.value])}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                   bg-ink-700 accent-spark"
        style={{
          background: `linear-gradient(to right, #ffcc4d ${(idx / (STEPS.length - 1)) * 100}%, #38352b ${(idx / (STEPS.length - 1)) * 100}%)`,
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-ink-600">{fmt(STEPS[0])}</span>
        <span className="text-[10px] text-ink-600">{fmt(STEPS[STEPS.length - 1])}</span>
      </div>
    </div>
  )
}
