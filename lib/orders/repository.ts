import path from "path";
import type { Order } from "./types";
import { assertDevelopmentWrite } from "@/lib/runtime/production";
import { readJsonArrayFile, writeJsonFile } from "@/lib/utils/json-file";

const DATA_PATH = path.join(process.cwd(), "data", "orders.local.json");

async function readOrderFile() {
  return readJsonArrayFile<Order>(DATA_PATH);
}

async function writeOrderFile(orders: Order[]) {
  await writeJsonFile(DATA_PATH, orders);
}

export async function createOrder(
  order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">,
) {
  assertDevelopmentWrite();

  const orders = await readOrderFile();
  const now = new Date().toISOString();
  const orderNumber = `FF-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${String(orders.length + 1).padStart(4, "0")}`;

  const nextOrder: Order = {
    ...order,
    id: `ord_${crypto.randomUUID()}`,
    orderNumber,
    createdAt: now,
    updatedAt: now,
  };

  orders.push(nextOrder);
  await writeOrderFile(orders);
  return nextOrder;
}

export async function getOrderByNumber(orderNumber: string) {
  const orders = await readOrderFile();
  return orders.find((order) => order.orderNumber === orderNumber) ?? null;
}
