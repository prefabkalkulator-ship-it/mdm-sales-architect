"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var app = (0, express_1.default)();
var PORT = parseInt(process.env.PORT || '8080');
// Serve static files from the current directory (since server.js will be in dist)
app.use(express_1.default.static(__dirname));
// Handle SPA routing: return index.html for all non-static requests
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
app.listen(PORT, '0.0.0.0', function () {
    console.log("Server is running on port ".concat(PORT));
});
