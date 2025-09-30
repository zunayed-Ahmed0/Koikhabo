// API utility with proper error handling and connection management

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Global API health status
let apiHealthStatus = 'unknown';
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

export const getAPIHealthStatus = () => apiHealthStatus;

export const checkAPIHealth = async () => {
  const now = Date.now();
  
  // Don't check too frequently
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && apiHealthStatus !== 'unknown') {
    return apiHealthStatus;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });
    
    if (response.ok) {
      apiHealthStatus = 'healthy';
    } else {
      apiHealthStatus = 'error';
    }
  } catch (error) {
    apiHealthStatus = 'error';
  }
  
  lastHealthCheck = now;
  return apiHealthStatus;
};

// Enhanced fetch with error handling and retries
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeoutMs = options.timeout || 10000; // 10 second timeout

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Remove timeout from requestOptions as fetch doesn't support it directly
  delete requestOptions.timeout;

  let lastError;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check API health before making request (skip for retries to avoid delays)
      if (attempt === 0) {
        await checkAPIHealth();
        if (apiHealthStatus === 'error') {
          throw new APIError('API is currently offline', 503, null);
        }
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      );

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, requestOptions),
        timeoutPromise
      ]);
      
      // Update health status based on response
      if (response.ok) {
        apiHealthStatus = 'healthy';
      } else if (response.status >= 500) {
        apiHealthStatus = 'error';
      }
      
      // Handle different response types
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      } else {
        // Try to get error message from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new APIError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx) or API errors
      if (error instanceof APIError && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // If we get here, all retries failed
  apiHealthStatus = 'error';
  
  if (lastError instanceof APIError) {
    throw lastError;
  } else {
    throw new APIError(
      'Network error: Unable to connect to server',
      0,
      { originalError: lastError.message }
    );
  }
};

// Convenience methods
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

export const apiPost = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiPut = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

// Error handling helper
export const handleAPIError = (error, addToast) => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 0:
        addToast('Unable to connect to server. Please check your internet connection.', 'error');
        break;
      case 400:
        addToast(error.message || 'Invalid request. Please check your input.', 'error');
        break;
      case 401:
        addToast('Authentication required. Please log in again.', 'error');
        break;
      case 403:
        addToast('Access denied. You don\'t have permission for this action.', 'error');
        break;
      case 404:
        addToast('Requested resource not found.', 'error');
        break;
      case 500:
        addToast('Server error. Please try again later.', 'error');
        break;
      case 503:
        addToast('Service temporarily unavailable. Please try again later.', 'error');
        break;
      default:
        addToast(error.message || 'An unexpected error occurred.', 'error');
    }
  } else {
    addToast('Network error. Please check your connection and try again.', 'error');
  }
};

// Initialize health check
checkAPIHealth();

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  checkAPIHealth,
  getAPIHealthStatus,
  handleAPIError,
  APIError,
};
