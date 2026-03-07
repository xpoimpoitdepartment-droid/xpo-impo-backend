"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCatalogCSV = void 0;
const product_catalog_service_1 = require("./product.catalog.service");
const exportCatalogCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, product_catalog_service_1.generateCatalogCSV)();
        if (!data.length) {
            return res.status(404).json({ success: false, message: "No products found" });
        }
        const csv = [
            Object.keys(data[0]).join(","),
            ...data.map((row) => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=product-catalog.csv");
        res.send(csv);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "CSV export failed", error });
    }
});
exports.exportCatalogCSV = exportCatalogCSV;
