import { z } from "zod";
import { possibleGenders, userRoles, userStatus } from "./user.const";

export const createUserZodSchema = z.object({
  name: z.string().min(1, "Name is required"),

  email: z.string().email("Invalid email format"),

  isEmailVerified: z.boolean().optional(),

  password: z.string().min(6, "Password must be at least 6 characters long"),

  role: z.enum([...userRoles] as [string, ...string[]]).optional(),
  image: z.string().optional(),

  gender: z.enum([...possibleGenders] as [string, ...string[]]).optional(),

  contactNo: z.string().optional(),

  bio: z.string().optional(),

  status: z.enum([...userStatus] as [string, ...string[]]).optional(),
  
  address: z.object({
    type: z.enum(["billing", "shipping"]).optional(),
    title: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    street: z.string().optional(),
    union: z.string().optional(),
    thana: z.string().optional(),
    district: z.string().optional(),
  }).optional(),

  walletPoint: z.number().optional(),

  socials: z.array(z.string()).optional(),

  cardInfo: z.any().optional().nullable(),
});
