// src/pages/DonationForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Zod schema for validation
const donationSchema = z.object({
  donorEmail: z.string().email("Invalid email"),
  amount: z.string().refine((val) => parseFloat(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiry: z.string().optional(),
  cvc: z.string().optional(),
});

export default function Donate({ campaignId }) {
  const [method, setMethod] = useState("card");
  const [showCVC, setShowCVC] = useState(false);

  const form = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorEmail: "",
      amount: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, method, campaign: campaignId };
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Donation failed");
      return res.json();
    },
    onSuccess: () => {
      alert("Donation submitted successfully!");
      form.reset();
    },
    onError: (err) => {
      alert(err.message || "An error occurred.");
    },
  });

  const onSubmit = (values) => {
    if (method === "paypal") {
      alert("Please use PayPal button below to complete payment.");
      return;
    }
    mutation.mutate(values);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Donate to This Campaign
      </h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...form.register("donorEmail")}
          />
          {form.formState.errors.donorEmail && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.donorEmail.message}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <Label>Amount (USD)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="25.00"
            {...form.register("amount")}
          />
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <Label>Payment Method</Label>
          <RadioGroup
            value={method}
            onValueChange={setMethod}
            className="flex space-x-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal">PayPal</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Card Section */}
        {method === "card" && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name on Card</Label>
                <Input placeholder="John Doe" {...form.register("cardName")} />
              </div>
              <div>
                <Label>Card Number</Label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  {...form.register("cardNumber")}
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" {...form.register("expiry")} />
                </div>
                <div className="w-1/2 relative">
                  <Label>CVC</Label>
                  <Input
                    type={showCVC ? "text" : "password"}
                    placeholder="123"
                    {...form.register("cvc")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCVC(!showCVC)}
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showCVC ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PayPal Section */}
        {method === "paypal" && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>PayPal Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <PayPalScriptProvider
                options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}
              >
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: form.watch("amount") || "0.00",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                      alert(`Thanks, ${details.payer.name.given_name}!`);
                      // Save to backend if needed
                    });
                  }}
                />
              </PayPalScriptProvider>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <Button type="submit" disabled={mutation.isLoading} className="w-full">
          {mutation.isLoading ? "Processing..." : "Donate Now"}
        </Button>
      </form>
    </div>
  );
}
