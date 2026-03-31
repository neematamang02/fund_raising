import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  getAdminUserDetails,
  getAdminUserDonations,
  getAdminUsers,
  updateAdminUserStatus,
} from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Loader2, Search, ShieldCheck, Mail, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function RoleBadge({ role }) {
  const roleMap = {
    admin: "bg-rose-100 text-rose-800 border-rose-200",
    organizer: "bg-blue-100 text-blue-800 border-blue-200",
    donor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <Badge className={roleMap[role] || roleMap.donor}>
      {(role || "donor").toUpperCase()}
    </Badge>
  );
}

function DonationsTab({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.userDonations(userId),
    queryFn: () => getAdminUserDonations(userId),
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return (
      <div className="py-14 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="py-8 flex items-center justify-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load donations: {error.message}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data?.donations || data.donations.length === 0) {
    return (
      <Card className="border-dashed border-slate-300">
        <CardContent className="py-14 text-center text-slate-600">
          This user has not made any donations yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="surface-card bg-emerald-50 border-emerald-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-emerald-900">
            Total Donated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-900">
            ${data.totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-emerald-700 mt-1">
            {data.totalCount} {data.totalCount === 1 ? "donation" : "donations"}
          </p>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="text-base">Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.donations.map((donation) => (
              <Card key={donation._id} className="border-slate-200">
                <CardContent className="py-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Campaign</p>
                      {donation.campaign ? (
                        <Link
                          to={`/donate/${donation.campaign._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {donation.campaign.title}
                        </Link>
                      ) : (
                        <p className="text-sm text-slate-600">N/A</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Amount</p>
                      <p className="text-sm font-semibold text-slate-900">
                        ${donation.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(donation.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsers() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_USERS}`);
      } else if (user.role !== "admin") {
        navigate(ROUTES.HOME);
      }
    }
  }, [loading, navigate, user]);

  const usersQueryParams = useMemo(
    () => ({ page, role: roleFilter, search: searchTerm }),
    [page, roleFilter, searchTerm],
  );

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: adminQueryKeys.users(usersQueryParams),
    queryFn: () => getAdminUsers(usersQueryParams),
    enabled: Boolean(user?.role === "admin"),
  });

  const users = usersData?.users || [];
  const totalPages = Number(usersData?.totalPages || 1);

  const { data: userDetails, isFetching: isDetailsFetching } = useQuery({
    queryKey: adminQueryKeys.userDetails(selectedUserId),
    queryFn: () => getAdminUserDetails(selectedUserId),
    enabled: Boolean(selectedUserId),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }) => updateAdminUserStatus(userId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.userDetails(variables.userId),
        }),
      ]);
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleUpdateUser = async ({ userId, role, isOrganizerApproved }) => {
    await updateUserMutation.mutateAsync({
      userId,
      payload: {
        role,
        isOrganizerApproved,
      },
    });
  };

  if (loading || isLoading) {
    return <AdminPageSkeleton statCount={0} listCount={5} />;
  }

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              User Management
            </h1>
            <p className="text-slate-600 mt-1">
              Review roles, profile details, and organizer approval status.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
            }
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Refresh
          </Button>
        </div>

        <Card className="surface-card shadow-sm">
          <CardContent className="pt-6">
            <form
              className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
              onSubmit={handleSearch}
            >
              <div>
                <Label htmlFor="search-users">Search</Label>
                <Input
                  id="search-users"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email"
                  className="h-11 rounded-lg border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={roleFilter} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {users.length === 0 ? (
            <Card className="border-dashed border-slate-300">
              <CardContent className="py-14 text-center text-slate-600">
                No users found for the selected filters.
              </CardContent>
            </Card>
          ) : (
            users.map((item) => (
              <Card key={item._id} className="surface-card shadow-sm">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <RoleBadge role={item.role} />
                        {item.isOrganizerApproved ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Organizer Approved
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {item.email}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUserId(item._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>User details</DialogTitle>
                            <DialogDescription>
                              Review activity and update role or organizer
                              approval.
                            </DialogDescription>
                          </DialogHeader>

                          {isDetailsFetching ? (
                            <div className="py-14 flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : userDetails?.user ? (
                            <Tabs defaultValue="overview">
                              <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="donations">Donations</TabsTrigger>
                              </TabsList>

                              <TabsContent value="overview">
                                <div className="space-y-5">
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <Card className="surface-card">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">
                                          Role
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <RoleBadge role={userDetails.user.role} />
                                      </CardContent>
                                    </Card>
                                    <Card className="surface-card">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">
                                          Donations
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="text-xl font-bold text-slate-900">
                                        {userDetails.donations?.length || 0}
                                      </CardContent>
                                    </Card>
                                    <Card className="surface-card">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">
                                          Activities
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="text-xl font-bold text-slate-900">
                                        {userDetails.activities?.length || 0}
                                      </CardContent>
                                    </Card>
                                  </div>

                                  <Card className="border-dashed border-slate-300">
                                    <CardHeader>
                                      <CardTitle className="text-base flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        Admin controls
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-3 gap-3">
                                      <div>
                                        <Label htmlFor={`role-${item._id}`}>
                                          Role
                                        </Label>
                                        <Select
                                          defaultValue={
                                            userDetails.user.role || "donor"
                                          }
                                          onValueChange={(nextRole) =>
                                            handleUpdateUser({
                                              userId: item._id,
                                              role: nextRole,
                                              isOrganizerApproved:
                                                userDetails.user
                                                  .isOrganizerApproved,
                                            })
                                          }
                                        >
                                          <SelectTrigger id={`role-${item._id}`}>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="donor">
                                              Donor
                                            </SelectItem>
                                            <SelectItem value="organizer">
                                              Organizer
                                            </SelectItem>
                                            <SelectItem value="admin">
                                              Admin
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <Label htmlFor={`approved-${item._id}`}>
                                          Organizer approval
                                        </Label>
                                        <Select
                                          defaultValue={
                                            userDetails.user.isOrganizerApproved
                                              ? "yes"
                                              : "no"
                                          }
                                          onValueChange={(value) =>
                                            handleUpdateUser({
                                              userId: item._id,
                                              role: userDetails.user.role,
                                              isOrganizerApproved: value === "yes",
                                            })
                                          }
                                        >
                                          <SelectTrigger
                                            id={`approved-${item._id}`}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">
                                              Approved
                                            </SelectItem>
                                            <SelectItem value="no">
                                              Not approved
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="text-sm text-slate-600 flex items-end">
                                        Changes apply immediately and are logged by
                                        backend activity tracking.
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="donations">
                                <DonationsTab userId={selectedUserId} />
                              </TabsContent>
                            </Tabs>
                          ) : (
                            <div className="py-8 text-center text-slate-500">
                              Unable to load user details.
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="surface-card">
          <CardContent className="py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
