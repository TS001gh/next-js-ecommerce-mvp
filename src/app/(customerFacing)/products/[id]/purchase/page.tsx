import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import CheckoutForm from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({ where: { id } });
  if (product === null) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "USD",
    // we want to tie this purchase to this particular product
    metadata: { productId: product.id },
  });

  //   this is what we use on the client to essentially say that this is the payment intent they're working on
  // you can also think about this ;ike an ID for this particular payment intent
  if (paymentIntent.client_secret == null) {
    throw new Error("Stripe failed to create payment intent");
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  );
}
