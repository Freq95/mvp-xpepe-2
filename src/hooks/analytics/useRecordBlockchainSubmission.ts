import { useCallback } from 'react';
import axios from 'axios';
import { ANALYTICS_API_URL } from 'config/sharedConfig';

export type SubmissionStatus = 'pending' | 'success' | 'failed';

export interface BlockchainSubmissionData {
  address: string;
  score: number;
  feePaid?: string;
  status?: SubmissionStatus;
  transactionHash?: string;
  errorMessage?: string;
}

export function useRecordBlockchainSubmission() {
  const recordSubmission = useCallback(async (data: BlockchainSubmissionData) => {
    try {
      const response = await axios.post(`${ANALYTICS_API_URL}/api/blockchain-submissions`, data);
      return { success: true, data: response.data.data, submissionId: response.data.data.submissionId };
    } catch (error: any) {
      console.error('Failed to record blockchain submission:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateSubmission = useCallback(async (submissionId: string, updates: {
    status?: SubmissionStatus;
    transactionHash?: string;
    errorMessage?: string;
  }) => {
    try {
      const response = await axios.patch(
        `${ANALYTICS_API_URL}/api/blockchain-submissions/${submissionId}`,
        updates
      );
      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.error('Failed to update blockchain submission:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return { recordSubmission, updateSubmission };
}

