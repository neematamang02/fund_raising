// src/pages/Donate.jsx
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const Donate = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Thank you for your interest! We will enable donations soon.");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Make a Donation</h2>
        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800 text-sm">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Donation Amount
            </label>
            <input
              type="number"
              id="amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="Amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Button variant="outline" type="submit">
            Donate
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
