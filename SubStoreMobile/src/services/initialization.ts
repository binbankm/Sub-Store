import apiService from './api';
import storageService from './storage';
import { logger } from '../utils/logger';

export async function initializeApp(): Promise<void> {
  try {
    logger.info('Initializing application...');
    
    await apiService.initialize();
    
    const serverUrl = apiService.getServerUrl();
    if (serverUrl) {
      logger.info(`Server URL configured: ${serverUrl}`);
      
      const isHealthy = await apiService.checkHealth();
      if (isHealthy) {
        logger.info('Server connection successful');
      } else {
        logger.warn('Server connection failed');
      }
    } else {
      logger.warn('No server URL configured');
    }
    
    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
  }
}

export async function setupServer(url: string, token?: string): Promise<boolean> {
  try {
    await apiService.setServerConfig(url, token);
    
    const isHealthy = await apiService.checkHealth();
    if (isHealthy) {
      logger.info(`Server configured successfully: ${url}`);
      return true;
    } else {
      logger.error('Server health check failed');
      return false;
    }
  } catch (error) {
    logger.error('Failed to setup server:', error);
    return false;
  }
}
