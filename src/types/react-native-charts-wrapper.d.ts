declare module 'react-native-charts-wrapper' {
  import { ViewStyle } from 'react-native';
  
  interface RadarChartProps {
    style: ViewStyle;
    data: any;
    xAxis: any;
    yAxis: any;
    chartDescription: any;
  }

  export const RadarChart: React.FC<RadarChartProps>;
} 