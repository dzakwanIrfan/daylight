import { IsNumber, IsString } from 'class-validator';

export class RequestVAtDto {
  reference_id: string;
  type: string = 'PAY';
  country: string;
  currency: string;
  channel_code: string;
  channel_properties: {
    display_name: string;
    expires_at: string;
    description: string;
  };
  request_amount: number;
  description: string;
  customer: {
    type: string;
    reference_id: string;
    email: string;
    individual_detail: {
      given_names: string;
    };
  };
}

export class ResponseVAtDto {
  payment_request_id: string;
  country: string;
  currency: string;
  business_id: string;
  reference_id: string;
  description: string;
  created: string;
  updated: string;
  status: string;
  capture_method: string;
  channel_code: string;
  customer_id: string;
  request_amount: number;
  channel_properties: {
    display_name: string;
    expires_at: string;
  };
  type: string;
  actions: [
    {
      type: string; // PRESENT_TO_CUSTOMER
      descriptor: string; // VIRTUAL_ACCOUNT_NUMBER
      value: string; // e.g., "381659999975205"
    },
  ];
}
