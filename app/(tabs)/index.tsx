import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, TriangleAlert as AlertTriangle, TrendingDown, Clock } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const { products, movements, alerts } = useStorage();

  const stats = {
    totalProducts: products.length,
    lowStockCount: products.filter(p => p.currentStock <= p.minStock).length,
    expiringSoonCount: products.filter(p => {
      const daysUntilExpiry = Math.ceil(
        (new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    }).length,
    criticalAlerts: alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
  };

  const recentMovements = movements.slice(0, 5);

  const StatCard = ({ icon, title, value, color }: any) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>FreshTrack</Text>
          <Text style={styles.subtitle}>{t('dashboard')}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Package size={24} color="#22C55E" />}
            title={t('totalProducts')}
            value={stats.totalProducts}
            color="#22C55E"
          />
          <StatCard
            icon={<TrendingDown size={24} color="#F97316" />}
            title={t('lowStock')}
            value={stats.lowStockCount}
            color="#F97316"
          />
          <StatCard
            icon={<Clock size={24} color="#EAB308" />}
            title={t('expiringSoon')}
            value={stats.expiringSoonCount}
            color="#EAB308"
          />
          <StatCard
            icon={<AlertTriangle size={24} color="#EF4444" />}
            title={t('criticalAlerts')}
            value={stats.criticalAlerts}
            color="#EF4444"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentMovements')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {recentMovements.length > 0 ? (
            recentMovements.map((movement) => (
              <View key={movement.id} style={styles.movementCard}>
                <View style={styles.movementIcon}>
                  <View style={[
                    styles.movementIndicator,
                    { backgroundColor: 
                      movement.type === 'in' ? '#22C55E' : 
                      movement.type === 'out' ? '#EF4444' : '#6B7280'
                    }
                  ]} />
                </View>
                <View style={styles.movementContent}>
                  <Text style={styles.movementProduct}>{movement.productName}</Text>
                  <Text style={styles.movementDetails}>
                    {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                    {movement.quantity} • {movement.reason}
                  </Text>
                  <Text style={styles.movementTime}>
                    {new Date(movement.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Keine Bewegungen vorhanden</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0D0D0',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statTitle: {
    fontSize: 12,
    color: '#000000',
    marginTop: 2,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  movementCard: {
    backgroundColor: '#F5C9A4',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  movementIndicator: {
    width: 12,
    height: 12,
    borderRadius: 0,
  },
  movementContent: {
    flex: 1,
  },
  movementProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  movementDetails: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  movementTime: {
    fontSize: 12,
    color: '#000000',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});