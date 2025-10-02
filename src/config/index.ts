import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq5dvvpecrdgpuf4ky3s0stpqg5mfyqsl8swhqh2y00z';

// al 4-lea SC v4 cu send scor si afisare top 10[fix la out of range] + withdraw function
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgq5dvvpecrdgpuf4ky3s0stpqg5mfyqsl8swhqh2y00z';

export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
