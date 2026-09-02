export type ConnectionType = 'Household' | 'Commercial' | 'Industrial' | 'Institutional' | 'Residential';
export type ConnectionStatus = 'Active' | 'Suspended' | 'Disconnected' | 'Pending';
export type MeterStatus = 'Normal' | 'Leak Suspected' | 'Faulty' | 'Tampered' | 'High Flow';
export type BillStatus = 'PAID' | 'PARTIALLY PAID' | 'UNPAID';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';
export type PaymentMode = PaymentMethod;

export type ComplaintType = 'Leak' | 'Meter Fault' | 'Billing Dispute' | 'Low Water Pressure' | 'Supply Interruption' | 'Other';
export type ComplaintStatus = 'Open' | 'Pending' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
export type OperatorRole = 'ADMIN' | 'BILLING_OPERATOR' | 'FIELD_ENGINEER' | 'COMPLAINT_OPERATOR';
export type Zone = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D';

export interface Connection {
  connection_id: string; // e.g. CON10001
  consumer_name: string;
  connection_type: ConnectionType;
  zone: Zone;
  address: string;
  meter_number?: string;
  meter_serial_number?: string;
  status: ConnectionStatus;
  connection_status?: ConnectionStatus;
  installation_date?: string;
  created_at: string;
}

export interface MeterReading {
  reading_id: string; // e.g. RDG9001
  connection_id: string;
  reading_timestamp: string; // ISO string
  consumption_litres: number;
  meter_status: MeterStatus;
  zone: Zone;
}

export interface Bill {
  bill_id: string; // e.g. BIL2024-01
  connection_id: string;
  billing_month: string; // e.g. 2026-08
  previous_reading?: number; // in units (kL or 1000L)
  current_reading?: number;
  units_consumed: number;
  amount: number;
  due_amount: number;
  due_date?: string;
  bill_status: BillStatus;
  generated_at: string;
  generated_by?: string;
  version: number;
}

export interface Payment {
  payment_id: string; // e.g. PAY5001
  bill_id: string;
  connection_id: string;
  payment_date: string;
  amount: number;
  amount_paid?: number;
  payment_method: PaymentMethod;
  payment_mode?: PaymentMethod;
  transaction_reference: string;
  reference_number?: string;
}

export interface Complaint {
  complaint_id: string; // e.g. CMP3001
  connection_id: string;
  complaint_type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution_notes?: string;
  version: number; // for optimistic concurrency control
}

export interface Operator {
  operator_id: string; // e.g. ADMIN001
  operator_name: string;
  zone: Zone | 'All Zones';
  role: OperatorRole;
  email: string;
}

export interface ExplainRow {
  id: number;
  select_type: string;
  table: string;
  type: string; // ALL, range, ref, eq_ref, const
  possible_keys: string;
  key: string;
  key_len?: string;
  ref?: string;
  rows: number;
  filtered?: number;
  Extra: string;
}

export interface TransactionStepLog {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  status: 'info' | 'success' | 'warning' | 'error' | 'lock';
}

export interface TestCaseResult {
  id: number;
  title: string;
  module: string;
  description: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  executionTimeMs: number;
  sqlSnippet: string;
  details?: string;
}

export interface LeakAlert {
  connection_id: string;
  consumer_name: string;
  zone: Zone;
  current_consumption: number;
  avg_consumption: number;
  increase_percent: number;
  risk_level: 'Normal' | 'Medium' | 'High' | 'Critical';
  meter_status: string;
  reading_timestamp: string;
}
