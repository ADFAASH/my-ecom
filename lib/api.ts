const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PRODUCTS_BASE_URL = `${BACKEND_BASE_URL}/api/products`;
const ORDERS_BASE_URL = `${BACKEND_BASE_URL}/api/orders`;


// Product API functions (existing)
export const getProducts = async () => {
  const res = await fetch(PRODUCTS_BASE_URL);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const createProduct = async (product: any) => {
  const res = await fetch(PRODUCTS_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const updateProduct = async (id: string, product: any) => {
  const res = await fetch(`${PRODUCTS_BASE_URL}/${id}`, {
    method: 'PUT', // Assuming PUT for full update
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${PRODUCTS_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// NEW: Order API functions
export const getOrders = async () => {
  const res = await fetch(ORDERS_BASE_URL);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Use PATCH for partial updates like status, shipped, delivered
export const updateOrder = async (id: string, orderData: any) => {
  const res = await fetch(`${ORDERS_BASE_URL}/${id}`, {
    method: 'PATCH', // Use PATCH for partial updates
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Optional: If you need to create orders from the admin panel (unlikely, but included for completeness)
export const createOrder = async (order: any) => {
  const res = await fetch(ORDERS_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Optional: If you need to delete orders from the admin panel
export const deleteOrder = async (id: string) => {
  const res = await fetch(`${ORDERS_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};