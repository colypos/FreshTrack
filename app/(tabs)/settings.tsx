import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, Package, Calendar, MapPin, Menu, X, Grid2x2 as Grid, List } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Product } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

export default function InventoryScreen() {
  const { t } = useLanguage();
  const { products, addProduct } = useStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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

  // Responsive breakpoints
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
  const getCurrentCategoryInfo = () => {
    if (selectedCategory === 'all') {
      return { name: 'Alle Kategorien', count: products.length };
    }
    const count = products.filter(p => p.category === selectedCategory).length;
    return { name: selectedCategory, count };
  };

  // Product Card Components
  const ProductGridCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity 
        style={styles.productGridCard}
        onPress={() => setSelectedProduct(product)}
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
        accessibilityLabel={`Produkt ${product.name}, ${stockStatus.label}, ${product.currentStock} ${product.unit}`}
        accessibilityRole="button"
        accessibilityHint="Tippen für Details"
      >
        <View style={styles.productIcon}>
          <Package size={20} color="#6B7280" />
        </View>
        
        <View style={styles.productListContent}>
          <View style={styles.productListHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.statusText}>{stockStatus.label}</Text>
            </View>
          </View>
          
          <Text style={styles.productCategory}>{product.category}</Text>
          
          <View style={styles.productListDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bestand:</Text>
              <Text style={styles.detailValue}>{product.currentStock} {product.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={14} color="#6B7280" />
              <Text style={styles.detailValue}>{formatGermanDate(product.expiryDate)}</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.detailValue}>{product.location}</Text>
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
          <Text style={styles.title}>{t('inventory')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              accessibilityLabel="Neues Produkt hinzufügen"
              accessibilityRole="button"
            >
              <Plus size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Produkte, Kategorien oder Standorte suchen..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Suchfeld für Produkte"
              accessibilityHint="Geben Sie Text ein um Produkte zu filtern"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                accessibilityLabel="Suche löschen"
                accessibilityRole="button"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Dropdown */}
        <View style={styles.categoryDropdownContainer}>
          <TouchableOpacity 
            style={styles.categoryDropdownButton}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            accessibilityLabel={`Kategorie auswählen, aktuell: ${getCurrentCategoryInfo().name}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: showCategoryDropdown }}
          >
            <View style={styles.categoryDropdownContent}>
              <Package size={20} color="#6B7280" />
              <View style={styles.categoryDropdownText}>
                <Text style={styles.categoryDropdownLabel}>Kategorie</Text>
                <Text style={styles.categoryDropdownValue}>
                  {getCurrentCategoryInfo().name} ({getCurrentCategoryInfo().count})
                </Text>
              </View>
            </View>
            <View style={[
              styles.categoryDropdownArrow,
              showCategoryDropdown && styles.categoryDropdownArrowOpen
            ]}>
              <Menu size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.categoryDropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.categoryDropdownItem,
                  selectedCategory === 'all' && styles.categoryDropdownItemActive
                ]}
                onPress={() => {
                  setSelectedCategory('all');
                  setShowCategoryDropdown(false);
                }}
                accessibilityLabel="Alle Kategorien anzeigen"
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCategory === 'all' }}
              >
                <Package size={18} color={selectedCategory === 'all' ? '#F68528' : '#6B7280'} />
                <Text style={[
                  styles.categoryDropdownItemText,
                  selectedCategory === 'all' && styles.categoryDropdownItemTextActive
                ]}>
                  Alle Kategorien ({products.length})
                </Text>
                {selectedCategory === 'all' && (
                  <View style={styles.categoryDropdownCheck}>
                    <Text style={styles.categoryDropdownCheckmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {categories.map(category => {
                const count = products.filter(p => p.category === category).length;
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryDropdownItem,
                      isSelected && styles.categoryDropdownItemActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    accessibilityLabel={`Kategorie ${category} anzeigen, ${count} Produkte`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[
                      styles.categoryDot,
                      { backgroundColor: isSelected ? '#F68528' : '#6B7280' }
                    ]} />
                    <Text style={[
                      styles.categoryDropdownItemText,
                      isSelected && styles.categoryDropdownItemTextActive
                    ]}>
                      {category} ({count})
                    </Text>
                    {isSelected && (
                      <View style={styles.categoryDropdownCheck}>
                        <Text style={styles.categoryDropdownCheckmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.productArea}>
          <View style={styles.productHeader}>
            <Text style={styles.resultCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Produkt' : 'Produkte'}
              {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
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
                <Package size={64} color="#D1D5DB" />
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
                  accessibilityLabel="Erstes Produkt hinzufügen"
                  accessibilityRole="button"
                >
                  <Plus size={20} color="#000000" />
                  <Text style={styles.emptyActionText}>Produkt hinzufügen</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Overlay to close dropdown when clicking outside */}
      {showCategoryDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          onPress={() => setShowCategoryDropdown(false)}
          accessibilityLabel="Dropdown schließen"
          accessibilityRole="button"
        />
      )}

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
    backgroundColor: '#D0D0D0',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#D0D0D0',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 0,
  },
  addButton: {
    backgroundColor: '#F68528',
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5C9A4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    lineHeight: 20,
  },
  mobileFilterButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Category Filter Buttons
  categoryFiltersContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  categoryFiltersScrollView: {
    paddingHorizontal: 0,
  },
  categoryFiltersContent: {
    paddingHorizontal: 0,
    gap: 8,
    flexDirection: 'row',
  },
  categoryFilterButton: {
    backgroundColor: '#FDD86E',
    borderWidth: 2,
  },
  
  // Product Area (now full width)
  contentContainer: {
    flex: 1,
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 20,
  },
  productArea: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#D0D0D0',
  },
  productHeader: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultCount: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 0,
    paddingTop: 10,
    paddingBottom: 24,
  },
  
  // Product List View
  productListView: {
    gap: 12,
  },
  productListCard: {
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 64,
    marginBottom: 0,
  },
  productListContent: {
    flex: 1,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: '#D0D0D0',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
  },
  statusText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginBottom: 4,
  },
  productListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  productCategory: {
    fontSize: 13,
    color: '#000000',
    marginBottom: 10,
    fontWeight: '500',
  },
  productListDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11,
    color: '#000000',
    flex: 1,
  },
  
  // Details Panel (Desktop)
  detailsPanel: {
    width: 320,
    backgroundColor: '#F5C9A4',
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  detailsField: {
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 16,
    color: '#000000',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyAction: {
    backgroundColor: '#F68528',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#D0D0D0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#F5C9A4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  
  // Form Styles
  fieldGroup: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#F68528',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F5C9A4',
    color: '#000000',
    minHeight: 48,
    lineHeight: 20,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Date Picker Styles
  datePickerContent: {
    flex: 1,
    padding: 20,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  dateOption: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  dateOptionSelected: {
    backgroundColor: '#F68528',
    borderColor: '#000000',
  },
  dateOptionToday: {
    backgroundColor: '#22C55E',
    borderColor: '#000000',
  },
  dateOptionThisWeek: {
    backgroundColor: '#EAB308',
    borderColor: '#000000',
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  dateOptionTextSelected: {
    color: '#000000',
  },
  dateOptionTextToday: {
    color: '#000000',
  },
  dateOptionLabel: {
    fontSize: 10,
    color: '#000000',
    marginTop: 2,
    fontWeight: '500',
  },
  quickDateSection: {
    marginTop: 20,
  },
  quickDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  quickDateButtons: {
    gap: 8,
  },
  quickDateButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  quickDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  quickDateButtonDate: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
});