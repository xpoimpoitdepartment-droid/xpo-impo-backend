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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("../app/config");
const category_model_1 = require("../app/modules/category/category.model");
const campaign_model_1 = require("../app/modules/campaign/campaign.model");
const product_model_1 = require("../app/modules/product/product.model");
const shop_model_1 = require("../app/modules/shop/shop.model");
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const categories = [
    {
        name: "Grocery",
        details: "Everyday grocery essentials for your home.",
        image: image("photo-1542838132-92c53300491e"),
        bannerImg: image("photo-1601598851547-4302969d7d0c"),
        sortOrder: 1,
    },
    {
        name: "Accessories",
        details: "Useful and stylish accessories for everyday life.",
        image: image("photo-1523779917675-b6ed3a42a561"),
        bannerImg: image("photo-1492707892479-7bc8d5a4ee93"),
        sortOrder: 2,
    },
    {
        name: "Men's Collection",
        details: "Modern clothing and essentials for men.",
        image: image("photo-1617137968427-85924c800a22"),
        bannerImg: image("photo-1483985988355-763728e1935b"),
        sortOrder: 3,
    },
    {
        name: "Honey & Natural Foods",
        details: "Pure honey and naturally sourced food products.",
        image: image("photo-1587049352846-4a222e784d38"),
        bannerImg: image("photo-1471943311424-646960669fbc"),
        sortOrder: 4,
    },
    {
        name: "Beauty & Personal Care",
        details: "Daily care products for a healthier self-care routine.",
        image: image("photo-1596462502278-27bfdc403348"),
        bannerImg: image("photo-1556228578-8c89e6adf883"),
        sortOrder: 5,
    },
    {
        name: "Home & Kitchen",
        details: "Practical products to make your home more comfortable.",
        image: image("photo-1556911220-e15b29be8c8f"),
        bannerImg: image("photo-1556910103-1c02745aea4d"),
        sortOrder: 6,
    },
];
const catalog = {
    Grocery: [
        "Premium Basmati Rice",
        "Red Lentils",
        "Whole Wheat Flour",
        "Fortified Soybean Oil",
        "Organic Green Tea",
        "Roasted Cashews",
        "Brown Sugar",
        "Instant Oats",
        "Arabica Coffee",
        "Mixed Nuts",
    ],
    Accessories: [
        "Leather Wallet",
        "Canvas Backpack",
        "Classic Sunglasses",
        "Minimalist Wrist Watch",
        "Cotton Cap",
        "Travel Belt",
        "Card Holder",
        "Silicone Phone Case",
        "Stainless Water Bottle",
        "Key Organizer",
    ],
    "Men's Collection": [
        "Oxford Casual Shirt",
        "Slim Fit Chino Pant",
        "Premium Polo Shirt",
        "Classic Denim Jacket",
        "Regular Fit Jeans",
        "Linen Panjabi",
        "Cotton Jogger",
        "Formal Dress Shirt",
        "Lightweight Hoodie",
        "Basic Crew Neck T-Shirt",
    ],
    "Honey & Natural Foods": [
        "Sundarban Raw Honey",
        "Litchi Blossom Honey",
        "Black Seed Honey",
        "Honeycomb Jar",
        "Organic Chia Seeds",
        "Premium Dates",
        "Coconut Sugar",
        "Turmeric Powder",
        "Natural Peanut Butter",
        "Apple Cider Vinegar",
    ],
    "Beauty & Personal Care": [
        "Aloe Vera Face Wash",
        "Vitamin C Serum",
        "Rose Water Toner",
        "Coconut Hair Oil",
        "Moisturizing Body Lotion",
        "Herbal Shampoo",
        "Sunscreen SPF 50",
        "Charcoal Face Mask",
        "Lip Care Balm",
        "Hand Wash",
    ],
    "Home & Kitchen": [
        "Non-stick Frying Pan",
        "Bamboo Cutting Board",
        "Glass Storage Jar",
        "Cotton Kitchen Towel",
        "Electric Spice Grinder",
        "Ceramic Dinner Set",
        "Stainless Steel Colander",
        "Reusable Food Container",
        "Wooden Serving Tray",
        "Silicone Baking Mat",
    ],
};
const variableCategories = new Set(["Accessories", "Men's Collection"]);
const colors = ["Black", "Navy", "White"];
const sizes = ["S", "M", "L", "XL"];
const productImages = [
    "photo-1521572163474-6864f9cf17ab",
    "photo-1542291026-7eec264c27ff",
    "photo-1551488831-00ddcb6c6bd3",
    "photo-1525507119028-ed4c629a60a3",
    "photo-1551486850-8c5a7f8f8d6b",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1529139574466-a303027c1d8b",
    "photo-1506629905607-d9c297d7a4e7",
    "photo-1496747611176-843222e1e57c",
    "photo-1485968579580-b6d095142e6e",
];
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const createVariants = (name, index) => {
    const attributes = [
        { name: "Color", values: colors },
        { name: "Size", values: sizes },
    ];
    const price = 900 + index * 75;
    const variants = colors.flatMap((color, colorIndex) => sizes.map((size, sizeIndex) => ({
        attributes: { Color: color, Size: size },
        price: price + colorIndex * 50,
        salePrice: price - 100 + colorIndex * 50,
        quantity: 12,
        sku: `${slugify(name).slice(0, 12).toUpperCase()}-${colorIndex + 1}${sizeIndex + 1}`,
    })));
    return { attributes, variants };
};
function seedCatalog() {
    return __awaiter(this, void 0, void 0, function* () {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error("DATABASE_URL is not configured.");
        }
        yield mongoose_1.default.connect(databaseUrl);
        try {
            yield product_model_1.ProductModel.deleteMany({});
            yield category_model_1.CategoryModel.deleteMany({});
            yield campaign_model_1.CampaignModel.deleteMany({});
            yield shop_model_1.ShopModel.updateMany({}, { $set: { products: [] } });
            const createdCategories = yield category_model_1.CategoryModel.insertMany(categories.map((category) => (Object.assign(Object.assign({}, category), { slug: slugify(category.name), icon: { name: "shopping-bag", url: category.image }, subCategories: [] }))));
            const products = createdCategories.flatMap((category, categoryIndex) => {
                const names = catalog[category.name];
                return names.map((name, productIndex) => {
                    const isVariable = variableCategories.has(category.name);
                    const variantData = isVariable
                        ? createVariants(name, productIndex)
                        : { attributes: [], variants: [] };
                    const price = 250 + categoryIndex * 125 + productIndex * 35;
                    const productType = isVariable ? "variable" : "simple";
                    return {
                        featuredImg: image(productImages[productIndex]),
                        gallery: [],
                        brandAndCategories: { categories: [category._id], tags: [] },
                        description: {
                            name,
                            slug: slugify(name),
                            unit: isVariable ? "piece" : "pack",
                            description: `${name} - quality ${category.name.toLowerCase()} product.`,
                            status: "publish",
                        },
                        productType,
                        productInfo: {
                            price,
                            salePrice: price - Math.round(price * 0.1),
                            quantity: isVariable ? 0 : 100,
                            sku: `${slugify(name).slice(0, 16).toUpperCase()}-${categoryIndex + 1}${productIndex + 1}`,
                            isExternal: false,
                        },
                        attributes: variantData.attributes,
                        variants: variantData.variants,
                        specifications: [{ key: "Quality", value: "Premium" }],
                        commission: {
                            regularType: "percentage",
                            regularValue: 5,
                            retailType: "percentage",
                            retailValue: 7,
                            allowManualOverride: false,
                        },
                        sortOrder: productIndex + 1,
                    };
                });
            });
            yield product_model_1.ProductModel.insertMany(products);
            console.log(`Seeded ${createdCategories.length} categories and ${products.length} products.`);
            console.log("Variable products: Accessories and Men's Collection; other categories use simple products.");
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
seedCatalog().catch((error) => {
    console.error("Catalog seed failed:", error);
    process.exitCode = 1;
});
