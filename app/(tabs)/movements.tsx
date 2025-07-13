import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ArrowDown, RotateCcw, Filter, Calendar } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Movement } from '@/types';

export default function MovementsScreen() {
  const { t } = useLanguage();
  const { movements } = useStorage();
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'adjustment'>('all');

  const filteredMovements = movements.filter(movement => 
    filterType === 'all' || movement.type === filterType
  );

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowUp size={20} color="#22C55E" />;
      case 'out':
        return <ArrowDown size={20} color="#EF4444" />;
      case 'adjustment':
        return <RotateCcw size={20} color="#6B7280" />;
      default:
        return <RotateCcw size={20} color="#6B7280" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return '#22C55E';
      case 'out':
        return '#EF4444';
      case 'adjustment':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in':
        return t('stockIn');
      case 'out':
        return t('stockOut');
      case 'adjustment':
        return t('adjustment');
      default:
        return type;
    }
  };

  const MovementCard = ({ movement }: { movement: Movement }) => (
    <TouchableOpacity style={styles.movementCard}>
      <View style={styles.movementIcon}>
        {getMovementIcon(movement.type)}
      </View>
      
      <View style={styles.movementContent}>
        <View style={styles.movementHeader}>
          <Text style={styles.productName}>{movement.productName}</Text>
          <Text style={[styles.quantityText, { color: getMovementColor(movement.type) }]}>
            {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
            {movement.quantity}
          </Text>
        </View>
        
        <View style={styles.movementDetails}>
          <Text style={styles.movementType}>{getMovementLabel(movement.type)}</Text>
          <Text style={styles.movementReason}>{movement.reason}</Text>
        </View>
        
        <View style={styles.movementFooter}>
          <Text style={styles.movementTime}>
            {new Date(movement.timestamp).toLocaleDateString()} • {new Date(movement.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={styles.movementUser}>{movement.user}</Text>
        </View>
        
        {movement.notes && (
          <Text style={styles.movementNotes}>{movement.notes}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('movements')}</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {[
          { key: 'all', label: 'Alle', icon: null },
          { key: 'in', label: t('stockIn'), icon: <ArrowUp size={16} color="#22C55E" /> },
          { key: 'out', label: t('stockOut'), icon: <ArrowDown size={16} color="#EF4444" /> },
          { key: 'adjustment', label: t('adjustment'), icon: <RotateCcw size={16} color="#6B7280" /> },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              filterType === filter.key && styles.filterChipActive
            ]}
            onPress={() => setFilterType(filter.key as any)}
          >
            {filter.icon}
            <Text style={[
              styles.filterText,
              filterType === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{movements.filter(m => m.type === 'in').length}</Text>
          <Text style={styles.statLabel}>Eingänge</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{movements.filter(m => m.type === 'out').length}</Text>
          <Text style={styles.statLabel}>Ausgänge</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{movements.filter(m => m.type === 'adjustment').length}</Text>
          <Text style={styles.statLabel}>Anpassungen</Text>
        </View>
      </View>

      <ScrollView style={styles.movementsList} showsVerticalScrollIndicator={false}>
        {filteredMovements.map(movement => (
          <MovementCard key={movement.id} movement={movement} />
        ))}
        
        {filteredMovements.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Keine Bewegungen gefunden</Text>
            <Text style={styles.emptySubtext}>
              Verwenden Sie den Scanner, um Lagerbewegungen zu erfassen
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0D0D0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#F5C9A4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 0,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#000000',
    height: 32,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#F68528',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  statsBar: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 0,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#000000',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#000000',
    marginHorizontal: 16,
  },
  movementsList: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  movementCard: {
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    marginBottom: 4,
    flexDirection: 'row',
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#D0D0D0',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementContent: {
    flex: 1,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  movementDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  movementType: {
    fontSize: 12,
    color: '#000000',
    backgroundColor: '#D0D0D0',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    fontWeight: '500',
  },
  movementReason: {
    fontSize: 14,
    color: '#000000',
  },
  movementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementTime: {
    fontSize: 12,
    color: '#000000',
  },
  movementUser: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  movementNotes: {
    fontSize: 12,
    color: '#000000',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
  },
});