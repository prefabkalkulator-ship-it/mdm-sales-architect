import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const inputFile = path.join(process.cwd(), 'src/data/pricing.xlsx');
const outputFile = path.join(process.cwd(), 'src/data/pricing_data.csv');

try {
    if (!fs.existsSync(inputFile)) {
        console.error(`Input file not found: ${inputFile}`);
        process.exit(1);
    }

    const workbook = XLSX.readFile(inputFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    fs.writeFileSync(outputFile, csvContent);
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
} catch (error) {
    console.error('Error converting file:', error);
    process.exit(1);
}
