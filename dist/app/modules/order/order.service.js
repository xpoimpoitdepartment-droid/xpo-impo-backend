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
exports.orderServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const nanoid_1 = require("nanoid");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const product_model_1 = require("../product/product.model");
const user_model_1 = require("../user/user.model");
const order_consts_1 = require("./order.consts");
const order_model_1 = require("./order.model");
/**
 * ✅ Helper: Common populate configuration for all order queries
 */
const orderPopulateOptions = [
    {
        path: "orderBy", // ✅ Root-level field
        select: "name email",
    },
    {
        path: "orderInfo.productInfo", // ✅ Inside orderInfo array
        select: "description.name productInfo.price productInfo.salePrice productInfo.wholesalePrice featuredImg",
    },
    {
        path: "orderInfo.products.product", // ✅ products[] inside orderInfo[]
        select: "description.name productInfo.price productInfo.salePrice productInfo.wholesalePrice featuredImg",
    },
];
/**
 * ✅ Get All Orders
 */
const getAllOrdersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const orderQuery = new QueryBuilder_1.default(order_model_1.OrderModel.find().populate(orderPopulateOptions), query)
        .search(order_consts_1.OrderSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield orderQuery.modelQuery;
    return result;
});
/**
 * ✅ Get My Orders (for logged-in user)
 */
const getMyOrdersFromDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const orderQuery = new QueryBuilder_1.default(order_model_1.OrderModel.find({ orderBy: userId }).populate(orderPopulateOptions), query)
        .search(order_consts_1.OrderSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield orderQuery.modelQuery;
    return result;
});
/**
 * ✅ Get Single Order by ID
 */
const getSingleOrderFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_model_1.OrderModel.findById(id).populate(orderPopulateOptions);
    if (!result) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order does not exist!");
    }
    return result;
});
// 🔹 Get Commission Summary for a User
// const getUserCommissionSummaryFromDB = async (userId: string) => {
//   const orders = await OrderModel.find({
//     "orderInfo.orderBy": userId,
//   }).populate([
//     {
//       path: "orderInfo.productInfo",
//       select:
//         "productInfo.price productInfo.salePrice productInfo.retailPrice productInfo.wholeSalePrice productInfo.wholesalePrice description.name",
//     },
//     {
//       path: "orderInfo.products.product",
//       select:
//         "productInfo.price productInfo.salePrice productInfo.retailPrice productInfo.wholeSalePrice productInfo.wholesalePrice description.name",
//     },
//   ]);
//   if (!orders || orders.length === 0) {
//     throw new AppError(httpStatus.NOT_FOUND, "No orders found for this user");
//   }
//   let totalOrders = 0;
//   let completedOrders = 0;
//   let pendingOrders = 0;
//   let totalQuantity = 0; // ✅ Added this
//   let totalPercentageCommissionAmount = 0;
//   let totalFixedCommissionAmount = 0;
//   let totalPercentageRate = 0;
//   let percentageCommissionCount = 0;
//   let totalSaleAmount = 0;
//   let totalRetailAmount = 0;
//   let totalWholesaleAmount = 0;
//   // Helpers
//   const getSalePriceFromProduct = (prod: any) => {
//     const sale = prod?.productInfo?.salePrice;
//     const price = prod?.productInfo?.price;
//     if (typeof sale === "number" && sale > 0) return sale;
//     if (typeof price === "number") return price;
//     return 0;
//   };
//   const getRetailPriceFromProduct = (prod: any) => {
//     const retail = prod?.productInfo?.retailPrice;
//     return typeof retail === "number" && retail > 0 ? retail : 0;
//   };
//   const getWholesalePriceFromProduct = (prod: any) => {
//     const w1 = prod?.productInfo?.wholeSalePrice;
//     const w2 = prod?.productInfo?.wholesalePrice;
//     if (typeof w1 === "number" && w1 > 0) return w1;
//     if (typeof w2 === "number" && w2 > 0) return w2;
//     return 0;
//   };
//   // ===== Loop through all orders =====
//   for (const order of orders) {
//     for (const info of order.orderInfo) {
//       if (info.orderBy?.toString() !== userId) continue;
//       totalOrders++;
//       if (info.status === "paid") {
//         completedOrders++;
//         // ✅ Use totalQuantity everywhere for accurate totals
//         const qty = info.totalQuantity || info.quantity || 1;
//         totalQuantity += qty;
//         // Handle single product orderInfo.productInfo
//         if (info.productInfo) {
//           const prod = info.productInfo as any;
//           const salePrice = getSalePriceFromProduct(prod);
//           const retailPrice = getRetailPriceFromProduct(prod);
//           const wholesalePrice = getWholesalePriceFromProduct(prod);
//           totalSaleAmount += salePrice * qty;
//           totalRetailAmount += retailPrice * qty;
//           totalWholesaleAmount += wholesalePrice * qty;
//         }
//         // Handle multi-product orders
//         if (Array.isArray(info.products) && info.products.length > 0) {
//           for (const p of info.products) {
//             const prod = (p as any).product as any;
//             const pq = (p as any).quantity || 1;
//             totalQuantity += pq; // ✅ Add each sub-product quantity
//             const usedSalePrice =
//               typeof (p as any).price === "number" && (p as any).price > 0
//                 ? (p as any).price
//                 : getSalePriceFromProduct(prod);
//             const retailPrice =
//               typeof (p as any).retailPrice === "number" &&
//               (p as any).retailPrice > 0
//                 ? (p as any).retailPrice
//                 : getRetailPriceFromProduct(prod);
//             const wholesalePrice =
//               typeof (p as any).wholesalePrice === "number" &&
//               (p as any).wholesalePrice > 0
//                 ? (p as any).wholesalePrice
//                 : getWholesalePriceFromProduct(prod);
//             totalSaleAmount += usedSalePrice * pq;
//             totalRetailAmount += retailPrice * pq;
//             totalWholesaleAmount += wholesalePrice * pq;
//           }
//         }
//         // ✅ Commission calculation (use totalQuantity multiplier if needed)
//         if (info.commission?.type === "percentage") {
//           const commissionAmount = info.commission.amount || 0;
//           totalPercentageCommissionAmount += commissionAmount;
//           totalPercentageRate += info.commission.value || 0;
//           percentageCommissionCount++;
//         } else if (info.commission?.type === "fixed") {
//           const commissionAmount = info.commission.amount || 0;
//           totalFixedCommissionAmount += commissionAmount;
//         }
//       } else if (info.status === "pending") {
//         pendingOrders++;
//       }
//     }
//   }
//   const averagePercentageRate =
//     percentageCommissionCount > 0
//       ? totalPercentageRate / percentageCommissionCount
//       : 0;
//   const totalCommission =
//     totalPercentageCommissionAmount + totalFixedCommissionAmount;
//   return {
//     totalOrders,
//     completedOrders,
//     pendingOrders,
//     totalQuantity, // ✅ Added output field
//     totalCommission,
//     totalPercentageCommissionAmount,
//     totalFixedCommissionAmount,
//     averagePercentageRate,
//     totalSaleAmount,
//     totalRetailAmount,
//     totalWholesaleAmount,
//   };
// };
const getUserCommissionSummaryFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // ✅ Fetch all orders placed by the user
    const orders = yield order_model_1.OrderModel.find({
        orderBy: userId,
        status: "paid",
    }).populate([
        {
            path: "orderInfo.productInfo",
            select: "productInfo.price productInfo.salePrice productInfo.retailPrice productInfo.wholeSalePrice productInfo.wholesalePrice description.name",
        },
        {
            path: "orderInfo.products.product",
            select: "productInfo.price productInfo.salePrice productInfo.retailPrice productInfo.wholeSalePrice productInfo.wholesalePrice description.name",
        },
    ]);
    if (!orders || orders.length === 0) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "No orders found for this user");
    }
    let totalOrders = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let totalQuantity = 0;
    let totalPercentageCommissionAmount = 0;
    let totalFixedCommissionAmount = 0;
    let totalPercentageRate = 0;
    let percentageCommissionCount = 0;
    let totalSaleAmount = 0;
    let totalRetailAmount = 0;
    let totalWholesaleAmount = 0;
    // ===== Helper functions =====
    const getSalePriceFromProduct = (prod) => {
        var _a, _b;
        const sale = (_a = prod === null || prod === void 0 ? void 0 : prod.productInfo) === null || _a === void 0 ? void 0 : _a.salePrice;
        const price = (_b = prod === null || prod === void 0 ? void 0 : prod.productInfo) === null || _b === void 0 ? void 0 : _b.price;
        if (typeof sale === "number" && sale > 0)
            return sale;
        if (typeof price === "number")
            return price;
        return 0;
    };
    const getRetailPriceFromProduct = (prod) => {
        var _a;
        const retail = (_a = prod === null || prod === void 0 ? void 0 : prod.productInfo) === null || _a === void 0 ? void 0 : _a.retailPrice;
        return typeof retail === "number" && retail > 0 ? retail : 0;
    };
    const getWholesalePriceFromProduct = (prod) => {
        var _a, _b;
        const w1 = (_a = prod === null || prod === void 0 ? void 0 : prod.productInfo) === null || _a === void 0 ? void 0 : _a.wholeSalePrice;
        const w2 = (_b = prod === null || prod === void 0 ? void 0 : prod.productInfo) === null || _b === void 0 ? void 0 : _b.wholesalePrice;
        if (typeof w1 === "number" && w1 > 0)
            return w1;
        if (typeof w2 === "number" && w2 > 0)
            return w2;
        return 0;
    };
    // ===== Loop through all orders =====
    for (const order of orders) {
        totalOrders++;
        if (order.status === "paid") {
            completedOrders++;
        }
        else if (order.status === "pending") {
            pendingOrders++;
        }
        // Loop through orderInfo array for detailed calculation
        for (const info of order.orderInfo) {
            const qty = info.quantity || 1;
            totalQuantity += qty;
            // ✅ Handle single product
            if (info.productInfo) {
                const prod = info.productInfo;
                const salePrice = getSalePriceFromProduct(prod);
                const retailPrice = getRetailPriceFromProduct(prod);
                const wholesalePrice = getWholesalePriceFromProduct(prod);
                totalSaleAmount += salePrice * qty;
                totalRetailAmount += retailPrice * qty;
                totalWholesaleAmount += wholesalePrice * qty;
            }
            // ✅ Handle multiple products
            if (Array.isArray(info.products) && info.products.length > 0) {
                for (const p of info.products) {
                    const prod = p.product;
                    const pq = p.quantity || 1;
                    totalQuantity += pq;
                    const usedSalePrice = typeof p.price === "number" && p.price > 0
                        ? p.price
                        : getSalePriceFromProduct(prod);
                    const retailPrice = typeof p.retailPrice === "number" &&
                        p.retailPrice > 0
                        ? p.retailPrice
                        : getRetailPriceFromProduct(prod);
                    const wholesalePrice = typeof p.wholesalePrice === "number" &&
                        p.wholesalePrice > 0
                        ? p.wholesalePrice
                        : getWholesalePriceFromProduct(prod);
                    totalSaleAmount += usedSalePrice * pq;
                    totalRetailAmount += retailPrice * pq;
                    totalWholesaleAmount += wholesalePrice * pq;
                }
            }
            // ✅ Commission calculation
            if (((_a = info.commission) === null || _a === void 0 ? void 0 : _a.type) === "percentage") {
                const commissionAmount = info.commission.amount || 0;
                totalPercentageCommissionAmount += commissionAmount;
                totalPercentageRate += info.commission.value || 0;
                percentageCommissionCount++;
            }
            else if (((_b = info.commission) === null || _b === void 0 ? void 0 : _b.type) === "fixed") {
                const commissionAmount = info.commission.amount || 0;
                totalFixedCommissionAmount += commissionAmount;
            }
        }
    }
    const averagePercentageRate = percentageCommissionCount > 0
        ? totalPercentageRate / percentageCommissionCount
        : 0;
    const totalCommission = totalPercentageCommissionAmount + totalFixedCommissionAmount;
    return {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalQuantity,
        totalCommission,
        totalPercentageCommissionAmount,
        totalFixedCommissionAmount,
        averagePercentageRate,
        totalSaleAmount,
        totalRetailAmount,
        totalWholesaleAmount,
    };
});
/**
 * ✅ Get Overall Order Summary
 */
