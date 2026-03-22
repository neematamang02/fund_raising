import { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/Context/AuthContext";
import ROUTES from "@/routes/routes";
import {
  adminQueryKeys,
  getAdminUserDetails,
  getAdminUsers,
  updateAdminUserStatus,
} from "@/services/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Search, ShieldCheck, Mail, Eye } from "lucide-react";
import { toast } from "sonner";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] px-4 py-8">
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

        <Card className="border-0 shadow-lg bg-white/90">
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
            <Card className="border-dashed">
              <CardContent className="py-14 text-center text-slate-600">
                No users found for the selected filters.
              </CardContent>
            </Card>
          ) : (
            users.map((item) => (
              <Card key={item._id} className="shadow-sm">
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
                            <div className="space-y-5">
                              <div className="grid md:grid-cols-3 gap-3">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-500">
                                      Role
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <RoleBadge role={userDetails.user.role} />
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-slate-500">
                                      Donations
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="text-xl font-bold text-slate-900">
                                    {userDetails.donations?.length || 0}
                                  </CardContent>
                                </Card>
                                <Card>
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

                              <Card className="border-dashed">
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

        <Card>
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
