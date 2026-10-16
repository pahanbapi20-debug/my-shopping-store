import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  subcategory: varchar("subcategory", { length: 80 }).notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  details: jsonb("details").$type<string[]>().notNull().default([]),
  /** Price in cents */
  price: integer("price").notNull(),
  /** Original price in cents, if on sale */
  compareAtPrice: integer("compare_at_price"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  colors: jsonb("colors")
    .$type<{ name: string; hex: string }[]>()
    .notNull()
    .default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(50),
  featured: boolean("featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  author: varchar("author", { length: 100 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 24 }).notNull().unique(),
  email: varchar("email", { length: 200 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().default(""),
  address1: varchar("address1", { length: 200 }).notNull(),
  address2: varchar("address2", { length: 200 }).notNull().default(""),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 80 }).notNull().default("United States"),
  shippingMethod: varchar("shipping_method", { length: 40 }).notNull(),
  paymentLast4: varchar("payment_last4", { length: 4 }).notNull().default(""),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  tax: integer("tax").notNull(),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  name: varchar("name", { length: 140 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  image: text("image").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  size: varchar("size", { length: 20 }).notNull().default(""),
  color: varchar("color", { length: 40 }).notNull().default(""),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
