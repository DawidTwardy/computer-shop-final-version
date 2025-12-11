const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchCategories() {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    if (!response.ok) throw new Error("Failed to fetch categories");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchProductById(id: number) {
  const url = `${API_URL}/api/products/${id}`;
  try {
    console.log("DEBUG: Fetching product from:", url); // Wypisuje wywoływany URL
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch product");
    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function fetchProductsByCategory(categoryId: number) {
  try {
    const response = await fetch(`${API_URL}/api/products/category/${categoryId}`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchCart(userId: number) {
  try {
    const response = await fetch(`${API_URL}/api/cart/${userId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  try {
    const response = await fetch(`${API_URL}/api/cart/${userId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) throw new Error("Failed to add to cart");
    return await response.json();
  } catch (error) {
    console.error("Error adding to cart:", error);
    return null;
  }
}

export async function removeFromCart(userId: number, productId: number) {
  try {
    const response = await fetch(`${API_URL}/api/cart/${userId}/items/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove from cart");
    return await response.json();
  } catch (error) {
    console.error("Error removing from cart:", error);
    return null;
  }
}

export async function fetchUserOrders(userId: number) {
  try {
    const response = await fetch(`${API_URL}/api/orders/${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function createOrder(userId: number, cartId: number) {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cartId }),
    });
    if (!response.ok) throw new Error("Failed to create order");
    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
