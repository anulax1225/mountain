export class OwlAPIClient {
    constructor(config = {}) {
        this.baseURL = config.baseURL || 'http://localhost';
        this.token = config.token || null;
        this.onTokenChange = config.onTokenChange || null;

        this.auth = new AuthAPI(this);
        this.projects = new ProjectsAPI(this);
        this.scenes = new ScenesAPI(this);
        this.hotspots = new HotspotsAPI(this);
        this.images = new ImagesAPI(this);
    }

    setToken(token) {
        this.token = token;
        if (this.onTokenChange) {
            this.onTokenChange(token);
        }
    }

    clearToken() {
        this.token = null;
        if (this.onTokenChange) {
            this.onTokenChange(null);
        }
    }

    async request(path, options = {}) {
        const url = `${this.baseURL}${path}`;
        const headers = {
            ...options.headers,
        };

        // Only set Content-Type for JSON, let browser set it for FormData
        if (!options.isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
        };

        if (options.body && !options.isFormData && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401 && this.token) {
                this.clearToken();
            }

            const contentType = response.headers.get('content-type');
            let data = null;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (response.status !== 204) {
                data = await response.text();
            }

            if (!response.ok) {
                throw new OwlAPIError(
                    data?.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof OwlAPIError) {
                throw error;
            }
            throw new OwlAPIError(error.message, null, null);
        }
    }
}

export class OwlAPIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'OwlAPIError';
        this.status = status;
        this.data = data;
    }
}

class AuthAPI {
    constructor(client) {
        this.client = client;
    }

    async register(data) {
        const response = await this.client.request('/api/register', {
            method: 'POST',
            body: data,
            skipAuth: true,
        });
        return response;
    }

    async login(email, password) {
        const response = await this.client.request('/api/login', {
            method: 'POST',
            body: { email, password },
            skipAuth: true,
        });

        if (response?.token) {
            this.client.setToken(response.token);
        }

        return response;
    }

    async logout() {
        try {
            const response = await this.client.request('/api/logout', {
                method: 'POST',
            });
            return response;
        } finally {
            this.client.clearToken();
        }
    }

    async user() {
        return await this.client.request('/api/user', {
            method: 'GET',
        });
    }
}

class ProjectsAPI {
    constructor(client) {
        this.client = client;
    }

    async list() {
        return await this.client.request('/api/projects', {
            method: 'GET',
        });
    }

    async create(data) {
        return await this.client.request('/api/projects', {
            method: 'POST',
            body: data,
        });
    }

    async get(slug) {
        return await this.client.request(`/api/projects/${slug}`, {
            method: 'GET',
        });
    }

    async update(slug, data) {
        return await this.client.request(`/api/projects/${slug}`, {
            method: 'PUT',
            body: data,
        });
    }

    async patch(slug, data) {
        return await this.client.request(`/api/projects/${slug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async delete(slug) {
        return await this.client.request(`/api/projects/${slug}`, {
            method: 'DELETE',
        });
    }
}

class ScenesAPI {
    constructor(client) {
        this.client = client;
    }

    async list(projectSlug) {
        return await this.client.request(`/api/projects/${projectSlug}/scenes`, {
            method: 'GET',
        });
    }

    async create(projectSlug, data) {
        return await this.client.request(`/api/projects/${projectSlug}/scenes`, {
            method: 'POST',
            body: data,
        });
    }

    async get(sceneSlug) {
        return await this.client.request(`/api/scenes/${sceneSlug}`, {
            method: 'GET',
        });
    }

    async update(sceneSlug, data) {
        return await this.client.request(`/api/scenes/${sceneSlug}`, {
            method: 'PUT',
            body: data,
        });
    }

    async patch(sceneSlug, data) {
        return await this.client.request(`/api/scenes/${sceneSlug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async delete(sceneSlug) {
        return await this.client.request(`/api/scenes/${sceneSlug}`, {
            method: 'DELETE',
        });
    }
}

class HotspotsAPI {
    constructor(client) {
        this.client = client;
    }

    async list(sceneSlug) {
        return await this.client.request(`/api/scenes/${sceneSlug}/hotspots`, {
            method: 'GET',
        });
    }

    async create(sceneSlug, data) {
        return await this.client.request(`/api/scenes/${sceneSlug}/hotspots`, {
            method: 'POST',
            body: data,
        });
    }

    async get(hotspotSlug) {
        return await this.client.request(`/api/hotspots/${hotspotSlug}`, {
            method: 'GET',
        });
    }

    async update(hotspotSlug, data) {
        return await this.client.request(`/api/hotspots/${hotspotSlug}`, {
            method: 'PUT',
            body: data,
        });
    }

    async patch(hotspotSlug, data) {
        return await this.client.request(`/api/hotspots/${hotspotSlug}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async delete(hotspotSlug) {
        return await this.client.request(`/api/hotspots/${hotspotSlug}`, {
            method: 'DELETE',
        });
    }
}

class ImagesAPI {
    constructor(client) {
        this.client = client;
    }

    async list(sceneSlug) {
        return await this.client.request(`/api/scenes/${sceneSlug}/images`, {
            method: 'GET',
        });
    }

    async upload(sceneSlug, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return await this.client.request(`/api/scenes/${sceneSlug}/images`, {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async get(imageSlug) {
        return await this.client.request(`/api/images/${imageSlug}`, {
            method: 'GET',
        });
    }

    async update(imageSlug, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        return await this.client.request(`/api/images/${imageSlug}`, {
            method: 'POST',
            body: formData,
            isFormData: true,
        });
    }

    async delete(imageSlug) {
        return await this.client.request(`/api/images/${imageSlug}`, {
            method: 'DELETE',
        });
    }
}