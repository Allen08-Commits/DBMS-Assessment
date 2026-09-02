import { Connection, MeterReading, Bill, Payment, Complaint, Operator } from '../types';

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    connection_id: 'CON10001',
    consumer_name: 'Arjun Kumar',
    connection_type: 'Household',
    zone: 'Zone A',
    address: '42, Lakeview Apartments, Indiranagar',
    meter_number: 'MTR-A-8821',
    status: 'Active',
    created_at: '2023-01-15 08:30:00'
  },
  {
    connection_id: 'CON10002',
    consumer_name: 'Priya Sharma',
    connection_type: 'Household',
    zone: 'Zone B',
    address: '108, Palm Grove Residency, Koramangala',
    meter_number: 'MTR-B-9912',
    status: 'Active',
    created_at: '2023-02-10 10:15:00'
  },
  {
    connection_id: 'CON10003',
    consumer_name: 'Green Mall Commercial Complex',
    connection_type: 'Commercial',
    zone: 'Zone A',
    address: 'Plot 7A, MG Road Commercial Hub',
    meter_number: 'MTR-A-1024',
    status: 'Active',
    created_at: '2022-11-05 14:00:00'
  },
  {
    connection_id: 'CON10004',
    consumer_name: 'City Hospital Healthcare Center',
    connection_type: 'Commercial',
    zone: 'Zone C',
    address: '15, Health City Boulevard, Whitefield',
    meter_number: 'MTR-C-3309',
    status: 'Active',
    created_at: '2022-08-20 09:45:00'
  },
  {
    connection_id: 'CON10005',
    consumer_name: 'Rohan Das',
    connection_type: 'Household',
    zone: 'Zone D',
    address: '12, Sunrise Enclave, Jayanagar',
    meter_number: 'MTR-D-5541',
    status: 'Active',
    created_at: '2023-03-12 11:20:00'
  },
  {
    connection_id: 'CON10006',
    consumer_name: 'Dr. Ananya Ray',
    connection_type: 'Household',
    zone: 'Zone A',
    address: '77, Magnolia Lane, Indiranagar',
    meter_number: 'MTR-A-7740',
    status: 'Active',
    created_at: '2023-04-01 16:30:00'
  },
  {
    connection_id: 'CON10007',
    consumer_name: 'Apex Infotech Park',
    connection_type: 'Commercial',
    zone: 'Zone B',
    address: 'Tower 3, Cyber Tech Zone, Koramangala',
    meter_number: 'MTR-B-6623',
    status: 'Active',
    created_at: '2022-09-18 12:00:00'
  },
  {
    connection_id: 'CON10008',
    consumer_name: 'Suresh Patel',
    connection_type: 'Household',
    zone: 'Zone C',
    address: '9, Green Meadow Colony, Whitefield',
    meter_number: 'MTR-C-4411',
    status: 'Active',
    created_at: '2023-05-14 15:40:00'
  },
  {
    connection_id: 'CON10009',
    consumer_name: 'St. Jude Educational Institute',
    connection_type: 'Institutional',
    zone: 'Zone D',
    address: '88, Campus Road, Jayanagar',
    meter_number: 'MTR-D-2299',
    status: 'Active',
    created_at: '2022-06-10 10:00:00'
  },
  {
    connection_id: 'CON10010',
    consumer_name: 'Vikram Joshi',
    connection_type: 'Household',
    zone: 'Zone A',
    address: '34, Crystal Springs Villa, Indiranagar',
    meter_number: 'MTR-A-9011',
    status: 'Active',
    created_at: '2023-06-22 13:10:00'
  },
  {
    connection_id: 'CON10011',
    consumer_name: 'Zenith Beverages Manufacturing',
    connection_type: 'Industrial',
    zone: 'Zone B',
    address: 'Industrial Plot 45, Phase 2, Koramangala',
    meter_number: 'MTR-B-1190',
    status: 'Active',
    created_at: '2022-04-15 08:00:00'
  },
  {
    connection_id: 'CON10012',
    consumer_name: 'Meera Nambiar',
    connection_type: 'Household',
    zone: 'Zone C',
    address: '56, Orchid Heights, Whitefield',
    meter_number: 'MTR-C-8877',
    status: 'Active',
    created_at: '2023-07-09 11:30:00'
  },
  {
    connection_id: 'CON10013',
    consumer_name: 'Grand Horizon Luxury Hotel',
    connection_type: 'Commercial',
    zone: 'Zone D',
    address: '101, Central Boulevard, Jayanagar',
    meter_number: 'MTR-D-9988',
    status: 'Active',
    created_at: '2022-10-01 09:00:00'
  },
  {
    connection_id: 'CON10014',
    consumer_name: 'Kavita Sundaram',
    connection_type: 'Household',
    zone: 'Zone A',
    address: '23, Silver Oak Court, Indiranagar',
    meter_number: 'MTR-A-3321',
    status: 'Active',
    created_at: '2023-08-15 14:20:00'
  },
  {
    connection_id: 'CON10015',
    consumer_name: 'Alok Verma',
    connection_type: 'Household',
    zone: 'Zone B',
    address: '67, Windmill Gardens, Koramangala',
    meter_number: 'MTR-B-4432',
    status: 'Suspended',
    created_at: '2023-09-01 10:45:00'
  },
  {
    connection_id: 'CON10016',
    consumer_name: 'Metropolitan Metro Depot',
    connection_type: 'Institutional',
    zone: 'Zone C',
    address: 'Station Road, Whitefield Hub',
    meter_number: 'MTR-C-7765',
    status: 'Active',
    created_at: '2022-03-12 17:00:00'
  },
  {
    connection_id: 'CON10017',
    consumer_name: 'Sunita Reddy',
    connection_type: 'Household',
    zone: 'Zone D',
    address: '81, Blossom Haven, Jayanagar',
    meter_number: 'MTR-D-6654',
    status: 'Active',
    created_at: '2023-10-10 09:30:00'
  },
  {
    connection_id: 'CON10018',
    consumer_name: 'Precision Auto Works',
    connection_type: 'Industrial',
    zone: 'Zone A',
    address: 'Shed 12, Auto Complex, Indiranagar',
    meter_number: 'MTR-A-5590',
    status: 'Active',
    created_at: '2022-05-20 11:15:00'
  },
  {
    connection_id: 'CON10019',
    consumer_name: 'Rajesh Gopinath',
    connection_type: 'Household',
    zone: 'Zone B',
    address: '14, Willow Creek, Koramangala',
    meter_number: 'MTR-B-2245',
    status: 'Active',
    created_at: '2023-11-04 15:00:00'
  },
  {
    connection_id: 'CON10020',
    consumer_name: 'Blue Star Textile Mill',
    connection_type: 'Industrial',
    zone: 'Zone C',
    address: 'Fabric Zone, Shed 4A, Whitefield',
    meter_number: 'MTR-C-1133',
    status: 'Active',
    created_at: '2022-01-30 08:30:00'
  },
  {
    connection_id: 'CON10021',
    consumer_name: 'Deepak Choudhury',
    connection_type: 'Household',
    zone: 'Zone D',
    address: '92, Pinecrest Villa, Jayanagar',
    meter_number: 'MTR-D-4488',
    status: 'Active',
    created_at: '2023-12-01 12:40:00'
  },
  {
    connection_id: 'CON10022',
    consumer_name: 'Unity Public School',
    connection_type: 'Institutional',
    zone: 'Zone A',
    address: '18, Wisdom Way, Indiranagar',
    meter_number: 'MTR-A-7711',
    status: 'Active',
    created_at: '2022-07-15 10:20:00'
  },
  {
    connection_id: 'CON10023',
    consumer_name: 'Shalini Murthy',
    connection_type: 'Household',
    zone: 'Zone B',
    address: '55, Green Glen Layout, Bellandur',
    meter_number: 'MTR-B-8833',
    status: 'Active',
    created_at: '2023-05-18 11:00:00'
  }
];

