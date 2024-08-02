"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUser } from "../../_actions/users";

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  console.log(id);

  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          {
            await deleteUser(id);
            router.refresh();
          }
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
