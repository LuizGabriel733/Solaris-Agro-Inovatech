import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { UVPoint } from '../types';

type BarUVChartProps = {
  data: UVPoint[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  maxDataValue: number;
  chartWidth: number;
  chartHeight: number;
};

export function BarUVChart({ data, selectedIndex, onSelectIndex, maxDataValue, chartWidth, chartHeight }: BarUVChartProps) {
  const [measuredWidth, setMeasuredWidth] = useState<number>(0);
  const scaleMax = Math.max(12, maxDataValue);
  const ticks = [12, 9, 6, 3, 0];
  const effectiveWidth = useMemo(() => (measuredWidth > 0 ? measuredWidth : chartWidth), [chartWidth, measuredWidth]);

  const onPlotLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== measuredWidth) setMeasuredWidth(nextWidth);
  };
  return (
    <View style={styles.root}>
      <View style={styles.plotRow}>
        <View style={[styles.yLabels, { height: chartHeight }]}>
          {ticks.map((tick) => (
            <Text key={`tick-${tick}`} style={styles.yLabel}>
              {tick}
            </Text>
          ))}
        </View>

        <View style={styles.plotWrap} onLayout={onPlotLayout}>
          <View style={[styles.svgWrap, { width: effectiveWidth, height: chartHeight }]}>
            <Svg width={effectiveWidth} height={chartHeight}>
            {ticks.map((tick) => {
              const y = chartHeight - (tick / scaleMax) * chartHeight;
              return (
                <Line
                  key={`grid-y-${tick}`}
                  x1={0}
                  y1={y}
                  x2={effectiveWidth}
                  y2={y}
                  stroke="#E5EAF3"
                  strokeWidth={1}
                  strokeDasharray="3 5"
                />
              );
            })}
              <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#9AA7B7" strokeWidth={1.5} />
              <Line x1={0} y1={chartHeight} x2={effectiveWidth} y2={chartHeight} stroke="#9AA7B7" strokeWidth={1.5} />
            </Svg>

            <View style={styles.barContainer}>
              {data.map((point, index) => {
                const isSelected = selectedIndex === index;
                const barHeight = Math.max((point.valor / scaleMax) * (chartHeight - 26), 8);
                return (
                  <TouchableOpacity
                    key={`${point.label}-${index}`}
                    style={styles.barItem}
                    onPress={() => onSelectIndex(index)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isSelected ? '#155DFC' : point.valor >= 8 ? '#FB7185' : '#7AA9FF',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.xLabelsRow}>
        <View style={styles.xSpacer} />
        <View style={[styles.xLabels, { width: effectiveWidth }]}>
          {data.map((point) => (
            <Text key={`label-${point.label}`} style={styles.xLabel}>
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 8,
  },
  plotRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yLabels: {
    width: 32,
    paddingRight: 6,
    justifyContent: 'space-between',
  },
  yLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  plotWrap: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  svgWrap: {
    position: 'relative',
    alignSelf: 'center',
  },
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 6,
    paddingBottom: 2,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '78%',
    borderRadius: 10,
    minHeight: 6,
  },
  xLabelsRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  xSpacer: {
    width: 32,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    alignSelf: 'center',
  },
  xLabel: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
});
