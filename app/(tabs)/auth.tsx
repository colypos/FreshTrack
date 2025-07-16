/**
 * Authentifizierungs-Screen für Restaurant Aarberg
 * Benutzerauswahl und Anmeldung
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChefHat, CreditCard, Shield, LogIn, User, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { RESTAURANT_CONFIG } from '@/constants/restaurant';
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from '@/constants/users';
import { User as UserType } from '@/types/auth';
import designSystem from '@/styles/designSystem';

export default function AuthScreen() {
  const { 
    login, 
    logout, 
    switchUser, 
    getAvailableUsers, 
    getLastLogin,
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    clearError
  } = useAuth();

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [lastLoginTimes, setLastLoginTimes] = useState<Record<string, string>>({});

  const availableUsers = getAvailableUsers();

  // Letzte Login-Zeiten laden
  useEffect(() => {
    const loadLastLoginTimes = async () => {
      const times: Record<string, string> = {};
      
      for (const user of availableUsers) {
        const lastLogin = await getLastLogin(user.id);
        if (lastLogin) {
          times[user.id] = new Date(lastLogin).toLocaleString('de-CH');
        }
      }
      
      setLastLoginTimes(times);
    };
    
    loadLastLoginTimes();
  }, [availableUsers, getLastLogin]);

  // Rolle-zu-Icon Mapping
  const getRoleIcon = (role: string, size: number = 24, color: string = designSystem.colors.text.primary) => {
    switch (role) {
      case 'kitchen':
        return <ChefHat size={size} color={color} />;
      case 'cashier':
        return <CreditCard size={size} color={color} />;
      case 'manager':
        return <Shield size={size} color={color} />;
      default:
        return <User size={size} color={color} />;
    }
  };

  // Rolle-zu-Farbe Mapping
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'kitchen':
        return designSystem.colors.success[500];
      case 'cashier':
        return designSystem.colors.warning[500];
      case 'manager':
        return designSystem.colors.error[500];
      default:
        return designSystem.colors.neutral[500];
    }
  };

  // Benutzer-Login
  const handleUserLogin = async (user: UserType) => {
    clearError();
    const success = await login({ username: user.username });
    
    if (success) {
      Alert.alert(
        'Anmeldung erfolgreich',
        `Willkommen, ${user.displayName}!\n\nSie sind jetzt als ${ROLE_DISPLAY_NAMES[user.role]} angemeldet.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Anmeldung fehlgeschlagen',
        error || 'Ein unbekannter Fehler ist aufgetreten.',
        [{ text: 'OK' }]
      );
    }
  };

  // Manueller Login
  const handleManualLogin = async () => {
    if (!manualUsername.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Benutzernamen ein.');
      return;
    }
    
    clearError();
    const success = await login({ username: manualUsername.trim() });
    
    if (success) {
      setShowManualLogin(false);
      setManualUsername('');
    } else {
      Alert.alert(
        'Anmeldung fehlgeschlagen',
        error || 'Benutzer nicht gefunden oder deaktiviert.',
        [{ text: 'OK' }]
      );
    }
  };

  // Benutzer wechseln
  const handleSwitchUser = async (user: UserType) => {
    Alert.alert(
      'Benutzer wechseln',
      `Möchten Sie zu ${user.displayName} (${ROLE_DISPLAY_NAMES[user.role]}) wechseln?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Wechseln', 
          onPress: async () => {
            const success = await switchUser(user.username);
            if (success) {
              Alert.alert(
                'Benutzer gewechselt',
                `Sie sind jetzt als ${user.displayName} angemeldet.`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  // Abmelden
  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Abmelden', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  // Benutzer-Karte Komponente
  const UserCard = ({ user, isCurrentUser = false }: { user: UserType; isCurrentUser?: boolean }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        isCurrentUser && styles.currentUserCard,
        { borderLeftColor: getRoleColor(user.role) }
      ]}
      onPress={() => isCurrentUser ? handleLogout() : handleUserLogin(user)}
      activeOpacity={designSystem.interactive.states.active.opacity}
      accessibilityRole="button"
      accessibilityLabel={`${isCurrentUser ? 'Abmelden von' : 'Anmelden als'} ${user.displayName}`}
      accessibilityHint={`${ROLE_DESCRIPTIONS[user.role]}`}
    >
      <View style={styles.userCardHeader}>
        <View style={[styles.userIcon, { backgroundColor: `${getRoleColor(user.role)}20` }]}>
          {getRoleIcon(user.role, 28, getRoleColor(user.role))}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {user.displayName}
          </Text>
          <Text style={styles.userRole}>
            {ROLE_DISPLAY_NAMES[user.role]}
          </Text>
        </View>
        
        {isCurrentUser && (
          <View style={styles.currentUserBadge}>
            <CheckCircle size={20} color={designSystem.colors.success[500]} />
            <Text style={styles.currentUserText}>Aktiv</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.userDescription}>
        {ROLE_DESCRIPTIONS[user.role]}
      </Text>
      
      <View style={styles.userCardFooter}>
        <View style={styles.userDetails}>
          <Text style={styles.userDetailLabel}>Benutzername:</Text>
          <Text style={styles.userDetailValue}>{user.username}</Text>
        </View>
        
        {lastLoginTimes[user.id] && (
          <View style={styles.lastLoginInfo}>
            <Clock size={14} color={designSystem.colors.text.disabled} />
            <Text style={styles.lastLoginText}>
              Letzter Login: {lastLoginTimes[user.id]}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.userCardAction}>
        <Text style={[styles.actionText, isCurrentUser && styles.logoutActionText]}>
          {isCurrentUser ? 'Abmelden' : 'Anmelden'}
        </Text>
        <LogIn size={16} color={isCurrentUser ? designSystem.colors.error[500] : designSystem.colors.success[500]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{RESTAURANT_CONFIG.name}</Text>
          <Text style={styles.restaurantSubtitle}>Benutzerverwaltung</Text>
        </View>
        
        {isAuthenticated && currentUser && (
          <TouchableOpacity
            style={styles.switchUserButton}
            onPress={() => setShowManualLogin(!showManualLogin)}
            accessibilityRole="button"
            accessibilityLabel="Manueller Login"
          >
            <User size={20} color={designSystem.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Aktueller Benutzer */}
        {isAuthenticated && currentUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktueller Benutzer</Text>
            <UserCard user={currentUser} isCurrentUser={true} />
          </View>
        )}

        {/* Verfügbare Benutzer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAuthenticated ? 'Benutzer wechseln' : 'Benutzer auswählen'}
          </Text>
          
          {availableUsers
            .filter(user => !isAuthenticated || user.id !== currentUser?.id)
            .map(user => (
              <UserCard 
                key={user.id} 
                user={user}
                isCurrentUser={false}
              />
            ))}
        </View>

        {/* Manueller Login */}
        {showManualLogin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manueller Login</Text>
            <View style={styles.manualLoginCard}>
              <Text style={styles.manualLoginLabel}>Benutzername:</Text>
              <TextInput
                style={styles.manualLoginInput}
                value={manualUsername}
                onChangeText={setManualUsername}
                placeholder="z.B. kueche, kasse, verwalter"
                placeholderTextColor={designSystem.colors.text.disabled}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleManualLogin}
                accessibilityLabel="Benutzername eingeben"
              />
              
              <View style={styles.manualLoginActions}>
                <TouchableOpacity
                  style={styles.manualLoginCancelButton}
                  onPress={() => {
                    setShowManualLogin(false);
                    setManualUsername('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Abbrechen"
                >
                  <Text style={styles.manualLoginCancelText}>Abbrechen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.manualLoginButton}
                  onPress={handleManualLogin}
                  disabled={!manualUsername.trim() || isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Anmelden"
                >
                  <Text style={styles.manualLoginButtonText}>
                    {isLoading ? 'Anmelden...' : 'Anmelden'}
                  </Text>
                  <LogIn size={16} color={designSystem.colors.text.inverse} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Hinweise */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Prototyp-Hinweise</Text>
            <Text style={styles.infoText}>
              • Alle Benutzer haben derzeit Vollzugriff auf alle Funktionen{'\n'}
              • Kein Passwort erforderlich (nur Benutzername){'\n'}
              • Anmeldung wird automatisch gespeichert{'\n'}
              • In der Produktion: Rollenbasierte Berechtigungen erforderlich
            </Text>
          </View>
        </View>

        {/* Restaurant-Info */}
        <View style={styles.section}>
          <View style={styles.restaurantCard}>
            <Text style={styles.restaurantCardTitle}>{RESTAURANT_CONFIG.name}</Text>
            <Text style={styles.restaurantCardAddress}>{RESTAURANT_CONFIG.address}</Text>
            <Text style={styles.restaurantCardContact}>
              📞 {RESTAURANT_CONFIG.phone}{'\n'}
              ✉️ {RESTAURANT_CONFIG.email}
            </Text>
          </View>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
    paddingBottom: designSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: designSystem.colors.border.secondary,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    ...designSystem.componentStyles.textTitle,
    fontSize: 24,
    marginBottom: 4,
  },
  restaurantSubtitle: {
    ...designSystem.componentStyles.textSecondary,
    fontSize: 16,
  },
  switchUserButton: {
    backgroundColor: designSystem.colors.background.secondary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    width: 44,
    height: 44,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  
  // Content
  content: {
    flex: 1,
    padding: designSystem.spacing.xl,
  },
  section: {
    marginBottom: designSystem.spacing.xxxl,
  },
  sectionTitle: {
    ...designSystem.componentStyles.textSubtitle,
    marginBottom: designSystem.spacing.lg,
    paddingBottom: designSystem.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: designSystem.colors.secondary[500],
  },
  
  // User Card
  userCard: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderLeftWidth: 4,
    padding: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.md,
    ...designSystem.shadows.low,
  },
  currentUserCard: {
    backgroundColor: designSystem.colors.success[50],
    borderColor: designSystem.colors.success[500],
    ...designSystem.shadows.medium,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing.md,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: designSystem.interactive.border.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designSystem.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...designSystem.componentStyles.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currentUserName: {
    color: designSystem.colors.success[700],
  },
  userRole: {
    ...designSystem.componentStyles.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  currentUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
    backgroundColor: designSystem.colors.success[100],
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.xs,
    borderRadius: designSystem.interactive.border.radius,
  },
  currentUserText: {
    ...designSystem.componentStyles.textCaption,
    color: designSystem.colors.success[700],
    fontWeight: '600',
  },
  userDescription: {
    ...designSystem.componentStyles.textSecondary,
    marginBottom: designSystem.spacing.md,
    lineHeight: 20,
  },
  userCardFooter: {
    marginBottom: designSystem.spacing.md,
  },
  userDetails: {
    flexDirection: 'row',
    marginBottom: designSystem.spacing.sm,
  },
  userDetailLabel: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
    marginRight: designSystem.spacing.sm,
  },
  userDetailValue: {
    ...designSystem.componentStyles.textCaption,
    fontFamily: 'monospace',
  },
  lastLoginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.xs,
  },
  lastLoginText: {
    ...designSystem.componentStyles.textCaption,
    color: designSystem.colors.text.disabled,
  },
  userCardAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: designSystem.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.secondary,
  },
  actionText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    color: designSystem.colors.success[500],
  },
  logoutActionText: {
    color: designSystem.colors.error[500],
  },
  
  // Manual Login
  manualLoginCard: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.low,
  },
  manualLoginLabel: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: designSystem.spacing.sm,
  },
  manualLoginInput: {
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.md,
    ...designSystem.componentStyles.textPrimary,
    backgroundColor: designSystem.colors.background.surface,
    marginBottom: designSystem.spacing.lg,
    minHeight: 48,
    ...designSystem.shadows.low,
  },
  manualLoginActions: {
    flexDirection: 'row',
    gap: designSystem.spacing.md,
  },
  manualLoginCancelButton: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    ...designSystem.shadows.low,
  },
  manualLoginCancelText: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
  },
  manualLoginButton: {
    flex: 1,
    backgroundColor: designSystem.colors.success[500],
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designSystem.spacing.sm,
    minHeight: 44,
    ...designSystem.shadows.low,
  },
  manualLoginButtonText: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.text.inverse,
    fontWeight: '600',
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: designSystem.colors.warning[50],
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.colors.warning[200],
    padding: designSystem.spacing.lg,
    ...designSystem.shadows.low,
  },
  infoTitle: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: 'bold',
    marginBottom: designSystem.spacing.sm,
    color: designSystem.colors.warning[800],
  },
  infoText: {
    ...designSystem.componentStyles.textSecondary,
    lineHeight: 20,
    color: designSystem.colors.warning[700],
  },
  
  // Restaurant Card
  restaurantCard: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.lg,
    alignItems: 'center',
    ...designSystem.shadows.low,
  },
  restaurantCardTitle: {
    ...designSystem.componentStyles.textSubtitle,
    textAlign: 'center',
    marginBottom: designSystem.spacing.sm,
  },
  restaurantCardAddress: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
    marginBottom: designSystem.spacing.sm,
  },
  restaurantCardContact: {
    ...designSystem.componentStyles.textCaption,
    textAlign: 'center',
    lineHeight: 18,
  },
});