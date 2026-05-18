import { getPriceStep } from '../lib/price.js';
import { cn } from '../lib/utils.js';

export default function PriceInput({
  value,
  onChange,
  referencePrice,
  placeholder = '가격',
  className,
  disabled = false,
}) {
  const step = getPriceStep(referencePrice ?? value);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const num = Number(raw);
    if (isNaN(num) || num < 0) return;
    onChange(raw);
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step={step}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn('h-10 px-3 rounded-lg bg-bg-soft border border-border text-xs outline-none focus:border-brand disabled:opacity-50', className)}
    />
  );
}
