
import { useState, useEffect } from 'react';
import { securityService } from '@/lib/security';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/hooks/useFirebaseAuth';

export interface SecurityAlert {
  id: string;
  type: 'login_anomaly' | 'data_breach' | 'suspicious_activity' | 'rate_limit' | 'security_update';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export function useSecurityMonitoring() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [securityScore, setSecurityScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityData();
      const interval = setInterval(checkSecurityStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      // Load existing alerts from localStorage
      const savedAlerts = JSON.parse(localStorage.getItem(`security_alerts_${user.uid}`) || '[]');
      setAlerts(savedAlerts.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      })));

      // Calculate security score
      await calculateSecurityScore();
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = async () => {
    if (!user) return;

    let score = 100; // Start with perfect score

    try {
      // Check for recent security events
      const recentLogs = await auditService.getUserAuditLogs(user.uid, 20);
      const failedAttempts = recentLogs.filter(log => 
        !log.success && log.category === 'auth'
      );

      // Deduct points for failed login attempts
      score -= failedAttempts.length * 5;

      // Check password strength (simulated)
      const hasStrongPassword = localStorage.getItem(`strong_password_${user.uid}`) === 'true';
      if (!hasStrongPassword) {
        score -= 20;
      }

      // Check for 2FA (simulated)
      const has2FA = localStorage.getItem(`2fa_enabled_${user.uid}`) === 'true';
      if (!has2FA) {
        score -= 15;
      }

      // Check for recent activity patterns
      const loginTimes = recentLogs
        .filter(log => log.action === 'login' && log.success)
        .map(log => new Date(log.timestamp).getHours());

      // Unusual login times (outside 6AM-11PM) reduce score
      const unusualLogins = loginTimes.filter(hour => hour < 6 || hour > 23);
      score -= unusualLogins.length * 3;

      setSecurityScore(Math.max(0, score));
    } catch (error) {
      console.error('Failed to calculate security score:', error);
      setSecurityScore(75); // Default score if calculation fails
    }
  };

  const checkSecurityStatus = async () => {
    if (!user) return;

    try {
      // Check for rate limit violations
      const rateLimitKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('rateLimit_')
      );

      for (const key of rateLimitKeys) {
        const attempts = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        const recentAttempts = attempts.filter((timestamp: number) => 
          now - timestamp < 60000 // Last minute
        );

        if (recentAttempts.length > 10) {
          addSecurityAlert({
            type: 'rate_limit',
            severity: 'medium',
            message: 'Unusual number of requests detected',
            metadata: { action: key.replace('rateLimit_', ''), attempts: recentAttempts.length }
          });
        }
      }

      // Check for security logs
      const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      const recentSecurityEvents = securityLogs.filter((log: any) => {
        const logTime = new Date(log.timestamp);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return logTime > fiveMinutesAgo && log.severity === 'high';
      });

      for (const event of recentSecurityEvents) {
        addSecurityAlert({
          type: 'suspicious_activity',
          severity: event.severity,
          message: `Security event detected: ${event.details}`,
          metadata: event
        });
      }
    } catch (error) {
      console.error('Security status check failed:', error);
    }
  };

  const addSecurityAlert = (alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>) => {
    if (!user) return;

    const newAlert: SecurityAlert = {
      id: Date.now().toString(),
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };

    setAlerts(prevAlerts => {
      const updatedAlerts = [newAlert, ...prevAlerts];
      localStorage.setItem(`security_alerts_${user.uid}`, JSON.stringify(updatedAlerts));
      return updatedAlerts;
    });

    // Log the security alert
    auditService.logSecurityEvent(
      user.uid,
      `security_alert_${alertData.type}`,
      { alert: newAlert },
      alertData.severity === 'critical' ? 'critical' : 'warning'
    );
  };

  const resolveAlert = (alertId: string) => {
    if (!user) return;

    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      );
      localStorage.setItem(`security_alerts_${user.uid}`, JSON.stringify(updatedAlerts));
      return updatedAlerts;
    });
  };

  const dismissAlert = (alertId: string) => {
    if (!user) return;

    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.filter(alert => alert.id !== alertId);
      localStorage.setItem(`security_alerts_${user.uid}`, JSON.stringify(updatedAlerts));
      return updatedAlerts;
    });
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.resolved);
  };

  const getCriticalAlerts = () => {
    return alerts.filter(alert => !alert.resolved && alert.severity === 'critical');
  };

  return {
    alerts,
    securityScore,
    loading,
    activeAlerts: getActiveAlerts(),
    criticalAlerts: getCriticalAlerts(),
    resolveAlert,
    dismissAlert,
    refreshSecurityData: loadSecurityData
  };
}
