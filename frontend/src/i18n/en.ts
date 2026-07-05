export const en = {
  appName: "Premium Cotton Wholesale",
  nav: { home: "Home", catalog: "Catalog", cart: "Cart", orders: "Orders", profile: "Profile" },
  home: {
    companyName: 'OOO "BLUE CROWN"',
    tagline: "Wholesale supplier of premium cotton t-shirts",
    intro:
      "We manufacture and supply 100% cotton t-shirts directly to marketplace sellers and retail " +
      "chains across Russia. Working straight from the factory floor — no middlemen — lets us hold " +
      "some of the most competitive wholesale prices on the market without cutting corners on quality.",
    promiseTitle: "Our promise to every buyer",
    qualityTitle: "Guaranteed quality",
    qualityText:
      "Every batch is quality-checked before shipping. 100% cotton, 180/200 GSM, reinforced seams — " +
      "stock that keeps your marketplace return rate low.",
    priceTitle: "Best price",
    priceText:
      "Direct factory supply with no intermediaries means consistently competitive wholesale pricing, " +
      "without compromising on fabric or construction.",
    deliveryTitle: "Fast, reliable delivery",
    deliveryText:
      "Orders ship promptly across Russia, and you can track every order's status right inside this bot " +
      "from confirmation to delivery.",
    contactTitle: "Company details",
    inn: "Tax ID (INN)",
    cta: "Browse the Catalog",
  },
  catalog: {
    title: "Wholesale Catalog",
    subtitle: "100% Cotton · 180 & 200 GSM Oversize · Sizes 46–56",
    material: "Material",
    fit: "Fit",
    gsm: "Density",
    selectSize: "Size",
    selectColor: "Color",
    black: "Black",
    white: "White",
    pricePerUnit: "per unit, excl. VAT",
    minOrder: "Min. order",
    units: "units",
    addToCart: "Add to Cart",
    inStock: "in stock",
    sizeChart: "Size Chart",
  },
  cart: {
    title: "Your Wholesale Order",
    empty: "Your cart is empty. Add some premium tees from the catalog.",
    remove: "Remove",
    subtotal: "Subtotal (excl. VAT)",
    vat: "VAT",
    total: "Total",
    checkout: "Proceed to Checkout",
    qty: "Qty",
  },
  checkout: {
    title: "Checkout",
    customerId: "Customer ID",
    companyName: "Company name",
    contactName: "Contact name",
    inn: "Tax ID (INN)",
    address: "Legal / shipping address",
    phone: "Phone",
    email: "Email",
    notes: "Order notes (optional)",
    placeOrder: "Place Order",
    payWithCard: "Pay with Card (Stripe)",
    payWithYooKassa: "Pay with YooKassa",
    orderPlaced: "Order placed! Choose a payment method below.",
    requisitesRequired: "Your Tax ID (INN) and address are required for the invoice.",
  },
  orders: {
    title: "My Orders",
    empty: "You haven't placed any orders yet.",
    order: "Order",
    status: "Status",
    total: "Total",
    viewDetails: "View Details",
    downloadInvoice: "Download Invoice",
    trackingTitle: "Order Tracking",
  },
  status: {
    NEW: "New — Awaiting Payment",
    PAID: "Paid",
    PROCESSING: "In Production",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  },
  profile: {
    title: "Profile",
    save: "Save",
    saved: "Saved",
  },
};

export type Dictionary = typeof en;
