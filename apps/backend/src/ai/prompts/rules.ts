export interface FieldDefinition {
  purpose: string;
  expectedValues: string;
  aliases: string[];
  misspellings: string[];
  internationalVariations: string[];
  examples: string[];
  confidenceExpectation: string;
}

export const CRM_FIELD_DEFINITIONS: Record<string, FieldDefinition> = {
  fullName: {
    purpose: 'Primary contact name for the lead',
    expectedValues: 'Full person name; 2+ characters; no placeholders',
    aliases: [
      'Customer Name', 'Full Name', 'Lead', 'Prospect', 'Client', 'Visitor',
      'Contact Name', 'Name', 'Lead Name', 'Applicant',
    ],
    misspellings: ['Nmae', 'Nme', 'Custmer Name', 'Fullname'],
    internationalVariations: ['Nombre', 'Nom', 'Nome', '氏名', 'نام'],
    examples: ['John Smith', 'Priya Sharma', 'María García-López'],
    confidenceExpectation: '>90 when single clear name column; 70-90 if split across columns',
  },
  firstName: {
    purpose: 'Given name when full name is split',
    expectedValues: 'First/given name only',
    aliases: ['First Name', 'Given Name', 'Fname', 'Forename'],
    misspellings: ['Frist Name', 'Frst Name'],
    internationalVariations: ['Prénom', 'Nombre', '名'],
    examples: ['John', 'Priya', 'María'],
    confidenceExpectation: '>90 when dedicated column; blank if only fullName available',
  },
  lastName: {
    purpose: 'Family/surname when full name is split',
    expectedValues: 'Last/family name only',
    aliases: ['Last Name', 'Surname', 'Lname', 'Family Name'],
    misspellings: ['Lastname', 'Sirname'],
    internationalVariations: ['Apellido', '姓'],
    examples: ['Smith', 'Sharma', 'García-López'],
    confidenceExpectation: '>90 when dedicated column',
  },
  email: {
    purpose: 'Primary email address for outreach',
    expectedValues: 'Valid RFC5322-like email; lowercase; no placeholders',
    aliases: ['Email', 'E-mail', 'E mail', 'Mail', 'Primary Email', 'Email Address', 'Contact Email'],
    misspellings: ['Emial', 'Emali', 'Emai'],
    internationalVariations: ['Correo', 'Courriel', 'メール'],
    examples: ['john@example.com', 'priya.sharma@company.co.in'],
    confidenceExpectation: '100 when valid syntax; 0 for test@test, n/a, -, placeholder',
  },
  phone: {
    purpose: 'Primary phone/mobile for contact',
    expectedValues: 'E.164 preferred (+country+digits); min 7 digits',
    aliases: [
      'Phone', 'Mobile', 'WhatsApp', 'Cell', 'Contact', 'Telephone', 'Tel', '☎',
      'Phone Number', 'Mobile Number', 'Contact Number', 'Cell Phone',
    ],
    misspellings: ['Phne', 'Moblie', 'Telephon'],
    internationalVariations: ['Móvil', 'Téléphone', '電話', 'WhatsApp No'],
    examples: ['+1-555-0100', '9876543210', '+44 20 7946 0958'],
    confidenceExpectation: '>90 when valid; 0 for invalid/placeholder',
  },
  phoneCountryCode: {
    purpose: 'ISO country calling code extracted from phone',
    expectedValues: 'Digits with + prefix e.g. +1, +91, +44',
    aliases: ['Country Code', 'Dial Code', 'ISD Code'],
    misspellings: [],
    internationalVariations: ['Codigo Pais', 'Indicatif'],
    examples: ['+91', '+1', '+44'],
    confidenceExpectation: '>85 when derivable from phone; else blank',
  },
  mobileWithoutCountryCode: {
    purpose: 'National significant number without country code',
    expectedValues: 'Digits only, no spaces/hyphens',
    aliases: ['Local Number', 'Mobile Without Code'],
    misspellings: [],
    internationalVariations: [],
    examples: ['9876543210', '5550100'],
    confidenceExpectation: '>85 when derivable from phone; else blank',
  },
  company: {
    purpose: 'Organization/employer associated with lead',
    expectedValues: 'Company or business name',
    aliases: ['Company', 'Organization', 'Business', 'Employer', 'Firm', 'Account', 'Org'],
    misspellings: ['Compny', 'Comapny', 'Buisness'],
    internationalVariations: ['Empresa', 'Société', '会社'],
    examples: ['Acme Corp', 'Tata Consultancy Services'],
    confidenceExpectation: '>85 when clear; blank if ambiguous with title',
  },
  title: {
    purpose: 'Job title or role',
    expectedValues: 'Professional title string',
    aliases: ['Title', 'Job Title', 'Position', 'Role', 'Designation'],
    misspellings: ['Titile', 'Jop Title'],
    internationalVariations: ['Cargo', 'Poste'],
    examples: ['Sales Manager', 'CEO', 'Software Engineer'],
    confidenceExpectation: '>80 when dedicated column',
  },
  city: { purpose: 'City/locality', expectedValues: 'City name', aliases: ['City', 'Town', 'Locality', 'Municipality'], misspellings: ['Cty'], internationalVariations: ['Ciudad', 'Ville', 'Stadt'], examples: ['Bangalore', 'New York'], confidenceExpectation: '>85 when present' },
  state: { purpose: 'State/province/region', expectedValues: 'State or province name/code', aliases: ['State', 'Province', 'Region', 'County'], misspellings: [], internationalVariations: ['Estado', 'État', 'Bundesland'], examples: ['Karnataka', 'CA', 'NY'], confidenceExpectation: '>85 when present' },
  country: { purpose: 'Country', expectedValues: 'Country name or ISO code', aliases: ['Country', 'Nation'], misspellings: [], internationalVariations: ['País', 'Pays'], examples: ['India', 'US', 'IN'], confidenceExpectation: '>85 when present' },
  zipCode: { purpose: 'Postal/ZIP code', expectedValues: 'Postal code string', aliases: ['Zip', 'ZIP Code', 'Postal Code', 'Pincode', 'Post Code'], misspellings: ['Zipcode'], internationalVariations: ['CP', 'PLZ'], examples: ['560001', '90210'], confidenceExpectation: '>80 when valid format' },
  leadOwner: {
    purpose: 'Sales rep or account owner assigned to lead',
    expectedValues: 'Person name of assigned rep',
    aliases: ['Owner', 'Sales Rep', 'Assigned', 'Relationship Manager', 'Executive', 'Account Manager', 'RM', 'Assigned To'],
    misspellings: ['Owener', 'Sales Rep.'],
    internationalVariations: ['Responsable', 'Asignado'],
    examples: ['Alice Smith', 'Raj Kumar'],
    confidenceExpectation: '>85 when dedicated owner column',
  },
  crmStatus: {
    purpose: 'Lead disposition status in CRM pipeline',
    expectedValues: 'One of: GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE',
    aliases: ['Status', 'Lead Status', 'CRM Status', 'Disposition', 'Stage', 'Pipeline Stage'],
    misspellings: ['Staus', 'Statsu'],
    internationalVariations: [],
    examples: ['Good Lead - Follow Up', 'Did Not Connect', 'Sale Done', 'Bad Lead'],
    confidenceExpectation: '>90 only when maps to allowed enum; else null',
  },
  dataSource: {
    purpose: 'Origin/source campaign or property listing',
    expectedValues: 'One of: leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots',
    aliases: ['Source', 'Data Source', 'Campaign', 'Property', 'Project', 'Lead Source'],
    misspellings: [],
    internationalVariations: [],
    examples: ['Meridian Tower', 'Leads on Demand', 'Sarjapur Plots'],
    confidenceExpectation: '>90 only when maps to allowed enum; else null',
  },
  notes: {
    purpose: 'Free-text notes; append overflow from multiple emails/phones/companies',
    expectedValues: 'Concatenated secondary values and context',
    aliases: ['Notes', 'Comments', 'Description', 'Remarks', 'CRM Note', 'Additional Info'],
    misspellings: ['Nots'],
    internationalVariations: ['Notas', 'Remarques'],
    examples: ['Secondary email: backup@test.com', 'Also interested in 2BHK'],
    confidenceExpectation: 'N/A — informational',
  },
};