// const getOrderSummaryFromDB = async () => {
//   const summary = await OrderModel.aggregate([
//     { $unwind: "$orderInfo" }, // flatten each order item
//     {
//       $group: {
//         _id: null,
//         totalOrders: { $sum: 1 },
//         pendingOrders: {
//           $sum: {
//             $cond: [{ $eq: ["$orderInfo.status", "pending"] }, 1, 0],
//           },
//         },
//         paidOrders: {
//           $sum: {
//             $cond: [{ $eq: ["$orderInfo.status", "paid"] }, 1, 0],
//           },
//         },
//         customerOrders: {
//           $sum: {
//             $cond: [{ $eq: ["$orderInfo.userRole", "customer"] }, 1, 0],
//           },
//         },
//         srOrders: {
//           $sum: {
//             $cond: [{ $eq: ["$orderInfo.userRole", "sr"] }, 1, 0],
//           },
//         },
//         totalOrderSaleAmount: { $sum: "$totalAmount" },
//         totalPendingSale: {
//           $sum: {
//             $cond: [
//               { $eq: ["$orderInfo.status", "pending"] },
//               "$orderInfo.totalAmount.total",
//               0,
//             ],
//           },
//         },
//         totalPaidOrderSaleAmount: {
//           $sum: {
//             $cond: [
//               { $eq: ["$orderInfo.status", "paid"] },
//               "$orderInfo.totalAmount.total",
//               0,
//             ],
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         totalOrders: 1,
//         pendingOrders: 1,
//         paidOrders: 1,
//         customerOrders: 1,
//         srOrders: 1,
//         totalOrderSaleAmount: 1,
//         totalPendingSale: 1,
//         totalPaidOrderSaleAmount: 1,
//       },
//     },
//   ]);
//   return (
//     summary[0] || {
//       totalOrders: 0,
//       pendingOrders: 0,
//       paidOrders: 0,
//       customerOrders: 0,
//       srOrders: 0,
//       totalOrderSaleAmount: 0,
//       totalPendingSale: 0,
//       totalPaidOrderSaleAmount: 0,
//     }
//   );
// };
// const createOrderIntoDB = async (payload: TOrder) => {
//   if (payload) {
//     payload.orderInfo.forEach((order) => {
//       order.trackingNumber = nanoid();
//       // ✅ Handle user role fallback
//       if (!order.userRole) {
//         order.userRole = "customer"; // Default role if not provided
//       }
//       // Calculate commission if not already included
//       if (order.commission && order.totalAmount) {
//         if (order.commission.type === "percentage") {
//           order.commission.amount =
//             (order.totalAmount.total * order.commission.value) / 100;
//         } else if (order.commission.type === "fixed") {
//           order.commission.amount = order.commission.value;
//         }
//       }
//     });
//   }
//   const result = await OrderModel.create(payload);
//   return result;
// };
// const createOrderIntoDB = async (payload: TOrder) => {
//   if (payload && payload.orderInfo) {
//     for (const orderInfo of payload.orderInfo) {
//       // Generate tracking number
//       orderInfo.trackingNumber = nanoid();
//       // Set default user role
//       if (!orderInfo.userRole) {
//         orderInfo.userRole = "customer";
//       }
//       // ✅ FIX: Ensure products array exists and has data
//       if (!orderInfo.products || orderInfo.products.length === 0) {
//         // If no products in array, create one from the legacy productInfo field
//         if (orderInfo.productInfo) {
//           orderInfo.products = [
//             {
//               product: orderInfo.productInfo,
//               quantity: orderInfo.quantity || 1,
//               price: orderInfo.totalAmount?.subTotal || 0,
//               subtotal: orderInfo.totalAmount?.subTotal || 0,
//               // Add other product fields as needed
//             },
//           ];
//         }
//       }
//       // ✅ FIX: Calculate subtotal for each product in the products array
//       if (orderInfo.products && orderInfo.products.length > 0) {
//         for (const product of orderInfo.products) {
//           // If wholeSalePrice is provided, use it; otherwise use regular price
//           const unitPrice = product.wholeSalePrice || product.price;
//           product.subtotal = unitPrice * product.quantity;
//         }
//       }
//       // Calculate commission
//       if (orderInfo.commission && orderInfo.totalAmount) {
//         if (orderInfo.commission.type === "percentage") {
//           orderInfo.commission.amount =
//             (orderInfo.totalAmount.total * orderInfo.commission.value) / 100;
//         } else if (orderInfo.commission.type === "fixed") {
//           orderInfo.commission.amount = orderInfo.commission.value;
//         }
//       }
//     }
//   }
//   const result = await OrderModel.create(payload);
//   return result;
// };
/**
 * ✅ Get Overall Order Summary (fixed without double-counting)
 */
