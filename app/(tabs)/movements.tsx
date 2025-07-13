import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ArrowDown, RotateCcw, Filter, Calendar, Plus } from 'lucide-react-native';
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

  const clearAllFilters = () => {
    setFilterType('all');
  };

  const MovementCard = ({ movement }: { movement: Movement }) => (
    <TouchableOpacity 
      style={styles.movementCard}
      activeOpacity={designSystem.interactive.states.active.opacity}
      accessibilityRole="button"
      accessibilityLabel={`${movement.productName} ${getMovementLabel(movement.type)} ${movement.quantity}`}
      accessibilityHint="Tippen für Details"
    >
      <View style={styles.movementIcon}>
        {getMovementIcon(movement.type)}
      </View>
      
      <View style={styles.movementContent}>
        <View style={styles.movementHeader}>
          <Text style={styles.productName} numberOfLines={1}>{movement.productName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getMovementColor(movement.type) }]}>
            <Text style={styles.statusText}>{getMovementLabel(movement.type)}</Text>
          </View>
        </View>
        
        <Text style={styles.movementCategory}>{movement.reason}</Text>
        
        <View style={styles.movementDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Menge:</Text>
            <Text style={[styles.detailValue, { color: getMovementColor(movement.type) }]}>
              {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
              {movement.quantity}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.detailValue}>
              {new Date(movement.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>User:</Text>
            <Text style={styles.detailValue}>{movement.user}</Text>
          </View>
        </View>
        
        {movement.notes && (
          <Text style={styles.movementNotes} numberOfLines={2}>{movement.notes}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with consistent styling */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('movements')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityLabel="Neue Bewegung hinzufügen"
              accessibilityRole="button"
            >
              <Plus size={24} color={designSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Section - consistent with Inventory */}
        <View style={styles.categoryFilterContainer}>
          <View style={styles.categoryFilterHeader}>
            <Text style={styles.categoryFilterTitle}>Bewegungstypen</Text>
            {filterType !== 'all' && (
              <TouchableOpacity
                onPress={clearAllFilters}
                activeOpacity={designSystem.interactive.states.active.opacity}
                accessibilityLabel="Alle Filter zurücksetzen"
                accessibilityRole="button"
              >
                <Text style={styles.clearFiltersText}>Zurücksetzen</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.categoryFilterButtons}>
            {[
              { key: 'all', label: 'Alle', icon: null, count: movements.length },
              { key: 'in', label: t('stockIn'), icon: <ArrowUp size={14} color={designSystem.colors.success[500]} />, count: movements.filter(m => m.type === 'in').length },
              { key: 'out', label: t('stockOut'), icon: <ArrowDown size={14} color={designSystem.colors.error[500]} />, count: movements.filter(m => m.type === 'out').length },
              { key: 'adjustment', label: t('adjustment'), icon: <RotateCcw size={14} color={designSystem.colors.neutral[500]} />, count: movements.filter(m => m.type === 'adjustment').length },
            ].map(filter => {
              const isSelected = filterType === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.categoryFilterButton,
                    isSelected && styles.categoryFilterButtonActive
                  ]}
                  onPress={() => setFilterType(filter.key as any)}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${filter.label}, ${filter.count} Bewegungen`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {filter.icon}
                  <Text style={[
                    styles.categoryFilterButtonText,
                    isSelected && styles.categoryFilterButtonTextActive
                  ]} numberOfLines={1} ellipsizeMode="tail">
                    {filter.label} ({filter.count})
                  </Text>
                  {isSelected && (
                    <View style={styles.categoryFilterCheck}>
                      <Text style={styles.categoryFilterCheckmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Main Content Area - consistent with Inventory */}
      <View style={styles.contentContainer}>
        <View style={styles.movementArea}>
          <View style={styles.movementHeader}>
            <Text style={styles.resultCount}>
              {filteredMovements.length} {filteredMovements.length === 1 ? 'Bewegung' : 'Bewegungen'}
              {filterType !== 'all' && ` (1 Filter aktiv)`}
            </Text>
          </View>

          <ScrollView 
            style={styles.movementsList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.movementsListContent}
          >
            <View style={styles.movementsListView}>
              {filteredMovements.map(movement => (
                <MovementCard key={movement.id} movement={movement} />
              ))}
            </View>
            
            {filteredMovements.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar size={64} color={designSystem.colors.neutral[300]} />
                <Text style={styles.emptyTitle}>Keine Bewegungen gefunden</Text>
                <Text style={styles.emptySubtitle}>
                  {filterType !== 'all' ? 
                    `Keine ${getMovementLabel(filterType)}-Bewegungen vorhanden` : 
                    'Verwenden Sie den Scanner, um Lagerbewegungen zu erfassen'
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAction}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityLabel="Neue Bewegung hinzufügen"
                  accessibilityRole="button"
                >
                  <Plus size={20} color={designSystem.colors.text.primary} />
                  <Text style={styles.emptyActionText}>Bewegung hinzufügen</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  
  // Header Styles - consistent with Inventory
  header: {
    backgroundColor: designSystem.colors.background.primary,
    padding: designSystem.spacing.xl,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.secondary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.lg,
  },
  title: {
    ...designSystem.componentStyles.textTitle,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 0,
  },
  addButton: {
    backgroundColor: designSystem.colors.secondary[500],
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    width: 44,
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  
  // Category Filter Styles - consistent with Inventory
  categoryFilterContainer: {
    marginTop: designSystem.spacing.md,
  },
  categoryFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.md,
  },
  categoryFilterTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  clearFiltersText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    color: designSystem.colors.error[500],
  },
  categoryFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm * 0.3,
    maxHeight: 58,
    overflow: 'hidden',
  },
  categoryFilterButton: {
    backgroundColor: designSystem.colors.filter.default,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    paddingHorizontal: designSystem.spacing.md,
    paddingVertical: 6,
    flexDirection: 'row', 
    alignItems: 'center',
    gap: designSystem.spacing.xs,
    height: 26,
    maxWidth: '48%',
  },
  categoryFilterButtonActive: {
    backgroundColor: designSystem.colors.filter.active,
    gap: designSystem.spacing.xs,
    height: 26,
    maxWidth: '48%',
    ...designSystem.shadows.medium,
  },
  categoryFilterButtonText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
    flex: 1,
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  categoryFilterButtonTextActive: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  categoryFilterCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: designSystem.colors.success[500],
    borderWidth: 1,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFilterCheckmark: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 10,
    fontWeight: 'bold',
    color: designSystem.colors.text.inverse,
  },
  
  // Content Area - consistent with Inventory
  contentContainer: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
    paddingHorizontal: designSystem.spacing.xl,
  },
  movementArea: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: designSystem.colors.background.primary,
  },
  movementHeader: {
    paddingHorizontal: 0,
    paddingVertical: designSystem.spacing.md,
    borderBottomColor: designSystem.colors.border.secondary,
  },
  resultCount: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  movementsList: {
    flex: 1,
  },
  movementsListContent: {
    padding: 0,
    paddingTop: designSystem.spacing.sm,
    paddingBottom: designSystem.spacing.xxl,
  },
  
  // Movement List View - consistent with Inventory
  movementsListView: {
    gap: designSystem.spacing.md,
  },
  movementCard: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designSystem.spacing.md,
    minHeight: 64,
    marginBottom: 0,
    ...designSystem.shadows.low,
  },
  movementContent: {
    flex: 1,
  },
  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
  },
  statusText: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 10,
    fontWeight: 'bold',
    color: designSystem.colors.text.inverse,
  },
  productName: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: 'bold',
    flex: 1,
    marginBottom: 4,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  movementCategory: {
    ...designSystem.componentStyles.textSecondary,
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '500',
  },
  movementDetails: {
    flexDirection: 'row',
    gap: designSystem.spacing.lg,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
  },
  detailLabel: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 11,
    flex: 1,
  },
  movementNotes: {
    ...designSystem.componentStyles.textCaption,
    fontStyle: 'italic',
    marginTop: designSystem.spacing.sm,
    paddingTop: designSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: designSystem.interactive.border.color,
  },
  
  // Empty State - consistent with Inventory
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designSystem.spacing.xl,
    paddingVertical: 48,
    marginTop: 40,
  },
  emptyTitle: {
    ...designSystem.componentStyles.textSubtitle,
    marginTop: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
    marginBottom: designSystem.spacing.xxl,
    lineHeight: 20,
    paddingHorizontal: designSystem.spacing.xl,
  },
  emptyAction: {
    backgroundColor: designSystem.colors.secondary[500],
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingHorizontal: designSystem.spacing.xl,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
    minHeight: 44,
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  emptyActionText: {
    ...designSystem.componentStyles.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});