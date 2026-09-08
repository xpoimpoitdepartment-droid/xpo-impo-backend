import { DashboardModel } from "./dashboard.model";
import { TDashboard } from "./dashboard.interface";

// Create
const createDashboard = async (payload: TDashboard) => {
  const result = await DashboardModel.create(payload);
  return result;
};

// Get all
const getAllDashboards = async () => {
  return await DashboardModel.find()
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
};

// Get single
const getDashboardById = async (id: string) => {
  return await DashboardModel.findById(id).populate([
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
};

// Update
const updateDashboard = async (id: string, payload: Partial<TDashboard>) => {
  return await DashboardModel.findByIdAndUpdate(id, payload, { new: true });
};

// Delete
const deleteDashboard = async (id: string) => {
  return await DashboardModel.findByIdAndDelete(id);
};

import { UserModel } from "../user/user.model";
import { OrderModel } from "../order/order.model";
import { CustomerModel } from "../customer/customer.model";
import AppError from "../../errors/handleAppError";

const getUserDashboardStats = async (email: string) => {
  console.log("==> Dashboard Stats requested for email:", email);
  const user = await UserModel.findOne({ email });
  if (!user) {
    console.error("==> User not found for email:", email);
    throw new AppError(404, "User not found");
  }

  const orders = await OrderModel.find({ 
    $or: [{ orderBy: user._id }, { orderBy: user._id.toString() }] 
  }).sort({ createdAt: -1 });

  console.log("==> Found orders for user:", user._id, " Count:", orders.length);

  const pendingOrders = orders.filter(o => ["pending", "processing"].includes(o.status || ""));
  const deliveredOrders = orders.filter(o => o.status === "delivered");

  const customer = await CustomerModel.findOne({ userId: user._id });

  return {
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    deliveredOrders: deliveredOrders.length,
    wishlistItems: customer?.wishlist?.length || 0,
    savedCards: customer?.cardInfo ? 1 : 0,
    addressesCount: customer?.address?.length || 0,
    recentOrders: orders.slice(0, 5).map((o: any) => ({
      id: `ORD-${(o._id?.toString() || "").slice(-5).toUpperCase()}`,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString().split("T")[0] : 
                 (typeof o.createdAt === 'string' ? o.createdAt.split("T")[0] : ""),
      totalAmount: o.totalAmount || 0,
      status: o.status === "pending" ? "Processing" : (o.status === "delivered" ? "Delivered" : "Processing"),
      items: o.totalQuantity || 1
    })),
    recentActivity: [
      ...orders.slice(0, 1).map((o: any) => ({
         id: o._id?.toString() || "unknown",
         title: `Order #ORD-${(o._id?.toString() || "").slice(-5).toUpperCase()} ${o.status === "delivered" ? "Delivered" : "Updated"}`,
         desc: `Your order has been ${o.status || "created"}.`,
         time: "Recently"
      })),
      { id: 'wa', title: 'Added to Wishlist', desc: 'You added a new item to your wishlist.', time: 'Yesterday' },
      { id: 'up', title: 'Profile Updated', desc: 'You successfully updated your profile information.', time: 'Recently' }
    ]
  };
};

export const dashboardService = {
  createDashboard,
  getAllDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
  getUserDashboardStats,
};
