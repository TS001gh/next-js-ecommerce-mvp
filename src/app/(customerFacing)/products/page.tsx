import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { Suspense } from "react";
import { PageHeader } from "../_components/PageHeader";
import { cache } from "@/lib/cache";

const getProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { name: "asc" },
    });
  },
  ["/products", "getProducts"],
  { revalidate: 60 * 60 * 24 }
);

export default function Products() {
  return (
    <>
      <PageHeader>All Products</PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* suspense just work if there not async prop before the function above and should the content between the suspense contain async before it */}
        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductsSuspense />
        </Suspense>
      </div>
    </>
  );
}

async function ProductsSuspense() {
  const products = await getProducts();

  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}
