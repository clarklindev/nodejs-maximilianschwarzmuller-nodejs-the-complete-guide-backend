import { IContact } from './IContact';
export interface ITenant {
  email: string;
  name?: string;
  phoneNumber?: string;

  countryCode?: string;

  createdAt: number;
  updatedAt: number;
}
