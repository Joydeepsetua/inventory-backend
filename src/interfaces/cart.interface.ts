import { Request } from "express";

import { JwtPayload } from "./jwt-payload.interface.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface AddCartItemInput {
  variant_id: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface SetCartCustomerInput {
  customer_id: string | null;
}

export interface CartSummary {
  item_count: number;
  total_quantity: number;
  subtotal: string;
}
