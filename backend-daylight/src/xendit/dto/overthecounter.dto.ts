import { IsNumber, IsString } from 'class-validator';

export class RequestOverTheCounterDto {
  reference_id: string;
  type: string = 'PAY';
  country: string;
  currency: string;
  channel_code: string;
  channel_properties: {
    payer_name: string;
    expires_at: string;
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

export class ResponseOverTheCounterDto {
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
      type: string;
      descriptor: string;
      value: string;
    },
  ];
}
