import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../../src/services/api';
import { AssessmentsResponse, AssessmentResponse, AssessmentGroupedResponse } from '../../src/types/assessment';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from '../../src/stores/auth';

type ViewMode = 'grouped' | 'ungrouped';

const EmptyListComponent = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>Nenhuma avaliação encontrada</Text>
  </View>
);

const ToggleButtons = ({ viewMode, setViewMode }: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}) => (
  <View style={styles.toggleContainer}>
    <TouchableOpacity
      style={[styles.toggleButton, viewMode === 'ungrouped' && styles.toggleButtonActive]}
      onPress={() => setViewMode('ungrouped')}
    >
      <Text style={[styles.toggleText, viewMode === 'ungrouped' && styles.toggleTextActive]}>
        Avaliações Individuais
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.toggleButton, viewMode === 'grouped' && styles.toggleButtonActive]}
      onPress={() => setViewMode('grouped')}
    >
      <Text style={[styles.toggleText, viewMode === 'grouped' && styles.toggleTextActive]}>
        Avaliações Consolidadas
      </Text>
    </TouchableOpacity>
  </View>
);

const GroupedAssessmentItem: React.FC<{
  item: AssessmentGroupedResponse;
  onPress: (id: number) => void;
  onPressConsolidated: (courseId: number, periodId: number) => void;
}> = ({ item, onPress, onPressConsolidated }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity 
        style={styles.groupHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.groupHeaderContent}>
          <View style={styles.groupHeaderLeft}>
            <Text style={styles.groupTitle}>{item.course_name}</Text>
            <Text style={styles.periodText}>
              {format(new Date(item.period.date_start), "dd/MM/yyyy")} - {format(new Date(item.period.date_end), "dd/MM/yyyy")}
            </Text>
          </View>
          <View style={styles.groupHeaderRight}>
            <Text style={styles.assessmentCount}>
              {item.assessments.length} avaliação{item.assessments.length === 1 ? '' : 's'}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#666" 
            />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <>
          {item.assessments.map((assessment) => (
            <TouchableOpacity 
              key={assessment.id}
              style={styles.card}
              onPress={() => onPress(assessment.id)}
            >
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <Text style={styles.infoText}>{assessment.evaluator.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.consolidatedButton}
            onPress={() => onPressConsolidated(item.assessments[0].id_course, item.period.id)}
          >
            <Ionicons name="stats-chart" size={20} color="#007AFF" />
            <Text style={styles.consolidatedButtonText}>Ver Resultado Consolidado</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

export default function AssessmentsScreen() {
  const params = useLocalSearchParams();
  const { currentRole } = useAuthStore();
  const [assessments, setAssessments] = useState<AssessmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('ungrouped');
  const router = useRouter();

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    // Se for avaliador ou forceUngrouped, força o modo não agrupado
    if (currentRole?.name === 'evaluator' || params.forceUngrouped === 'true') {
      setViewMode('ungrouped');
    }
  }, [currentRole, params.forceUngrouped]);

  async function loadAssessments() {
    try {
      setIsLoading(true);
      const { data } = await api.get<AssessmentsResponse>('/assessments');
      setAssessments(data);
      
      // Define o modo inicial baseado nos dados disponíveis
      if (!data.ungrouped?.length && data.grouped?.length) {
        setViewMode('grouped');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao carregar avaliações');
    } finally {
      setIsLoading(false);
    }
  }

  const renderItem = ({ item }: { item: AssessmentResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/screens/assessment-result",
        params: { id: item.id }
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.courseName}>{item.course.name}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{item.course.faculty.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            {format(new Date(item.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroupedItem = ({ item }: { item: AssessmentGroupedResponse }) => (
    <GroupedAssessmentItem 
      item={item} 
      onPress={(id) => router.push({
        pathname: "/screens/assessment-result",
        params: { id }
      })}
      onPressConsolidated={(courseId, periodId) => router.push({
        pathname: "/screens/assessment-result",
        params: { 
          courseId,
          periodId,
          isConsolidated: "true"
        }
      })}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const hasGrouped = assessments?.grouped?.length ?? 0 > 0;
  const hasUngrouped = assessments?.ungrouped?.length ?? 0 > 0;

  const totalAssessments = (assessments?.ungrouped?.length ?? 0) + (assessments?.grouped?.length ?? 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Avaliações</Text>
        <Text style={styles.subtitle}>
          {totalAssessments} avaliação{totalAssessments === 1 ? '' : 's'} encontrada{totalAssessments === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.content}>
        {hasGrouped && hasUngrouped && currentRole?.name !== 'evaluator' ? (
          <ToggleButtons viewMode={viewMode} setViewMode={setViewMode} />
        ) : null}

        {viewMode === 'grouped' && hasGrouped ? (
          <FlatList
            data={assessments?.grouped}
            keyExtractor={(item) => item.course_name}
            renderItem={renderGroupedItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
          />
        ) : viewMode === 'ungrouped' && hasUngrouped ? (
          <FlatList
            data={assessments?.ungrouped}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyListComponent}
          />
        ) : (
          <EmptyListComponent />
        )}
      </View>
    </View>
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
    padding: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  periodText: {
    fontSize: 14,
    color: '#666',
  },
  assessmentCount: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  consolidatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    gap: 10,
  },
  consolidatedButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 