import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/routes/routes";
import { AuthContext } from "@/context/AuthContext";
import {
  Target,
  ImageIcon,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  CheckCircle,
  Eye,
  Heart,
  TrendingUp,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

const campaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(20, "Title must be less than 20 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  imageUrl: z.string().url("Must be a valid image URL"),
  target: z
    .number()
    .min(10, "Target must be at least $10")
    .max(1000000, "Target must be less than $1,000,000"),
});

export default function CreateCampaign() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      target: 1000,
      category: "",
      duration: 30,
      urgency: "medium",
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const watchedImageUrl = watch("imageUrl");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");
  const watchedTarget = watch("target");

  // Update image preview when URL changes
  useEffect(() => {
    if (
      watchedImageUrl &&
      watchedImageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)
    ) {
      setImagePreview(watchedImageUrl);
    } else {
      setImagePreview("");
    }
  }, [watchedImageUrl]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Organizer Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be an organizer to create campaigns.
          </p>
          <FundraisingButton
            variant="support"
            onClick={() => navigate(ROUTES.APPLY_ORGANIZER)}
          >
            Apply to Become Organizer
          </FundraisingButton>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const payload = {
      title: data.title,
      description: data.description,
      imageURL: data.imageUrl,
      target: data.target,
      category: data.category,
      duration: data.duration,
      urgency: data.urgency,
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Campaign created successfully! 🎉");
        navigate(ROUTES.HOME);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while creating the campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Create New Campaign
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Launch Your
            </span>
            <br />
            <span className="text-gray-800">Fundraising Campaign</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create a compelling campaign that inspires donors and drives
            meaningful change in your community.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="h-6 w-6" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Basic Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Start with the essential details of your campaign
                        </p>
                      </div>

                      <FormField
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Campaign Title *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Clean Water for Rural Communities in Kenya"
                                className="h-11 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                              />
                            </FormControl>
                            <div className="flex justify-between items-center">
                              <FormMessage />
                              <p className="text-xs text-gray-500">
                                {watchedTitle?.length || 0}/100 characters
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Campaign Description *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={6}
                                placeholder="Tell your story... What problem are you solving? Who will benefit? How will the funds be used? Be specific and compelling to inspire donors."
                                className="border-2 border-gray-200 focus:border-green-500 rounded-xl resize-none"
                              />
                            </FormControl>
                            <div className="flex justify-between items-center">
                              <FormMessage />
                              <p className="text-xs text-gray-500">
                                {watchedDescription?.length || 0}/2000
                                characters
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Media & Funding */}
                    <div className="space-y-6">
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Media & Funding
                        </h3>
                        <p className="text-sm text-gray-600">
                          Add visuals and set your funding goals
                        </p>
                      </div>

                      <FormField
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Campaign Image URL *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/your-campaign-image.jpg"
                                className="h-11 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500">
                              Use a high-quality image that represents your
                              cause (recommended: 1200x600px)
                            </p>
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-1 gap-6">
                        <FormField
                          name="target"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Funding Goal (USD) *
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                  <Input
                                    {...field}
                                    type="number"
                                    min="100"
                                    max="1000000"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                    className="pl-10 h-11 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                      <FundraisingButton
                        type="submit"
                        variant="success"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        loadingText="Creating Campaign..."
                        disabled={isSubmitting}
                      >
                        <Target className="h-5 w-5" />
                        Launch Campaign
                      </FundraisingButton>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Tips Section */}
          <div className="space-y-6">
            {/* Campaign Preview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Campaign preview"
                    className="w-full h-32 object-cover rounded-xl"
                    onError={() => setImagePreview("")}
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                    {watchedTitle || "Your campaign title will appear here"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {watchedDescription ||
                      "Your campaign description will appear here..."}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    ${watchedTarget?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Funding Goal</div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: Heart,
                    title: "Tell Your Story",
                    desc: "Share personal experiences and emotional connections to your cause",
                  },
                  {
                    icon: ImageIcon,
                    title: "Use Quality Images",
                    desc: "High-resolution photos that show the impact of your work",
                  },
                  {
                    icon: Target,
                    title: "Set Realistic Goals",
                    desc: "Research similar campaigns and set achievable funding targets",
                  },
                  {
                    icon: TrendingUp,
                    title: "Share Regularly",
                    desc: "Post updates and engage with your supporters throughout the campaign",
                  },
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <tip.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 text-sm">
                        {tip.title}
                      </h4>
                      <p className="text-green-700 text-xs">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800">
                    Platform Impact
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-xs text-blue-700">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      $2.5M+
                    </div>
                    <div className="text-xs text-blue-700">Raised</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
