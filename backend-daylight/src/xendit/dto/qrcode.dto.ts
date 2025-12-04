import { IsNumber, IsString } from 'class-validator';

export class RequestQrCodetDto {
  reference_id: string;
  type: string = 'PAY';
  country: string;
  currency: string;
  channel_code: string;
  channel_properties: {
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

export class ResponseQrCodetDto {
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
    success_return_url: string;
    pending_return_url?: string;
    failure_return_url?: string;
    cancel_return_url?: string;
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
