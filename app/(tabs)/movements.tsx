import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, ArrowDown, RotateCcw, Filter, Calendar, Plus, Package, X, Search } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Movement } from '@/types';
import designSystem from '@/styles/designSystem';

export default function MovementsScreen() {
  const { t } = useLanguage();
  const { movements, products, addMovement } = useStorage();
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'adjustment'>('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [movementData, setMovementData] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    notes: '',
  });

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

  const handleCreateMovement = () => {
    setShowProductSelector(true);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
    setShowMovementModal(true);
  };

  const handleMovement = async () => {
    if (!selectedProduct || !movementData.quantity || !movementData.reason) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    await addMovement({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: movementData.type,
      quantity: movementData.quantity,
      reason: movementData.reason,
      user: 'Current User',
      notes: movementData.notes,
    });

    setShowMovementModal(false);
    setSelectedProduct(null);
    setMovementData({
      type: 'in',
      quantity: 0,
      reason: '',
      notes: '',
    });

    Alert.alert('Erfolg', 'Bewegung wurde erfasst');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

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
              onPress={handleCreateMovement}
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
                  {filter.icon && <View style={{ marginRight: 4 }}>{filter.icon}</View>}
                  <Text style={[
                    styles.categoryFilterButtonText,
                    isSelected && styles.categoryFilterButtonTextActive
                  ]} numberOfLines={1} ellipsizeMode="tail">{filter.label} ({filter.count})</Text>
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
                  onPress={handleCreateMovement}
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

      {/* Product Selector Modal */}
      <Modal visible={showProductSelector} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowProductSelector(false)}
              accessibilityLabel={t('cancel')}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Produkt auswählen</Text>
            <View style={{ width: 80 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color={designSystem.colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Produkt suchen..."
                  placeholderTextColor={designSystem.colors.text.disabled}
                  value={productSearchQuery}
                  onChangeText={setProductSearchQuery}
                  accessibilityLabel="Produkt suchen"
                  returnKeyType="search"
                />
                {productSearchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setProductSearchQuery('')}
                    activeOpacity={designSystem.interactive.states.active.opacity}
                    accessibilityLabel="Suche löschen"
                    accessibilityRole="button"
                  >
                    <X size={20} color={designSystem.colors.text.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <ScrollView style={styles.productList} showsVerticalScrollIndicator={false}>
              {filteredProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => handleProductSelect(product)}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityRole="button"
                  accessibilityLabel={`Produkt ${product.name} auswählen`}
                >
                  <View style={styles.productIcon}>
                    <Package size={20} color={designSystem.colors.text.secondary} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDetails}>
                      {product.category} • {product.currentStock} {product.unit}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {filteredProducts.length === 0 && (
                <View style={styles.emptyProductState}>
                  <Text style={styles.emptyText}>
                    {productSearchQuery ? 
                      `Keine Produkte für "${productSearchQuery}" gefunden` : 
                      'Keine Produkte verfügbar'
                    }
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Movement Modal */}
      <Modal visible={showMovementModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMovementModal(false)}>
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Lagerbewegung</Text>
            <TouchableOpacity onPress={handleMovement}>
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedProduct && (
              <View style={styles.selectedProductInfo}>
                <Package size={24} color={designSystem.colors.success[500]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.selectedProductDetails}>
                    Aktueller Bestand: {selectedProduct.currentStock} {selectedProduct.unit}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.movementTypeContainer}>
              <Text style={styles.inputLabel}>Bewegungstyp</Text>
              <View style={styles.buttonGroup}>
                {[
                  { key: 'in', label: 'Wareneingang', color: designSystem.colors.success[500] },
                  { key: 'out', label: 'Warenausgang', color: designSystem.colors.error[500] },
                  { key: 'adjustment', label: 'Anpassung', color: designSystem.colors.neutral[500] },
                ].map(type => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      movementData.type === type.key && { backgroundColor: type.color }
                    ]}
                    onPress={() => setMovementData({...movementData, type: type.key as any})}
                    activeOpacity={designSystem.interactive.states.active.opacity}
                    accessibilityRole="button"
                    accessibilityLabel={`${type.label} auswählen`}
                    accessibilityState={{ selected: movementData.type === type.key }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      movementData.type === type.key && { color: designSystem.colors.text.inverse }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('quantity')} *</Text>
              <TextInput
                style={styles.textInput}
                value={movementData.quantity.toString()}
                onChangeText={(text) => setMovementData({...movementData, quantity: parseInt(text) || 0})}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={designSystem.colors.text.disabled}
                accessibilityLabel="Menge eingeben"
                accessibilityHint="Anzahl der Einheiten für diese Bewegung"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('reason')} *</Text>
              <TextInput
                style={styles.textInput}
                value={movementData.reason}
                onChangeText={(text) => setMovementData({...movementData, reason: text})}
                placeholder="z.B. Lieferung, Verkauf, Korrektur"
                placeholderTextColor={designSystem.colors.text.disabled}
                accessibilityLabel="Grund eingeben"
                accessibilityHint="Grund für diese Lagerbewegung"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('notes')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={movementData.notes}
                onChangeText={(text) => setMovementData({...movementData, notes: text})}
                placeholder="Zusätzliche Notizen..."
                placeholderTextColor={designSystem.colors.text.disabled}
                multiline
                numberOfLines={3}
                accessibilityLabel="Notizen eingeben"
                accessibilityHint="Optionale zusätzliche Informationen"
                returnKeyType="done"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.interactive.border.color,
    backgroundColor: designSystem.colors.background.secondary,
  },
  modalTitle: {
    ...designSystem.componentStyles.textSubtitle,
  },
  cancelButton: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  saveButton: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  
  // Product Selector Styles
  searchContainer: {
    marginBottom: designSystem.spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingHorizontal: designSystem.spacing.lg,
    paddingVertical: designSystem.spacing.md,
    gap: designSystem.spacing.md,
    minHeight: 48,
    ...designSystem.shadows.low,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    ...designSystem.componentStyles.textPrimary,
    lineHeight: 20,
  },
  productList: {
    flex: 1,
  },
  productItem: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.md,
    minHeight: 64,
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: designSystem.interactive.border.radius,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    ...designSystem.componentStyles.textSecondary,
  },
  emptyProductState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
  },
  
  // Movement Form Styles
  selectedProductInfo: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.xxl,
    ...designSystem.shadows.low,
  },
  selectedProductName: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  selectedProductDetails: {
    ...designSystem.componentStyles.textSecondary,
    marginTop: 2,
  },
  movementTypeContainer: {
    marginBottom: designSystem.spacing.xl,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: designSystem.spacing.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  typeButtonText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: designSystem.spacing.xl,
  },
  inputLabel: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: designSystem.spacing.sm,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: 14,
    ...designSystem.componentStyles.textPrimary,
    backgroundColor: designSystem.colors.background.secondary,
    minHeight: 48,
    lineHeight: 20,
    ...designSystem.shadows.low,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});