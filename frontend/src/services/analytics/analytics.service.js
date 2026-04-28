import environment from '../../config';

/**
 * Analytics Service
 * Handles analytics tracking (Google Analytics, etc.)
 */
class AnalyticsService {
    constructor() {
        this.initialized = false;
        this.trackingId = null;
    }

    /**
     * Initialize analytics
     * @param {string} trackingId - Google Analytics tracking ID
     */
    init(trackingId) {
        if (!environment.enableAnalytics) {
            console.log('Analytics disabled');
            return;
        }

        if (!trackingId) {
            console.warn('No tracking ID provided');
            return;
        }

        this.trackingId = trackingId;
        
        // Load Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', trackingId);

        this.initialized = true;
        console.log('Analytics initialized');
    }

    /**
     * Track page view
     * @param {string} path - Page path
     * @param {string} title - Page title
     */
    trackPageView(path, title) {
        if (!this.initialized) return;

        if (window.gtag) {
            window.gtag('config', this.trackingId, {
                page_path: path,
                page_title: title,
            });
        }
    }

    /**
     * Track event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {Object} options - Event options
     */
    trackEvent(category, action, options = {}) {
        if (!this.initialized) return;

        if (window.gtag) {
            window.gtag('event', action, {
                event_category: category,
                ...options,
            });
        }
    }

    /**
     * Track user engagement
     * @param {string} feature - Feature name
     * @param {string} action - Action type
     * @param {Object} metadata - Additional data
     */
    trackEngagement(feature, action, metadata = {}) {
        this.trackEvent('engagement', action, {
            feature,
            ...metadata,
        });
    }

    /**
     * Track error
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    trackError(error, context = {}) {
        this.trackEvent('error', error.name || 'UnknownError', {
            message: error.message,
            ...context,
        });
    }

    /**
     * Track KPI interaction
     * @param {string} action - Action type (view, create, edit, delete)
     * @param {string} kpiId - KPI ID
     * @param {string} kpiName - KPI name
     */
    trackKPIInteraction(action, kpiId, kpiName) {
        this.trackEvent('kpi', action, {
            kpi_id: kpiId,
            kpi_name: kpiName,
        });
    }

    /**
     * Track target interaction
     * @param {string} action - Action type
     * @param {string} targetId - Target ID
     */
    trackTargetInteraction(action, targetId) {
        this.trackEvent('target', action, {
            target_id: targetId,
        });
    }

    /**
     * Track score view
     * @param {string} scoreId - Score ID
     * @param {number} score - Score value
     */
    trackScoreView(scoreId, score) {
        this.trackEvent('score', 'view', {
            score_id: scoreId,
            score_value: score,
        });
    }
}

export default new AnalyticsService();