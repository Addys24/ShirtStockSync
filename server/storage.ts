import createMemoryStore from "memorystore";
import session from "express-session";
import type {
  User,
  Store,
  Product,
  Stock,
  Transfer,
  InsertUser,
  InsertStore,
  InsertProduct,
  InsertStock,
  InsertTransfer,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Store operations
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Stock operations
  getStockByStore(storeId: number): Promise<(Stock & { product: Product })[]>;
  updateStock(id: number, quantity: number): Promise<Stock>;
  createStock(stock: InsertStock): Promise<Stock>;
  
  // Transfer operations
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  getTransfersByStore(storeId: number): Promise<Transfer[]>;
  completeTransfer(id: number): Promise<Transfer>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private products: Map<number, Product>;
  private stock: Map<number, Stock>;
  private transfers: Map<number, Transfer>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.users = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.stock = new Map();
    this.transfers = new Map();
    this.currentIds = {
      users: 1,
      stores: 1,
      products: 1,
      stock: 1,
      transfers: 1,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(store: InsertStore): Promise<Store> {
    const id = this.currentIds.stores++;
    const newStore = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentIds.products++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async getStockByStore(storeId: number): Promise<(Stock & { product: Product })[]> {
    return Array.from(this.stock.values())
      .filter((stock) => stock.storeId === storeId)
      .map((stock) => ({
        ...stock,
        product: this.products.get(stock.productId)!,
      }));
  }

  async updateStock(id: number, quantity: number): Promise<Stock> {
    const stock = this.stock.get(id);
    if (!stock) throw new Error("Stock not found");
    const updated = { ...stock, quantity };
    this.stock.set(id, updated);
    return updated;
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const id = this.currentIds.stock++;
    const newStock = { ...stock, id };
    this.stock.set(id, newStock);
    return newStock;
  }

  async createTransfer(transfer: InsertTransfer): Promise<Transfer> {
    const id = this.currentIds.transfers++;
    const newTransfer = { ...transfer, id, createdAt: new Date() };
    this.transfers.set(id, newTransfer);
    return newTransfer;
  }

  async getTransfersByStore(storeId: number): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).filter(
      (transfer) =>
        transfer.fromStoreId === storeId || transfer.toStoreId === storeId,
    );
  }

  async completeTransfer(id: number): Promise<Transfer> {
    const transfer = this.transfers.get(id);
    if (!transfer) throw new Error("Transfer not found");
    const updated = { ...transfer, status: "completed" as const };
    this.transfers.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
