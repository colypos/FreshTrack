import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, TriangleAlert as AlertTriangle, TrendingDown, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';
import { useStorage } from '@/hooks/useStorage';
import designSystem from '@/styles/designSystem';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const { products, movements, alerts } = useStorage();
  const router = useRouter();

  const stats = {
    totalProducts: products.length,
    lowStockCount: products.filter(p => p.currentStock <= p.minStock).length,
    expiringSoonCount: products.filter(p => {
      // Parse German date format DD.MM.YYYY
      const parseGermanDate = (dateString) => {
        if (!dateString) return new Date();
        
        const germanDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
        const match = dateString.match(germanDateRegex);
        
        if (match) {
          const [, day, month, year] = match;
          // Create date with month-1 because JavaScript months are 0-indexed
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        
        // Fallback to standard Date parsing
        return new Date(dateString);
      };
      
      const expiryDate = parseGermanDate(p.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      
      // Include expired products (negative days) and products expiring within 7 days
      return daysUntilExpiry <= 7;
    }).length,
    criticalAlerts: alerts.filter(a => a.severity === 'high' && !a.acknowledged).length,
  };

  const recentMovements = movements.slice(0, 5);

  const StatCard = ({ icon, title, value, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      activeOpacity={designSystem.interactive.states.active.opacity}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      accessibilityHint={`Tippen um ${title.toLowerCase()} anzuzeigen`}
      onPress={onPress}
    >
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  // Navigation handlers for each stat card
  const handleTotalProductsPress = () => {
    router.push('/inventory');
  };

  const handleLowStockPress = () => {
    // Navigate to inventory with low stock filter
    router.push({
      pathname: '/inventory',
      params: { filter: 'lowStock' }
    });
  };

  const handleExpiringSoonPress = () => {
    // Navigate to inventory with expiring soon filter
    router.push({
      pathname: '/inventory',
      params: { filter: 'expiringSoon' }
    });
  };

  const handleCriticalAlertsPress = () => {
    // Navigate to inventory with critical alerts filter
    router.push({
      pathname: '/inventory',
      params: { filter: 'criticalAlerts' }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>FreshTrack</Text>
          <Text style={styles.subtitle}>{t('dashboard')}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Package size={24} color={designSystem.colors.success[500]} />}
            title={t('totalProducts')}
            value={stats.totalProducts}
            color={designSystem.colors.success[500]}
            onPress={handleTotalProductsPress}
          />
          <StatCard
            icon={<TrendingDown size={24} color={designSystem.colors.warning[500]} />}
            title={t('lowStock')}
            value={stats.lowStockCount}
            color={designSystem.colors.warning[500]}
            onPress={handleLowStockPress}
          />
          <StatCard
            icon={<Clock size={24} color={designSystem.colors.warning[700]} />}
            title={t('expiringSoon')}
            value={stats.expiringSoonCount}
            color={designSystem.colors.warning[700]}
            onPress={handleExpiringSoonPress}
          />
          <StatCard
            icon={<AlertTriangle size={24} color={designSystem.colors.error[500]} />}
            title={t('criticalAlerts')}
            value={stats.criticalAlerts}
            color={designSystem.colors.error[500]}
            onPress={handleCriticalAlertsPress}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('recentMovements')}</Text>
            <TouchableOpacity
              activeOpacity={designSystem.interactive.states.active.opacity}
              accessibilityRole="button"
              accessibilityLabel={t('viewAll')}
            >
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
                      movement.type === 'in' ? designSystem.colors.success[500] : 
                      movement.type === 'out' ? designSystem.colors.error[500] : designSystem.colors.neutral[500]
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
    backgroundColor: designSystem.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: designSystem.spacing.xl,
    paddingBottom: 10,
  },
  title: {
    ...designSystem.componentStyles.textTitle,
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    ...designSystem.componentStyles.textSubtitle,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: designSystem.spacing.sm,
    gap: designSystem.spacing.sm,
  },
  statCard: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    ...designSystem.shadows.low,
  },
  statIcon: {
    marginRight: designSystem.spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...designSystem.componentStyles.textHeader,
    fontSize: 24,
  },
  statTitle: {
    ...designSystem.componentStyles.textCaption,
    marginTop: 2,
  },
  section: {
    padding: designSystem.spacing.xl,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.lg,
  },
  sectionTitle: {
    ...designSystem.componentStyles.textHeader,
  },
  viewAllText: {
    ...designSystem.componentStyles.textSecondary,
    fontWeight: '600',
  },
  movementCard: {
    ...designSystem.componentStyles.interactiveBase,
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
  movementIndicator: {
    width: 12,
    height: 12,
    borderRadius: designSystem.interactive.border.radius,
  },
  movementContent: {
    flex: 1,
  },
  movementProduct: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  movementDetails: {
    ...designSystem.componentStyles.textSecondary,
    marginBottom: 2,
  },
  movementTime: {
    ...designSystem.componentStyles.textCaption,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...designSystem.componentStyles.textPrimary,
    textAlign: 'center',
  },
});