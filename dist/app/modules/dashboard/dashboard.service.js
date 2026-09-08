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
exports.dashboardService = void 0;
const dashboard_model_1 = require("./dashboard.model");
// Create
const createDashboard = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dashboard_model_1.DashboardModel.create(payload);
    return result;
});
// Get all
const getAllDashboards = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield dashboard_model_1.DashboardModel.find()
        .populate("summary")
        .populate("orderStatus")
        .populate("recentOrders")
        .populate("salesHistory")
        .populate("popularProducts")
        .populate("lowStockProducts")
        .populate("topCategoryWithProducts")
        .populate("withdrawals")
        .populate("attributes")
        .populate("taxes")
        .populate("shippings")
        .populate("orders")
        .populate("transactions")
        .populate("faqs")
        .populate("users")
        .populate("vendors")
        .populate("customers")
        .populate("coupons");
});
// Get single
const getDashboardById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield dashboard_model_1.DashboardModel.findById(id).populate([
        "summary",
        "orderStatus",
        "recentOrders",
        "salesHistory",
        "popularProducts",
        "lowStockProducts",
        "topCategoryWithProducts",
        "withdrawals",
        "attributes",
        "taxes",
        "shippings",
        "orders",
        "transactions",
        "faqs",
        "users",
        "vendors",
        "customers",
        "coupons",
    ]);
});
// Update
const updateDashboard = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield dashboard_model_1.DashboardModel.findByIdAndUpdate(id, payload, { new: true });
});
// Delete
const deleteDashboard = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield dashboard_model_1.DashboardModel.findByIdAndDelete(id);
});
const user_model_1 = require("../user/user.model");
const order_model_1 = require("../order/order.model");
const customer_model_1 = require("../customer/customer.model");
const handleAppError_1 = __importDefault(require("../../errors/handleAppError"));
const getUserDashboardStats = (email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("==> Dashboard Stats requested for email:", email);
    const user = yield user_model_1.UserModel.findOne({ email });
    if (!user) {
        console.error("==> User not found for email:", email);
        throw new handleAppError_1.default(404, "User not found");
    }
    const orders = yield order_model_1.OrderModel.find({
        $or: [{ orderBy: user._id }, { orderBy: user._id.toString() }]
    }).sort({ createdAt: -1 });
    console.log("==> Found orders for user:", user._id, " Count:", orders.length);
    const pendingOrders = orders.filter(o => ["pending", "processing"].includes(o.status || ""));
    const deliveredOrders = orders.filter(o => o.status === "delivered");
    const customer = yield customer_model_1.CustomerModel.findOne({ userId: user._id });
    return {
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        deliveredOrders: deliveredOrders.length,
        wishlistItems: ((_a = customer === null || customer === void 0 ? void 0 : customer.wishlist) === null || _a === void 0 ? void 0 : _a.length) || 0,
        savedCards: (customer === null || customer === void 0 ? void 0 : customer.cardInfo) ? 1 : 0,
        addressesCount: ((_b = customer === null || customer === void 0 ? void 0 : customer.address) === null || _b === void 0 ? void 0 : _b.length) || 0,
        recentOrders: orders.slice(0, 5).map((o) => {
            var _a;
            return ({
                id: `ORD-${(((_a = o._id) === null || _a === void 0 ? void 0 : _a.toString()) || "").slice(-5).toUpperCase()}`,
                createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString().split("T")[0] :
                    (typeof o.createdAt === 'string' ? o.createdAt.split("T")[0] : ""),
                totalAmount: o.totalAmount || 0,
                status: o.status === "pending" ? "Processing" : (o.status === "delivered" ? "Delivered" : "Processing"),
                items: o.totalQuantity || 1
            });
        }),
        recentActivity: [
            ...orders.slice(0, 1).map((o) => {
                var _a, _b;
                return ({
                    id: ((_a = o._id) === null || _a === void 0 ? void 0 : _a.toString()) || "unknown",
                    title: `Order #ORD-${(((_b = o._id) === null || _b === void 0 ? void 0 : _b.toString()) || "").slice(-5).toUpperCase()} ${o.status === "delivered" ? "Delivered" : "Updated"}`,
                    desc: `Your order has been ${o.status || "created"}.`,
                    time: "Recently"
                });
            }),
            { id: 'wa', title: 'Added to Wishlist', desc: 'You added a new item to your wishlist.', time: 'Yesterday' },
            { id: 'up', title: 'Profile Updated', desc: 'You successfully updated your profile information.', time: 'Recently' }
        ]
    };
});
exports.dashboardService = {
    createDashboard,
    getAllDashboards,
    getDashboardById,
    updateDashboard,
    deleteDashboard,
    getUserDashboardStats,
};
