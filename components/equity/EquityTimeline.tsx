"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCompactCurrency,
  formatCurrency,
  formatOwnership,
  formatShares,
} from "@/lib/equity/format";
import type {
  SavedScenario,
  TimelineEvent,
} from "@/lib/equity/types";

interface EquityTimelineProps {
  active: SavedScenario;
  comparisons: SavedScenario[];
  events: TimelineEvent[];
}

type ChartDatum = {
  month: number;
  active?: number;
  exercise?: number;
  vestedShares?: number;
  ownership?: number;
  companyValue?: number;
  grossValue?: number;
} & Record<string, number | undefined>;

interface TimelineTooltipContentProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: ChartDatum }>;
  comparisons?: SavedScenario[];
}

function createChartData(
  active: SavedScenario,
  comparisons: SavedScenario[],
): ChartDatum[] {
  const points = new Map<number, ChartDatum>();

  function getPoint(month: number) {
    const existing = points.get(month);

    if (existing) {
      return existing;
    }

    const next: ChartDatum = { month };
    points.set(month, next);
    return next;
  }

  active.timeline.forEach((point) => {
    const datum = getPoint(point.month);
    datum.active = point.netValue;
    datum.exercise = point.exerciseCost;
    datum.vestedShares = point.vestedShares;
    datum.ownership = point.ownership;
    datum.companyValue = point.companyValue;
    datum.grossValue = point.grossValue;
  });

  comparisons.forEach((scenario) => {
    scenario.timeline.forEach((point) => {
      getPoint(point.month)[scenario.id] = point.netValue;
    });
  });

  return [...points.values()].sort((left, right) => left.month - right.month);
}

function formatMonth(month: number): string {
  if (month === 0) {
    return "Today";
  }

  if (month % 12 === 0) {
    return `${month / 12}y`;
  }

  return `${month}m`;
}

export function TimelineTooltipContent({
  active,
  label,
  payload,
  comparisons = [],
}: TimelineTooltipContentProps) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="timeline-tooltip">
      <p>Month {label}</p>
      {point.vestedShares === undefined ? null : (
        <dl>
          <div>
            <dt>Vested shares</dt>
            <dd>{formatShares(point.vestedShares)}</dd>
          </div>
          <div>
            <dt>Ownership</dt>
            <dd>{formatOwnership(point.ownership ?? 0)}</dd>
          </div>
          <div>
            <dt>Company value</dt>
            <dd>{formatCurrency(point.companyValue ?? 0)}</dd>
          </div>
          <div>
            <dt>Gross equity value</dt>
            <dd>{formatCurrency(point.grossValue ?? 0)}</dd>
          </div>
          <div>
            <dt>Exercise cost</dt>
            <dd>{formatCurrency(point.exercise ?? 0)}</dd>
          </div>
          <div>
            <dt>Net value</dt>
            <dd>{formatCurrency(point.active ?? 0)}</dd>
          </div>
        </dl>
      )}
      {comparisons.map((scenario) =>
        point[scenario.id] === undefined ? null : (
          <p key={scenario.id} className="tooltip-comparison">
            {scenario.name}: {formatCurrency(point[scenario.id] ?? 0)} net
          </p>
        ),
      )}
    </div>
  );
}

export function EquityTimeline({
  active,
  comparisons,
  events,
}: EquityTimelineProps) {
  const data = createChartData(active, comparisons);
  const result = active.result;

  return (
    <section className="timeline-panel" aria-labelledby="timeline-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">The path, not just the payoff</p>
          <h2 id="timeline-title">Equity value over time</h2>
        </div>
        <div className="chart-legend" aria-label="Chart legend">
          <span className="legend-active">Net value</span>
          <span className="legend-cost">Exercise cost</span>
          {comparisons.map((scenario, index) => (
            <span
              key={scenario.id}
              className={`legend-comparison legend-comparison-${index + 1}`}
              style={
                {
                  "--scenario-color": scenario.color,
                } as React.CSSProperties
              }
            >
              {scenario.name}
            </span>
          ))}
        </div>
      </div>

      <p id="timeline-instructions" className="chart-instructions">
        Use arrow keys to explore the interactive chart. The written summary
        below provides the same essential endpoints.
      </p>
      <div
        className="timeline-chart"
        role="region"
        aria-label="Interactive equity value over time chart"
        aria-describedby="timeline-instructions"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 22, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
            role="application"
            aria-label="Explore equity values by month"
            aria-describedby="timeline-instructions"
          >
            <defs>
              <linearGradient id="active-value-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              axisLine={false}
              tickLine={false}
              width={58}
            />
            <Tooltip
              content={
                <TimelineTooltipContent comparisons={comparisons} />
              }
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active scenario"
              stroke="var(--green)"
              strokeWidth={3}
              fill="url(#active-value-fill)"
              isAnimationActive={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="exercise"
              name="Exercise cost"
              stroke="var(--coral)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            {comparisons.map((scenario, index) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.id}
                name={scenario.name}
                stroke={scenario.color}
                strokeWidth={2}
                strokeDasharray={index === 0 ? "8 4" : "2 4"}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            ))}
            {events.map((event) => (
              <ReferenceLine
                key={event.id}
                x={event.month}
                stroke="var(--border-strong)"
                strokeDasharray="2 5"
                aria-label={event.label}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ol className="event-rail" aria-label="Modeled milestones">
        {events.map((event) => (
          <li key={event.id}>
            <span>{formatMonth(event.month)}</span>
            {event.label}
          </li>
        ))}
      </ol>

      <div className="chart-summary">
        <p>
          Today: {formatShares(result.vestedSharesToday)} vested shares and{" "}
          {formatCurrency(result.currentNetValue)} net value.
        </p>
        <p>
          At exit: {formatShares(result.vestedSharesAtExit)} vested shares,{" "}
          {formatOwnership(result.ownershipAtExit)} ownership,{" "}
          {formatCurrency(result.exitExerciseCost)} exercise cost, and{" "}
          {formatCurrency(result.exitNetValue)} net value.
        </p>
      </div>
    </section>
  );
}
