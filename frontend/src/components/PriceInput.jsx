import { getPriceStep } from '../lib/price.js';
import { cn } from '../lib/utils.js';

/**
 * 가격 입력 필드 — 참조가격에 맞춰 step(호가단위)을 자동 계산.
 * - min="0" (음수 입력 차단)
 * - 참조가격이 100 이하면 0.1/0.01 등 소수 단위로 세분화
 * - 참조가격이 1000만 이상이면 1만 단위로 커짐
 */
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
    if (isNaN(num) || num < 0) return; // 음수 차단
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
      className={cn(
        'h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand disabled:opacity-50',
        className
      )}
    />
  );
}
