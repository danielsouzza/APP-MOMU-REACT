import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/services/api';
import { BarChart } from 'react-native-chart-kit';
import Svg, { Polygon, Line, Text as SvgText, Path, G, Circle } from 'react-native-svg';

interface ChartData {
  labels: string[];
  scores: number[];
  total: number;
}

interface ResultData {
  chart: ChartData;
  course: string;
  evaluator: string;
  faculty: string;
  id: number;
}

interface Evaluator {
  id: number;
  name: string;
  image_url: string;
}

interface AssessmentEvaluator {
  assessment_id: number;
  evaluator: Evaluator;
}

interface ConsolidatedResultData {
  course: string;
  faculty: string;
  period: string;
  assessments: AssessmentEvaluator[];
  chart: ChartData;
}

interface RadarChartProps {
  data: number[];
  labels: string[];
  size?: number;
}

function RadarChart({ data, labels, size = 300 }: RadarChartProps) {
  const padding = 60;
  const availableSize = size - (padding * 2);
  const center = availableSize / 2;
  const radius = center - 10;
  const angleStep = (Math.PI * 2) / labels.length;

  const circles = [0.2, 0.4, 0.6, 0.8, 1].map(scale => {
    const r = radius * scale;
    return `M${center},${center - r} A${r},${r} 0 1,1 ${center},${center + r} A${r},${r} 0 1,1 ${center},${center - r}`;
  });

  const axes = labels.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `M${center},${center} L${x},${y}`;
  });

  const points = data.map((value, i) => {
    const r = (value / 100) * radius;
    const angle = i * angleStep - Math.PI / 2;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <Svg width={size} height={size}>
      <G transform={`translate(${padding + center}, ${padding + center})`}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <Circle
            key={i}
            r={radius * scale}
            fill="none"
            stroke="#ddd"
            strokeWidth="0.5"
          />
        ))}
        
        {labels.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return (
            <Line
              key={i}
              x1={0}
              y1={0}
              x2={x}
              y2={y}
              stroke="#ddd"
              strokeWidth="0.5"
            />
          );
        })}

        <Polygon
          points={data.map((value, i) => {
            const r = (value / 100) * radius;
            const angle = i * angleStep - Math.PI / 2;
            return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
          }).join(' ')}
          fill="rgba(0, 122, 255, 0.3)"
          stroke="#007AFF"
          strokeWidth="2"
        />

        {labels.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = (radius + 35) * Math.cos(angle);
          const y = (radius + 35) * Math.sin(angle);
          
          return (
            <SvgText
              key={label}
              x={x}
              y={y}
              fontSize="13"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${(angle * 180) / Math.PI + 90}, ${x}, ${y})`}
              fill="#666"
            >
              {label}
            </SvgText>
          );
        })}
      </G>
    </Svg>
  );
}

export default function AssessmentResultScreen() {
  const params = useLocalSearchParams();
  const [result, setResult] = useState<ResultData | ConsolidatedResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        
        if (params.isConsolidated === "true" && params.courseId && params.periodId) {
          const { data } = await api.get<ConsolidatedResultData>(
            `/assessments/course/${params.courseId}/period/${params.periodId}/result`
          );
          console.log('Dados consolidados:', data);
          if (isMounted) setResult(data);
        } else if (params.id) {
          const { data } = await api.get<ResultData>(`/assessments/${params.id}/result`);
          if (isMounted) setResult(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          Alert.alert('Erro', 'Falha ao carregar resultados');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [params.id, params.courseId, params.periodId, params.isConsolidated]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!result?.chart) {
    return (
      <View style={styles.centerContainer}>
        <Text>Nenhum resultado encontrado</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    propsForBackgroundLines: {
      strokeDasharray: '',
      strokeWidth: 0.5,
      stroke: '#e3e3e3',
    },
    propsForLabels: {
      fontSize: 12,
      fill: '#666',
    },
  };

  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: result.chart.labels.map((_, i) => `Dimensão ${i + 1}`),
    datasets: [{
      data: result.chart.scores
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{result.course}</Text>
        <Text style={styles.subtitle}>{result.faculty}</Text>
        {'evaluator' in result ? (
          <Text style={styles.evaluator}>Avaliador: {result.evaluator}</Text>
        ) : (
          <View style={styles.evaluatorsContainer}>
            <Text style={styles.evaluatorsTitle}>Avaliadores:</Text>
            {result.assessments.map(({ evaluator }) => (
              <Text key={evaluator.id} style={styles.evaluatorItem}>
                • {evaluator.name}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Dimensões:</Text>
        {result.chart.labels.map((label, index) => (
          <Text key={label} style={styles.legendItem}>
            {index + 1} - {label}
          </Text>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Avaliação por Dimensão</Text>
        <View style={styles.radarContainer}>
          <RadarChart 
            data={result.chart.scores} 
            labels={result.chart.labels.map((_, i) => `Dimensão ${i + 1}`)}
            size={Math.min(screenWidth - 40, 500)}
          />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Desenvolvimento do nível de maturidade</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barChartContainer}
        >
          <BarChart
            data={chartData}
            width={Math.max(screenWidth, result.chart.labels.length * 80)}
            height={300}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              propsForLabels: {
                fontSize: 12,
              },
            }}
            verticalLabelRotation={0}
            showValuesOnTopOfBars
          />
        </ScrollView>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Pontuação Total:</Text>
        <Text style={styles.totalValue}>
          {result.chart.total.toFixed(1)}%
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  evaluator: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
  },
  evaluatorsContainer: {
    marginTop: 10,
  },
  evaluatorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  evaluatorItem: {
    fontSize: 14,
    color: '#888',
    marginLeft: 10,
    marginBottom: 3,
  },
  legendContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  legendItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chartContainer: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  radarContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  barChartContainer: {
    paddingVertical: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 18,
    marginRight: 10,
    color: '#666',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
}); 