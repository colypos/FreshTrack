import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, Package, Calendar, MapPin, Menu, X, Grid2x2 as Grid, List } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Product } from '@/types';
import designSystem from '@/styles/designSystem';

const { width: screenWidth } = Dimensions.get('window');

export default function InventoryScreen() {
  const { t } = useLanguage();
  const { products, addProduct } = useStorage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    unit: '',
    expiryDate: '',
    location: '',
    supplier: '',
    barcode: '',
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Apply filter from navigation params
  const getFilteredProductsByParam = () => {
    const filter = params.filter as string;
    
    switch (filter) {
      case 'lowStock':
        return products.filter(p => p.currentStock <= p.minStock);
      case 'expiringSoon':
        return products.filter(p => {
          const parseGermanDate = (dateString: string) => {
            if (!dateString) return new Date();
            const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
            const match = dateString.match(germanDateRegex);
            if (match) {
              const [, day, month, year] = match;
              return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            return new Date(dateString);
          };
          const expiryDate = parseGermanDate(p.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        });
      case 'criticalAlerts':
        return products.filter(p => {
          const parseGermanDate = (dateString: string) => {
            if (!dateString) return new Date();
            const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
            const match = dateString.match(germanDateRegex);
            if (match) {
              const [, day, month, year] = match;
              return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            return new Date(dateString);
          };
          const expiryDate = parseGermanDate(p.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          return daysUntilExpiry < 0 || p.currentStock <= p.minStock;
        });
      default:
        return products;
    }
  };

  const baseFilteredProducts = getFilteredProductsByParam();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  }).filter(product => {
    // Apply navigation filter if present
    if (params.filter) {
      return baseFilteredProducts.some(fp => fp.id === product.id);
    }
    return true;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
  };

  const showAllProducts = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    if (params.filter) {
      router.replace('/inventory');
    }
  };

  const getStockStatus = (product: Product) => {
    const now = new Date();
    
    const parseGermanDate = (dateString: string) => {
      if (!dateString) return new Date();
      
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = dateString.match(germanDateRegex);
      
      if (match) {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      return new Date(dateString);
    };
    
    const expiryDate = parseGermanDate(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', color: '#EF4444', label: 'Abgelaufen' };
    if (daysUntilExpiry === 0) return { status: 'expiresToday', color: '#EF4444', label: 'Läuft heute ab' };
    if (daysUntilExpiry <= 7) return { status: 'expiresThisWeek', color: '#EAB308', label: 'Läuft bald ab' };
    if (product.currentStock <= product.minStock) return { status: 'lowStockWarning', color: '#F97316', label: 'Niedriger Bestand' };
    return { status: 'inStock', color: '#22C55E', label: 'Auf Lager' };
  };

  const formatGermanDate = (dateString: string) => {
    if (!dateString) return '';
    
    const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    if (germanDateRegex.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Produktnamen ein.');
      return;
    }
    
    const validateGermanDate = (dateString: string) => {
      if (!dateString) return true;
      
      const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = dateString.match(germanDateRegex);
      
      if (!match) return false;
      
      const [, day, month, year] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum < 1 || dayNum > 31) return false;
      if (monthNum < 1 || monthNum > 12) return false;
      if (yearNum < 1900 || yearNum > 2100) return false;
      
      const testDate = new Date(yearNum, monthNum - 1, dayNum);
      return testDate.getDate() === dayNum && 
             testDate.getMonth() === monthNum - 1 && 
             testDate.getFullYear() === yearNum;
    };
    
    if (newProduct.expiryDate && !validateGermanDate(newProduct.expiryDate)) {
      Alert.alert('Fehler', 'Bitte geben Sie ein gültiges Datum im Format DD.MM.YYYY ein (z.B. 30.03.1973)');
      return;
    }
    
    try {
      await addProduct(newProduct);
      setNewProduct({
        name: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        unit: '',
        expiryDate: '',
        location: '',
        supplier: '',
        barcode: '',
      });
      setShowAddModal(false);
      Alert.alert('Erfolg', 'Produkt wurde erfolgreich hinzugefügt!');
    } catch (error) {
      Alert.alert('Fehler', 'Produkt konnte nicht hinzugefügt werden.');
    }
  };

  const handleDateSelect = (selectedDate: string) => {
    setNewProduct({...newProduct, expiryDate: selectedDate});
    setShowDatePicker(false);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 730; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      dates.push({
        formatted: `${day}.${month}.${year}`,
        display: `${day}.${month}.${year}`,
        date: date
      });
    }
    
    return dates;
  };

  // Get current category display info
  const getFilteredCount = () => {
    return filteredProducts.length;
  };

  // Get filter display name
  const getFilterDisplayName = () => {
    const filter = params.filter as string;
    switch (filter) {
      case 'lowStock':
        return 'Niedriger Bestand';
      case 'expiringSoon':
        return 'Läuft bald ab';
      case 'criticalAlerts':
        return 'Kritische Warnungen';
      default:
        return null;
    }
  };

  // Product Card Components
  const ProductGridCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity 
        style={styles.productGridCard}
        onPress={() => setSelectedProduct(product)}
        activeOpacity={designSystem.interactive.states.active.opacity}
        accessibilityLabel={`Produkt ${product.name}, ${stockStatus.label}, ${product.currentStock} ${product.unit}`}
        accessibilityRole="button"
        accessibilityHint="Tippen für Details"
      >
        <View style={styles.productCardHeader}>
          <View style={styles.productIcon}>
            <Package size={20} color="#6B7280" />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.statusText}>{stockStatus.label}</Text>
          </View>
        </View>
        
        <View style={styles.productCardContent}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bestand:</Text>
              <Text style={styles.detailValue}>{product.currentStock} {product.unit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.detailValue}>{formatGermanDate(product.expiryDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailValue} numberOfLines={1}>{product.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ProductListCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity 
        style={styles.productListCard}
        onPress={() => setSelectedProduct(product)}
        activeOpacity={designSystem.interactive.states.active.opacity}
        accessibilityLabel={`Produkt ${product.name}, ${stockStatus.label}, ${product.currentStock} ${product.unit}`}
        accessibilityRole="button"
        accessibilityHint="Tippen für Details"
      >
        <View style={styles.productIcon}>
          <Package size={20} color="#6B7280" />
        </View>
        
        <View style={styles.productListContent}>
          <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">{product.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.statusText}>{stockStatus.label}</Text>
          </View>
          
          <Text style={styles.productCategory} numberOfLines={1} ellipsizeMode="tail">{product.category}</Text>
          
          <View style={styles.productListDetails}>
            <View style={[styles.detailItem, styles.detailItemStock]}>
              <Text style={styles.detailLabel}>Bestand:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{product.currentStock} {product.unit}</Text>
            </View>
            <View style={[styles.detailItem, styles.detailItemDate]}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.detailValue} numberOfLines={1}>{formatGermanDate(product.expiryDate)}</Text>
            </View>
            <View style={[styles.detailItem, styles.detailItemLocation]}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{product.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Inventar</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityLabel="Neues Produkt hinzufügen"
              accessibilityRole="button"
            >
              <Plus size={24} color={designSystem.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={designSystem.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Produkte, Kategorien oder Standorte suchen..."
              placeholderTextColor={designSystem.colors.text.disabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Suchfeld für Produkte"
              accessibilityHint="Geben Sie Text ein um Produkte zu filtern"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                activeOpacity={designSystem.interactive.states.active.opacity}
                accessibilityLabel="Suche löschen"
              >
                <Text style={styles.clearFiltersText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filter Buttons */}
        <View style={styles.categoryFilterContainer}>
          <View style={styles.categoryFilterHeader}>
            <Text style={styles.categoryFilterTitle}>Kategorien</Text>
            <View style={styles.filterActions}>
              {(selectedCategories.length > 0 || searchQuery.length > 0 || params.filter) && (
                <TouchableOpacity
                  onPress={showAllProducts}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityLabel="Alle Filter zurücksetzen und alle Produkte anzeigen"
                  accessibilityRole="button"
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.categoryFilterButtons}>
            {categories.map(category => {
              const count = products.filter(p => p.category === category).length;
              const isSelected = selectedCategories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryFilterButton,
                    isSelected && styles.categoryFilterButtonActive
                  ]}
                  onPress={() => toggleCategory(category)}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityLabel={`Filter ${category}, ${count} Produkte`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[
                    styles.categoryFilterButtonText,
                    isSelected && styles.categoryFilterButtonTextActive
                  ]}>
                    {category} ({count})
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

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.productArea}>
          <View style={styles.productHeader}>
            <Text style={styles.resultCount}>
              {getFilteredCount()} {getFilteredCount() === 1 ? 'Produkt' : 'Produkte'}
              {(selectedCategories.length > 0 || params.filter) && ` (${selectedCategories.length + (params.filter ? 1 : 0)} Filter aktiv)`}
              {getFilterDisplayName() && (
                <Text style={styles.filterIndicator}> • {getFilterDisplayName()}</Text>
              )}
            </Text>
          </View>

          <ScrollView 
            style={styles.productList} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productListContent}
          >
            <View style={styles.productListView}>
              {filteredProducts.map(product => (
                <ProductListCard key={product.id} product={product} />
              ))}
            </View>
            
            {filteredProducts.length === 0 && (
              <View style={styles.emptyState}>
                <Package size={64} color={designSystem.colors.neutral[300]} />
                <Text style={styles.emptyTitle}>Keine Produkte gefunden</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 
                    `Keine Ergebnisse für "${searchQuery}"` : 
                    'Fügen Sie Ihr erstes Produkt hinzu'
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAction}
                  onPress={() => setShowAddModal(true)}
                  activeOpacity={designSystem.interactive.states.active.opacity}
                  accessibilityLabel="Erstes Produkt hinzufügen"
                  accessibilityRole="button"
                >
                  <Plus size={20} color={designSystem.colors.text.primary} />
                  <Text style={styles.emptyActionText}>Produkt hinzufügen</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Add Product Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddModal(false)}
              accessibilityLabel="Abbrechen"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('addProduct')}</Text>
            <TouchableOpacity 
              onPress={handleAddProduct}
              accessibilityLabel="Produkt speichern"
              accessibilityRole="button"
            >
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Grundinformationen</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('productName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                  placeholder="z.B. Tomaten"
                  placeholderTextColor="#6B7280"
                  autoFocus
                  returnKeyType="next"
                  accessibilityLabel="Produktname eingeben"
                  accessibilityHint="Pflichtfeld für den Namen des Produkts"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('category')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.category}
                  onChangeText={(text) => setNewProduct({...newProduct, category: text})}
                  placeholder="z.B. Gemüse"
                  placeholderTextColor="#6B7280"
                  returnKeyType="next"
                  accessibilityLabel="Kategorie eingeben"
                  accessibilityHint="Produktkategorie für bessere Organisation"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Bestandsinformationen</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.inputLabel}>{t('quantity')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newProduct.currentStock.toString()}
                    onChangeText={(text) => setNewProduct({...newProduct, currentStock: parseInt(text) || 0})}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6B7280"
                    returnKeyType="next"
                    accessibilityLabel="Aktuelle Menge eingeben"
                    accessibilityHint="Anzahl der verfügbaren Einheiten"
                  />
                </View>
                
                <View style={styles.inputGroupHalf}>
                  <Text style={styles.inputLabel}>{t('unit')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newProduct.unit}
                    onChangeText={(text) => setNewProduct({...newProduct, unit: text})}
                    placeholder="kg, Stück, L"
                    placeholderTextColor="#6B7280"
                    returnKeyType="next"
                    accessibilityLabel="Einheit eingeben"
                    accessibilityHint="Maßeinheit für das Produkt"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mindestbestand</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.minStock.toString()}
                  onChangeText={(text) => setNewProduct({...newProduct, minStock: parseInt(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#6B7280"
                  returnKeyType="next"
                  accessibilityLabel="Mindestbestand eingeben"
                  accessibilityHint="Warnschwelle für niedrigen Bestand"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Verfallsdatum</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('expiryDate')}</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.dateInput]}
                    value={newProduct.expiryDate}
                    onChangeText={(text) => setNewProduct({...newProduct, expiryDate: text})}
                    placeholder="DD.MM.YYYY"
                    placeholderTextColor="#6B7280"
                    returnKeyType="next"
                    accessibilityLabel="Verfallsdatum eingeben"
                    accessibilityHint="Datum im Format Tag.Monat.Jahr"
                  />
                  <TouchableOpacity 
                    style={styles.calendarButton}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityLabel="Kalender öffnen"
                    accessibilityHint="Datum aus Kalender auswählen"
                    accessibilityRole="button"
                  >
                    <Calendar size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.groupTitle}>Zusätzliche Informationen</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('location')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.location}
                  onChangeText={(text) => setNewProduct({...newProduct, location: text})}
                  placeholder="z.B. Kühlschrank A1"
                  placeholderTextColor="#6B7280"
                  returnKeyType="next"
                  accessibilityLabel="Lagerort eingeben"
                  accessibilityHint="Wo das Produkt gelagert wird"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lieferant</Text>
                <TextInput
                  style={styles.textInput}
                  value={newProduct.supplier}
                  onChangeText={(text) => setNewProduct({...newProduct, supplier: text})}
                  placeholder="z.B. Frische AG"
                  placeholderTextColor="#6B7280"
                  returnKeyType="done"
                  accessibilityLabel="Lieferant eingeben"
                  accessibilityHint="Name des Produktlieferanten"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal 
        visible={showDatePicker} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(false)}
              accessibilityLabel="Abbrechen"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Datum auswählen</Text>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(false)}
              accessibilityLabel="Fertig"
              accessibilityRole="button"
            >
              <Text style={styles.saveButton}>Fertig</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.datePickerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.dateGrid}>
              {generateDateOptions().slice(0, 60).map((dateOption, index) => {
                const isSelected = newProduct.expiryDate === dateOption.formatted;
                const isToday = index === 0;
                const isThisWeek = index < 7;
                
                return (
                  <TouchableOpacity
                    key={dateOption.formatted}
                    style={[
                      styles.dateOption,
                      isSelected && styles.dateOptionSelected,
                      isToday && styles.dateOptionToday,
                      isThisWeek && !isToday && styles.dateOptionThisWeek
                    ]}
                    onPress={() => handleDateSelect(dateOption.formatted)}
                    accessibilityLabel={`Datum ${dateOption.display} auswählen`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      isSelected && styles.dateOptionTextSelected,
                      isToday && styles.dateOptionTextToday
                    ]}>
                      {dateOption.display}
                    </Text>
                    {isToday && (
                      <Text style={styles.dateOptionLabel}>Heute</Text>
                    )}
                    {isThisWeek && !isToday && (
                      <Text style={styles.dateOptionLabel}>
                        {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dateOption.date.getDay()]}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.quickDateSection}>
              <Text style={styles.quickDateTitle}>Schnellauswahl</Text>
              <View style={styles.quickDateButtons}>
                {[
                  { label: 'Heute', days: 0 },
                  { label: 'Morgen', days: 1 },
                  { label: 'In 1 Woche', days: 7 },
                  { label: 'In 2 Wochen', days: 14 },
                  { label: 'In 1 Monat', days: 30 },
                  { label: 'In 3 Monaten', days: 90 },
                ].map(option => {
                  const date = new Date();
                  date.setDate(date.getDate() + option.days);
                  const formatted = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                  
                  return (
                    <TouchableOpacity
                      key={option.label}
                      style={styles.quickDateButton}
                      onPress={() => handleDateSelect(formatted)}
                      accessibilityLabel={`${option.label} auswählen: ${formatted}`}
                      accessibilityRole="button"
                    >
                      <Text style={styles.quickDateButtonText}>{option.label}</Text>
                      <Text style={styles.quickDateButtonDate}>{formatted}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
  
  // Header Styles
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
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
  },
  searchBar: {
    flex: 1,
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
  searchInput: {
    flex: 1,
    ...designSystem.componentStyles.textPrimary,
    lineHeight: 20,
  },
  
  // Category Filter Styles
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
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
  },
  clearFiltersText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    color: designSystem.colors.error[500],
  },
  categoryFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm * 0.3, // 30% of default spacing (8px * 0.3 = 2.4px)
    maxHeight: 58, // Approximately 2 rows (26px height + 6px gap + 26px height)
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
    height: 26, // 60% of original 44px height
  },
  categoryFilterButtonActive: {
    backgroundColor: designSystem.colors.filter.active,
    borderColor: designSystem.colors.filter.activeBorder,
    gap: designSystem.spacing.xs,
    height: 26,
    maxWidth: '48%',
    ...designSystem.shadows.medium,
  },
  categoryFilterButtonText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  categoryFilterButtonTextActive: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
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
  
  // Product Area (now full width)
  contentContainer: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
    paddingHorizontal: designSystem.spacing.xl,
  },
  productArea: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: designSystem.colors.background.primary,
  },
  productHeader: {
    paddingHorizontal: 0,
    paddingVertical: designSystem.spacing.md,
    borderBottomColor: designSystem.colors.border.secondary,
  },
  resultCount: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  filterIndicator: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
    color: designSystem.colors.secondary[600],
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 0,
    paddingTop: designSystem.spacing.sm,
    paddingBottom: designSystem.spacing.xxl,
  },
  
  // Product List View
  productListView: {
    gap: designSystem.spacing.md,
  },
  productListCard: {
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
  productIcon: {
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
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusText: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productName: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productCategory: {
    ...designSystem.componentStyles.textSecondary,
    fontSize: designSystem.getResponsiveValue(14, 15, 16),
    marginBottom: 6,
    fontWeight: '500',
    color: designSystem.colors.text.primary,
    minHeight: 18,
    lineHeight: 18,
  },
  productListDetails: {
    flexDirection: 'column',
    gap: designSystem.spacing.sm,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
    minHeight: 20,
    flex: 1,
  },
  detailItemStock: {
    minWidth: 120,
  },
  detailItemDate: {
    minWidth: 140,
  },
  detailItemLocation: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 11,
    fontWeight: '600',
    minWidth: 50,
  },
  detailValue: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 11,
    flex: 1,
    minWidth: 0,
  },
  
  // Empty State
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
  
  // Form Styles
  fieldGroup: {
    marginBottom: designSystem.spacing.xxxl,
    paddingBottom: designSystem.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.secondary,
  },
  groupTitle: {
    ...designSystem.componentStyles.textSubtitle,
    marginBottom: designSystem.spacing.xl,
    paddingBottom: designSystem.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: designSystem.colors.secondary[500],
  },
  inputGroup: {
    marginBottom: designSystem.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.xl,
  },
  inputGroupHalf: {
    flex: 1,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.md,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    width: 48,
    height: 48,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  
  // Date Picker Styles
  datePickerContent: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.xxxl,
  },
  dateOption: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.md,
    width: '31%',
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    ...designSystem.shadows.low,
  },
  dateOptionSelected: {
    backgroundColor: designSystem.colors.secondary[500],
    borderColor: designSystem.interactive.border.color,
    ...designSystem.shadows.medium,
  },
  dateOptionToday: {
    backgroundColor: designSystem.colors.success[500],
    borderColor: designSystem.interactive.border.color,
    ...designSystem.shadows.medium,
  },
  dateOptionThisWeek: {
    backgroundColor: designSystem.colors.warning[500],
    borderColor: designSystem.interactive.border.color,
    ...designSystem.shadows.medium,
  },
  dateOptionText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateOptionTextSelected: {
    color: designSystem.colors.text.primary,
  },
  dateOptionTextToday: {
    color: designSystem.colors.text.primary,
  },
  dateOptionLabel: {
    ...designSystem.componentStyles.textCaption,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  quickDateSection: {
    marginTop: designSystem.spacing.xl,
  },
  quickDateTitle: {
    ...designSystem.componentStyles.textSubtitle,
    marginBottom: designSystem.spacing.lg,
  },
  quickDateButtons: {
    gap: designSystem.spacing.sm,
  },
  quickDateButton: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
    ...designSystem.shadows.low,
  },
  quickDateButtonText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  quickDateButtonDate: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '500',
  },
});