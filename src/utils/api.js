let csrfToken = null;

export const setCsrfToken = (token) => {
    csrfToken = token;
};

export const apiFetch = async (url, options = {}) => {
    const headers = {
        ...options.headers,
    };

    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())) {
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        } else {
            console.warn('apiFetch: Perform state-changing request without CSRF token.');
        }
    }

    return fetch(url, { ...options, headers });
};
