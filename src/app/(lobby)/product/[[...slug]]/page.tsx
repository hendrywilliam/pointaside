import { db } from "@/db/core";
import Image from "next/image";
import { eq } from "drizzle-orm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { notFound } from "next/navigation";
import { Product, Store, products, stores } from "@/db/schema";
import ProductPanel from "@/components/lobby/product/product-panel";

export default async function ProductPage({
  params: { slug },
}: {
  params: {
    slug: string[];
  };
}) {
  // Pattern -> [id, slug-from-product-name]
  const isProductIdExistAndANumber = slug[0] && !isNaN(Number(slug[0]));

  // If it is string -> not found
  if (!isProductIdExistAndANumber) {
    notFound();
  }

  const { product, store } = (
    await db
      .select({ product: products, store: stores })
      .from(products)
      .where(eq(products.id, Number(slug[0])))
      .leftJoin(stores, eq(stores.id, products.storeId))
  )[0] as {
    product: Product;
    store: Store;
  };

  if (!product) {
    notFound();
  }

  const parsedImageUrl =
    product.image && JSON.parse(product.image as string)[0].fileUrl;

  return (
    <div className="flex flex-col container h-full w-full py-8">
      <div className="flex h-full w-full my-2 gap-8">
        <div className="group relative h-[600px] w-full overflow-hidden">
          <Image
            src={parsedImageUrl as string}
            fill
            alt={product.name ?? "Product Image"}
            className="w-full h-full object-fill rounded transition duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <h1 className="font-bold text-xl">{product.name}</h1>
          <ProductPanel product={product} store={store} />
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-gray-400">
                Product Description
              </AccordionTrigger>
              <AccordionContent>{product.description}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
