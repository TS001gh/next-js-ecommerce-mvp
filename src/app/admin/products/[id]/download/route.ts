import fs from "fs/promises";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });
  if (product == null) return notFound();

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  //   to give me the end of the image that will be the extension
  const extension = product.filePath.split(".").pop();

  console.log(`${product.name}.${extension}`);
  //   console.log(file.buffer);

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
