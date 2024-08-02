"use client";

import { Button } from "@/components/ui/button";
import { emailOrderHistory } from "../../actions/orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState, useFormStatus } from "react-dom";

export default function MyOrderPage() {
  const [data, action] = useFormState(emailOrderHistory, {});
  return (
    <form className="max-2-xl mx-auto" action={action}>
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter email and we will email you your order history and download
            links
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" required name="email" id="email" />
            {data.error && <div className="text-destructive">{data.error}</div>}
          </div>
        </CardContent>
        <CardFooter>
          {data.message ? <p>{data.message}</p> : <SubmitButton />}
        </CardFooter>
      </Card>
    </form>
  );
}

async function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size="lg" disabled={pending} type="submit">
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}
