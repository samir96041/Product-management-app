// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import multer from 'multer';
import shopify from "./shopify.js";
// import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// Validate session for Shopify
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());



// Fetch products from Shopify Admin REST API\

app.get("/api/products", async (req, res) => {
  try {
    // Create a REST client to interact with the Shopify Admin API
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    // Fetch product data from Shopify
    const productData = await client.get({
      path: "products",
      query: {
        limit: 40, 
      },
    });

    // Respond with the product data
    res.status(200).send({
      products: productData.body.products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        price: product.variants[0].price, 
        image: product.image?.src || null, 
      })),
    });
  } catch (error) {
    // console.error("Failed to fetch products:", error.message);
    res.status(500).send({ error: "Failed to fetch products" });
  }
});



const upload = multer(); //used multer

//Add products api
app.post("/api/products/create", upload.single('image'), async (req, res) => {
  const { title, body_html, vendor, variants } = req.body;
  const image = req.file; 
  const productData = {
    product: {
      title,
      body_html,
      vendor,
      variants: JSON.parse(variants), 
      images: image ? [{ attachment: image.buffer.toString('base64') }] : []
    },
  };
  try {
    const client = new shopify.api.clients.Rest({
      session: res.locals.shopify.session,
    });

    const response = await client.post({
      path: "products",
      data: productData,
      type: "application/json",
    });

    res.status(201).send(response.body);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({ error: "Failed to create product" });
  }
});


//Update product Api
app.put("/api/products/:id", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    
    if (!session) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const productId = req.params.id;
    const { title, body_html, vendor, variants } = req.body; 
    const client = new shopify.api.clients.Rest({ session });

    // Send PUT request to update the product
    const response = await client.put({
      path: `products/${productId}`,
      data: {
        product: {
          title,
          body_html,
          vendor,
          variants,
        },
      },
      type: "application/json",
    });

    res.status(200).send({ success: true, product: response.body.product });
  } catch (error) {
    // console.error("Error updating product:", error.message);
    res.status(500).send({ success: false, message: "Failed to update product" });
  }
});


//Delete products api
app.delete("/api/products/:id", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    if (!session) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const productId = req.params.id;
    // Use the Shopify Admin API to delete the product
    const client = new shopify.api.clients.Rest({ session });
    await client.delete({
      path: `products/${productId}`,
    });

    res.status(200).send({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    // console.error("Error deleting product:", error);
    res.status(500).send({ success: false, message: "Failed to delete product" });
  }
});









app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
