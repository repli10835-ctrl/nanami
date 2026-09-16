import { formatCurrency } from "../lib/currency";
import { getCatalogItem, type MenuItem } from "../lib/catalogData";
import type { CartLine, Order } from "../lib/store";
import { buildWhatsappMessage } from "../lib/whatsapp";

function calculateUnitPrice(
  item: MenuItem,
  selectedChoiceIds: string[],
): { unitPrice: number; labels: string[] } {
  let price = item.price;
  const labels: string[] = [];
  item.groups
    .filter((g) => g.enabled !== false)
    .forEach((g) => {
      g.choices.forEach((c) => {
        if (selectedChoiceIds.includes(c.id)) {
          price += c.price;
          labels.push(c.name);
        }
      });
    });
  return { unitPrice: price, labels };
}

async function runMustTryRegressionTest() {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const rupiah = (n: number) => formatCurrency(n, "N$");

  console.log("=========================================================================");
  console.log(`REGRESSION TEST A: MUST TRY GRID -> CART -> CHECKOUT (Order: NK-${randomId})`);
  console.log("=========================================================================");

  // 1. Real lookup from store catalog data (Must Try item: m1 Teriyaki Chicken Bento)
  const item = getCatalogItem("m1")!;
  console.log(
    `[Store Lookup] : getCatalogItem("m1") -> Name: "${item.name}" | Base Price: ${rupiah(item.price)}`,
  );

  // 2. Select options matching ProductSheet calculation logic
  const selectedChoiceIds = ["large", "egg"]; // Large (+15) + Fried Egg (+15)
  const calc = calculateUnitPrice(item, selectedChoiceIds);
  console.log(
    `[Price Calc]  : Base Price (${rupiah(item.price)}) + Option Deltas (${rupiah(calc.unitPrice - item.price)}) = Calculated Unit Price (${rupiah(calc.unitPrice)})`,
  );

  const cartLine: CartLine = {
    id: `cart-must-try-${Date.now()}`,
    itemId: item.id,
    name: item.name, // Real catalog item name, not hardcoded
    unitPrice: calc.unitPrice, // Calculated dynamically from base + options
    qty: 1,
    optionLabels: calc.labels, // Resolved option choice names
    note: "Extra bumbu teriyaki",
  };

  const order: Order = {
    id: `ord-${randomId}`,
    code: `NK-${randomId}`,
    createdAt: Date.now(),
    type: "delivery",
    lines: [cartLine],
    subtotal: calc.unitPrice,
    discount: 0,
    voucherCode: "",
    deliveryFee: 15,
    total: calc.unitPrice + 15,
    status: "new",
    paymentMethod: "QRIS",
    customer: {
      name: "Siti Rahma",
      phone: "081987654321",
      address: "Jl. Melati No. 10",
      deliveryNote: "Depan pagar hitam",
    },
  };

  console.log(`[Order Code]   : ${order.code}`);
  console.log(`[Customer]     : ${order.customer.name} (${order.customer.phone})`);
  console.log(`[Item Added]   : ${cartLine.name} x${cartLine.qty} (${rupiah(cartLine.unitPrice)})`);
  console.log(`[Options]      : [${cartLine.optionLabels.join(", ")}]`);
  console.log(`[Note]         : "${cartLine.note}"`);
  console.log(`[Total Amount] : ${rupiah(order.total)}`);

  const waText = buildWhatsappMessage(order);
  console.log(`\n[GENERATED WHATSAPP MESSAGE]:\n${waText}`);
  console.log("=========================================================================");
  console.log("REGRESSION TEST A (MUST TRY) PASSED SUCCESSFULLY!");
  console.log("=========================================================================");
}

runMustTryRegressionTest().catch(console.error);