// Helper to generate realistic readings for past 7 days across connections
export const generateInitialReadings = (): MeterReading[] => {
  const readings: MeterReading[] = [];
  const baseDate = new Date('2026-08-31T20:00:00Z');
  let readingCounter = 9001;

  INITIAL_CONNECTIONS.forEach((conn) => {
    // Generate 6 timestamps for each connection (past 6 hourly / periodic cycles)
    for (let i = 5; i >= 0; i--) {
      const time = new Date(baseDate.getTime() - i * 4 * 3600 * 1000);
      const timeStr = time.toISOString().replace('T', ' ').substring(0, 19);
      
      let baseConsumption = 250; // liters
      if (conn.connection_type === 'Commercial') baseConsumption = 1800;
      if (conn.connection_type === 'Industrial') baseConsumption = 4500;
      if (conn.connection_type === 'Institutional') baseConsumption = 2200;

      // Intentional leak anomalies for testing leak detection:
      // CON10003 has severe spike, CON10008 has high pipe burst spike
      let consumption = Math.round(baseConsumption * (0.85 + Math.random() * 0.3));
      let status: MeterReading['meter_status'] = 'Normal';

      if (conn.connection_id === 'CON10003' && i <= 1) {
        consumption = 5400; // 3x average!
        status = 'Leak Suspected';
      } else if (conn.connection_id === 'CON10008' && i <= 1) {
        consumption = 890; // > 3x household avg!
        status = 'Leak Suspected';
      } else if (conn.connection_id === 'CON10015') {
        consumption = 0;
        status = 'Faulty';
      } else if (conn.connection_id === 'CON10011' && i === 0) {
        consumption = 8900;
        status = 'High Flow';
      }

      readings.push({
        reading_id: `RDG${readingCounter++}`,
        connection_id: conn.connection_id,
        reading_timestamp: timeStr,
        consumption_litres: consumption,
        meter_status: status,
        zone: conn.zone
      });
    }
  });

  return readings;
};

