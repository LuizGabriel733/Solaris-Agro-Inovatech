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
        {/* Eixo Y - Rótulos numéricos */}
        <View style={[styles.yLabels, { height: chartHeight }]}>
          {ticks.map((tick) => (
            <Text key={`tick-${tick}`} style={styles.yLabel}>
              {tick}
            </Text>
          ))}
        </View>

        {/* Área do Gráfico */}
        <View style={styles.plotWrap} onLayout={onPlotLayout}>
          <View style={[styles.svgWrap, { width: effectiveWidth, height: chartHeight }]}>
            
            {/* O SVG desenha os elementos visuais */}
            <Svg width={effectiveWidth} height={chartHeight} style={styles.svgElement}>
              {/* Linhas de Grade Horizontais */}
              {ticks.map((tick) => {
                const y = chartHeight - (tick / scaleMax) * chartHeight;
                return (
                  <Line
                    key={`grid-y-${tick}`}
                    x1={0}
                    y1={y}
                    x2={effectiveWidth}
                    y2={y}
                    stroke="#F0F0F0"
                    strokeWidth={1}
                    strokeDasharray="3 5"
                  />
                );
              })}

              {/* Eixos de referência */}
              <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#D1D5DB" strokeWidth={1} />
              <Line x1={0} y1={chartHeight} x2={effectiveWidth} y2={chartHeight} stroke="#D1D5DB" strokeWidth={1} />

              {/* Linha do Gráfico (Amarelo Figma) */}
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="#F1C40F" 
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pontos de dados */}
              {data.map((point, index) => {
                const x = (index / Math.max(data.length - 1, 1)) * effectiveWidth;
                const y = chartHeight - (point.value / scaleMax) * chartHeight;
                const isSelected = selectedIndex === index;
                const pointColor = point.value >= 9 ? '#E11D48' : '#F1C40F';

                return (
                  <Circle
                    key={`${point.label}-${index}`}
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 3.5}
                    fill={pointColor}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              })}
            </Svg>

            {/* CAMADA DE TOQUE: Fica por cima de tudo para capturar cliques */}
            <View style={[styles.pressLayer, { width: effectiveWidth, height: chartHeight }]}>
              {data.map((point, index) => (
                <TouchableOpacity
                  key={`touch-${point.label}-${index}`}
                  onPress={() => onSelectIndex(index)}
                  style={styles.touchPoint}
                  activeOpacity={0.6}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Eixo X - Rótulos de tempo */}
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
  root: { paddingVertical: 8 },
  plotRow: { flexDirection: 'row', alignItems: 'center' },
  yLabels: { width: 28, paddingRight: 4, justifyContent: 'space-between' },
  yLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '600', textAlign: 'right' },
  plotWrap: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svgWrap: { 
    position: 'relative', 
    alignSelf: 'center',
    overflow: 'visible' // Garante que pontos na borda apareçam
  },
  svgElement: {
    zIndex: 1,
  },
  pressLayer: {
    position: 'absolute',
    left: 0, 
    top: 0, 
    flexDirection: 'row',
    zIndex: 10, // Prioridade total para o toque
    backgroundColor: 'transparent',
  },
  touchPoint: { 
    flex: 1,
    height: '100%',
  },
  xLabelsRow: { marginTop: 8, flexDirection: 'row' },
  xSpacer: { width: 28 },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  xLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '600' },
});