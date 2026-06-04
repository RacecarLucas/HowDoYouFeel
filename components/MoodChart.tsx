import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Text,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { colors } from '../constants/colors';
import { fontFamily } from '../constants/fonts';

interface ChartPoint {
  value: number;
  label: string;
}

interface MoodChartProps {
  data: ChartPoint[];
  width?: number;
  height?: number;
  maxValue?: number;
  lineColor?: string;
  fillColor?: string;
}

const DEFAULT_HEIGHT = 180;
const PADDING = { top: 16, right: 16, bottom: 28, left: 28 };

export function MoodChart({
  data,
  width,
  height = DEFAULT_HEIGHT,
  maxValue = 5,
  lineColor = '#F4A261',
  fillColor = 'rgba(244, 162, 97, 0.25)',
}: MoodChartProps) {
  const chartWidth = width || Dimensions.get('window').width - 64;
  const plotWidth = chartWidth - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const getX = (index: number) =>
    PADDING.left + (index / (data.length - 1)) * plotWidth;
  const getY = (value: number) =>
    PADDING.top + plotHeight - (value / maxValue) * plotHeight;

  // Build line path
  const linePath = data
    .map((point, i) => {
      const x = getX(i);
      const y = getY(point.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Build area path (close the bottom)
  const areaPath =
    linePath +
    ` L ${getX(data.length - 1)} ${PADDING.top + plotHeight} L ${getX(0)} ${
      PADDING.top + plotHeight
    } Z`;

  const yTicks = [0, 1, 2, 3, 4, 5];

  return (
    <View style={[styles.container, { width: chartWidth, height }]}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity={0.35} />
            <Stop offset="1" stopColor={lineColor} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        <G>
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <Line
                key={`grid-${tick}`}
                x1={PADDING.left}
                y1={y}
                x2={chartWidth - PADDING.right}
                y2={y}
                stroke={colors.border}
                strokeWidth={0.5}
                strokeDasharray={tick === 0 ? undefined : '4,4'}
              />
            );
          })}
        </G>

        {/* Y-axis labels */}
        <G>
          {yTicks.map((tick) => (
            <Text
              key={`ylabel-${tick}`}
              x={PADDING.left - 6}
              y={getY(tick) + 3}
              textAnchor="end"
              fontSize={9}
              fill={colors.textSecondary}
              fontFamily={fontFamily.medium}
            >
              {tick}
            </Text>
          ))}
        </G>

        {/* X-axis labels */}
        <G>
          {data.map((point, i) => (
            <Text
              key={`xlabel-${i}`}
              x={getX(i)}
              y={height - 6}
              textAnchor="middle"
              fontSize={9}
              fill={colors.textSecondary}
              fontFamily={fontFamily.medium}
            >
              {point.label}
            </Text>
          ))}
        </G>

        {/* Area fill */}
        <Path d={areaPath} fill="url(#areaFill)" />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        <G>
          {data.map((point, i) => (
            <G key={`dot-${i}`}>
              <Circle
                cx={getX(i)}
                cy={getY(point.value)}
                r={5}
                fill={lineColor}
              />
              <Circle
                cx={getX(i)}
                cy={getY(point.value)}
                r={2.5}
                fill={colors.white}
              />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});
