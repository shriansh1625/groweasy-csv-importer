#!/usr/bin/env node
/** Generates real-world messy CSV files for stress testing. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'demo', 'csvs', 'real-world');

mkdirSync(OUT, { recursive: true });

const files = {
  'hubspot-export.csv': `Record ID,First Name,Last Name,Email,Phone Number,Lead Status,Create Date,Original Source
1,Alice,Johnson,alice@hubspot-demo.com,+1 555-2001,NEW,2024-01-15 10:00:00,ORGANIC_SEARCH
2,Bob,Smith,,+1 555-2002,OPEN,2024-01-16 11:30:00,PAID_SEARCH
3,Carol,White,carol@hubspot-demo.com,,IN_PROGRESS,2024-01-17 09:15:00,SOCIAL_MEDIA`,

  'salesforce-leads.csv': `Lead ID,FirstName,LastName,Email,Phone,Company,LeadSource,Status,OwnerId
00Q1,John,Doe,john@sfdc.com,555-3001,Acme Corp,Web,Open - Not Contacted,005xx
00Q2,Jane,Smith,jane@sfdc.com,555-3002,Beta LLC,Partner Referral,Working - Contacted,005xy
00Q3,,Unknown,invalid,,Gamma Inc,Cold Call,Closed - Not Converted,005xx`,

  'zoho-crm-export.csv': `Lead Name,Email,Phone,Lead Source,Lead Owner,Lead Status,Industry
Raj Malhotra,raj@zoho.in,9876543210,Website,Rahul Shah,Contacted,Real Estate
Priya Nair,priya@zoho.in,,Referral,Anita Rao,Not Contacted,IT
Vikram Singh,vikram@zoho.in,8765432109,Facebook,Suresh Patel,Qualified,Finance`,

  'facebook-leads-realistic.csv': `id,created_time,ad_name,adset_name,campaign_name,form_name,is_organic,platform,full_name,email,phone_number,city,state,country
l:123,2024-06-01 08:12:34,Summer Promo,Lookalike 1%,Q2 Leads,Meridian Tower Form,false,fb,John Doe,john@gmail.com,+1 555-4001,Austin,TX,US
l:124,2024-06-02 14:22:11,Retargeting,Website Visitors,Q2 Leads,Meridian Tower Form,false,fb,Jane Smith,jane@yahoo.com,5554002,Dallas,TX,US
l:125,2024-06-03 09:05:00,Brand Awareness,Broad,Q2 Leads,Eden Park Form,true,fb,Carlos Ruiz,carlos@email.com,+52 55 1234 5678,CDMX,CMX,MX`,

  'google-ads-realistic.csv': `Google Click ID,Conversion Time,Conversion Value,Conversion Currency,User Email,User Phone,Keyword,Match Type,Device,Campaign
CjwKCAiAx,2024-06-01 12:00:00,1,USD,alex@ads.com,+44 7700 900123,buy apartment london,Exact,Mobile,UK Search
CjwKCAiAy,2024-06-02 15:30:00,1,USD,,+1 555-5001,real estate investment,Phrase,Desktop,US Search
CjwKCAiAz,2024-06-03 08:45:00,1,USD,sophie@ads.fr,06 12 34 56 78,appartement paris,Broad,Tablet,FR Search`,

  'excel-messy-export.csv': `"Lead Name","EMAIL ADDRESS","☎ Contact","Whatsapp Number","Sales Rep","Interested?"
"John Doe","john@excel.com","555-6001","555-6001","Alice","Yes"
"Jane Smith","jane@excel.com","555-6002","","Bob","Maybe"
"","","555-6003","555-6003","Carol","No"`,

  'horrible-headers-mixed.csv': `Name,EMAIL ADDRESS,☎ Contact,Whatsapp Number,Lead Name,Mobile No.,Sales Rep,Interested?,नाम,फ़ोन,ईमेल
John Doe,john@horrible.com,555-7001,555-7001,John D,555-7001,Alice,Yes,जॉन डो,555-7001,john@horrible.com
Jane Smith,JANE@HORRIBLE.COM,555-7002,,Jane S,,Bob,No,जेन स्मिथ,555-7002,jane@horrible.com
,,555-7003,555-7003,,555-7003,Carol,Maybe,,,`,

  'duplicate-mixed-columns.csv': `name,Name,NAME,email,Email,EMAIL,phone,Phone
John,john@dup.com,john@dup.com,john@dup.com,555-8001,555-8001,555-8001
Jane,jane@dup.com,jane@dup.com,jane@dup.com,555-8002,555-8002,555-8002`,

  'rtl-arabic-headers.csv': `الاسم,البريد,الهاتف,Company,Notes
محمد أحمد,mohammed@email.ae,+971 50 123 4567,Emirates LLC,Interested in villa
فاطمة علي,fatima@email.ae,+971 55 987 6543,Dubai Properties,Follow up Friday`,

  'european-semicolon.csv': `Nom;Email;Téléphone;Entreprise;Statut
Jean Dupont;jean@email.fr;06 12 34 56 78;Société FR;Nouveau
Hans Müller;hans@email.de;+49 170 1234567;Firma GmbH;Kontaktiert`,

  'agency-chaos.csv': `,,,,
Lead ID,Contact,Email / Phone,Owner,Status,Notes
LD-001,Rajesh Kumar,raj@agency.in / 9876501234,Priya,Hot,Callback Monday
LD-002,Sneha Reddy,sneha@gmail.com,Amit,Warm,
LD-003,Vikram,,Rahul,Cold,Wrong number
,,,,
LD-004,Deepa Nair,deepa@outlook.com,Anita,Hot,Booked site visit`,
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content, 'utf8');
}

console.log(`Generated ${String(Object.keys(files).length)} real-world CSV files in demo/csvs/real-world/`);
