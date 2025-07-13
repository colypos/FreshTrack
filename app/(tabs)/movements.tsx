import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ArrowDown, RotateCcw, Filter, Calendar } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Movement } from '@/types';
import designSystem from '@/styles/designSystem';

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
        return <ArrowUp size={20} color={designSystem.colors.success[500]} />;
      case 'out':
        return <ArrowDown size={20} color={designSystem.colors.error[500]} />;
      case 'adjustment':
        return <RotateCcw size={20} color={designSystem.colors.neutral[500]} />;
      default:
        return <RotateCcw size={20} color={designSystem.colors.neutral[500]} />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
        return designSystem.colors.success[500];
      case 'out':
        return designSystem.colors.error[500];
      case 'adjustment':
        return designSystem.colors.neutral[500];
      default:
        return designSystem.colors.neutral[500];
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
    <TouchableOpacity 
      style={styles.movementCard}
      activeOpacity={designSystem.interactive.states.active.opacity}
      accessibilityRole="button"
      accessibilityLabel={`${movement.productName} ${getMovementLabel(movement.type)} ${movement.quantity}`}
    >
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
        <TouchableOpacity 
          style={styles.filterButton}
          activeOpacity={designSystem.interactive.states.active.opacity}
          accessibilityRole="button"
          accessibilityLabel="Filter öffnen"
        >
          <Filter size={24} color={designSystem.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Bewegungstypen</Text>
          {filterType !== 'all' && (
            <TouchableOpacity
              onPress={() => setFilterType('all')}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityLabel="Alle Filter zurücksetzen"
              accessibilityRole="button"
            >
              <Text style={styles.clearFiltersText}>Zurücksetzen</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterButtons}>
          {[
            { key: 'all', label: 'Alle', icon: null },
            { key: 'in', label: t('stockIn'), icon: <ArrowUp size={14} color={designSystem.colors.success[500]} /> },
            { key: 'out', label: t('stockOut'), icon: <ArrowDown size={14} color={designSystem.colors.error[500]} /> },
            { key: 'adjustment', label: t('adjustment'), icon: <RotateCcw size={14} color={designSystem.colors.neutral[500]} /> },
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                filterType === filter.key && styles.filterChipActive
              ]}
              onPress={() => setFilterType(filter.key as any)}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${filter.label}`}
              accessibilityState={{ selected: filterType === filter.key }}
            >
              {filter.icon}
              <Text style={[
                styles.filterText,
                filterType === filter.key && styles.filterTextActive
              ]} numberOfLines={1} ellipsizeMode="tail">
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            <Calendar size={48} color={designSystem.colors.neutral[300]} />
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
    backgroundColor: designSystem.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
    paddingBottom: 10,
  },
  title: {
    ...designSystem.componentStyles.textTitle,
  },
  filterButton: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    width: 48,
    height: 48,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  filterContainer: {
    paddingHorizontal: designSystem.spacing.xl,
    marginBottom: designSystem.spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.sm,
  },
  filterTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  clearFiltersText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    color: designSystem.colors.error[500],
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm,
    maxHeight: 58, // 2 rows max
    overflow: 'hidden',
  },
  filterChip: {
    backgroundColor: designSystem.colors.filter.default,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
    height: 26, // 60% of original 44px
    maxWidth: '48%',
    ...designSystem.shadows.low,
  },
  filterChipActive: {
    backgroundColor: designSystem.colors.filter.active,
    borderWidth: designSystem.interactive.border.width, // Same border width
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
    height: 26,
    maxWidth: '48%',
    ...designSystem.shadows.medium,
  },
  filterText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
    flex: 1,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  filterTextActive: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  statsBar: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    flexDirection: 'row',
    marginHorizontal: designSystem.spacing.xl,
    marginBottom: designSystem.spacing.lg,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.low,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...designSystem.componentStyles.textHeader,
    fontWeight: 'bold',
  },
  statLabel: {
    ...designSystem.componentStyles.textCaption,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: designSystem.interactive.border.color,
    marginHorizontal: designSystem.spacing.lg,
  },
  movementsList: {
    flex: 1,
    padding: designSystem.spacing.xl,
    paddingTop: 0,
  },
  movementCard: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    marginBottom: 4,
    flexDirection: 'row',
    ...designSystem.shadows.low,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designSystem.spacing.md,
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
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  quantityText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: 'bold',
  },
  movementDetails: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.sm,
  },
  movementType: {
    ...designSystem.componentStyles.textCaption,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: 2,
    borderRadius: designSystem.interactive.border.radius,
    fontWeight: '500',
  },
  movementReason: {
    ...designSystem.componentStyles.textSecondary,
  },
  movementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementTime: {
    ...designSystem.componentStyles.textCaption,
  },
  movementUser: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '500',
  },
  movementNotes: {
    ...designSystem.componentStyles.textCaption,
    fontStyle: 'italic',
    marginTop: designSystem.spacing.sm,
    paddingTop: designSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: designSystem.interactive.border.color,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    ...designSystem.componentStyles.textSubtitle,
    fontWeight: '600',
    marginTop: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.sm,
  },
  emptySubtext: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});