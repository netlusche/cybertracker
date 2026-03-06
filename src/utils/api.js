import i18n from '../i18n';

let csrfToken = null;

export const setCsrfToken = (token) => {
    csrfToken = token;
};

export const apiFetch = async (url, options = {}) => {
    let lang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
    if (lang.includes('-')) lang = lang.split('-')[0];

    const headers = {
        'X-App-Language': lang,
        ...options.headers,
    };

    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())) {
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        } else {
            console.warn('apiFetch: Perform state-changing request without CSRF token.');
        }
    }

    // Prevent browser caching for GET requests by default
    const finalOptions = { ...options, headers };
    if (!finalOptions.method || finalOptions.method.toUpperCase() === 'GET') {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.append('_t', Date.now());
        url = urlObj.toString();
        // Also add cache control headers just in case
        finalOptions.cache = 'no-store';
        finalOptions.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        finalOptions.headers['Pragma'] = 'no-cache';
    }

    return fetch(url, finalOptions);
};