/**
 * ✅ Get Overall Order Summary (based on new Order Schema)
 * - Root-level: orderBy, userRole, status, totalAmount
 * - Nested: orderInfo[].totalAmount.total (for product-level totals)
 */
const getOrderSummaryFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    // Step 1️⃣: Aggregate top-level order stats
    const rootSummary = yield order_model_1.OrderModel.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
                paidOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
                },
                totalCancelledOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                },
                srCanceledOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$status", "cancelled"] },
                                    { $eq: ["$userRole", "sr"] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                customerCanceledOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$status", "cancelled"] },
                                    { $eq: ["$userRole", "customer"] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                todayTotalPaidOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$status", "paid"] },
                                    {
                                        $eq: [
                                            {
                                                $dateToString: {
                                                    format: "%Y-%m-%d",
                                                    date: "$createdAt",
                                                },
                                            },
                                            new Date().toISOString().split("T")[0],
                                        ],
                                    },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                todayTotalCanceledOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$status", "cancelled"] },
                                    {
                                        $eq: [
                                            {
                                                $dateToString: {
                                                    format: "%Y-%m-%d",
                                                    date: "$createdAt",
                                                },
                                            },
                                            new Date().toISOString().split("T")[0],
                                        ],
                                    },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                todayTotalSrOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$userRole", "sr"] },
                                    {
                                        $eq: [
                                            {
                                                $dateToString: {
                                                    format: "%Y-%m-%d",
                                                    date: "$createdAt",
                                                },
                                            },
                                            new Date().toISOString().split("T")[0],
                                        ],
                                    },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                todayTotalCustomerOrders: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$userRole", "customer"] },
                                    {
                                        $eq: [
                                            {
                                                $dateToString: {
                                                    format: "%Y-%m-%d",
                                                    date: "$createdAt",
                                                },
                                            },
                                            new Date().toISOString().split("T")[0],
                                        ],
                                    },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                customerOrders: {
                    $sum: { $cond: [{ $eq: ["$userRole", "customer"] }, 1, 0] },
                },
                srOrders: {
                    $sum: { $cond: [{ $eq: ["$userRole", "sr"] }, 1, 0] },
                },
                totalOrderSaleAmount: {
                    $sum: { $ifNull: ["$totalAmount", 0] },
                },
                totalPendingSale: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "pending"] },
                            { $ifNull: ["$totalAmount", 0] },
                            0,
                        ],
                    },
                },
                totalPaidOrderSaleAmount: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", "paid"] },
                            { $ifNull: ["$totalAmount", 0] },
                            0,
                        ],
                    },
                },
            },
        },
    ]);
    // Step 2️⃣: Aggregate nested product-level orderInfo totals (for accuracy)
    const nestedSummary = yield order_model_1.OrderModel.aggregate([
        { $unwind: "$orderInfo" },
        {
            $group: {
                _id: null,
                totalItemsSold: { $sum: "$orderInfo.quantity" },
                totalProductSale: {
                    $sum: { $ifNull: ["$orderInfo.totalAmount.total", 0] },
                },
            },
        },
    ]);
    // Step 3️⃣: Combine both safely
    return {
        totalOrders: ((_a = rootSummary[0]) === null || _a === void 0 ? void 0 : _a.totalOrders) || 0,
        pendingOrders: ((_b = rootSummary[0]) === null || _b === void 0 ? void 0 : _b.pendingOrders) || 0,
        paidOrders: ((_c = rootSummary[0]) === null || _c === void 0 ? void 0 : _c.paidOrders) || 0,
        customerOrders: ((_d = rootSummary[0]) === null || _d === void 0 ? void 0 : _d.customerOrders) || 0,
        canceledOrders: ((_e = rootSummary[0]) === null || _e === void 0 ? void 0 : _e.totalCancelledOrders) || 0,
        srCanceledOrders: ((_f = rootSummary[0]) === null || _f === void 0 ? void 0 : _f.srCanceledOrders) || 0,
        customerCanceledOrders: ((_g = rootSummary[0]) === null || _g === void 0 ? void 0 : _g.customerCanceledOrders) || 0,
        todayTotalPaidOrders: ((_h = rootSummary[0]) === null || _h === void 0 ? void 0 : _h.todayTotalPaidOrders) || 0,
        todayTotalCanceledOrders: ((_j = rootSummary[0]) === null || _j === void 0 ? void 0 : _j.todayTotalCanceledOrders) || 0,
        todayTotalSrOrders: ((_k = rootSummary[0]) === null || _k === void 0 ? void 0 : _k.todayTotalSrOrders) || 0,
        todayTotalCustomerOrders: ((_l = rootSummary[0]) === null || _l === void 0 ? void 0 : _l.todayTotalCustomerOrders) || 0,
        srOrders: ((_m = rootSummary[0]) === null || _m === void 0 ? void 0 : _m.srOrders) || 0,
        totalOrderSaleAmount: ((_o = rootSummary[0]) === null || _o === void 0 ? void 0 : _o.totalOrderSaleAmount) || 0,
        totalPendingSale: ((_p = rootSummary[0]) === null || _p === void 0 ? void 0 : _p.totalPendingSale) || 0,
        totalPaidOrderSaleAmount: ((_q = rootSummary[0]) === null || _q === void 0 ? void 0 : _q.totalPaidOrderSaleAmount) || 0,
        totalItemsSold: ((_r = nestedSummary[0]) === null || _r === void 0 ? void 0 : _r.totalItemsSold) || 0,
        totalProductSale: ((_s = nestedSummary[0]) === null || _s === void 0 ? void 0 : _s.totalProductSale) || 0,
    };
});
// const createOrderIntoDB = async (payload: TOrder) => {
//   if (payload) {
//     let totalQuantity = 0;
//     payload.orderInfo.forEach((order) => {
//       // 🔹 Generate tracking number
//       order.trackingNumber = nanoid();
//       // 🔹 Fallback user role
//       if (!order.userRole) {
//         order.userRole = "customer";
//       }
//       // 🔹 Default selectedPrice (if not provided) — use a numeric default to match the type
//       if (order.selectedPrice === undefined || order.selectedPrice === null) {
//         order.selectedPrice = 0;
//       }
//       // 🔹 Sum up quantities for totalQuantity
//       if (order.quantity) {
//         totalQuantity += order.quantity;
//       }
//       // 🔹 Calculate commission if applicable
//       if (order.commission && order.totalAmount) {
//         if (order.commission.type === "percentage") {
//           order.commission.amount =
//             (order.totalAmount.total * order.commission.value) / 100;
//         } else if (order.commission.type === "fixed") {
//           order.commission.amount = order.commission.value;
//         }
//       }
//     });
//     // 🔹 Assign totalQuantity to main order payload
//     payload.totalQuantity = totalQuantity;
//   }
//   // 🔹 Create order in DB
//   const result = await OrderModel.create(payload);
//   return result;
// };
// ✅ Create Order
const createOrderIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload) {
        let totalQuantity = 0;
        // 🔹 Generate tracking number for the whole order
        payload.trackingNumber = (0, nanoid_1.nanoid)();
        // 🔹 Default role
        if (!payload.userRole) {
            payload.userRole = "customer";
        }
        // 🔹 Loop through orderInfo array for calculations
        payload.orderInfo.forEach((item) => {
            // ✅ Default selectedPrice
            if (item.selectedPrice === undefined || item.selectedPrice === null) {
                item.selectedPrice = 0;
            }
            // ✅ Sum up total quantity
            totalQuantity += item.quantity || 0;
            // ✅ Commission calculation
            if (item.commission && item.totalAmount) {
                if (item.commission.type === "percentage") {
                    item.commission.amount =
                        (item.totalAmount.total * item.commission.value) / 100;
                }
                else if (item.commission.type === "fixed") {
                    item.commission.amount = item.commission.value;
                }
            }
        });
        // ✅ Assign computed total quantity to main order
        payload.totalQuantity = totalQuantity;
    }
    // ✅ Save the order
    const result = yield order_model_1.OrderModel.create(payload);
    return result;
});
const updateOrderInDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield order_model_1.OrderModel.findById(id);
    if (!isExist) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order does not exists!");
    }
    const result = yield order_model_1.OrderModel.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
