import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );

  if (paymentIntent.metadata.productId == null) return notFound();

  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  });

  if (product == null) return notFound();

  const isSuccess = paymentIntent.status === "succeeded";
  return (
    <section className="max-w-5xl w-full mx-auto space-y-8">
      <h1
        className={`text-4xl font-bold text-center ${
          isSuccess ? "text-green-500" : "text-rose-500"
        }`}
      >
        {isSuccess ? "Success!" : "Error"}
      </h1>
      <div className="grid grid-cols-1 place-items-center gap-4">
        <picture className="aspect-video flex-shrink-0 w-1/2 relative drop-shadow-lg">
          <Image
            className="rounded-lg"
            src={product?.imagePath}
            alt={`image of ${product?.name}`}
            fill
            objectFit="cover"
          />
        </picture>
        <div>
          <span className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </span>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="line-clamp- text-muted-foreground">
            {product.description}
          </p>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      // 1000 * 24 * 60 * 60 => it is the number of milliseconds in one day
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 24 * 60 * 60),
      },
    })
  ).id;
}
