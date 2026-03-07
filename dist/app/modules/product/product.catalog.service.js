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
exports.generateCatalogCSV = void 0;
const product_model_1 = require("./product.model");
const generateCatalogCSV = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.ProductModel.find({ "description.status": "publish" })
        .populate("brandAndCategories.brand")
        .populate("brandAndCategories.categories")
        .populate("brandAndCategories.tags")
        .lean();
    return products.map((p) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
        return ({
            id: p._id,
            title: ((_a = p.description) === null || _a === void 0 ? void 0 : _a.name) || "",
            description: ((_b = p.description) === null || _b === void 0 ? void 0 : _b.description) || "",
            availability: ((_c = p.productInfo) === null || _c === void 0 ? void 0 : _c.quantity) > 0 ? "in stock" : "out of stock",
            condition: "new",
            price: `${((_d = p.productInfo) === null || _d === void 0 ? void 0 : _d.price) || 0}.00 BDT`,
            link: `${process.env.FRONTEND_URL || "https://milkomart.com"}/product/${((_e = p.description) === null || _e === void 0 ? void 0 : _e.slug) || p._id}`,
            image_link: p.featuredImg || "",
            brand: ((_g = (_f = p.brandAndCategories) === null || _f === void 0 ? void 0 : _f.brand) === null || _g === void 0 ? void 0 : _g.name) || "",
            google_product_category: ((_k = (_j = (_h = p.brandAndCategories) === null || _h === void 0 ? void 0 : _h.categories) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.name) || "",
            fb_product_category: ((_o = (_m = (_l = p.brandAndCategories) === null || _l === void 0 ? void 0 : _l.categories) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.name) || "",
            quantity_to_sell_on_facebook: ((_p = p.productInfo) === null || _p === void 0 ? void 0 : _p.quantity) || 0,
            sale_price: ((_q = p.productInfo) === null || _q === void 0 ? void 0 : _q.salePrice) ? `${p.productInfo.salePrice}.00 BDT` : "",
            sale_price_effective_date: "2025-01-01T00:00+06:00/2025-12-31T23:59+06:00",
            item_group_id: `group_${p._id}`,
            gender: "unisex",
            color: ((_s = (_r = p.specifications) === null || _r === void 0 ? void 0 : _r.find((s) => { var _a; return ((_a = s.key) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "color"; })) === null || _s === void 0 ? void 0 : _s.value) || "Multi",
            size: ((_u = (_t = p.specifications) === null || _t === void 0 ? void 0 : _t.find((s) => { var _a; return ((_a = s.key) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "size"; })) === null || _u === void 0 ? void 0 : _u.value) || "Standard",
            age_group: "adult",
            material: ((_w = (_v = p.specifications) === null || _v === void 0 ? void 0 : _v.find((s) => { var _a; return ((_a = s.key) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "material"; })) === null || _w === void 0 ? void 0 : _w.value) || "Premium Quality",
            pattern: "Solid",
            shipping: "BD::Cash on Delivery:0.00 BDT",
            shipping_weight: `${((_x = p.productInfo) === null || _x === void 0 ? void 0 : _x.length) || 0}x${((_y = p.productInfo) === null || _y === void 0 ? void 0 : _y.width) || 0}x${((_z = p.productInfo) === null || _z === void 0 ? void 0 : _z.height) || 0} cm`,
            "video[0].url": p.video || "",
            "video[0].tag[0]": ((_2 = (_1 = (_0 = p.brandAndCategories) === null || _0 === void 0 ? void 0 : _0.tags) === null || _1 === void 0 ? void 0 : _1[0]) === null || _2 === void 0 ? void 0 : _2.name) || "",
            gtin: ((_3 = p.productInfo) === null || _3 === void 0 ? void 0 : _3.sku) || "",
            "product_tags[0]": ((_6 = (_5 = (_4 = p.brandAndCategories) === null || _4 === void 0 ? void 0 : _4.tags) === null || _5 === void 0 ? void 0 : _5[0]) === null || _6 === void 0 ? void 0 : _6.name) || "",
            "product_tags[1]": ((_9 = (_8 = (_7 = p.brandAndCategories) === null || _7 === void 0 ? void 0 : _7.tags) === null || _8 === void 0 ? void 0 : _8[1]) === null || _9 === void 0 ? void 0 : _9.name) || "",
            "style[0]": "Modern",
        });
    });
});
exports.generateCatalogCSV = generateCatalogCSV;
