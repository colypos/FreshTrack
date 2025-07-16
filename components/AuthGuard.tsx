/**
 * Authentication Guard Component
 * Schützt Komponenten vor nicht-authentifizierten Zugriffen
 * 
 * @author FreshTrack Development Team
 * @version 1.0.0
 * @since 2025-01-27
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, LogIn } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { RESTAURANT_CONFIG } from '@/constants/restaurant';
import designSystem from '@/styles/designSystem';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: { resource: string; action: string };
  fallbackMessage?: string;
  showLoginPrompt?: boolean;
}

/**
 * AuthGuard Component
 * Zeigt Inhalte nur für authentifizierte und autorisierte Benutzer an
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackMessage,
  showLoginPrompt = true
}) => {
  const { 
    isAuthenticated, 
    currentUser, 
    isLoading, 
    hasRole, 
    hasPermission 
  } = useAuth();

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Shield size={48} color={designSystem.colors.neutral[400]} />
          <Text style={styles.loadingText}>Authentifizierung wird überprüft...</Text>
        </View>
      </View>
    );
  }

  // Nicht authentifiziert
  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.authCard}>
          <Shield size={64} color={designSystem.colors.error[500]} />
          <Text style={styles.authTitle}>Anmeldung erforderlich</Text>
          <Text style={styles.authMessage}>
            {fallbackMessage || 'Sie müssen sich anmelden, um auf diese Funktion zuzugreifen.'}
          </Text>
          
          {showLoginPrompt && (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => {
                // In einer echten App würde hier zur Login-Seite navigiert
                console.log('Navigation zur Anmeldung');
              }}
              accessibilityRole="button"
              accessibilityLabel="Zur Anmeldung"
            >
              <LogIn size={20} color={designSystem.colors.text.inverse} />
              <Text style={styles.loginButtonText}>Anmelden</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{RESTAURANT_CONFIG.name}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Rollenprüfung
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <View style={styles.container}>
        <View style={styles.authCard}>
          <Shield size={64} color={designSystem.colors.warning[500]} />
          <Text style={styles.authTitle}>Keine Berechtigung</Text>
          <Text style={styles.authMessage}>
            Diese Funktion erfordert die Rolle "{requiredRole}".{'\n'}
            Sie sind angemeldet als: {currentUser.displayName} ({currentUser.role})
          </Text>
          
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserLabel}>Aktueller Benutzer:</Text>
            <Text style={styles.currentUserValue}>{currentUser.displayName}</Text>
            <Text style={styles.currentUserRole}>Rolle: {currentUser.role}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Berechtigungsprüfung
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return (
      <View style={styles.container}>
        <View style={styles.authCard}>
          <Shield size={64} color={designSystem.colors.warning[500]} />
          <Text style={styles.authTitle}>Keine Berechtigung</Text>
          <Text style={styles.authMessage}>
            Sie haben keine Berechtigung für diese Aktion.{'\n'}
            Erforderlich: {requiredPermission.action} auf {requiredPermission.resource}
          </Text>
          
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionLabel}>Erforderliche Berechtigung:</Text>
            <Text style={styles.permissionValue}>
              {requiredPermission.action} → {requiredPermission.resource}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Autorisiert - Inhalt anzeigen
  return <>{children}</>;
};

/**
 * Hook für einfache Authentifizierungsprüfung
 */
export const useAuthGuard = (requiredRole?: string, requiredPermission?: { resource: string; action: string }) => {
  const { isAuthenticated, currentUser, hasRole, hasPermission } = useAuth();

  const isAuthorized = React.useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    
    if (requiredRole && !hasRole(requiredRole)) return false;
    
    if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
      return false;
    }
    
    return true;
  }, [isAuthenticated, currentUser, requiredRole, requiredPermission, hasRole, hasPermission]);

  return {
    isAuthorized,
    isAuthenticated,
    currentUser,
    hasRole: (role: string) => hasRole(role),
    hasPermission: (resource: string, action: string) => hasPermission(resource, action)
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designSystem.spacing.xl,
  },
  
  // Loading
  loadingCard: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.xxl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    ...designSystem.shadows.low,
  },
  loadingText: {
    ...designSystem.componentStyles.textPrimary,
    textAlign: 'center',
    marginTop: designSystem.spacing.lg,
  },
  
  // Auth Card
  authCard: {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.interactive.border.radius,
    borderWidth: designSystem.interactive.border.width,
    borderColor: designSystem.interactive.border.color,
    padding: designSystem.spacing.xxl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    ...designSystem.shadows.medium,
  },
  authTitle: {
    ...designSystem.componentStyles.textSubtitle,
    textAlign: 'center',
    marginTop: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.md,
  },
  authMessage: {
    ...designSystem.componentStyles.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: designSystem.spacing.xl,
  },
  
  // Login Button
  loginButton: {
    backgroundColor: designSystem.colors.success[500],
    paddingHorizontal: designSystem.spacing.xl,
    paddingVertical: designSystem.spacing.md,
    borderRadius: designSystem.interactive.border.radius,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.xl,
    minHeight: 44,
    ...designSystem.accessibility.minTouchTarget,
    ...designSystem.shadows.low,
  },
  loginButtonText: {
    ...designSystem.componentStyles.textPrimary,
    color: designSystem.colors.text.inverse,
    fontWeight: '600',
  },
  
  // Restaurant Info
  restaurantInfo: {
    alignItems: 'center',
    paddingTop: designSystem.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border.secondary,
  },
  restaurantName: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
  },
  
  // Current User Info
  currentUserInfo: {
    backgroundColor: designSystem.colors.background.primary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    alignItems: 'center',
    marginTop: designSystem.spacing.lg,
    width: '100%',
  },
  currentUserLabel: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentUserValue: {
    ...designSystem.componentStyles.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentUserRole: {
    ...designSystem.componentStyles.textSecondary,
  },
  
  // Permission Info
  permissionInfo: {
    backgroundColor: designSystem.colors.background.primary,
    borderRadius: designSystem.interactive.border.radius,
    padding: designSystem.spacing.lg,
    alignItems: 'center',
    marginTop: designSystem.spacing.lg,
    width: '100%',
  },
  permissionLabel: {
    ...designSystem.componentStyles.textCaption,
    fontWeight: '600',
    marginBottom: 4,
  },
  permissionValue: {
    ...designSystem.componentStyles.textPrimary,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});