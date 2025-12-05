import { Event } from "./event.types";
import { XenditPaymentMethod, XenditTransactionStatus } from "./xendit.types";
import { MatchingGroup } from "./matching.types";

// Transaction info attached to user's events
export interface MyEventTransaction {
  id: string;
  externalId: string;
  status: XenditTransactionStatus;
  amount: number;
  totalFee: number;
  finalAmount: number;
  paymentMethod: XenditPaymentMethod;
  paidAt: string | null;
  createdAt: string;
}

export interface MyEvent extends Event {
  transaction: MyEventTransaction;
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
  MY_EVENTS = "my-events",
  PAST_EVENTS = "past-events",
  TRANSACTIONS = "transactions",
}
