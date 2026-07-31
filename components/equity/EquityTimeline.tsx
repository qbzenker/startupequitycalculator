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
} & Record<string, number | undefined>;

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
        </div>
      </div>

      <div
        className="timeline-chart"
        role="img"
        aria-label="Equity value over time"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 22, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id="active-value-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F7A52" stopOpacity={0.24} />
                <stop offset="100%" stopColor="#1F7A52" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#D9D6CC" />
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
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "active" ? "Active net value" : String(name),
              ]}
              labelFormatter={(month) => `Month ${month}`}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active scenario"
              stroke="#1F7A52"
              strokeWidth={3}
              fill="url(#active-value-fill)"
              isAnimationActive={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="exercise"
              name="Exercise cost"
              stroke="#DF7253"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            {comparisons.map((scenario) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.id}
                name={scenario.name}
                stroke={scenario.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            ))}
            {events.map((event) => (
              <ReferenceLine
                key={event.id}
                x={event.month}
                stroke="#7D817C"
                strokeDasharray="2 5"
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
