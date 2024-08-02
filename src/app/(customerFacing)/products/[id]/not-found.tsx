import { PageHeader } from "@/app/admin/_components/PageHeader";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid place-items-center font-mono">
      <PageHeader>Not Found</PageHeader>
      <p className="font-semibold text-lg">
        Could not find this particular product for purchase
      </p>
      <Link href="/" className="hover:text-blue-700 text-lg hover:underline">
        Return Home
      </Link>
    </div>
  );
}
