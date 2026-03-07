import { Request, Response } from "express";
import { generateCatalogCSV } from "./product.catalog.service";

export const exportCatalogCSV = async (req: Request, res: Response) => {
  try {
    const data = await generateCatalogCSV();
    
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
  } catch (error) {
    res.status(500).json({ success: false, message: "CSV export failed", error });
  }
};
