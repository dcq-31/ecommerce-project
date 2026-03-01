"use server";

import { getProducts } from "./products";
import type { Product } from "./types";

export async function fetchCategoryProducts(category: string): Promise<Product[]> {
  return getProducts({ category });
}
