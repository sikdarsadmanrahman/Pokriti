import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useGetFlashSaleQuery } from '../../api/publicApi.js';
import useCountdown from '../../hooks/useCountdown.js';
import { pad2 } from '../../utils/format.js';

/** Sticky bar under the header while a flash sale is live; disappears cleanly once it ends. */
export default function FlashSaleBar() {
  const { data } = useGetFlashSaleQuery(undefined, { pollingInterval: 60_000 });
  const countdown = useCountdown(data?.endsAt);
  if (!data?.endsAt || !countdown) return null;

  return (
    <Link
      to="/shop?combo=false&sort=popular#flash-sale"
      className="sticky top-0 z-30 flex items-center justify-center gap-3 bg-honey-500 px-4 py-2 text-sm font-semibold text-honey-900"
    >
      <Zap size={16} className="fill-honey-900" />
      <span className="hidden sm:inline">Flash Sale — limited stock, ends in</span>
      <span className="sm:hidden">Flash Sale ends in</span>
      <span className="flex items-center gap-1 font-mono tabular-nums">
        {countdown.d > 0 && <span>{countdown.d}d</span>}
        <span className="rounded bg-white/40 px-1.5 py-0.5">{pad2(countdown.h)}</span>:
        <span className="rounded bg-white/40 px-1.5 py-0.5">{pad2(countdown.m)}</span>:
        <span className="rounded bg-white/40 px-1.5 py-0.5">{pad2(countdown.s)}</span>
      </span>
    </Link>
  );
}
