export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: Money;
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  category: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  slug: string;
  title: string;
};

export type Currency = {
  id: string;
  name: string;
  rate: number;
  isBase: boolean;
  imageUrl?: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  price: Money;
  image: ProductImage | null;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: Money;
};

export type Banner = {
  id: string;
  imageUrl: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};
