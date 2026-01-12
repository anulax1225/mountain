/**
 * Owl API Client - Enhanced SDK for panoramic photo editor API
 * @version 2.0.0
 */

/**
 * @typedef {Object} ClientConfig
 * @property {string} [baseURL='http://localhost'] - Base URL for API
 * @property {string} [token] - Authentication token
 * @property {Function} [onTokenChange] - Callback when token changes
 * @property {Function} [onRequest] - Request interceptor
 * @property {Function} [onResponse] - Response interceptor
 * @property {Function} [onError] - Error interceptor
 * @property {number} [timeout=30000] - Request timeout in ms
 * @property {number} [retryAttempts=0] - Number of retry attempts for failed requests
 * @property {number} [retryDelay=1000] - Delay between retries in ms
 */

class OwlAPIClient {
    /**
     * @param {ClientConfig} config
     */
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost:8000';
        this.token = config.token || null;
        this.timeout = config.timeout || 30000;
        this.retryAttempts = config.retryAttempts || 0;
        this.retryDelay = config.retryDelay || 1000;
        
        // Callbacks
        this.onTokenChange = config.onTokenChange || null;
        this.onRequest = config.onRequest || null;
        this.onResponse = config.onResponse || null;
        this.onError = config.onError || null;

        // Initialize API endpoints
        this.auth = new AuthAPI(this);
        this.projects = new ProjectsAPI(this);
        this.scenes = new ScenesAPI(this);
        this.hotspots = new HotspotsAPI(this);
        this.images = new ImagesAPI(this);
        this.stickers = new StickersAPI(this);

