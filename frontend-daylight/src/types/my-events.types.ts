import { Event } from './event.types';
import { Transaction } from './payment.types';
import { MatchingGroup } from './matching.types';

export interface MyEvent extends Event {
  transaction: {
    id: string;
    merchantRef: string;
    paymentStatus: string;
    amount: number;
    paidAt: string | null;
    createdAt: string;
  };
  matchingGroup?: MatchingGroup;
}

export interface MyEventsResponse {
  data: MyEvent[];
  total: number;
}

export interface MyPastEventsResponse {
  data: MyEvent[];
  total: number;
}

export enum MyEventsTab {
  MY_EVENTS = 'my-events',
  PAST_EVENTS = 'past-events',
  TRANSACTIONS = 'transactions',
}