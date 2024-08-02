"use client";

import { userOrderExists } from "@/app/_actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { set } from "zod";

interface CheckoutFormProps {
  product: {
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
    id: string;
  };
  clientSecret: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function CheckoutForm({
  product,
  clientSecret,
}: CheckoutFormProps) {
  // this element like context wrapper for giving us the attributes and so on
  //   for that we have to create a new element inside it

  return (
    <section className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <picture className="aspect-video flex-shrink-0 w-1/3 relative drop-shadow-lg">
          <Image
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
        </div>
      </div>

      <Elements
        options={{
          clientSecret,
          locale: "en",
          appearance: { theme: "flat", labels: "floating" },
        }}
        stripe={stripePromise}
      >
        <Form priceInCents={product?.priceInCents} productId={product?.id} />
      </Elements>
    </section>
  );
}

// ======================================== FORM ELEMENT =================================

function Form({
  priceInCents,
  productId,
}: {
  priceInCents: number;
  productId: string;
}) {
  const stripe = useStripe();
  //   This hook has all the details for our payment information like email and so on
  const elements = useElements();

  // STATES
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();

  // HANDLERS
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // check if there any problem
    if (stripe == null || elements == null || email == null) {
      return;
    }

    setIsLoading(true);

    // Check for existing order

    const orderExists = await userOrderExists(email, productId);

    if (orderExists) {
      setErrorMessage(
        "You have already purchased this product. Try to download it from the My order page"
      );
      setIsLoading(false);
      return;
    }

    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          // This is the success page
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          {errorMessage && (
            <CardDescription className="text-destructive">
              {errorMessage}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className="mt-6 relative before:content-[''] before:absolute before:w-full before:h-[0.12rem] before:-top-2 before:bg-slate-500/10">
            <LinkAuthenticationElement
              onChange={(e) => setEmail(e.value.email)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full ${
              isLoading ? "disabled:cursor-not-allowed" : "cursor-pointer"
            }`}
            size="lg"
            disabled={stripe == null || elements == null || isLoading}
          >
            {isLoading
              ? "Purchasing..."
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
