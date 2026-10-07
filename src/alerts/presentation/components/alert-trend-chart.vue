<script setup>
import { computed, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlertFormatters } from '../composables/use-alert-formatters.js';

const props = defineProps({
  /** Readings sorted by time: [{ takenAt: Date, valueCelsius: number }]. */
  readings: { type: Array, required: true },
  /** Lower bound of the safe range, if any. */
  safeMin: { type: Number, default: null },
  /** Upper bound of the safe range, if any. */
  safeMax: { type: Number, default: null },
  /** Alert severity, used for the line color. */
  severity: { type: String, default: 'info' },
});

const { t } = useI18n();
const { formatTemperature, formatClock, formatRange } = useAlertFormatters();
const summaryId = useId();
const tableId = useId();

const WIDTH = 320;
const HEIGHT = 168;
const PLOT = { left: 44, right: 10, top: 12, bottom: 26 };
const plotWidth = WIDTH - PLOT.left - PLOT.right;
const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;

const domain = computed(() => {
  const values = props.readings.map((reading) => reading.valueCelsius);
  [props.safeMin, props.safeMax].forEach((bound) => {
    if (bound !== null) values.push(bound);
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.12, 0.5);
  return { min: min - padding, max: max + padding };
});

const timeDomain = computed(() => {
  const first = props.readings[0]?.takenAt.getTime() ?? 0;
  const last = props.readings.at(-1)?.takenAt.getTime() ?? first;
  return { first, span: Math.max(last - first, 1) };
});

const x = (date) =>
  PLOT.left + ((date.getTime() - timeDomain.value.first) / timeDomain.value.span) * plotWidth;
const y = (value) =>
  PLOT.top + ((domain.value.max - value) / (domain.value.max - domain.value.min)) * plotHeight;

const points = computed(() =>
  props.readings.map((reading) => ({ x: x(reading.takenAt), y: y(reading.valueCelsius) }))
);

const linePath = computed(() =>
  points.value
    .map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ')
);

const safeBand = computed(() => {
  const top = y(props.safeMax ?? domain.value.max);
  const bottom = y(props.safeMin ?? domain.value.min);
  return { y: top, height: Math.max(bottom - top, 0) };
});

const thresholds = computed(() =>
  [props.safeMax, props.safeMin]
    .filter((value) => value !== null)
    .map((value) => ({ value, y: y(value), label: formatTemperature(value) }))
);

const yTicks = computed(() => {
  const bounds = [props.safeMax, props.safeMin].filter((value) => value !== null);
  const { min, max } = domain.value;
  const values = bounds.length ? bounds : [max, (max + min) / 2, min];
  return values.map((value) => ({ y: y(value), label: value.toFixed(1) }));
});

const xTicks = computed(() => {
  const { readings } = props;
  if (!readings.length) return [];
  const indexes = [...new Set([0, Math.floor((readings.length - 1) / 2), readings.length - 1])];
  return indexes.map((index) => ({
    x: x(readings[index].takenAt),
    label: formatClock(readings[index].takenAt),
    anchor: index === 0 ? 'start' : index === readings.length - 1 ? 'end' : 'middle',
  }));
});

const lastPoint = computed(() => points.value.at(-1));

const summary = computed(() => {
  const first = props.readings[0];
  const last = props.readings.at(-1);
  return t('alerts.chart.summary', {
    from: formatTemperature(first.valueCelsius),
    to: formatTemperature(last.valueCelsius),
    start: formatClock(first.takenAt),
    end: formatClock(last.takenAt),
    range: formatRange(props.safeMin, props.safeMax),
  });
});
</script>

<template>
  <figure
    class="trend-chart"
    :class="`tone-${severity}`"
  >
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      role="img"
      :aria-labelledby="summaryId"
      :aria-describedby="tableId"
    >
      <rect
        class="safe-band"
        :x="PLOT.left"
        :y="safeBand.y"
        :width="plotWidth"
        :height="safeBand.height"
      />
      <g class="grid">
        <line
          v-for="tick in yTicks"
          :key="`grid-${tick.label}`"
          :x1="PLOT.left"
          :x2="WIDTH - PLOT.right"
          :y1="tick.y"
          :y2="tick.y"
        />
      </g>
      <g class="thresholds">
        <line
          v-for="threshold in thresholds"
          :key="threshold.value"
          :x1="PLOT.left"
          :x2="WIDTH - PLOT.right"
          :y1="threshold.y"
          :y2="threshold.y"
        />
      </g>
      <path
        class="line"
        :d="linePath"
      />
      <circle
        v-if="lastPoint"
        class="last-point"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        r="4"
      />
      <g class="axis">
        <text
          v-for="tick in yTicks"
          :key="`y-${tick.label}`"
          :x="PLOT.left - 8"
          :y="tick.y + 4"
          text-anchor="end"
        >
          {{ tick.label }}
        </text>
        <text
          v-for="tick in xTicks"
          :key="`x-${tick.label}`"
          :x="tick.x"
          :y="HEIGHT - 6"
          :text-anchor="tick.anchor"
        >
          {{ tick.label }}
        </text>
      </g>
    </svg>
    <figcaption :id="summaryId">
      <span
        class="legend-swatch"
        aria-hidden="true"
      />
      {{ summary }}
    </figcaption>
    <table
      :id="tableId"
      class="sr-only"
    >
      <caption>
        {{
          t('alerts.chart.tableCaption')
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">
            {{ t('alerts.chart.time') }}
          </th>
          <th scope="col">
            {{ t('alerts.chart.temperature') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="reading in readings"
          :key="reading.takenAt.getTime()"
        >
          <td>{{ formatClock(reading.takenAt) }}</td>
          <td>{{ formatTemperature(reading.valueCelsius) }}</td>
        </tr>
      </tbody>
    </table>
  </figure>
</template>

<style scoped>
.trend-chart {
  --tone: var(--cryo-status-info);
  margin: 0;
  padding: 12px 12px 10px;
  background: var(--cryo-surface);
  border: 1px solid var(--cryo-border);
  border-radius: var(--cryo-radius-lg);
}

.tone-critical {
  --tone: var(--cryo-status-critical);
}

.tone-warning {
  --tone: var(--cryo-status-warning);
}

svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.safe-band {
  fill: var(--cryo-status-ok-bg);
}

.grid line {
  stroke: var(--cryo-border-subtle);
  stroke-width: 1;
}

.thresholds line {
  stroke: var(--cryo-status-ok);
  stroke-dasharray: 4 4;
  stroke-width: 1.2;
}

.line {
  fill: none;
  stroke: var(--tone);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
  vector-effect: non-scaling-stroke;
}

.last-point {
  fill: var(--tone);
  stroke: var(--cryo-surface);
  stroke-width: 2;
}

.axis text {
  fill: var(--cryo-text-muted);
  font-size: 10px;
}

figcaption {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  color: var(--cryo-text-secondary);
  font-size: 12px;
  line-height: 1.45;
}

.legend-swatch {
  flex: 0 0 auto;
  width: 14px;
  height: 10px;
  margin-top: 3px;
  background: var(--cryo-status-ok-bg);
  border-top: 1.5px dashed var(--cryo-status-ok);
  border-bottom: 1.5px dashed var(--cryo-status-ok);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