        // Active requests tracking for cancellation
        this.activeRequests = new Map();
    }

    /**
     * Set authentication token
     * @param {string} token
     */
    setToken(token) {
        this.token = token;
        if (this.onTokenChange) {
            this.onTokenChange(token);
        }
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        if (this.onTokenChange) {
            this.onTokenChange(null);
        }
    }

    /**
     * Cancel a specific request by ID
     * @param {string} requestId
     */
    cancelRequest(requestId) {
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestId);
        }
    }

    /**
     * Cancel all active requests
     */
    cancelAllRequests() {
        this.activeRequests.forEach(controller => controller.abort());
        this.activeRequests.clear();
    }

    /**
     * Make HTTP request with retry logic
     * @param {string} path
     * @param {Object} options
     * @returns {Promise<any>}
     */
    async request(path, options = {}) {
        const requestId = options.requestId || `${Date.now()}-${Math.random()}`;
        let attempt = 0;
        
        while (attempt <= this.retryAttempts) {
            try {
                return await this._executeRequest(path, options, requestId);
            } catch (error) {
                if (
                    attempt < this.retryAttempts &&
                    error.status >= 500 &&
                    error.name !== 'AbortError'
                ) {
                    attempt++;
                    await this._delay(this.retryDelay * attempt);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Execute a single request
     * @private
     */
    async _executeRequest(path, options, requestId) {
        const url = `${this.baseURL}${path}`;
        const controller = new AbortController();
        
        this.activeRequests.set(requestId, controller);

        const headers = { ...options.headers, "X-CSRF-Token": document.querySelector("input[name=_token]").value };

        // Set Content-Type for JSON requests
        if (!options.isFormData && options.body) {
            headers['Content-Type'] = 'application/json';
        }

        // Add authorization header
        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
            signal: controller.signal,
        };

        // Serialize body for JSON requests
        if (options.body && !options.isFormData && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        // Setup timeout
        const timeoutId = setTimeout(() => this.timeout ?? controller.abort(), this.timeout);

        try {
            // Request interceptor
            if (this.onRequest) {
                await this.onRequest(url, config);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            this.activeRequests.delete(requestId);

            // Handle 401 unauthorized
            if (response.status === 401 && this.token) {
                this.clearToken();
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else if (response.status !== 204) {
                // For non-JSON responses (like image downloads)
                if (options.responseType === 'blob') {
                    data = await response.blob();
                } else if (options.responseType === 'arrayBuffer') {
                    data = await response.arrayBuffer();
                } else {
                    data = await response.text();
                }
            }

            // Check response status
            if (!response.ok) {
                const error = new OwlAPIError(
                    data?.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    data
                );
                
                if (this.onError) {
                    await this.onError(error);
                }
                
                throw error;
            }

            // Response interceptor
            if (this.onResponse) {
                await this.onResponse(response, data);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            this.activeRequests.delete(requestId);

            if (error instanceof OwlAPIError) {
                throw error;
            }

            if (error.name === 'AbortError') {
                throw new OwlAPIError('Request cancelled', null, null);
            }

            throw new OwlAPIError(error.message, null, null);
        }
    }

    /**
     * Delay helper for retry logic
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Custom API Error class
 */
class OwlAPIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'OwlAPIError';
        this.status = status;
        this.data = data;
    }

    /**
     * Check if error is a network error
     */
    isNetworkError() {
        return this.status === null;
    }

    /**
     * Check if error is a client error (4xx)
     */
    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Check if error is a server error (5xx)
     */
    isServerError() {
        return this.status >= 500 && this.status < 600;
    }

    /**
     * Check if error is unauthorized
     */
    isUnauthorized() {
        return this.status === 401;
    }

    /**
     * Check if error is validation error
     */
    isValidationError() {
        return this.status === 422;
    }
}

/**
 * Authentication API endpoints
 */
class AuthAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * Register a new user
     * @param {Object} data - Registration data
     * @param {string} data.name - User's name
     * @param {string} data.email - User's email
     * @param {string} data.password - User's password (min 8 chars)
     * @returns {Promise<Object>}
     */
    async register(data) {
        return await this.client.request('/register', {
            method: 'POST',
            body: data,
            skipAuth: true,
        });
    }

    /**
     * Login and obtain authentication token
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>}
     */
    async login(email, password) {
        const response = await this.client.request('/login', {
            method: 'POST',
            body: { email, password },
            skipAuth: true,
        });

        if (response?.token) {
            this.client.setToken(response.token);
        }

        return response;
    }

    /**
     * Logout and revoke authentication token
     * @returns {Promise<Object>}
     */
    async logout() {
        try {
            const response = await this.client.request('/logout', {
                method: 'POST',
            });
            return response;
        } finally {
            this.client.clearToken();
        }
    }

    /**
     * Get authenticated user information
     * @returns {Promise<Object>}
     */
    async user() {
        return await this.client.request('/user', {
            method: 'GET',
        });
    }
}

/**
 * Projects API endpoints
 */
class ProjectsAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all projects for authenticated user
     * @returns {Promise<Object>}
     */
    async list() {
        return await this.client.request('/projects', {
            method: 'GET',
        });
    }

    /**
     * Create a new project
     * @param {Object} data
     * @param {string} data.name - Project name
     * @param {string} [data.description] - Project description
     * @returns {Promise<Object>}
     */
    async create(data) {
        return await this.client.request('/projects', {
            method: 'POST',
            body: data,
        });
    }

    /**
     * Get a specific project by slug
     * @param {string} slug - Project slug
     * @returns {Promise<Object>}
     */
    async get(slug) {
        return await this.client.request(`/projects/${slug}`, {
            method: 'GET',
        });
    }

    /**
     * Update a project (full update)
     * @param {string} slug - Project slug
     * @param {Object} data
     * @param {string} [data.name] - Project name
     * @param {string} [data.description] - Project description
     * @returns {Promise<Object>}
     */
    async update(slug, data) {
        return await this.client.request(`/projects/${slug}`, {
            method: 'PUT',
            body: data,
        });
    }

    /**
     * Patch a project (partial update)
     * @param {string} slug - Project slug
     * @param {Object} data
     * @param {string} [data.name] - Project name
     * @param {string} [data.description] - Project description
     * @returns {Promise<Object>}
     */
    async patch(slug, data) {
        return await this.client.request(`/projects/${slug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    /**
     * Delete a project
     * @param {string} slug - Project slug
     * @returns {Promise<void>}
     */
    async delete(slug) {
        return await this.client.request(`/projects/${slug}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Scenes API endpoints
 */
class ScenesAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all scenes for a project
     * @param {string} projectSlug - Project slug
     * @returns {Promise<Object>}
     */
    async list(projectSlug) {
        return await this.client.request(`/projects/${projectSlug}/scenes`, {
            method: 'GET',
        });
    }

    /**
     * Create a new scene in a project
     * @param {string} projectSlug - Project slug
     * @param {Object} data
     * @param {string} [data.name] - Scene name
     * @returns {Promise<Object>}
     */
    async create(projectSlug, data) {
        return await this.client.request(`/projects/${projectSlug}/scenes`, {
            method: 'POST',
            body: data,
        });
    }

    /**
     * Get a specific scene by slug
     * @param {string} sceneSlug - Scene slug
     * @returns {Promise<Object>}
     */
    async get(sceneSlug) {
        return await this.client.request(`/scenes/${sceneSlug}`, {
            method: 'GET',
        });
    }

    /**
     * Update a scene (full update)
     * @param {string} sceneSlug - Scene slug
     * @param {Object} data
     * @param {string} [data.name] - Scene name
     * @returns {Promise<Object>}
     */
    async update(sceneSlug, data) {
        return await this.client.request(`/scenes/${sceneSlug}`, {
            method: 'PUT',
            body: data,
        });
    }

    /**
     * Patch a scene (partial update)
     * @param {string} sceneSlug - Scene slug
     * @param {Object} data
     * @param {string} [data.name] - Scene name
     * @returns {Promise<Object>}
     */
    async patch(sceneSlug, data) {
        return await this.client.request(`/scenes/${sceneSlug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    /**
     * Delete a scene
     * @param {string} sceneSlug - Scene slug
     * @returns {Promise<void>}
     */
    async delete(sceneSlug) {
        return await this.client.request(`/scenes/${sceneSlug}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Hotspots API endpoints
 */
class HotspotsAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all hotspots for a scene
     * @param {string} sceneSlug - Scene slug
     * @returns {Promise<Object>}
     */
    async list(sceneSlug) {
        return await this.client.request(`/scenes/${sceneSlug}/hotspots`, {
            method: 'GET',
        });
    }

    /**
     * Create a new hotspot in a scene
     * @param {string} sceneSlug - Scene slug
     * @param {Object} data
     * @param {number} data.from_image_id - Source image ID
     * @param {number} data.to_image_id - Destination image ID
     * @returns {Promise<Object>}
     */
    async create(sceneSlug, data) {
        return await this.client.request(`/scenes/${sceneSlug}/hotspots`, {
            method: 'POST',
            body: data,
        });
    }

    /**
     * Get a specific hotspot by slug
     * @param {string} hotspotSlug - Hotspot slug
     * @returns {Promise<Object>}
     */
    async get(hotspotSlug) {
        return await this.client.request(`/hotspots/${hotspotSlug}`, {
            method: 'GET',
        });
    }

    /**
     * Update a hotspot (full update)
     * @param {string} hotspotSlug - Hotspot slug
     * @param {Object} data
     * @param {number} [data.from_image_id] - Source image ID
     * @param {number} [data.to_image_id] - Destination image ID
     * @returns {Promise<Object>}
     */
    async update(hotspotSlug, data) {
        return await this.client.request(`/hotspots/${hotspotSlug}`, {
            method: 'PUT',
            body: data,
        });
    }

    /**
     * Patch a hotspot (partial update)
     * @param {string} hotspotSlug - Hotspot slug
     * @param {Object} data
     * @param {number} [data.from_image_id] - Source image ID
     * @param {number} [data.to_image_id] - Destination image ID
     * @returns {Promise<Object>}
     */
    async patch(hotspotSlug, data) {
        return await this.client.request(`/hotspots/${hotspotSlug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    /**
     * Delete a hotspot
     * @param {string} hotspotSlug - Hotspot slug
     * @returns {Promise<void>}
     */
    async delete(hotspotSlug) {
        return await this.client.request(`/hotspots/${hotspotSlug}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Images API endpoints
 */
class ImagesAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all images for a scene
     * @param {string} sceneSlug - Scene slug
     * @returns {Promise<Object>}
     */
    async list(sceneSlug) {
        return await this.client.request(`/scenes/${sceneSlug}/images`, {
            method: 'GET',
        });
    }

    /**
     * Upload a new image to a scene
     * @param {string} sceneSlug - Scene slug
     * @param {File} imageFile - Image file (max 20MB)
     * @param {string} [name] - Optional name for the image
     * @returns {Promise<Object>}
     */
    async upload(sceneSlug, imageFile, name = null) {
        const formData = new FormData();
        formData.append('image', imageFile);
        if (name) {
            formData.append('name', name);
        }

        return await this.client.request(`/scenes/${sceneSlug}/images`, {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    /**
     * Get a specific image by slug
     * @param {string} imageSlug - Image slug
     * @returns {Promise<Object>}
     */
    async get(imageSlug) {
        return await this.client.request(`/images/${imageSlug}`, {
            method: 'GET',
        });
    }

    /**
     * Update/replace an existing image file
     * @param {string} imageSlug - Image slug
     * @param {File} imageFile - New image file (max 20MB)
     * @returns {Promise<Object>}
     */
    async update(imageSlug, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return await this.client.request(`/images/${imageSlug}`, {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    /**
     * Update image name only
     * @param {string} imageSlug - Image slug
     * @param {string} name - New name for the image
     * @returns {Promise<Object>}
     */
    async updateName(imageSlug, name) {
        const formData = new FormData();
        formData.append('name', name);

        return await this.client.request(`/images/${imageSlug}`, {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    /**
     * Download image file
     * @param {string} imageSlug - Image slug
     * @param {string} [format='blob'] - Response format: 'blob' or 'arrayBuffer'
     * @returns {Promise<Blob|ArrayBuffer>}
     */
    async download(imageSlug, format = 'blob') {
        return await this.client.request(`/images/${imageSlug}/download`, {
            method: 'GET',
            responseType: format,
        });
    }

    /**
     * Delete an image
     * @param {string} imageSlug - Image slug
     * @returns {Promise<void>}
     */
    async delete(imageSlug) {
        return await this.client.request(`/images/${imageSlug}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Stickers API endpoints - ADD THIS CLASS to your owl-sdk.js
 */
class StickersAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * List all stickers for an image
     * @param {string} imageSlug - Image slug
     * @returns {Promise<Object>}
     */
    async list(imageSlug) {
        return await this.client.request(`/images/${imageSlug}/stickers`, {
            method: 'GET',
        });
    }

    /**
     * Create a new sticker on an image
     * @param {string} imageSlug - Image slug
     * @param {Object} data
     * @param {string} data.type - Sticker type: 'emoji', 'image', 'text'
     * @param {string} data.content - Sticker content (emoji, image path, or text)
     * @param {number} data.position_x - X position
     * @param {number} data.position_y - Y position
     * @param {number} data.position_z - Z position
     * @param {number} [data.scale=1.0] - Scale factor
     * @param {string} [data.font_family] - Font family for text stickers
     * @param {number} [data.font_size] - Font size for text stickers
     * @param {string} [data.color] - Text color
     * @param {string} [data.background_color] - Background color
     * @returns {Promise<Object>}
     */
    async create(imageSlug, data) {
        return await this.client.request(`/images/${imageSlug}/stickers`, {
            method: 'POST',
            body: data,
        });
    }

    /**
     * Get a specific sticker by slug
     * @param {string} stickerSlug - Sticker slug
     * @returns {Promise<Object>}
     */
    async get(stickerSlug) {
        return await this.client.request(`/stickers/${stickerSlug}`, {
            method: 'GET',
        });
    }

    /**
     * Update a sticker
     * @param {string} stickerSlug - Sticker slug
     * @param {Object} data - Sticker data to update
     * @returns {Promise<Object>}
     */
    async update(stickerSlug, data) {
        return await this.client.request(`/stickers/${stickerSlug}`, {
            method: 'PUT',
            body: data,
        });
    }

    /**
     * Patch a sticker (partial update)
     * @param {string} stickerSlug - Sticker slug
     * @param {Object} data - Sticker data to update
     * @returns {Promise<Object>}
     */
    async patch(stickerSlug, data) {
        return await this.client.request(`/stickers/${stickerSlug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    /**
     * Delete a sticker
     * @param {string} stickerSlug - Sticker slug
     * @returns {Promise<void>}
     */
    async delete(stickerSlug) {
        return await this.client.request(`/stickers/${stickerSlug}`, {
            method: 'DELETE',
        });
    }
}

// NOTE: Add this class to your existing owl-sdk.js file, replacing the existing ImagesAPI class

// =============================================================================
// GLOBAL CLIENT SINGLETON
// =============================================================================

/**
 * Global client instance
 */
const client = new OwlAPIClient();

/**
 * Configure the global client
 * @param {ClientConfig} config
 * @returns {OwlAPIClient}
 */
function configure(config) {
    Object.assign(client, {
        baseURL: config.baseURL !== undefined ? config.baseURL : client.baseURL,
        token: config.token !== undefined ? config.token : client.token,
        timeout: config.timeout !== undefined ? config.timeout : client.timeout,
        retryAttempts: config.retryAttempts !== undefined ? config.retryAttempts : client.retryAttempts,
        retryDelay: config.retryDelay !== undefined ? config.retryDelay : client.retryDelay,
        onTokenChange: config.onTokenChange !== undefined ? config.onTokenChange : client.onTokenChange,
        onRequest: config.onRequest !== undefined ? config.onRequest : client.onRequest,
        onResponse: config.onResponse !== undefined ? config.onResponse : client.onResponse,
        onError: config.onError !== undefined ? config.onError : client.onError,
    });
    
    return client;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export the class for creating custom instances
export { OwlAPIClient, OwlAPIError };

// Export the global client instance (default export)
export default client;

// Export the configure function
export { configure };

// Export API endpoints from global client for convenience
export const auth = client.auth;
export const projects = client.projects;
export const scenes = client.scenes;
export const hotspots = client.hotspots;
export const images = client.images;
export const stickers = client.stickers;