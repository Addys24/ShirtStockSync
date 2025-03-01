import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { hashPassword } from "./auth"; // Assuming hashPassword function exists

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await storage.getUsers();
    res.json(users);
  });

  // Development helper route to initialize test data
  app.post("/api/dev/init", async (req, res) => {
    // Create two stores
    const storeA = await storage.createStore({
      name: "Branch A",
      location: "Downtown"
    });

    const storeB = await storage.createStore({
      name: "Branch B",
      location: "Uptown"
    });

    // Create some products
    const products = await Promise.all([
      storage.createProduct({
        name: "Classic T-Shirt",
        size: 32,
        color: "Light Blue"
      }),
      storage.createProduct({
        name: "Classic T-Shirt",
        size: 36,
        color: "Dark Pink"
      }),
      storage.createProduct({
        name: "Premium T-Shirt",
        size: 40,
        color: "Plain White"
      })
    ]);

    // Add initial stock
    await Promise.all([
      storage.createStock({
        productId: products[0].id,
        storeId: storeA.id,
        quantity: 50
      }),
      storage.createStock({
        productId: products[1].id,
        storeId: storeA.id,
        quantity: 30
      }),
      storage.createStock({
        productId: products[2].id,
        storeId: storeB.id,
        quantity: 25
      })
    ]);

    res.json({ message: "Test data initialized" });
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  // Add delete endpoint for products
  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.sendStatus(200);
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

  app.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create admin users" });
    }

    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}