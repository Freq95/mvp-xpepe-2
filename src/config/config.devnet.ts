import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqr3zadu3p4u4md79a58t7xdz5pvc6a80sswhqh4f6ur';

// al 4-lea SC v4 cu send scor si afisare top 10[fix la out of range] + withdraw function
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgqr3zadu3p4u4md79a58t7xdz5pvc6a80sswhqh4f6ur';

export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
