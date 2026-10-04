import { SALE_FORM_MAX_LINES } from "@/lib/forms/limits";

export function parseSaleFormData(formData: FormData) {
  const lines = Array.from({ length: SALE_FORM_MAX_LINES }, (_, index) => index)
    .map((index) => ({
      productId: formData.get(`lines.${index}.productId`),
      quantity: formData.get(`lines.${index}.quantity`),
      unitPrice: formData.get(`lines.${index}.unitPrice`),
    }))
    .filter((line) => line.productId && line.quantity && line.unitPrice);

  return {
    customerId: formData.get("customerId"),
    saleDate: formData.get("saleDate"),
    discount: formData.get("discount") || "0.00",
    deliveryCharge: formData.get("deliveryCharge") || "0.00",
    otherCharges: formData.get("otherCharges") || "0.00",
    notes: formData.get("notes") || undefined,
    lines,
  };
}
