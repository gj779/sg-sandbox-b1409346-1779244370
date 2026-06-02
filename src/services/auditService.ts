import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuditLog {
  id?: string;
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'data' | 'file' | 'security' | 'system';
}

export class AuditService {
  private static instance: AuditService;
  
  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  // Log audit event
  async logEvent(event: Omit<AuditLog, 'timestamp' | 'id'>): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        ...event,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'auditLogs'), auditLog);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Fallback to local storage if Firestore fails
      this.logToLocalStorage(event);
    }
  }

  // Fallback logging to local storage
  private logToLocalStorage(event: Omit<AuditLog, 'timestamp' | 'id'>): void {
    // Guard against SSR execution - localStorage only exists in browser
    if (typeof window === "undefined") {
      console.warn("Falling back to server log streaming:", event);
      return;
    }

    try {
      const auditLog = {
        ...event,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };

      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      logs.push(auditLog);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('auditLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log to localStorage:', error);
    }
  }

  // Log authentication events
  async logAuthEvent(
    userId: string, 
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_login',
    success: boolean,
    details?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource: 'authentication',
      details: details || {},
      success,
      errorMessage,
      severity: success ? 'info' : 'warning',
      category: 'auth'
    });
  }

  // Log data access events
  async logDataAccess(
    userId: string,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId?: string,
    success: boolean = true,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource,
      resourceId,
      details: details || {},
      success,
      severity: success ? 'info' : 'error',
      category: 'data'
    });
  }

  // Log file operations
  async logFileOperation(
    userId: string,
    action: 'upload' | 'download' | 'delete' | 'access',
    fileName: string,
    fileSize?: number,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource: 'file',
      resourceId: fileName,
      details: { fileName, fileSize },
      success,
      errorMessage,
      severity: success ? 'info' : 'warning',
      category: 'file'
    });
  }

  // Log security events
  async logSecurityEvent(
    userId: string,
    action: string,
    details: Record<string, any>,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'warning'
  ): Promise<void> {
    await this.logEvent({
      userId,
      action,
      resource: 'security',
      details,
      success: false, // Security events are typically concerns
      severity,
      category: 'security'
    });
  }

  // Get audit logs for a user
  async getUserAuditLogs(userId: string, limitCount: number = 50): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  // Get security audit logs (admin only)
  async getSecurityAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('category', '==', 'security'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Failed to fetch security audit logs:', error);
      return [];
    }
  }

  // Get system audit logs by category
  async getAuditLogsByCategory(
    category: 'auth' | 'data' | 'file' | 'security' | 'system',
    limitCount: number = 100
  ): Promise<AuditLog[]> {
    try {
      const q = query(
        collection(db, 'auditLogs'),
        where('category', '==', category),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
    } catch (error) {
      console.error('Failed to fetch audit logs by category:', error);
      return [];
    }
  }
}

export const auditService = AuditService.getInstance();
