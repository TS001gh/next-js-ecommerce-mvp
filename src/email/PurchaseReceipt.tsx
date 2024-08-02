import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import { OrderInformation } from "./components/OrderInformation";

type PurchaseReceiptEmailProps = {
  product: {
    name: string;
    description: string;
    imagePath: string;
  };
  order: {
    id: string;
    createdAt: Date;
    pricePaidInCents: number;
  };

  downloadVerificationId: string;
};

// Set fake data
// PurchaseReceiptEmail.PreviewProps = {
//   product: {
//     name: "Product name",
//     description: "Product description",
//     imagePath:
//       "/products/5f455fa6-7129-4c55-bd99-ebf6e7016eb3-photo-1523275335684-37898b6baf30.avif",
//   },
//   order: {
//     id: crypto.randomUUID(),
//     createdAt: new Date(),
//     pricePaidInCents: 10000,
//   },
//   downloadVerificationId: crypto.randomUUID(),
// } satisfies PurchaseReceiptEmailProps;

export default function PurchaseReceiptEmail({
  product,
  order,
  downloadVerificationId,
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <OrderInformation
              order={order}
              product={product}
              downloadVerificationId={downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
