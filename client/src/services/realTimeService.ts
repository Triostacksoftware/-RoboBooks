// Real-time service for handling Server-Sent Events (SSE) and WebSocket-like functionality
export interface RealTimeConfig {
  endpoint: string;
  retryInterval?: number;
  maxRetries?: number;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onReconnect?: () => void;
  onClose?: () => void;
}

export interface PaymentUpdate {
  type: 'payment_created' | 'payment_updated' | 'payment_deleted';
  payment: any;
  timestamp: string;
}

export interface RealTimeStats {
  isConnected: boolean;
  lastMessageTime: Date | null;
  reconnectAttempts: number;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

class RealTimeService {
  private eventSource: EventSource | null = null;
  private config: RealTimeConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: RealTimeConfig) {
    this.config = config;
    this.maxReconnectAttempts = config.maxRetries || 5;
    this.reconnectInterval = config.retryInterval || 5000;
  }

  // Connect to the SSE endpoint
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.eventSource) {
          this.disconnect();
        }

        console.log('🔌 Connecting to real-time service:', this.config.endpoint);
        
        this.eventSource = new EventSource(this.config.endpoint);
        
        this.eventSource.onopen = () => {
          console.log('✅ Real-time connection established');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.config.onReconnect?.();
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Real-time message received:', data);
            
            // Handle different message types
            this.handleMessage(data);
            
            // Call global message handler
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('❌ Failed to parse real-time message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('❌ Real-time connection error:', error);
          this.config.onError?.(error);
          
          if (!this.isReconnecting) {
            this.handleReconnect();
          }
          
          reject(error);
        };

        this.eventSource.addEventListener('close', () => {
          console.log('🔌 Real-time connection closed');
          this.config.onClose?.();
        });

      } catch (error) {
        console.error('❌ Failed to create EventSource:', error);
        reject(error);
      }
    });
  }

  // Disconnect from the SSE endpoint
  disconnect(): void {
    if (this.eventSource) {
      console.log('🔌 Disconnecting from real-time service');
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.isReconnecting = false;
  }

  // Handle reconnection logic
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
        this.isReconnecting = false;
      });
    }, this.reconnectInterval);
  }

  // Handle incoming messages
  private handleMessage(data: any): void {
    const { type, ...payload } = data;
    
    // Notify listeners for this message type
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type)!;
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`❌ Error in listener for ${type}:`, error);
        }
      });
    }
  }

  // Subscribe to specific message types
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    const listeners = this.listeners.get(type)!;
    listeners.add(callback);
    
    console.log(`📡 Subscribed to ${type} messages`);
    
    // Return unsubscribe function
    return () => {
      if (this.listeners.has(type)) {
        const listeners = this.listeners.get(type)!;
        listeners.delete(callback);
        
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Unsubscribe from specific message types
  unsubscribe(type: string, callback: (data: any) => void): void {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type)!;
      listeners.delete(callback);
      
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
      
      console.log(`📡 Unsubscribed from ${type} messages`);
    }
  }

  // Get connection status
  getStatus(): RealTimeStats {
    return {
      isConnected: this.eventSource?.readyState === EventSource.OPEN,
      lastMessageTime: null, // Could be enhanced to track last message time
      reconnectAttempts: this.reconnectAttempts,
      connectionStatus: this.getConnectionStatus()
    };
  }

  // Get current connection status
  private getConnectionStatus(): RealTimeStats['connectionStatus'] {
    if (!this.eventSource) {
      return 'disconnected';
    }
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return this.isReconnecting ? 'reconnecting' : 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }

  // Send a message to the server (if supported)
  send(message: any): void {
    // Note: SSE is one-way (server to client)
    // This method is included for future WebSocket support
    console.warn('⚠️ SSE does not support client-to-server messages');
  }

  // Check if the service is connected
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  // Force a reconnection
  forceReconnect(): void {
    console.log('🔄 Force reconnection requested');
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect().catch((error) => {
      console.error('❌ Force reconnection failed:', error);
    });
  }
}

// Create a singleton instance for payments
export const paymentsRealTimeService = new RealTimeService({
  endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/payments/real-time`,
  retryInterval: 5000,
  maxRetries: 5,
  onMessage: (data) => {
    console.log('📨 Payment real-time message:', data);
  },
  onError: (error) => {
    console.error('❌ Payment real-time error:', error);
  },
  onReconnect: () => {
    console.log('✅ Payment real-time reconnected');
  },
  onClose: () => {
    console.log('🔌 Payment real-time connection closed');
  }
});

// Export the service class for custom instances
export default RealTimeService;
