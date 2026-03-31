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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeletons";
import {
  PageHeader,
  RefreshButton,
  StatusBadge,
  EmptyState,
  Pagination,
  FilterCard,
  InfoRow,
  DetailSection,
} from "@/components/admin/AdminUtils";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Search, ShieldCheck, Mail, Eye, Users, AlertCircle, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// ─── DonationsTab ─────────────────────────────────────────────────────────────

function DonationsTab({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: adminQueryKeys.userDonations(userId),
    queryFn: () => getAdminUserDonations(userId),
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="text-sm">Failed to load donations: {error.message}</span>
      </div>
    );
  }

  if (!data?.donations?.length) {
    return <EmptyState icon={HandCoins} title="No donations yet" description="This user has not made any donations." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total donated</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{currency.format(data.totalAmount)}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.totalCount} {data.totalCount === 1 ? "donation" : "donations"}
        </p>
      </div>

      <div className="space-y-2">
        {data.donations.map((donation) => (
          <div key={donation._id} className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-md border border-border bg-muted/20 p-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">Campaign</p>
              {donation.campaign ? (
                <Link
                  to={`/donate/${donation.campaign._id}`}
                  className="text-sm font-medium text-chart-2 hover:text-foreground hover:underline transition-colors"
                >
                  {donation.campaign.title}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
              )}
            </div>
            <InfoRow label="Amount" value={`$${Number(donation.amount).toFixed(2)}`} />
            <InfoRow label="Date" value={format(new Date(donation.createdAt), "PP")} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
      if (!user) navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.ADMIN_USERS}`);
      else if (user.role !== "admin") navigate(ROUTES.HOME);
    }
  }, [loading, navigate, user]);

  const usersQueryParams = useMemo(
    () => ({ page, role: roleFilter, search: searchTerm }),
    [page, roleFilter, searchTerm],
  );

  const { data: usersData, isLoading, isFetching } = useQuery({
    queryKey: adminQueryKeys.users(usersQueryParams),
    queryFn: () => getAdminUsers(usersQueryParams),
    enabled: Boolean(user?.role === "admin"),
  });

  const users = usersData?.users ?? [];
  const totalPages = Number(usersData?.totalPages ?? 1);

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
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetails(variables.userId) }),
      ]);
      toast.success("User updated successfully");
    },
    onError: (error) => toast.error(error.message || "Failed to update user"),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleUpdateUser = async ({ userId, role, isOrganizerApproved }) => {
    await updateUserMutation.mutateAsync({ userId, payload: { role, isOrganizerApproved } });
  };

  if (loading || isLoading) return <AdminPageSkeleton statCount={0} listCount={5} variant="list" />;

  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">

        <PageHeader
          label="Admin · Users"
          title="User Management"
          description="Review roles, profile details, and organizer approval status."
          action={
            <RefreshButton
              disabled={isFetching}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })}
            />
          }
        />

        {/* Filters */}
        <FilterCard>
          <form className="grid gap-3 md:grid-cols-[1fr_200px_auto]" onSubmit={handleSearch}>
            <div>
              <Label htmlFor="search-users" className="text-xs font-medium text-muted-foreground">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-users"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Name or email…"
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-xs font-medium text-muted-foreground">Role</Label>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger id="role-filter" className="mt-1 h-9">
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
              <Button type="submit" size="sm">
                <Search className="h-3.5 w-3.5 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </FilterCard>

        {/* User list */}
        <div className="space-y-2">
          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting the filters or search term."
            />
          ) : (
            users.map((item) => (
              <Card key={item._id} className="surface-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <StatusBadge status={item.role} />
                        {item.isOrganizerApproved && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <ShieldCheck className="h-3 w-3" />
                            Approved
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {item.email}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedUserId(item._id)}>
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>User details</DialogTitle>
                          <DialogDescription>Review activity and update role or organizer approval.</DialogDescription>
                        </DialogHeader>

                        {isDetailsFetching ? (
                          <div className="py-12 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : userDetails?.user ? (
                          <Tabs defaultValue="overview">
                            <TabsList className="w-full">
                              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                              <TabsTrigger value="donations" className="flex-1">Donations</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4 mt-4">
                              {/* Stats row */}
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { label: "Role", value: <StatusBadge status={userDetails.user.role} /> },
                                  { label: "Donations", value: userDetails.donations?.length ?? 0 },
                                  { label: "Activities", value: userDetails.activities?.length ?? 0 },
                                ].map(({ label, value }) => (
                                  <div key={label} className="rounded-lg border border-border bg-muted/20 p-3">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                                    <div className="mt-1.5 text-lg font-bold text-foreground">{value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Admin controls */}
                              <DetailSection icon={ShieldCheck} title="Admin Controls">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`role-${item._id}`} className="text-xs text-muted-foreground">Role</Label>
                                    <Select
                                      defaultValue={userDetails.user.role ?? "donor"}
                                      onValueChange={(nextRole) =>
                                        handleUpdateUser({
                                          userId: item._id,
                                          role: nextRole,
                                          isOrganizerApproved: userDetails.user.isOrganizerApproved,
                                        })
                                      }
                                    >
                                      <SelectTrigger id={`role-${item._id}`} className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="donor">Donor</SelectItem>
                                        <SelectItem value="organizer">Organizer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor={`approved-${item._id}`} className="text-xs text-muted-foreground">Organizer approval</Label>
                                    <Select
                                      defaultValue={userDetails.user.isOrganizerApproved ? "yes" : "no"}
                                      onValueChange={(value) =>
                                        handleUpdateUser({
                                          userId: item._id,
                                          role: userDetails.user.role,
                                          isOrganizerApproved: value === "yes",
                                        })
                                      }
                                    >
                                      <SelectTrigger id={`approved-${item._id}`} className="mt-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="yes">Approved</SelectItem>
                                        <SelectItem value="no">Not approved</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <p className="md:col-span-2 text-xs text-muted-foreground">
                                    Changes apply immediately and are logged by backend activity tracking.
                                  </p>
                                </div>
                              </DetailSection>
                            </TabsContent>

                            <TabsContent value="donations" className="mt-4">
                              <DonationsTab userId={selectedUserId} />
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <EmptyState title="Unable to load user details" />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
