import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ROUTES from "@/routes/routes";
import {
  UserCheck,
  Shield,
  CheckCircle,
  Users,
  Target,
  Sparkles,
  FileText,
  Clock,
  Award,
  TrendingUp,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

// Enhanced Zod schema for application form
const applicationSchema = z.object({
  organizationName: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must be less than 100 characters"),
  description: z
    .string()
    .min(50, "Please provide at least 50 characters describing your cause")
    .max(1000, "Description must be less than 1000 characters"),
});

export default function ApplyOrganizer() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // If not logged in or not a donor, redirect appropriately
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(ROUTES.LOGIN + "?redirect=" + ROUTES.APPLY_ORGANIZER);
      } else if (user.role !== "donor") {
        navigate(ROUTES.HOME);
      }
    }
  }, [user, loading, navigate]);

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      organizationName: "",
      description: "",
      website: "",
      contactEmail: user?.email || "",
      phoneNumber: "",
      experience: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const res = await fetch("/api/organizer/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Application failed");
      }
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      toast.success(
        "Application submitted successfully! We'll review it within 2-3 business days."
      );
      navigate(ROUTES.HOME);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit application");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 text-sm font-medium mb-6">
            <UserCheck className="h-4 w-4 mr-2" />
            Organizer Application
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Become a Campaign
            </span>
            <br />
            <span className="text-gray-800">Organizer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join our trusted community of organizers and start creating
            meaningful change in your community and beyond.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Award className="h-6 w-6 text-amber-500" />
                  Organizer Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: Target,
                    title: "Create Campaigns",
                    desc: "Launch unlimited fundraising campaigns for your causes",
                  },
                  {
                    icon: Users,
                    title: "Build Community",
                    desc: "Connect with donors and supporters worldwide",
                  },
                  {
                    icon: TrendingUp,
                    title: "Track Impact",
                    desc: "Monitor your campaign progress with detailed analytics",
                  },
                  {
                    icon: Shield,
                    title: "Trusted Platform",
                    desc: "Benefit from our secure, transparent fundraising system",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-600 text-xs">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">
                    Quick Review Process
                  </h3>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">
                  Most applications are reviewed within 2-3 business days. We'll
                  notify you via email once your application is processed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Global Impact</h3>
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">
                  Join 500+ verified organizers who have raised over $2.5M for
                  causes worldwide through our platform.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="h-6 w-6" />
                  Application Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Organization Information */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Organization Information
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tell us about your organization or cause
                      </p>
                    </div>

                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="organizationName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Organization / Group Name *
                        </Label>
                        <Input
                          id="organizationName"
                          {...form.register("organizationName")}
                          placeholder="e.g. Clean Water Initiative"
                          className="h-11 border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                        />
                        {form.formState.errors.organizationName && (
                          <p className="text-red-500 text-sm">
                            {form.formState.errors.organizationName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-700"
                      >
                        Describe Your Cause *
                      </Label>
                      <Textarea
                        id="description"
                        rows={4}
                        {...form.register("description")}
                        placeholder="Tell us about your mission, the problems you're solving, and the impact you want to create..."
                        className="border-2 border-gray-200 focus:border-purple-500 rounded-xl resize-none"
                      />
                      <div className="flex justify-between items-center">
                        {form.formState.errors.description && (
                          <p className="text-red-500 text-sm">
                            {form.formState.errors.description.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {form.watch("description")?.length || 0}/1000
                          characters
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">
                            Application Review Process
                          </p>
                          <p>
                            Our team will review your application within 2-3
                            business days. We may contact you for additional
                            information if needed. You'll receive an email
                            notification once your application is approved.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FundraisingButton
                      type="submit"
                      variant="support"
                      size="lg"
                      fullWidth
                      loading={mutation.isPending}
                      loadingText="Submitting Application..."
                      disabled={mutation.isPending}
                    >
                      <Sparkles className="h-5 w-5" />
                      Submit Application
                    </FundraisingButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
