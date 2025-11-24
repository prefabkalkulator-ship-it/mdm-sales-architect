"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xlsx_1 = require("xlsx");
var fs = require("fs");
var path = require("path");
var inputFile = path.join(process.cwd(), 'src/data/pricing.xlsx');
var outputFile = path.join(process.cwd(), 'src/data/pricing_data.csv');
try {
    if (!fs.existsSync(inputFile)) {
        console.error("Input file not found: ".concat(inputFile));
        process.exit(1);
    }
    var workbook = xlsx_1.default.readFile(inputFile);
    var sheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[sheetName];
    var csvContent = xlsx_1.default.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(outputFile, csvContent);
    console.log("Successfully converted ".concat(inputFile, " to ").concat(outputFile));
}
catch (error) {
    console.error('Error converting file:', error);
    process.exit(1);
}
