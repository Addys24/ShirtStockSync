import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  // Stores
  app.get("/api/stores", async (req, res) => {
    const stores = await storage.getStores();
    res.json(stores);
  });

  app.post("/api/stores", async (req, res) => {
    const store = await storage.createStore(req.body);
    res.status(201).json(store);
  });

  // Stock
  app.get("/api/stock/:storeId", async (req, res) => {
    const stock = await storage.getStockByStore(parseInt(req.params.storeId));
    res.json(stock);
  });

  app.post("/api/stock", async (req, res) => {
    const stock = await storage.createStock(req.body);
    res.status(201).json(stock);
  });

  app.patch("/api/stock/:id", async (req, res) => {
    const stock = await storage.updateStock(
      parseInt(req.params.id),
      req.body.quantity,
    );
    res.json(stock);
  });

  // Transfers
  app.get("/api/transfers/:storeId", async (req, res) => {
    const transfers = await storage.getTransfersByStore(
      parseInt(req.params.storeId),
    );
    res.json(transfers);
  });

  app.post("/api/transfers", async (req, res) => {
    const transfer = await storage.createTransfer(req.body);
    res.status(201).json(transfer);
  });

  app.patch("/api/transfers/:id/complete", async (req, res) => {
    const transfer = await storage.completeTransfer(parseInt(req.params.id));
    res.json(transfer);
  });

  const httpServer = createServer(app);
  return httpServer;
}