export const SEMANTIC_INFERENCE_RULES = `Column names are NOT fixed. Infer semantic meaning from headers and cell values.
Never require exact header matches. Use aliases, misspellings, and international variations listed per field.`;

export const AMBIGUITY_RULES = `If two columns equally match one field: do NOT guess. Leave field blank (null, confidence 0).
Emit warning { code: "AMBIGUOUS_COLUMN", message: "...", field: "..." }. Decrease confidence for affected fields.`;

export const MULTIPLE_VALUE_RULES = `When multiple emails, phones, companies, owners, or addresses exist:
Select the most likely PRIMARY value for the dedicated field.
Append remaining useful values to notes (crm_note) separated by "; ".
Never discard useful information.`;

export const DATE_RULES = `Date normalization: support ISO, DD/MM/YYYY, MM/DD/YYYY, UNIX timestamps, Excel serial dates, RFC2822, human-readable.
Output ISO 8601 date (YYYY-MM-DD) in value. Never invent dates. Blank if unparseable.`;

export const PHONE_RULES = `Phone normalization: strip spaces/hyphens/brackets; preserve + prefix for international.
Extract phoneCountryCode and mobileWithoutCountryCode when possible. Reject invalid numbers (blank, confidence 0).`;

export const EMAIL_RULES = `Email validation: reject invalid syntax, placeholder (test@test, n/a, -, none, null@null), dummy, obvious spam.
Lowercase valid emails. Blank + confidence 0 if invalid.`;

