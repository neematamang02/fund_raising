import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const profileSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords must match",
      path: ["confirmPassword"],
    }
  );

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // 1) Fetch my donations
  const { data: donations = [], isLoading: isDonationsLoading } = useQuery({
    queryKey: ["myDonations"],
    queryFn: async () => {
      const res = await fetch("/api/donations/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch donations");
      return res.json();
    },
  });

  // Filtering state
  const [filterText, setFilterText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Apply filters
  const filteredDonations = donations.filter((d) => {
    const matchCampaign = filterText
      ? d.campaign.title.toLowerCase().includes(filterText.toLowerCase())
      : true;

    const donationDate = new Date(d.createdAt);
    const afterFrom = dateFrom ? donationDate >= new Date(dateFrom) : true;
    const beforeTo = dateTo ? donationDate <= new Date(dateTo) : true;

    return matchCampaign && afterFrom && beforeTo;
  });

  // 2) Profile form with mutation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { name: data.name, email: data.email };
      if (data.password) payload.password = data.password;

      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Profile update failed");
      }
      return res.json();
    },
    onSuccess: (updatedUser) => {
      alert("Profile updated");
      queryClient.invalidateQueries(["myDonations"]);
      // Update user in AuthContext
      // (You could store a setter in AuthContext or just reload page)
      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        password: "",
        confirmPassword: "",
      });
    },
  });

  const onSubmitProfile = (data) => {
    profileMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">Dashboard</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
            <div>
              <label>Name</label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label>Email</label>
              <Input type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label>New Password (leave blank to keep current)</label>
              <Input type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label>Confirm Password</label>
              <Input type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="bg-green-600 text-white">
              {profileMutation.isLoading ? "Updating…" : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Donation Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label>Search Campaign</label>
              <Input
                placeholder="Campaign name"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div>
              <label>From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label>To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {isDonationsLoading ? (
            <p>Loading...</p>
          ) : filteredDonations.length === 0 ? (
            <p>No donations found.</p>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <Card key={donation._id} className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>
                      {donation.campaign.title} —{" "}
                      <span className="font-semibold">
                        ${donation.amount.toLocaleString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {format(new Date(donation.createdAt), "PPP")}
                      </p>
                      <p>
                        <span className="font-semibold">Method:</span>{" "}
                        {donation.method}
                      </p>
                    </div>
                    <div className="text-gray-600">
                      Donation ID: {donation._id.slice(-6)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
