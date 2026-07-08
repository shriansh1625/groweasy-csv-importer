#!/usr/bin/env node
/**
 * Generates realistic demo CSV files for reviewer testing.
 * Run: node scripts/generate-demo-csvs.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO_DIR = join(__dirname, '..', 'demo', 'csvs');

mkdirSync(DEMO_DIR, { recursive: true });

const files = {
  '01-facebook-leads-standard.csv': `created_time,full_name,email,phone_number,form_name,platform
2024-03-15 09:12:00,John Doe,john.doe@gmail.com,+1 555-0100,Meridian Tower Lead Form,fb
2024-03-15 10:45:00,Jane Smith,jane.smith@yahoo.com,555-0101,Meridian Tower Lead Form,fb
2024-03-16 14:22:00,Carlos Mendez,carlos.m@outlook.com,+52 55 1234 5678,Eden Park Inquiry,fb
2024-03-17 08:05:00,Ananya Patel,ananya.p@gmail.com,9876543210,Sarjapur Plots,fb
2024-03-18 16:30:00,Robert Chen,robert.chen@company.com,555-0104,Meridian Tower Lead Form,fb`,

  '02-facebook-leads-messy-headers.csv': `Created Time,Full Name,Email Address,Phone,Ad Name,campaign_id,is_organic
03/15/2024 9:12 AM,John Doe,john@example.com,5550100,Meridian Ad,120334455,false
03/16/2024 2:30 PM,Jane Smith,,555-0101,Eden Park Ad,120334456,false
03/17/2024,N/A,invalid-email,not-a-phone,Test Ad,120334457,true`,

  '03-google-ads-leads.csv': `GCLID,Lead Email,Lead Phone,Conversion Name,Conversion Time,Keyword,Device
CjwKCAiA,alex.turner@email.com,+44 7700 900123,Lead Form Submit,2024-04-01 11:23:45,buy apartment london,Mobile
CjwKCAiB,sophie.martin@free.fr,06 12 34 56 78,Lead Form Submit,2024-04-02 09:15:22,appartement paris,Desktop
CjwKCAiC,,+1-555-0199,Lead Form Submit,2024-04-03 14:00:00,real estate investment,Tablet`,

  '04-google-ads-export-utf8.csv': `Date,Customer Name,Email,Phone Number,City,State,Country,Lead Status
2024-05-01,Müller Hans,hans.muller@web.de,+49 30 12345678,Berlin,BE,Germany,New
2024-05-02,María García,maria.garcia@email.es,+34 612 345 678,Madrid,MD,Spain,Contacted
2024-05-03,田中太郎,tanaka@example.jp,+81 90-1234-5678,Tokyo,TK,Japan,Qualified`,

  '05-excel-export.csv': `"First Name","Last Name","Email Address","Mobile","Company Name","Job Title","Created Date"
"Alice","Johnson","alice.j@corp.com","555-0200","Acme Corp","Director","01/15/2024"
"Bob","Williams","bob.w@startup.io","555-0201","StartupIO","CEO","01/16/2024"
"Charlie","Brown","charlie@test.com","555-0202","Test LLC","Manager","01/17/2024"`,

  '06-agency-crm-export.csv': `Lead ID,Contact Name,Email,Mobile,Lead Owner,Source,Campaign,Status,Notes
LD-1001,Rajesh Kumar,rajesh.k@domain.in,9876501234,Priya Sharma,Facebook Ads,Meridian Q1,GOOD_LEAD_FOLLOW_UP,Interested in 3BHK
LD-1002,Sneha Reddy,sneha.r@gmail.com,8765432109,Amit Patel,Google Ads,Eden Park Search,DID_NOT_CONNECT,Called twice no answer
LD-1003,Vikram Singh,,7654321098,Priya Sharma,Referral,Walk-in,BAD_LEAD,Wrong number
LD-1004,Deepa Nair,deepa.n@outlook.com,6543210987,Amit Patel,Facebook Ads,Sarjapur Plots,SALE_DONE,Booked unit A-1204`,

  '07-real-estate-crm.csv': `Property,Client Name,Email,Phone,Sales Rep,CRM Status,Data Source,City,Budget
Meridian Tower,Aisha Khan,aisha.k@email.com,+91 9988776655,Rahul Mehta,GOOD_LEAD_FOLLOW_UP,meridian_tower,Mumbai,1.2 Cr
Eden Park,Vikram Desai,vikram.d@gmail.com,9988776654,Anita Rao,DID_NOT_CONNECT,eden_park,Bangalore,85 L
Sarjapur Plots,Meera Iyer,meera.i@yahoo.com,8877665544,Rahul Mehta,SALE_DONE,sarjapur_plots,Hyderabad,45 L`,

  '08-broken-headers-typos.csv': `Nmae,Emial,Phne,Compny,Statu
John Doe,john@test.com,5550300,Acme Inc,Active
Jane Smith,jane@test.com,5550301,Beta LLC,Pending
,empty@test.com,5550302,Gamma Co,Active`,

  '09-duplicate-headers.csv': `Name,Email,Phone,Name,Email,Notes
John Doe,john@dup.com,5550400,John D.,john.d@alt.com,VIP client
Jane Smith,jane@dup.com,5550401,Jane S.,jane.s@work.com,Follow up Monday`,

  '10-mixed-date-formats.csv': `Name,Email,Phone,Signup Date,Last Contact
Alice Brown,alice@dates.com,5550500,2024-01-15,15-Jan-2024
Bob Green,bob@dates.com,5550501,01/20/2024,2024-01-20T14:30:00Z
Carol White,carol@dates.com,5550502,20.03.2024,Mar 20 2024`,

  '11-international-names.csv': `Full Name,Email,Phone,Country,Language
Nguyễn Văn An,an.nguyen@email.vn,+84 912 345 678,Vietnam,Vietnamese
François Müller,francois@email.fr,+33 6 12 34 56 78,France,French
Алексей Иванов,alexey@mail.ru,+7 916 123 4567,Russia,Russian
Mohammed Al-Rashid,m.alrashid@email.ae,+971 50 123 4567,UAE,Arabic`,

  '12-unicode-emoji.csv': `Name,Email,Phone,Notes,Rating
Sarah ✨,sarah@emoji.com,5550600,Loves 🏠 properties,⭐⭐⭐⭐⭐
Mike 🚀,mike@emoji.com,5550601,Interested in 📍 downtown,⭐⭐⭐
Lisa 💼,lisa@emoji.com,5550602,CFO at 🏢 TechCorp,⭐⭐⭐⭐`,

  '13-mixed-languages.csv': `Nombre,Correo,Telefono,Empresa,Notas
Juan García,juan@email.es,+34 612 345 678,Empresa SA,Interesado en apartamento
Marie Dubois,marie@email.fr,06 12 34 56 78,Société FR,Recherche maison
Hans Schmidt,hans@email.de,+49 170 1234567,Firma GmbH,Wohnung gesucht`,

  '14-blank-rows.csv': `Name,Email,Phone,Company

John Doe,john@blank.com,5550700,Acme

,,,

Jane Smith,jane@blank.com,5550701,Beta`,

  '15-duplicate-rows.csv': `Name,Email,Phone,Source
John Doe,john@dup.com,5550800,Facebook
Jane Smith,jane@dup.com,5550801,Google
John Doe,john@dup.com,5550800,Facebook
John Doe,john@dup.com,5550800,Facebook
Bob Wilson,bob@dup.com,5550802,Referral`,

  '16-messy-formatting.csv': `  Name  ,  Email  , Phone , Company 
" John ""Johnny"" Doe ",john@messy.com," 555-0900 ", " Acme, Inc. "
Jane Smith,jane@messy.com,555-0901,  Beta LLC  
  ,  spaces@test.com  ,555-0902,  Gamma  `,

  '17-formula-injection.csv': `Name,Email,Phone,Notes
=SUM(A1:A10),normal@test.com,5551000,Normal row
+1234567890,plus@test.com,5551001,Phone starts with plus
-100,minus@test.com,5551002,Negative value
@SUM(A1),at@test.com,5551003,At prefix
Normal User,normal2@test.com,5551004,Clean row`,

  '18-international-phones.csv': `Name,Email,Phone,Country Code
US Contact,us@test.com,+1 (555) 123-4567,+1
UK Contact,uk@test.com,+44 7700 900123,+44
India Contact,in@test.com,+91 98765 43210,+91
Germany Contact,de@test.com,+49 170 1234567,+49
Japan Contact,jp@test.com,+81 90-1234-5678,+81
Brazil Contact,br@test.com,+55 11 91234-5678,+55`,

  '19-empty-columns.csv': `Name,Email,Phone,Extra1,Extra2,Extra3,Extra4
John Doe,john@empty.com,5551100,,,,
Jane Smith,jane@empty.com,5551101,,,,value
Bob Wilson,bob@empty.com,5551102,,,,`,

  '20-tiny-two-row.csv': `Name,Email
Alice,alice@tiny.com
Bob,bob@tiny.com`,

  '21-tab-separated.csv': `Name\tEmail\tPhone\tCompany
Tab User One\ttab1@test.com\t5551200\tTabCorp
Tab User Two\ttab2@test.com\t5551201\tTabInc`,

  '22-trailing-commas.csv': `Name,Email,Phone,Company,
John Doe,john@trail.com,5551300,Acme,
Jane Smith,jane@trail.com,5551301,Beta,`,

  '23-quoted-fields-multiline.csv': `Name,Email,Phone,Address
"John Doe",john@quote.com,5551400,"123 Main St
Apt 4B"
"Jane Smith",jane@quote.com,5551401,"456 Oak Ave"`,

  '24-salesforce-style.csv': `Lead Source,First Name,Last Name,Email,Phone,Lead Status,Owner Alias,Created Date
Web,Thomas,Anderson,t.anderson@matrix.com,5551500,Open - Not Contacted,jdoe,2024-06-01
Partner Referral,Trinity,Unknown,trinity@matrix.com,5551501,Working - Contacted,jsmith,2024-06-02
Cold Call,Morpheus,Free,morpheus@matrix.com,5551502,Closed - Converted,jdoe,2024-06-03`,

  '25-hubspot-export.csv': `Record ID,First Name,Last Name,Email,Phone Number,Lead Status,Lifecycle Stage,Original Source
10001,Emma,Watson,emma@hub.com,+1 555-1600,NEW,lead,ORGANIC_SEARCH
10002,Daniel,Radcliffe,daniel@hub.com,+1 555-1601,OPEN,lead,PAID_SEARCH
10003,Rupert,Grint,rupert@hub.com,,IN_PROGRESS,lead,SOCIAL_MEDIA`,
};

// Generate large CSV programmatically
const largeRows = ['Name,Email,Phone,Company,City,Lead Owner,Status,Source'];
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'David', 'Linda'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const owners = ['Priya Sharma', 'Amit Patel', 'Rahul Mehta', 'Anita Rao'];
const statuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
const sources = ['Facebook Ads', 'Google Ads', 'Referral', 'Walk-in'];

for (let i = 0; i < 200; i += 1) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const name = `${fn} ${ln}`;
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${String(i)}@demo.com`;
  const phone = `555${String(2000 + i).padStart(4, '0')}`;
  const company = `Company ${String(i % 20)}`;
  const city = cities[i % cities.length];
  const owner = owners[i % owners.length];
  const status = statuses[i % statuses.length];
  const source = sources[i % sources.length];
  largeRows.push(`${name},${email},${phone},${company},${city},${owner},${status},${source}`);
}

files['26-large-dataset-200-rows.csv'] = largeRows.join('\n');

for (const [filename, content] of Object.entries(files)) {
  writeFileSync(join(DEMO_DIR, filename), content, 'utf8');
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: Object.keys(files).length,
  files: Object.keys(files).map((name) => ({
    name,
    description: name.replace(/^\d+-/, '').replace('.csv', '').replace(/-/g, ' '),
  })),
};

writeFileSync(join(DEMO_DIR, '..', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Generated ${String(Object.keys(files).length)} demo CSV files in demo/csvs/`);