export const CRM_STATUS_MAPPING = `crmStatus mapping (never invent new statuses):
GOOD_LEAD_FOLLOW_UP ← "good lead", "follow up", "interested", "hot lead", "qualified", "callback", "warm"
DID_NOT_CONNECT ← "did not connect", "no answer", "not reachable", "rnr", "switched off", "busy", "no response"
BAD_LEAD ← "bad lead", "not interested", "junk", "wrong number", "invalid", "duplicate", "dnd"
SALE_DONE ← "sale done", "closed", "booked", "converted", "won", "deal closed", "purchased"`;

export const DATA_SOURCE_MAPPING = `dataSource mapping (never invent new sources):
leads_on_demand ← "leads on demand", "lod", "on demand"
meridian_tower ← "meridian tower", "meridian", "mt"
eden_park ← "eden park", "eden"
varah_swamy ← "varah swamy", "varah", "vs"
sarjapur_plots ← "sarjapur plots", "sarjapur", "sp"
If uncertain → null, confidence 0.`;

export function buildRulesPrompt(): string {
  const fieldBlocks = Object.entries(CRM_FIELD_DEFINITIONS)
    .map(([field, def]) => {
      return `[${field}] ${def.purpose}
Expected: ${def.expectedValues}
Aliases: ${def.aliases.join(', ')}
Misspellings: ${def.misspellings.join(', ') || 'none'}
International: ${def.internationalVariations.join(', ') || 'none'}
Examples: ${def.examples.join(', ')}
Confidence: ${def.confidenceExpectation}`;
    })
    .join('\n\n');

  return [
    SEMANTIC_INFERENCE_RULES,
    AMBIGUITY_RULES,
    MULTIPLE_VALUE_RULES,
    DATE_RULES,
    PHONE_RULES,
    EMAIL_RULES,
    CRM_STATUS_MAPPING,
    DATA_SOURCE_MAPPING,
    'FIELD DEFINITIONS:',
    fieldBlocks,
  ].join('\n\n');
}
