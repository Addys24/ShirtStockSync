import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "shopkeeper"] }).notNull(),
  storeId: integer("store_id"),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  color: text("color", {
    enum: [
      "Light Pink",
      "Dark Pink",
      "Light Yellow",
      "Dark Yellow", 
      "Light Blue",
      "Dark Blue",
      "Plain White"
    ]
  }).notNull(),
});

export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  fromStoreId: integer("from_store_id").notNull(),
  toStoreId: integer("to_store_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status", { enum: ["pending", "completed"] }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  storeId: true,
});

export const insertStoreSchema = createInsertSchema(stores);
export const insertProductSchema = createInsertSchema(products);
export const insertStockSchema = createInsertSchema(stock);
export const insertTransferSchema = createInsertSchema(transfers);

export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Stock = typeof stock.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
