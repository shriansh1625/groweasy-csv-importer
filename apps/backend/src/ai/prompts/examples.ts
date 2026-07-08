/** Few-shot examples: input headers+row → expected output fragment. Progressively harder. */

export interface FewShotExample {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  source: string;
  input: { headers: string[]; row: Record<string, string> };
  output: {
    fields: Record<string, { value: string | null; confidence: number }>;
    warnings?: Array<{ code: string; message: string; field?: string }>;
  };
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    id: 'ex01_facebook_export',
    difficulty: 'easy',
    source: 'Facebook Lead Ads',
    input: { headers: ['full_name', 'email', 'phone_number'], row: { full_name: 'John Smith', email: 'john@example.com', phone_number: '555-0100' } },
    output: { fields: { fullName: { value: 'John Smith', confidence: 98 }, email: { value: 'john@example.com', confidence: 100 }, phone: { value: '+15550100', confidence: 92 } } },
  },
  {
    id: 'ex02_google_ads',
    difficulty: 'easy',
    source: 'Google Ads',
    input: { headers: ['Name', 'Email', 'Phone'], row: { Name: 'Jane Doe', Email: 'JANE@EXAMPLE.COM', Phone: '+1 555 0101' } },
    output: { fields: { fullName: { value: 'Jane Doe', confidence: 95 }, email: { value: 'jane@example.com', confidence: 100 }, phone: { value: '+15550101', confidence: 95 } } },
  },
  {
    id: 'ex03_excel_sheet',
    difficulty: 'easy',
    source: 'Excel export',
    input: { headers: ['First Name', 'Last Name', 'Company', 'Mobile'], row: { 'First Name': 'Priya', 'Last Name': 'Sharma', Company: 'TCS', Mobile: '9876543210' } },
    output: { fields: { firstName: { value: 'Priya', confidence: 95 }, lastName: { value: 'Sharma', confidence: 95 }, company: { value: 'TCS', confidence: 90 }, phone: { value: '+919876543210', confidence: 90 }, phoneCountryCode: { value: '+91', confidence: 88 }, mobileWithoutCountryCode: { value: '9876543210', confidence: 88 } } },
  },
  {
    id: 'ex04_real_estate_crm',
    difficulty: 'medium',
    source: 'Real Estate CRM',
    input: { headers: ['Lead Name', 'Project', 'Status', 'Sales Rep'], row: { 'Lead Name': 'Raj Kumar', Project: 'Meridian Tower', Status: 'Good Lead - Follow Up', 'Sales Rep': 'Alice' } },
    output: { fields: { fullName: { value: 'Raj Kumar', confidence: 95 }, dataSource: { value: 'meridian_tower', confidence: 92 }, crmStatus: { value: 'GOOD_LEAD_FOLLOW_UP', confidence: 90 }, leadOwner: { value: 'Alice', confidence: 85 } } },
  },
  {
    id: 'ex05_agency_export',
    difficulty: 'medium',
    source: 'Agency CRM',
    input: { headers: ['Client', 'E-mail', 'WhatsApp', 'Assigned To'], row: { Client: 'María García', 'E-mail': 'maria@test.com', WhatsApp: '+34 612 345 678', 'Assigned To': 'Carlos RM' } },
    output: { fields: { fullName: { value: 'María García', confidence: 95 }, email: { value: 'maria@test.com', confidence: 100 }, phone: { value: '+34612345678', confidence: 92 }, leadOwner: { value: 'Carlos RM', confidence: 88 } } },
  },
  {
    id: 'ex06_manual_spreadsheet',
    difficulty: 'medium',
    source: 'Manual spreadsheet',
    input: { headers: ['name', 'mail', 'tel'], row: { name: 'bob jones', mail: 'bob@corp.com', tel: 'invalid-phone' } },
    output: { fields: { fullName: { value: 'Bob Jones', confidence: 88 }, email: { value: 'bob@corp.com', confidence: 100 }, phone: { value: null, confidence: 0 } }, warnings: [{ code: 'INVALID_PHONE', message: 'Could not normalize tel column', field: 'phone' }] },
  },
  {
    id: 'ex07_broken_headers',
    difficulty: 'hard',
    source: 'Broken export',
    input: { headers: ['Nmae', 'Emial', 'Phne'], row: { Nmae: 'Test User', Emial: 'not-an-email', Phne: '123' } },
    output: { fields: { fullName: { value: 'Test User', confidence: 75 }, email: { value: null, confidence: 0 }, phone: { value: null, confidence: 0 } }, warnings: [{ code: 'INVALID_EMAIL', message: 'Rejected invalid email syntax', field: 'email' }] },
  },
  {
    id: 'ex08_duplicate_columns',
    difficulty: 'hard',
    source: 'Duplicate headers',
    input: { headers: ['Email', 'email', 'Name'], row: { Email: 'primary@test.com', email: 'backup@test.com', Name: 'Dual Email Lead' } },
    output: {
      fields: { fullName: { value: 'Dual Email Lead', confidence: 95 }, email: { value: 'primary@test.com', confidence: 85 }, notes: { value: 'Secondary email: backup@test.com', confidence: 80 } },
      warnings: [{ code: 'AMBIGUOUS_COLUMN', message: 'Two email columns present; selected first as primary', field: 'email' }],
    },
  },
  {
    id: 'ex09_multiple_phones',
    difficulty: 'hard',
    source: 'Multiple contacts',
    input: { headers: ['Name', 'Mobile', 'Office Phone'], row: { Name: 'Corp Lead', Mobile: '9876543210', 'Office Phone': '080-1234567' } },
    output: { fields: { fullName: { value: 'Corp Lead', confidence: 95 }, phone: { value: '+919876543210', confidence: 90 }, notes: { value: 'Secondary phone: 080-1234567', confidence: 75 } } },
  },
  {
    id: 'ex10_multiple_emails',
    difficulty: 'hard',
    source: 'Multiple emails',
    input: { headers: ['Contact', 'Work Email', 'Personal Email'], row: { Contact: 'Exec Lead', 'Work Email': 'exec@company.com', 'Personal Email': 'exec@gmail.com' } },
    output: { fields: { fullName: { value: 'Exec Lead', confidence: 90 }, email: { value: 'exec@company.com', confidence: 92 }, notes: { value: 'Secondary email: exec@gmail.com', confidence: 78 } } },
  },
  {
    id: 'ex11_international_names',
    difficulty: 'hard',
    source: 'International',
    input: { headers: ['氏名', 'メール', '電話'], row: { '氏名': '田中太郎', 'メール': 'tanaka@example.jp', '電話': '090-1234-5678' } },
    output: { fields: { fullName: { value: '田中太郎', confidence: 95 }, email: { value: 'tanaka@example.jp', confidence: 100 }, phone: { value: '+819012345678', confidence: 88 } } },
  },
  {
    id: 'ex12_messy_formatting',
    difficulty: 'hard',
    source: 'Messy data',
    input: { headers: ['  NAME  ', 'EMAIL ADDRESS', 'PHONE '], row: { '  NAME  ': '  messy   data  ', 'EMAIL ADDRESS': '  TEST@EXAMPLE.COM  ', 'PHONE ': '(555) 010-9999' } },
    output: { fields: { fullName: { value: 'messy data', confidence: 85 }, email: { value: 'test@example.com', confidence: 100 }, phone: { value: '+15550109999', confidence: 90 } } },
  },
  {
    id: 'ex13_blank_values',
    difficulty: 'medium',
    source: 'Sparse row',
    input: { headers: ['Name', 'Email', 'Phone', 'Company'], row: { Name: 'Sparse Lead', Email: '', Phone: '', Company: '' } },
    output: { fields: { fullName: { value: 'Sparse Lead', confidence: 95 }, email: { value: null, confidence: 0 }, phone: { value: null, confidence: 0 }, company: { value: null, confidence: 0 } } },
  },
  {
    id: 'ex14_mixed_language',
    difficulty: 'extreme',
    source: 'Mixed language',
    input: { headers: ['Nombre', 'Correo', 'Estado', 'Fuente'], row: { Nombre: 'Carlos Ruiz', Correo: 'carlos@empresa.es', Estado: 'No contesta', Fuente: 'Eden Park' } },
    output: { fields: { fullName: { value: 'Carlos Ruiz', confidence: 95 }, email: { value: 'carlos@empresa.es', confidence: 100 }, crmStatus: { value: 'DID_NOT_CONNECT', confidence: 88 }, dataSource: { value: 'eden_park', confidence: 90 } } },
  },
  {
    id: 'ex15_abbreviations',
    difficulty: 'extreme',
    source: 'Abbreviated CRM',
    input: { headers: ['FN', 'LN', 'Co', 'Stat', 'Src'], row: { FN: 'Amy', LN: 'Wong', Co: 'Planet Express', Stat: 'WON', Src: 'LOD' } },
    output: { fields: { firstName: { value: 'Amy', confidence: 80 }, lastName: { value: 'Wong', confidence: 80 }, company: { value: 'Planet Express', confidence: 75 }, crmStatus: { value: 'SALE_DONE', confidence: 82 }, dataSource: { value: 'leads_on_demand', confidence: 78 } } },
  },
  {
    id: 'ex16_placeholder_rejection',
    difficulty: 'extreme',
    source: 'Placeholder data',
    input: { headers: ['Name', 'Email', 'Phone'], row: { Name: 'Test', Email: 'test@test.com', Phone: '0000000000' } },
    output: { fields: { fullName: { value: 'Test', confidence: 70 }, email: { value: null, confidence: 0 }, phone: { value: null, confidence: 0 } }, warnings: [{ code: 'PLACEHOLDER_REJECTED', message: 'Rejected placeholder email and phone', field: 'email' }] },
  },
  {
    id: 'ex17_status_variations',
    difficulty: 'extreme',
    source: 'Status mapping',
    input: { headers: ['Lead', 'Disposition'], row: { Lead: 'Cold Lead', Disposition: 'not interested - wrong number' } },
    output: { fields: { fullName: { value: 'Cold Lead', confidence: 85 }, crmStatus: { value: 'BAD_LEAD', confidence: 88 } } },
  },
  {
    id: 'ex18_excel_serial_date',
    difficulty: 'extreme',
    source: 'Excel serial',
    input: { headers: ['Name', 'Created Date'], row: { Name: 'Date Lead', 'Created Date': '45292' } },
    output: { fields: { fullName: { value: 'Date Lead', confidence: 90 }, notes: { value: 'Created Date normalized: 2023-12-15', confidence: 70 } } },
  },
];

export function getExamplesForVersion(version: 'v1' | 'v2' | 'experimental'): FewShotExample[] {
  switch (version) {
    case 'v1':
      return FEW_SHOT_EXAMPLES.slice(0, 3);
    case 'v2':
      return FEW_SHOT_EXAMPLES.slice(0, 8);
    case 'experimental':
      return FEW_SHOT_EXAMPLES;
    default:
      return FEW_SHOT_EXAMPLES.slice(0, 8);
  }
}

export function serializeExamples(examples: FewShotExample[]): string {
  return JSON.stringify(
    examples.map((ex) => ({
      id: ex.id,
      difficulty: ex.difficulty,
      source: ex.source,
      input: ex.input,
      expected: ex.output,
    })),
  );
}
