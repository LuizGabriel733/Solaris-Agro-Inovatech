import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { UVPoint } from '../types';
import { createLinePath } from '../utils';

type LineUVChartProps = {
  data: UVPoint[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  chartWidth: number;
  chartHeight: number;
  maxDataValue: number;
};

export function LineUVChart({
  data,
  selectedIndex,
  onSelectIndex,
  chartWidth,
  chartHeight,
  maxDataValue,
}: LineUVChartProps) {
  // [Implementacao por Arthur Junior] Grafico de linha com eixos e ticks no mesmo estilo da referencia.
  const [measuredWidth, setMeasuredWidth] = useState<number>(0);
  const scaleMax = Math.max(12, maxDataValue);
  const ticks = [12, 9, 6, 3, 0];
  const effectiveWidth = useMemo(() => (measuredWidth > 0 ? measuredWidth : chartWidth), [chartWidth, measuredWidth]);
  const polylinePoints = createLinePath(data, effectiveWidth, chartHeight, scaleMax);

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

            {[0.25, 0.5, 0.75].map((fraction) => (
              <Line
                key={`grid-x-${fraction}`}
                x1={effectiveWidth * fraction}
                y1={0}
                x2={effectiveWidth * fraction}
                y2={chartHeight}
                stroke="#E5EAF3"
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ))}

            <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#9AA7B7" strokeWidth={1.5} />
            <Line x1={0} y1={chartHeight} x2={effectiveWidth} y2={chartHeight} stroke="#9AA7B7" strokeWidth={1.5} />

            <Polyline
              points={polylinePoints}
              fill="none"
              stroke="#1E5BFF"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {data.map((point, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * effectiveWidth;
              const y = chartHeight - (point.value / scaleMax) * chartHeight;
              const isSelected = selectedIndex === index;
              return (
                <Circle
                  key={`${point.label}-${index}`}
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4.5}
                  fill={point.value >= 8 ? '#E11D48' : '#1E5BFF'}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
              );
            })}
            </Svg>

            <View style={styles.pressLayer}>
              {data.map((point, index) => (
                <TouchableOpacity
                  key={`touch-${point.label}-${index}`}
                  onPress={() => onSelectIndex(index)}
                  style={styles.touchPoint}
                  activeOpacity={0.8}
                />
              ))}
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
    alignItems: 'center',
  },
  yLabels: {
    width: 32,
    paddingRight: 6,
    justifyContent: 'space-between',
    height: '100%',
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
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  svgWrap: {
    position: 'relative',
    alignSelf: 'center',
  },
  pressLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  touchPoint: {
    flex: 1,
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
    alignSelf: 'center',
  },
  xLabel: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
});
