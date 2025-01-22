// const API_BASE_URL = 'http://localhost:8000'
const API_BASE_URL = 'https://api-dev.gbase.ai'

export const ENDPOINTS = {
    events: {
        list: `${API_BASE_URL}/mock/meeting`,
        create: `${API_BASE_URL}/mock/meeting`,
        update: `${API_BASE_URL}/mock/meeting`,
        delete: `${API_BASE_URL}/mock/meeting`,
    }
} as const;