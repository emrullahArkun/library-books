const apiClient = {
    async request(url, options = {}) {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
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

    async requestJson(url, options = {}) {
        try {
            const response = await this.request(url, options);
            return this.handleResponse(response);
        } catch (error) {
            // Rethrow allow caller to handle, or log
            throw error;
        }
    },

    async handleResponse(response) {
        if (response.status === 401) {
            // Optional: redirect to login or clear token
            localStorage.removeItem('token');
            // Remove hard redirect to prevent refresh loops. Let the app handle the 401.
            // window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            let errorMessage = `HTTP Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore json parse error for error response
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    },

    get(url, options = {}) {
        return this.requestJson(url, { ...options, method: 'GET' });
    },

    post(url, data, options = {}) {
        return this.requestJson(url, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    put(url, data, options = {}) {
        return this.requestJson(url, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    patch(url, data, options = {}) {
        return this.requestJson(url, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    delete(url, options = {}) {
        return this.requestJson(url, { ...options, method: 'DELETE' });
    }
};

export default apiClient;
