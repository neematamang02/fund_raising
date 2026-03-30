import { useContext, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "@/Context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar, HandCoins, Search, Settings, UserRound } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

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
    },
  );

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // 1) Fetch my donations
  const { data: donationsData, isLoading: isDonationsLoading } = useQuery({
    queryKey: ["myDonations"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/donations/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch donations");
      const data = await res.json();
      return data;
    },
    enabled: !!token,
  });

  // Extract donations array from response
  const donations = donationsData?.donations || [];

  // Filtering state
  const [filterText, setFilterText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Apply filters
  const filteredDonations = (donations || []).filter((d) => {
    if (!d || !d.campaign) return false;

    const matchCampaign = filterText
      ? (d.campaign.title || "")
          .toLowerCase()
          .includes(filterText.toLowerCase())
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

      const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
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
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["myDonations"] });
      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        password: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onSubmitProfile = (data) => {
    profileMutation.mutate(data);
  };

  const donationStats = useMemo(() => {
    const count = filteredDonations.length;
    const totalAmount = filteredDonations.reduce(
      (sum, donation) => sum + Number(donation.amount || 0),
      0,
    );

    return {
      count,
      totalAmount,
    };
  }, [filteredDonations]);

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge className="mb-3 bg-blue-100 text-blue-800">
                Donor Dashboard
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {user?.name}
              </h1>
              <p className="mt-1 text-slate-600">
                Manage profile details and review your donation activity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Donations
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {donationStats.count}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Given
                </p>
                <p className="text-lg font-bold text-primary">
                  ${donationStats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="surface-card rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-secondary" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmitProfile)}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="dashboard-name">Name</Label>
                <Input
                  id="dashboard-name"
                  {...register("name")}
                  className="h-11 rounded-lg border-slate-300"
                />
                {errors.name ? (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-email">Email</Label>
                <Input
                  id="dashboard-email"
                  type="email"
                  {...register("email")}
                  className="h-11 rounded-lg border-slate-300"
                />
                {errors.email ? (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-password">New Password</Label>
                <Input
                  id="dashboard-password"
                  type="password"
                  {...register("password")}
                  className="h-11 rounded-lg border-slate-300"
                />
                {errors.password ? (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-confirm">Confirm Password</Label>
                <Input
                  id="dashboard-confirm"
                  type="password"
                  {...register("confirmPassword")}
                  className="h-11 rounded-lg border-slate-300"
                />
                {errors.confirmPassword ? (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HandCoins className="h-5 w-5 text-secondary" />
              My Donations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="campaign-search">Search Campaign</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="campaign-search"
                    placeholder="Campaign name"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-11 rounded-lg border-slate-300 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-11 rounded-lg border-slate-300 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-11 rounded-lg border-slate-300 pl-9"
                  />
                </div>
              </div>
            </div>

            {isDonationsLoading ? (
              <p className="text-slate-600">Loading donations...</p>
            ) : filteredDonations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
                No donations found for the selected filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDonations.map((donation) => (
                  <article
                    key={donation._id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {donation.campaign?.title || "Unknown Campaign"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(donation.createdAt), "PPP")} |{" "}
                        {donation.method || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        ${(donation.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID: {donation._id?.slice(-6) || "N/A"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
