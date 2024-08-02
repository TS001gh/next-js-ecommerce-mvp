"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, {
  message: "Required",
});

// نتحقق هنا ما اذا تم ارسال صورة اي اننا لم نرسل شيء فارغ بعدها تحققنا اذا ما هي صورة ام لا
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(5),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  {
    /* first we convert form data to an actual object that we can used
        Then i save my data safely */
  }
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    // get the errors for each individual field
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  //  1-File: recursive means that we have multiple images that we can add
  await fs.mkdir("products", { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  //  2-Image
  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: filePath,
      imagePath: imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}

/**
 * edit action
 */
const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  {
    /* first we convert form data to an actual object that we can used
        Then i save my data safely */
  }
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    // get the errors for each individual field
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });

  if (product == null) return notFound();

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath);
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = product.imagePath;

  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`);
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath: filePath,
      imagePath: imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id: id },
    data: { isAvailableForPurchase: isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteProduct(id: string, disabled: boolean) {
  const product = await db.product.delete({ where: { id: id } });
  if (product === null) {
    return notFound();
  }

  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);

  revalidatePath("/");
  revalidatePath("/products");
}
