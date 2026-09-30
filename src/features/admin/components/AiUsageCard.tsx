import { useAiUsage } from '../hooks/useAiUsage';
import SimpleBarChart from '../../../components/charts/SimpleBarChart';
import Button from '../../../components/ui/Button';

const nf = new Intl.NumberFormat();

/** Green under 70% of the daily budget, amber from 70%, red from 90% — so it's obvious before it maxes out. */
function gaugeColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function AiUsageCard() {
  const { usage, isLoading, isError, refetch } = useAiUsage();

  return (
    <div className="card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">AI Usage (Gemini)</div>
          <p className="mt-1 text-xs text-brand-text-muted">
            Requests per day (UTC){usage ? ` · ${usage.model}` : ''}.
          </p>
        </div>
        {usage && (
          <span className="chip chip-primary px-2.5 py-0.5 text-xs">{nf.format(usage.todayTokens)} tokens today</span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 h-48 animate-pulse rounded-xl bg-brand-card-alt" aria-busy="true" />
      ) : isError || !usage ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-400 light:text-red-700">Couldn't load AI usage.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4">
            {usage.dailyLimit ? (
              (() => {
                const pct = Math.min(100, Math.round((usage.todayCalls / usage.dailyLimit) * 100));
                return (
                  <>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-bold text-brand-text">
                        {nf.format(usage.todayCalls)}{' '}
                        <span className="font-medium text-brand-text-secondary">/ {nf.format(usage.dailyLimit)} requests today</span>
                      </span>
                      <span className="font-bold text-brand-text">{pct}%</span>
                    </div>
                    <div
                      className="mt-2 h-3 w-full overflow-hidden rounded-full bg-brand-card-alt"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                      aria-label="Share of daily request quota used"
                    >
                      <div className={`h-full rounded-full transition-all duration-700 ${gaugeColor(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                    {pct >= 70 && (
                      <p className="mt-2 text-xs font-semibold text-amber-400 light:text-amber-700" role="alert">
                        {pct >= 90 ? 'Almost at the daily limit.' : 'Approaching the daily limit.'}
                      </p>
                    )}
                  </>
                );
              })()
            ) : (
              <p className="text-sm font-bold text-brand-text">
                {nf.format(usage.todayCalls)} <span className="font-medium text-brand-text-secondary">requests today</span>
                <span className="ml-2 text-xs font-normal text-brand-text-muted">
                  Set GEMINI_DAILY_REQUEST_LIMIT on the server to show a limit.
                </span>
              </p>
            )}
          </div>

          {!usage.configured && (
            <p className="mt-2 text-xs text-brand-text-muted">GEMINI_API_KEY isn't set, so no AI calls are being made.</p>
          )}

          <div className="mt-4">
            <SimpleBarChart
              unitLabel="requests"
              data={usage.series.map((d) => ({ label: d.date.slice(5), value: d.calls }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