//  Update Order Status (Dedicated Route)
// const updateOrderStatusInDB = async (id: string, status: OrderStatus) => {
//   const order = await OrderModel.findById(id).populate("orderInfo.productInfo");
//   if (!order) {
//     throw new AppError(httpStatus.NOT_FOUND, "Order not found!");
//   }
//   if (!order.orderInfo || order.orderInfo.length === 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Order info is missing!");
//   }
//   // ✅ Update all items’ status
//   order.orderInfo.forEach((item) => {
//     item.status = status;
//   });
//   // ✅ When order is marked as PAID
//   if (status === "paid") {
//     for (const item of order.orderInfo) {
//       const product = item.productInfo as any;
//       if (product) {
//         // 🧩 Determine which quantity field to use
//         const orderQty =
//           item.totalQuantity && item.totalQuantity > 0
//             ? item.totalQuantity
//             : item.quantity || 0;
//         if (orderQty <= 0) {
//           throw new AppError(
//             httpStatus.BAD_REQUEST,
//             `Invalid order quantity for "${
//               product.description?.name || product.name
//             }".`
//           );
//         }
//         // 🟢 Check and reduce product stock
//         if (product.quantity < orderQty) {
//           throw new AppError(
//             httpStatus.BAD_REQUEST,
//             `Not enough stock for "${
//               product.description?.name || product.name
//             }". Only ${product.quantity} left.`
//           );
//         }
//         // ✅ Deduct the quantity from product stock
//         product.quantity -= orderQty;
//         await ProductModel.findByIdAndUpdate(product._id, {
//           quantity: product.quantity,
//         });
//         // 🧮 Apply commission (only once)
//         if (!item.commission.amount && item.commission.value) {
//           const commissionRate =
//             item.commission.type === "percentage"
//               ? item.commission.value / 100
//               : 0;
//           const commissionAmount =
//             item.commission.type === "percentage"
//               ? item.totalAmount.subTotal * commissionRate
//               : item.commission.value;
//           item.commission.amount = commissionAmount;
//         }
//         // 💰 Update SR’s commission balance once per paid order item
//         if (
//           item.orderBy?._id &&
//           item.userRole === "sr" &&
//           item.commission?.amount &&
//           !item.commission.isAddedToBalance
//         ) {
//           await UserModel.findByIdAndUpdate(
//             item.orderBy._id,
//             { $inc: { commissionBalance: item.commission.amount || 0 } },
//             { new: true }
//           );
//           item.commission.isAddedToBalance = true;
//         }
//       }
//     }
//   }
//   await order.save();
//   return order;
// };
// ✅ Update Order Status
const updateOrderStatusInDB = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const order = yield order_model_1.OrderModel.findById(id).populate("orderInfo.productInfo");
    if (!order) {
        throw new handleAppError_1.default(http_status_1.default.NOT_FOUND, "Order not found!");
    }
    // ✅ Update main order status
    order.status = status;
    // ✅ When order is PAID, update stock and commission
    if (status === "paid") {
        for (const item of order.orderInfo) {
            const product = item.productInfo;
            if (product) {
                const orderQty = item.quantity || 0;
                if (orderQty <= 0) {
                    throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, `Invalid order quantity for "${((_a = product.description) === null || _a === void 0 ? void 0 : _a.name) || product.name}".`);
                }
                // 🟢 Check and reduce stock
                if (product.quantity < orderQty) {
                    throw new handleAppError_1.default(http_status_1.default.BAD_REQUEST, `Not enough stock for "${((_b = product.description) === null || _b === void 0 ? void 0 : _b.name) || product.name}". Only ${product.quantity} left.`);
                }
                // ✅ Deduct quantity
                product.quantity -= orderQty;
                yield product_model_1.ProductModel.findByIdAndUpdate(product._id, {
                    quantity: product.quantity,
                });
                // 💰 Apply commission if applicable
                if (item.commission &&
                    !item.commission.amount &&
                    item.commission.value) {
                    if (item.commission.type === "percentage") {
                        item.commission.amount =
                            (item.totalAmount.total * item.commission.value) / 100;
                    }
                    else {
                        item.commission.amount = item.commission.value;
                    }
                }
            }
        }
        // ✅ Add SR commission to balance (only once per order)
        if (order.userRole === "sr" && order.orderBy && order.orderInfo.length) {
            let totalCommission = 0;
            order.orderInfo.forEach((item) => {
                var _a;
                if ((_a = item.commission) === null || _a === void 0 ? void 0 : _a.amount) {
                    totalCommission += item.commission.amount;
                }
            });
            if (totalCommission > 0) {
                yield user_model_1.UserModel.findByIdAndUpdate(order.orderBy, { $inc: { commissionBalance: totalCommission } }, { new: true });
            }
        }
    }
    yield order.save();
    return order;
});
exports.orderServices = {
    getAllOrdersFromDB,
    getSingleOrderFromDB,
    getUserCommissionSummaryFromDB,
    createOrderIntoDB,
    updateOrderStatusInDB,
    getOrderSummaryFromDB,
    updateOrderInDB,
    getMyOrdersFromDB,
};
