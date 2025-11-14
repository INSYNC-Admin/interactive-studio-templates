/**
 * Shared Watermark Service für Interactive Studio Apps
 * Singleton Pattern - verhindert mehrfache Initialisierung
 * Batch API für mehrere Apps
 */
(function() {
  'use strict';

  const WATERMARK_NAMESPACE = '__interactiveStudioWatermark';
  const WATERMARK_ID = 'interactive-studio-watermark';
  const API_URL = 'https://plan-status-service.onrender.com/api/plan-status';

  // Singleton Pattern
  if (window[WATERMARK_NAMESPACE]) {
    console.log('[Watermark] Service already initialized by another app');
    return window[WATERMARK_NAMESPACE];
  }

  class WatermarkService {
    constructor() {
      this.isInitialized = false;
      this.watermarkElement = null;
      this.registeredApps = new Map(); // appId → { instanceId, appName }
      this.appStatuses = new Map(); // appId → { isFree, planName, timestamp }
      
      console.log('[Watermark] Service constructor initialized');
    }

    registerApp(appId, instanceId, appName) {
      if (!appId || !instanceId || !appName) {
        console.error('[Watermark] Invalid app registration:', { appId, instanceId, appName });
        return;
      }

      this.registeredApps.set(appId, { instanceId, appName });
      console.log(`[Watermark] App registered: ${appName} (${appId}) - Instance: ${instanceId}`);
      console.log(`[Watermark] Total registered apps: ${this.registeredApps.size}`);
    }

    async start() {
      if (this.isInitialized) {
        console.log('[Watermark] Service already started, skipping');
        return;
      }
      
      this.isInitialized = true;
      console.log('[Watermark] Starting service...');
      console.log(`[Watermark] Registered apps: ${this.registeredApps.size}`);

      // Initial Check (nur einmal beim Laden, kein Polling)
      await this.checkPlanStatusForAllApps();
      
      console.log('[Watermark] Initial check completed');
    }

    async checkPlanStatusForAllApps() {
      if (this.registeredApps.size === 0) {
        console.warn('[Watermark] No apps registered, skipping plan check');
        return;
      }

      // Build batch request
      const checks = Array.from(this.registeredApps.entries()).map(([appId, appData]) => {
        console.log(`[Watermark] Preparing check for app: ${appData.appName} (${appId}) - Instance: ${appData.instanceId}`);
        return {
          instanceId: appData.instanceId,
          appId: appId
        };
      });

      console.log('[Watermark] Batch request payload:', JSON.stringify(checks, null, 2));
      console.log(`[Watermark] Calling API: ${API_URL}/batch`);

      try {
        const response = await fetch(`${API_URL}/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checks })
        });

        console.log('[Watermark] API Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Watermark] API Error: HTTP ${response.status} - ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('[Watermark] API Response data:', JSON.stringify(responseData, null, 2));

        const { results } = responseData;
        console.log(`[Watermark] Received ${results.length} results from API`);

        // Update App-Statuses
        results.forEach((result, index) => {
          console.log(`[Watermark] Processing result ${index + 1}/${results.length}:`, JSON.stringify(result, null, 2));
          
          this.appStatuses.set(result.appId, {
            isFree: result.isFree,
            planName: result.planName || 'Unknown',
            appName: result.appName || this.registeredApps.get(result.appId)?.appName || result.appId,
            timestamp: Date.now(),
            vendorProductId: result.vendorProductId || null,
            packageName: result.packageName || null,
            source: result.source || 'api'
          });

          const status = this.appStatuses.get(result.appId);
          console.log(`[Watermark] Updated status for ${result.appId}:`, {
            isFree: status.isFree,
            planName: status.planName,
            appName: status.appName,
            vendorProductId: status.vendorProductId,
            packageName: status.packageName
          });
        });

        // Update Wasserzeichen
        this.updateWatermark();
      } catch (error) {
        console.error('[Watermark] Failed to check plan status:', error);
        console.error('[Watermark] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // Fail-safe: Bei Fehler alle Apps als Free markieren
        console.warn('[Watermark] Fail-safe: Marking all apps as free due to error');
        this.registeredApps.forEach((appData, appId) => {
          this.appStatuses.set(appId, { 
            isFree: true, 
            planName: 'Error',
            appName: appData.appName,
            timestamp: Date.now(),
            error: error.message,
            source: 'error-fallback'
          });
        });
        
        this.updateWatermark();
      }
    }

    getFreeAppsList() {
      const freeApps = [];
      this.appStatuses.forEach((status, appId) => {
        if (status.isFree) {
          console.log(`[Watermark] Found free app: ${status.appName} (${appId})`);
          freeApps.push({
            appId: appId,
            appName: status.appName,
            planName: status.planName
          });
        } else {
          console.log(`[Watermark] Found paid app: ${status.appName} (${appId}) - Plan: ${status.planName}`);
        }
      });
      
      console.log(`[Watermark] Free apps list: ${freeApps.length} app(s)`, freeApps);
      return freeApps;
    }

    updateWatermark() {
      const freeApps = this.getFreeAppsList();
      
      console.log(`[Watermark] Updating watermark - Free apps: ${freeApps.length}`);
      console.log('[Watermark] Current app statuses:', Array.from(this.appStatuses.entries()).map(([appId, status]) => ({
        appId,
        appName: status.appName,
        isFree: status.isFree,
        planName: status.planName
      })));

      if (freeApps.length > 0) {
        console.log('[Watermark] Showing watermark - Free apps detected:', freeApps.map(a => a.appName));
        this.showWatermark(freeApps);
      } else {
        console.log('[Watermark] Hiding watermark - All apps have paid plans');
        this.hideWatermark();
      }
    }

    showWatermark(freeApps = []) {
      console.log('[Watermark] showWatermark called with free apps:', freeApps);
      
      if (this.watermarkElement) {
        console.log('[Watermark] Watermark element already exists, updating content');
        this.updateWatermarkContent(freeApps);
        this.watermarkElement.style.display = 'block';
        this.watermarkElement.style.opacity = '1';
        return;
      }

      console.log('[Watermark] Creating new watermark element');
      const watermark = document.createElement('div');
      watermark.id = WATERMARK_ID;
      
      // CSS Styles
      watermark.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 18px;
        border-radius: 6px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        pointer-events: none;
        user-select: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(8px);
        transition: opacity 0.3s ease;
        line-height: 1.5;
        max-width: 300px;
      `;
      
      this.updateWatermarkContent(freeApps, watermark);
      
      if (document.body) {
        document.body.appendChild(watermark);
        this.watermarkElement = watermark;
        console.log('[Watermark] Watermark element appended to body');
      } else {
        console.log('[Watermark] Body not ready, waiting...');
        const observer = new MutationObserver(() => {
          if (document.body) {
            document.body.appendChild(watermark);
            this.watermarkElement = watermark;
            observer.disconnect();
            console.log('[Watermark] Watermark element appended to body (after wait)');
          }
        });
        observer.observe(document.documentElement, { childList: true });
      }
    }

    updateWatermarkContent(freeApps, element = this.watermarkElement) {
      if (!element) {
        console.warn('[Watermark] Cannot update content - element is null');
        return;
      }

      console.log('[Watermark] Updating watermark content with free apps:', freeApps);
      
      let html = '<div style="font-weight: 600; margin-bottom: 8px;">Made with Interactive Studio</div>';

      if (freeApps.length > 0) {
        html += '<div style="font-size: 11px; opacity: 0.9; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">';
        html += '<div style="margin-bottom: 4px;">Free Plan:</div>';
        freeApps.forEach(app => {
          const appDisplayName = app.appName || app.appId;
          html += `<div style="margin-top: 4px;">• ${appDisplayName} by Interactive Studio</div>`;
        });
        html += '</div>';
      }

      element.innerHTML = html;
      console.log('[Watermark] Watermark content updated:', html);
    }

    hideWatermark() {
      if (this.watermarkElement) {
        console.log('[Watermark] Hiding watermark element');
        this.watermarkElement.style.opacity = '0';
        setTimeout(() => {
          if (this.watermarkElement) {
            this.watermarkElement.style.display = 'none';
            console.log('[Watermark] Watermark element hidden');
          }
        }, 300);
      } else {
        console.log('[Watermark] No watermark element to hide');
      }
    }

    destroy() {
      console.log('[Watermark] Destroying service');
      if (this.watermarkElement) {
        this.watermarkElement.remove();
        this.watermarkElement = null;
      }
      this.isInitialized = false;
      this.registeredApps.clear();
      this.appStatuses.clear();
      console.log('[Watermark] Service destroyed');
    }
  }

  const service = new WatermarkService();
  window[WATERMARK_NAMESPACE] = service;
  
  window.addEventListener('beforeunload', () => {
    service.destroy();
  });
  
  console.log('[Watermark] Singleton service created and available at window.__interactiveStudioWatermark');
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = service;
  }
  
  return service;
})();
