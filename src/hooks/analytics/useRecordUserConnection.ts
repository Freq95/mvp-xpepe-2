import { useCallback, useRef } from 'react';
import axios from 'axios';
import { ANALYTICS_API_URL } from 'config/sharedConfig';

export function useRecordUserConnection() {
  // Track which addresses we've already recorded to avoid duplicate calls
  const recordedAddresses = useRef<Set<string>>(new Set());

  const recordConnection = useCallback(async (address: string) => {
    // Skip if we've already recorded this address in this session
    if (recordedAddresses.current.has(address)) {
      console.log('📍 Connection already recorded for address:', address);
      return { success: true, isNewConnection: false, skipped: true };
    }

    try {
      const response = await axios.post(`${ANALYTICS_API_URL}/api/user-connections`, {
        address
      });
      
      // Mark as recorded
      recordedAddresses.current.add(address);
      
      const isNewConnection = response.data.isNewConnection;
      console.log(isNewConnection 
        ? `✅ New user connection recorded: ${address}` 
        : `📍 Existing user connection: ${address}`
      );
      
      return { 
        success: true, 
        isNewConnection,
        data: response.data.data 
      };
    } catch (error: any) {
      console.error('Failed to record user connection:', error);
      // Don't throw - we don't want to break the app if analytics fails
      return { success: false, error: error.message };
    }
  }, []);

  return { recordConnection };
}

