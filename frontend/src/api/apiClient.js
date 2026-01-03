const apiClient = {
    async request(url, options = {}) {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Basic ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        // Ensure URL is relative or absolute as needed. 
        // Usage assumes paths like /api/resource
        try {
            const response = await fetch(url, config);
            return response;
        } catch (error) {
            console.error("API Request Failed", error);
            throw error;
        }
    },

    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    },

    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
};

export default apiClient;