export const INITIAL_READINGS: MeterReading[] = generateInitialReadings();

export const INITIAL_BILLS: Bill[] = [
  {
    bill_id: 'BIL-202607-001',
    connection_id: 'CON10001',
    billing_month: '2026-07',
    previous_reading: 1420,
    current_reading: 1640,
    units_consumed: 220,
    amount: 680,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:00:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-002',
    connection_id: 'CON10002',
    billing_month: '2026-07',
    previous_reading: 980,
    current_reading: 1140,
    units_consumed: 160,
    amount: 440,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:05:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-003',
    connection_id: 'CON10003',
    billing_month: '2026-07',
    previous_reading: 5500,
    current_reading: 6350,
    units_consumed: 850,
    amount: 4300,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:10:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-004',
    connection_id: 'CON10004',
    billing_month: '2026-07',
    previous_reading: 4200,
    current_reading: 4780,
    units_consumed: 580,
    amount: 2680,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:15:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-005',
    connection_id: 'CON10005',
    billing_month: '2026-07',
    previous_reading: 810,
    current_reading: 905,
    units_consumed: 95,
    amount: 190,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:20:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-006',
    connection_id: 'CON10006',
    billing_month: '2026-07',
    previous_reading: 1100,
    current_reading: 1350,
    units_consumed: 250,
    amount: 800,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:25:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-007',
    connection_id: 'CON10007',
    billing_month: '2026-07',
    previous_reading: 7800,
    current_reading: 9100,
    units_consumed: 1300,
    amount: 7000,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:30:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-008',
    connection_id: 'CON10008',
    billing_month: '2026-07',
    previous_reading: 670,
    current_reading: 840,
    units_consumed: 170,
    amount: 480,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:35:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-009',
    connection_id: 'CON10009',
    billing_month: '2026-07',
    previous_reading: 3400,
    current_reading: 3950,
    units_consumed: 550,
    amount: 2500,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:40:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-010',
    connection_id: 'CON10010',
    billing_month: '2026-07',
    previous_reading: 1250,
    current_reading: 1370,
    units_consumed: 120,
    amount: 280,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:45:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-011',
    connection_id: 'CON10011',
    billing_month: '2026-07',
    previous_reading: 15400,
    current_reading: 18200,
    units_consumed: 2800,
    amount: 16000,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:50:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-012',
    connection_id: 'CON10012',
    billing_month: '2026-07',
    previous_reading: 890,
    current_reading: 1040,
    units_consumed: 150,
    amount: 400,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 09:55:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-013',
    connection_id: 'CON10013',
    billing_month: '2026-07',
    previous_reading: 6200,
    current_reading: 7150,
    units_consumed: 950,
    amount: 4900,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 10:00:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-014',
    connection_id: 'CON10014',
    billing_month: '2026-07',
    previous_reading: 540,
    current_reading: 630,
    units_consumed: 90,
    amount: 180,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 10:05:00',
    generated_by: 'ADMIN001',
    version: 2
  },
  {
    bill_id: 'BIL-202607-015',
    connection_id: 'CON10015',
    billing_month: '2026-07',
    previous_reading: 310,
    current_reading: 310,
    units_consumed: 0,
    amount: 50,
    due_amount: 0,
    bill_status: 'PAID',
    generated_at: '2026-08-01 10:10:00',
    generated_by: 'ADMIN001',
    version: 2
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    payment_id: 'PAY-5001',
    bill_id: 'BIL-202607-001',
    connection_id: 'CON10001',
    payment_date: '2026-08-05 11:20:30',
    amount: 680,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-9920193'
  },
  {
    payment_id: 'PAY-5002',
    bill_id: 'BIL-202607-002',
    connection_id: 'CON10002',
    payment_date: '2026-08-06 14:10:15',
    amount: 440,
    payment_method: 'Net Banking',
    transaction_reference: 'TXN-NB-4482011'
  },
  {
    payment_id: 'PAY-5003',
    bill_id: 'BIL-202607-003',
    connection_id: 'CON10003',
    payment_date: '2026-08-10 16:45:00',
    amount: 4300,
    payment_method: 'Credit Card',
    transaction_reference: 'TXN-CC-8827164'
  },
  {
    payment_id: 'PAY-5004',
    bill_id: 'BIL-202607-004',
    connection_id: 'CON10004',
    payment_date: '2026-08-08 11:15:00',
    amount: 2680,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-4491028'
  },
  {
    payment_id: 'PAY-5005',
    bill_id: 'BIL-202607-005',
    connection_id: 'CON10005',
    payment_date: '2026-08-04 09:30:10',
    amount: 190,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-3310944'
  },
  {
    payment_id: 'PAY-5006',
    bill_id: 'BIL-202607-006',
    connection_id: 'CON10006',
    payment_date: '2026-08-09 15:20:00',
    amount: 800,
    payment_method: 'Debit Card',
    transaction_reference: 'TXN-DC-7740192'
  },
  {
    payment_id: 'PAY-5007',
    bill_id: 'BIL-202607-007',
    connection_id: 'CON10007',
    payment_date: '2026-08-12 10:15:22',
    amount: 7000,
    payment_method: 'Net Banking',
    transaction_reference: 'TXN-NB-7729104'
  },
  {
    payment_id: 'PAY-5008',
    bill_id: 'BIL-202607-008',
    connection_id: 'CON10008',
    payment_date: '2026-08-11 12:45:00',
    amount: 480,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-8819201'
  },
  {
    payment_id: 'PAY-5009',
    bill_id: 'BIL-202607-009',
    connection_id: 'CON10009',
    payment_date: '2026-08-08 12:00:00',
    amount: 2500,
    payment_method: 'Debit Card',
    transaction_reference: 'TXN-DC-1192834'
  },
  {
    payment_id: 'PAY-5010',
    bill_id: 'BIL-202607-010',
    connection_id: 'CON10010',
    payment_date: '2026-08-07 15:30:40',
    amount: 280,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-6648291'
  },
  {
    payment_id: 'PAY-5011',
    bill_id: 'BIL-202607-011',
    connection_id: 'CON10011',
    payment_date: '2026-08-15 17:10:00',
    amount: 16000,
    payment_method: 'Net Banking',
    transaction_reference: 'TXN-NB-9902183'
  },
  {
    payment_id: 'PAY-5012',
    bill_id: 'BIL-202607-012',
    connection_id: 'CON10012',
    payment_date: '2026-08-10 14:00:00',
    amount: 400,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-5520194'
  },
  {
    payment_id: 'PAY-5013',
    bill_id: 'BIL-202607-013',
    connection_id: 'CON10013',
    payment_date: '2026-08-09 13:40:50',
    amount: 4900,
    payment_method: 'Credit Card',
    transaction_reference: 'TXN-CC-4401928'
  },
  {
    payment_id: 'PAY-5014',
    bill_id: 'BIL-202607-014',
    connection_id: 'CON10014',
    payment_date: '2026-08-03 10:55:12',
    amount: 180,
    payment_method: 'Cash',
    transaction_reference: 'TXN-CSH-5501923'
  },
  {
    payment_id: 'PAY-5015',
    bill_id: 'BIL-202607-015',
    connection_id: 'CON10015',
    payment_date: '2026-08-06 16:30:00',
    amount: 50,
    payment_method: 'UPI',
    transaction_reference: 'TXN-UPI-1192033'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    complaint_id: 'CMP3001',
    connection_id: 'CON10003',
    complaint_type: 'Leak',
    description: 'Main basement supply pipeline shows abnormal water pressure and visible seepage near feeder valve.',
    status: 'In Progress',
    priority: 'Critical',
    created_at: '2026-08-28 08:30:00',
    updated_at: '2026-08-29 11:00:00',
    assigned_to: 'ENG002 - Rajesh Nair',
    version: 2
  },
  {
    complaint_id: 'CMP3002',
    connection_id: 'CON10008',
    complaint_type: 'Leak',
    description: 'Underground meter chamber flooded with high flow sound even when household valves are shut.',
    status: 'Open',
    priority: 'High',
    created_at: '2026-08-30 14:15:00',
    updated_at: '2026-08-30 14:15:00',
    version: 1
  },
  {
    complaint_id: 'CMP3003',
    connection_id: 'CON10015',
    complaint_type: 'Meter Fault',
    description: 'Digital smart meter display is blank and not sending telemetry pulses since suspension notice.',
    status: 'Open',
    priority: 'Medium',
    created_at: '2026-08-27 10:00:00',
    updated_at: '2026-08-27 10:00:00',
    version: 1
  },
  {
    complaint_id: 'CMP3004',
    connection_id: 'CON10004',
    complaint_type: 'Low Water Pressure',
    description: 'Low inlet water pressure in hospital overhead header tank during peak operating hours (08:00 - 12:00).',
    status: 'In Progress',
    priority: 'High',
    created_at: '2026-08-26 16:40:00',
    updated_at: '2026-08-27 09:20:00',
    assigned_to: 'ENG004 - Sneha Kulkarni',
    version: 2
  },
  {
    complaint_id: 'CMP3005',
    connection_id: 'CON10006',
    complaint_type: 'Billing Dispute',
    description: 'Consumer claims billing units exceeded historical household average by 30% without increase in occupancy.',
    status: 'Open',
    priority: 'Low',
    created_at: '2026-08-29 13:10:00',
    updated_at: '2026-08-29 13:10:00',
    version: 1
  },
  {
    complaint_id: 'CMP3006',
    connection_id: 'CON10011',
    complaint_type: 'Supply Interruption',
    description: 'Sudden flow cutoff in industrial sector branch line for 45 minutes during evening shift.',
    status: 'Resolved',
    priority: 'Critical',
    created_at: '2026-08-25 18:00:00',
    updated_at: '2026-08-26 02:30:00',
    assigned_to: 'ENG001 - Mohan Kumar',
    version: 3
  },
  {
    complaint_id: 'CMP3007',
    connection_id: 'CON10002',
    complaint_type: 'Other',
    description: 'Request for secondary check valve installation before consumer internal plumbing junction.',
    status: 'Resolved',
    priority: 'Low',
    created_at: '2026-08-20 11:20:00',
    updated_at: '2026-08-22 15:45:00',
    assigned_to: 'ENG003 - David Paul',
    version: 2
  },
  {
    complaint_id: 'CMP3008',
    connection_id: 'CON10013',
    complaint_type: 'Low Water Pressure',
    description: 'Hotel cooling tower intake line requires minimum 3.5 bar pressure; currently measuring 1.8 bar.',
    status: 'In Progress',
    priority: 'Medium',
    created_at: '2026-08-28 17:30:00',
    updated_at: '2026-08-29 10:15:00',
    assigned_to: 'ENG002 - Rajesh Nair',
    version: 2
  },
  {
    complaint_id: 'CMP3009',
    connection_id: 'CON10018',
    complaint_type: 'Meter Fault',
    description: 'Optical pulse sensor miscounting during rapid water demand cycles.',
    status: 'Open',
    priority: 'Medium',
    created_at: '2026-08-30 09:15:00',
    updated_at: '2026-08-30 09:15:00',
    version: 1
  },
  {
    complaint_id: 'CMP3010',
    connection_id: 'CON10022',
    complaint_type: 'Supply Interruption',
    description: 'Water supply pipeline valve scheduled maintenance notice required for school campus reservoir filling.',
    status: 'Open',
    priority: 'Low',
    created_at: '2026-08-31 08:00:00',
    updated_at: '2026-08-31 08:00:00',
    version: 1
  }
];

export const INITIAL_OPERATORS: Operator[] = [
  {
    operator_id: 'ADMIN001',
    operator_name: 'Dr. S. K. Narayana (Chief Engineer)',
    zone: 'All Zones',
    role: 'ADMIN',
    email: 'admin.narayana@waterboard.gov.in'
  },
  {
    operator_id: 'BILL001',
    operator_name: 'Ramesh Varma',
    zone: 'Zone A',
    role: 'BILLING_OPERATOR',
    email: 'ramesh.billing@waterboard.gov.in'
  },
  {
    operator_id: 'ENG001',
    operator_name: 'Mohan Kumar',
    zone: 'Zone B',
    role: 'FIELD_ENGINEER',
    email: 'mohan.eng@waterboard.gov.in'
  },
  {
    operator_id: 'CMP001',
    operator_name: 'Anita Sen',
    zone: 'All Zones',
    role: 'COMPLAINT_OPERATOR',
    email: 'anita.complaints@waterboard.gov.in'
  }
];
