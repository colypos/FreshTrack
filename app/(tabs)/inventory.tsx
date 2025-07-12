import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, Package, Calendar, MapPin } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import { Product } from '@/types';

export default function InventoryScreen() {
  const { t } = useLanguage();
  const { products, addProduct } = useStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    const now = new Date();
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', color: '#EF4444' };
    if (daysUntilExpiry === 0) return { status: 'expiresToday', color: '#EF4444' };
    if (daysUntilExpiry <= 7) return { status: 'expiresThisWeek', color: '#EAB308' };
    if (product.currentStock <= product.minStock) return { status: 'lowStockWarning', color: '#F97316' };
    return { status: 'inStock', color: '#22C55E' };
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return;
    
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
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    
    return (
      <TouchableOpacity style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Package size={20} color="#6b7280" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.statusText}>{t(stockStatus.status)}</Text>
          </View>
        </View>
        
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('stock')}</Text>
              <Text style={styles.detailValue}>{product.currentStock} {product.unit}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.detailValue}>
                {new Date(product.expiryDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#6b7280" />
              <Text style={styles.detailValue}>{product.location}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('inventory')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchProducts')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === 'all' && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === 'all' && styles.categoryTextActive
          ]}>
            {t('allCategories')}
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.productList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.productListContent}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Keine Produkte gefunden</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>{t('cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('addProduct')}</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Text style={styles.saveButton}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('productName')}</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                placeholder="z.B. Tomaten"
                placeholderTextColor="#6B7280"
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
              />
            </View>
            
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
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('expiryDate')}</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.dateInput]}
                  value={newProduct.expiryDate}
                  onChangeText={(text) => setNewProduct({...newProduct, expiryDate: text})}
                  placeholder="DD.MM.YYYY"
                  placeholderTextColor="#6B7280"
                />
                <TouchableOpacity style={styles.calendarButton}>
                  <Calendar size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('location')}</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.location}
                onChangeText={(text) => setNewProduct({...newProduct, location: text})}
                placeholder="z.B. Kühlschrank A1"
                placeholderTextColor="#6B7280"
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
  addButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    width: 48,
    height: 48,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#F5C9A4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 0,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000000',
    height: 32,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#F68528',
    borderColor: '#000000',
  },
  categoryText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#000000',
  },
  productList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  productListContent: {
    paddingTop: 0,
  },
  productCard: {
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    marginBottom: 4,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIcon: {
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
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 14,
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
  },
  statusText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#000000',
    marginTop: 12,
  },
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F5C9A4',
    color: '#000000',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
  },
  calendarButton: {
    backgroundColor: '#F5C9A4',
    borderWidth: 1,
    borderColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});