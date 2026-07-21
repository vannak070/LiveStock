import * as fs from 'fs';
import * as path from 'path';
import { parseExcelDatabase } from '../lib/xlsx-parser';

const excelPath = "/Users/vannakath/Documents/Documents - Vannak’s MacBook Pro/Personal Info/SNR Farm/Sales Report/Update/Sale Tracking.xlsx";
const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'db.json');

console.log("Parsing Excel database...");
try {
  const data = parseExcelDatabase(excelPath);
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  console.log(`Database initialized successfully and saved to ${dbPath}`);
  console.log(`Stock count: ${data.stock.length}`);
  console.log(`Weight records: ${data.weightTracking.length}`);
  console.log(`Sales records: ${data.salesTracking.length}`);
} catch (error) {
  console.error("Failed to parse excel database:", error);
  process.exit(1);
}
