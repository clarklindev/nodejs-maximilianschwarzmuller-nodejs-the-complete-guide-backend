export interface IInvoice {
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: number;
  };
  items: {
    item: string;
    description: string;
    quantity: number;
    amount: number;
  }[];
  subtotal: number;
  paid: number;
  invoice_nr: number;
}
