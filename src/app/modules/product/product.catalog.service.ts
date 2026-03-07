import { ProductModel } from "./product.model";

export const generateCatalogCSV = async () => {
  const products = await ProductModel.find({ "description.status": "publish" })
    .populate("brandAndCategories.brand")
    .populate("brandAndCategories.categories")
    .populate("brandAndCategories.tags")
    .lean();

  return products.map((p: any) => ({
    id: p._id,
    title: p.description?.name || "",
    description: p.description?.description || "",
    availability: p.productInfo?.quantity > 0 ? "in stock" : "out of stock",
    condition: "new",
    price: `${p.productInfo?.price || 0}.00 BDT`,
    link: `${process.env.FRONTEND_URL || "https://milkomart.com"}/product/${p.description?.slug || p._id}`,
    image_link: p.featuredImg || "",
    brand: p.brandAndCategories?.brand?.name || "",
    google_product_category: p.brandAndCategories?.categories?.[0]?.name || "",
    fb_product_category: p.brandAndCategories?.categories?.[0]?.name || "",
    quantity_to_sell_on_facebook: p.productInfo?.quantity || 0,
    sale_price: p.productInfo?.salePrice ? `${p.productInfo.salePrice}.00 BDT` : "",
    sale_price_effective_date: "2025-01-01T00:00+06:00/2025-12-31T23:59+06:00",
    item_group_id: `group_${p._id}`,
    gender: "unisex",
    color: p.specifications?.find((s: any) => s.key?.toLowerCase() === "color")?.value || "Multi",
    size: p.specifications?.find((s: any) => s.key?.toLowerCase() === "size")?.value || "Standard",
    age_group: "adult",
    material: p.specifications?.find((s: any) => s.key?.toLowerCase() === "material")?.value || "Premium Quality",
    pattern: "Solid",
    shipping: "BD::Cash on Delivery:0.00 BDT",
    shipping_weight: `${p.productInfo?.length || 0}x${p.productInfo?.width || 0}x${p.productInfo?.height || 0} cm`,
    "video[0].url": p.video || "",
    "video[0].tag[0]": p.brandAndCategories?.tags?.[0]?.name || "",
    gtin: p.productInfo?.sku || "",
    "product_tags[0]": p.brandAndCategories?.tags?.[0]?.name || "",
    "product_tags[1]": p.brandAndCategories?.tags?.[1]?.name || "",
    "style[0]": "Modern",
  }));
};
