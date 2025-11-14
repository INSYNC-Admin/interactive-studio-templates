/**
 * Shared Watermark Service für Interactive Studio Apps
 * Singleton Pattern - verhindert mehrfache Initialisierung
 */
(function() {
  'use strict';

  const WATERMARK_NAMESPACE = '__interactiveStudioWatermark';
  const WATERMARK_ID = 'interactive-studio-watermark';
  const WATERMARK_API_URL = 'https://plan-status-service.onrender.com/api/plan-status';
  
  // Singleton: Nur einmal initialisieren
  if (window[WATERMARK_NAMESPACE]) {
    console.log('[Watermark Service] Already initialized by another app');
    return window[WATERMARK_NAMESPACE];
  }

  /**
   * Watermark Service Class
   */
  class WatermarkService {
    constructor() {
      this.isInitialized = false;
      this.watermarkElement = null;
      this.currentPlanStatus = null;
      this.checkInterval = null;
      this.apiCache = new Map();
      this.apiCacheTTL = 5 * 60 * 1000; // 5 Minuten
      this.registeredApps = new Set();
      
      // Callbacks für Plan-Status-Änderungen
      this.statusChangeCallbacks = [];
      
      // Initialisiere Service
      this.init();
    }

    /**
     * App registrieren (z.B. 'spline', 'scroll-sequence', 'creative-script')
     */
    registerApp(appId) {
      if (typeof appId !== 'string' || !appId.trim()) {
        console.warn('[Watermark Service] Invalid appId:', appId);
        return;
      }
      
      this.registeredApps.add(appId.trim());
      
      console.log('[Watermark Service] App registered:', appId, 'Total apps:', this.registeredApps.size);
    }

    /**
     * Initialisiere Service
     */
    init() {
      if (this.isInitialized) {
        return;
      }

      console.log('[Watermark Service] Initializing...');
      
      // Warte auf DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    /**
     * Starte Wasserzeichen-Logik
     */
    async start() {
      if (this.isInitialized) {
        return;
      }

      this.isInitialized = true;
      
      // Prüfe Plan-Status
      await this.checkPlanStatus();
      
      // Periodische Updates (alle 5 Minuten)
      this.checkInterval = setInterval(() => {
        this.checkPlanStatus().catch(err => {
          console.error('[Watermark Service] Error during periodic check:', err);
        });
      }, 5 * 60 * 1000);
    }

    /**
     * Parse instance parameter (schnell, für UI)
     */
    parseInstanceParameter() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const instanceParam = urlParams.get('instance');
        
        if (!instanceParam) {
          return { isFree: true, vendorProductId: null, source: 'fallback' };
        }
        
        const parts = instanceParam.split('.');
        if (parts.length !== 2) {
          return { isFree: true, vendorProductId: null, source: 'fallback' };
        }
        
        const dataPart = parts[1];
        const decoded = atob(dataPart.replace(/-/g, '+').replace(/_/g, '/'));
        const instanceData = JSON.parse(decoded);
        
        const vendorProductId = instanceData.vendorProductId;
        const isFree = !vendorProductId || vendorProductId === null || vendorProductId === '';
        
        return {
          isFree: isFree,
          vendorProductId: vendorProductId,
          instanceId: instanceData.instanceId,
          source: 'instance-param'
        };
      } catch (error) {
        console.error('[Watermark Service] Failed to parse instance parameter:', error);
        return { isFree: true, vendorProductId: null, source: 'fallback' };
      }
    }

    /**
     * Prüfe Plan-Status via Backend API (sicher, für Validierung)
     */
    async checkPlanStatusViaAPI(instanceId) {
      try {
        // Check cache first
        const cacheKey = instanceId;
        const cached = this.apiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.apiCacheTTL) {
          return { ...cached.data, source: 'api-cache' };
        }
        
        // Get instance token
        const instanceToken = new URLSearchParams(window.location.search).get('instance');
        if (!instanceToken) {
          return { isFree: true, vendorProductId: null, source: 'fallback' };
        }
        
        // Call backend API
        const response = await fetch(WATERMARK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${instanceToken}`
          },
          body: JSON.stringify({ instanceId: instanceId })
        });
        
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache result
        this.apiCache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        
        return { ...data, source: 'api' };
      } catch (error) {
        console.error('[Watermark Service] Failed to check plan via API:', error);
        return { isFree: true, vendorProductId: null, source: 'fallback', error: error.message };
      }
    }

    /**
     * Hauptfunktion: Prüfe Plan-Status
     */
    async checkPlanStatus() {
      // Layer 1: Schnelle UI-Antwort via Instance Parameter
      const quickStatus = this.parseInstanceParameter();
      
      // Layer 2: Backend-Validierung (async, non-blocking)
      let validatedStatus = quickStatus;
      if (quickStatus.instanceId) {
        // Validiere im Hintergrund, aber nutze erstmal Quick-Status für UI
        this.checkPlanStatusViaAPI(quickStatus.instanceId)
          .then(apiStatus => {
            // Update falls sich Status geändert hat
            if (this.hasStatusChanged(validatedStatus, apiStatus)) {
              validatedStatus = apiStatus;
              this.updateWatermark(validatedStatus);
            }
          })
          .catch(err => {
            console.error('[Watermark Service] Background validation failed:', err);
          });
      }
      
      // Update Wasserzeichen mit Quick-Status (sofort)
      this.updateWatermark(quickStatus);
    }

    /**
     * Prüfe ob Status sich geändert hat
     */
    hasStatusChanged(oldStatus, newStatus) {
      return oldStatus.isFree !== newStatus.isFree || 
             oldStatus.vendorProductId !== newStatus.vendorProductId;
    }

    /**
     * Update Wasserzeichen basierend auf Plan-Status
     */
    updateWatermark(planStatus) {
      const previousStatus = this.currentPlanStatus;
      this.currentPlanStatus = planStatus;
      
      if (planStatus.isFree) {
        this.showWatermark();
      } else {
        this.hideWatermark();
      }
      
      // Trigger callbacks wenn Status sich geändert hat
      if (previousStatus && this.hasStatusChanged(previousStatus, planStatus)) {
        this.notifyStatusChange(planStatus);
      }
    }

    /**
     * Zeige Wasserzeichen (nur einmal)
     */
    showWatermark() {
      // Prüfe ob bereits existiert
      if (this.watermarkElement && document.body.contains(this.watermarkElement)) {
        this.watermarkElement.style.display = 'block';
        return;
      }
      
      // Erstelle Element
      this.watermarkElement = document.getElementById(WATERMARK_ID);
      
      if (!this.watermarkElement) {
        this.watermarkElement = document.createElement('div');
        this.watermarkElement.id = WATERMARK_ID;
        this.watermarkElement.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          pointer-events: none;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(8px);
          transition: opacity 0.3s ease;
        `;
        this.watermarkElement.textContent = 'Interactive Studio Free Plan';
        
        // Append to body
        if (document.body) {
          document.body.appendChild(this.watermarkElement);
        } else {
          // Wait for body
          const observer = new MutationObserver(() => {
            if (document.body) {
              document.body.appendChild(this.watermarkElement);
              observer.disconnect();
            }
          });
          observer.observe(document.documentElement, { childList: true });
        }
      }
      
      this.watermarkElement.style.display = 'block';
      console.log('[Watermark Service] Watermark shown');
    }

    /**
     * Verstecke Wasserzeichen
     */
    hideWatermark() {
      if (this.watermarkElement) {
        this.watermarkElement.style.display = 'none';
        console.log('[Watermark Service] Watermark hidden');
      }
    }

    /**
     * Registriere Callback für Status-Änderungen
     */
    onStatusChange(callback) {
      if (typeof callback === 'function') {
        this.statusChangeCallbacks.push(callback);
      }
    }

    /**
     * Benachrichtige alle Callbacks
     */
    notifyStatusChange(newStatus) {
      this.statusChangeCallbacks.forEach(callback => {
        try {
          callback(newStatus);
        } catch (error) {
          console.error('[Watermark Service] Error in status change callback:', error);
        }
      });
    }

    /**
     * Get current plan status
     */
    getCurrentPlanStatus() {
      return this.currentPlanStatus;
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      
      if (this.watermarkElement) {
        this.watermarkElement.remove();
        this.watermarkElement = null;
      }
      
      this.isInitialized = false;
      console.log('[Watermark Service] Destroyed');
    }
  }

  // Singleton erstellen
  const watermarkService = new WatermarkService();
  
  // Global verfügbar machen
  window[WATERMARK_NAMESPACE] = watermarkService;
  
  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    watermarkService.destroy();
  });
  
  console.log('[Watermark Service] Singleton created');
  
  // Export für Module Systems (falls vorhanden)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = watermarkService;
  }
  
  return watermarkService;
})();

