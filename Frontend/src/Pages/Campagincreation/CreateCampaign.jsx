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
import { Button } from "@/components/ui/button";
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
import { AuthContext } from "@/Context/AuthContext";
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

const campaignSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  imageUrl: z.string().optional().or(z.literal("")),
  target: z
    .number()
    .min(10, "Target must be at least $10")
    .max(1000000, "Target must be less than $1,000,000"),
  expiryMode: z.enum(["duration", "date"]),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration must be 365 days or less"),
  deadlineAt: z.string().optional(),
});

export default function CreateCampaign() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const form = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      target: 1000,
      category: "",
      expiryMode: "duration",
      duration: 30,
      deadlineAt: "",
      urgency: "medium",
    },
  });

  const { handleSubmit, watch, setValue } = form;

  const watchedImageUrl = watch("imageUrl");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");
  const watchedTarget = watch("target");
  const watchedExpiryMode = watch("expiryMode");
  const watchedDuration = watch("duration");
  const watchedDeadlineAt = watch("deadlineAt");

  // Keep a live image preview from either selected file or image URL input.
  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    const trimmedUrl = (watchedImageUrl || "").trim();
    if (trimmedUrl) {
      setImagePreview(trimmedUrl);
      return;
    }

    setImagePreview("");
  }, [imageFile, watchedImageUrl]);

  const onFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setImageFile(nextFile);

    if (nextFile) {
      setValue("imageUrl", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const onImageUrlChange = (fieldOnChange, value) => {
    fieldOnChange(value);
    if (value.trim()) {
      setImageFile(null);
    }
  };

  const normalizeImageUrl = (value) => {
    if (!value || !value.trim()) return "";

    try {
      const parsed = new URL(value.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const normalizedImageUrl = normalizeImageUrl(data.imageUrl);
    const hasImageFile = Boolean(imageFile);
    const hasImageUrl = Boolean(normalizedImageUrl);

    if (hasImageFile === hasImageUrl) {
      toast.error(
        "Choose exactly one image source: upload a file or provide an image URL.",
      );
      setIsSubmitting(false);
      return;
    }

    if (normalizedImageUrl === null) {
      toast.error("Please provide a valid image URL (http/https).");
      setIsSubmitting(false);
      return;
    }

    if (data.expiryMode === "date") {
      if (!data.deadlineAt) {
        toast.error("Please select a campaign end date.");
        setIsSubmitting(false);
        return;
      }

      const parsedDeadline = new Date(data.deadlineAt);
      if (
        Number.isNaN(parsedDeadline.getTime()) ||
        parsedDeadline <= new Date()
      ) {
        toast.error("Campaign end date must be in the future.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = new FormData();
    payload.append("title", data.title);
    payload.append("description", data.description);
    payload.append("target", String(data.target));
    payload.append("category", data.category || "");
    payload.append("urgency", data.urgency || "medium");

    if (data.expiryMode === "date") {
      payload.append("deadlineAt", new Date(data.deadlineAt).toISOString());
    } else {
      payload.append("duration", String(data.duration));
    }

    if (hasImageFile) {
      payload.append("imageFile", imageFile);
    } else {
      payload.append("imageURL", normalizedImageUrl);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (res.ok) {
        toast.success("Campaign created successfully! 🎉");
        navigate(ROUTES.MY_CAMPAIGNS);
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

  if (!user) {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== "organizer") {
    return (
      <div className="min-h-screen surface-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-chart-4" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Organizer Access Required</h2>
          <p className="text-muted-foreground mb-6">You need to be an organizer to create campaigns.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate(ROUTES.APPLY_ORGANIZER)}>
            Apply to Become Organizer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Organizer</p>
          <h1 className="text-2xl font-bold text-foreground">Create New Campaign</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Launch a compelling campaign that inspires donors and drives meaningful change.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="border bg-card overflow-hidden">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
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
                            <FormLabel>Campaign Title *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g. Clean Water for Rural Communities in Kenya"
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
                            <FormLabel>Campaign Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={6}
                                placeholder="Tell your story... What problem are you solving? Who will benefit? How will the funds be used?"
                                className="resize-none"
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
                            <FormLabel>Campaign Image *</FormLabel>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Upload Image
                                </p>
                                <Input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.gif,.webp"
                                  onChange={onFileChange}
                                  disabled={Boolean((field.value || "").trim())}
                                />
                                <p className="text-xs text-gray-500">
                                  Upload one image file up to 5MB.
                                </p>
                              </div>

                                <div className="flex items-center gap-2 my-2">
                                  <div className="h-px flex-1 bg-border" />
                                  <span className="text-xs font-semibold text-muted-foreground uppercase">or</span>
                                  <div className="h-px flex-1 bg-border" />
                                </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Provide Image URL
                                </p>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(event) =>
                                      onImageUrlChange(
                                        field.onChange,
                                        event.target.value,
                                      )
                                    }
                                    disabled={Boolean(imageFile)}
                                    placeholder="https://example.com/your-campaign-image.jpg"
                                  />
                                </FormControl>
                              </div>
                            </div>
                            <FormMessage />
                            <p className="text-xs text-gray-500">
                              Choose one source only. Uploaded file or image
                              URL.
                            </p>
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-1 gap-6">
                        <FormField
                          name="target"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Funding Goal (USD) *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type="number"
                                    min="100"
                                    max="1000000"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="expiryMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Expiry Option *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select expiry option" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="duration">
                                    Expire after number of days
                                  </SelectItem>
                                  <SelectItem value="date">
                                    Expire on specific date
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchedExpiryMode === "duration" ? (
                          <FormField
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign Duration (Days) *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min="1"
                                    max="365"
                                    onChange={(e) =>
                                      field.onChange(
                                        Number(e.target.value || 0),
                                      )
                                    }
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-500">
                                  Campaign will end after {watchedDuration || 0}{" "}
                                  day(s).
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            name="deadlineAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign End Date *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="datetime-local"
                                    min={new Date().toISOString().slice(0, 16)}
                                  />
                                </FormControl>
                                {watchedDeadlineAt ? (
                                  <p className="text-xs text-gray-500">
                                    Ends on{" "}
                                    {new Date(
                                      watchedDeadlineAt,
                                    ).toLocaleString()}
                                    .
                                  </p>
                                ) : null}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-border">
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        size="sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><span className="animate-spin mr-2">⏳</span>Creating Campaign...</>
                        ) : (
                          <><Target className="h-4 w-4 mr-2" />Launch Campaign</>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Tips */}
          <div className="space-y-5">
            {/* Campaign Preview */}
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-chart-2" />
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
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-3">
                  <div className="text-xl font-bold text-primary">
                    ${watchedTarget?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Funding Goal</div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border bg-primary/5 border-primary/15">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Heart, title: "Tell Your Story", desc: "Share personal experiences and emotional connections to your cause" },
                  { icon: ImageIcon, title: "Use Quality Images", desc: "High-resolution photos that show the impact of your work" },
                  { icon: Target, title: "Set Realistic Goals", desc: "Research similar campaigns and set achievable funding targets" },
                  { icon: TrendingUp, title: "Share Regularly", desc: "Post updates and engage with your supporters throughout the campaign" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <tip.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm">{tip.title}</h4>
                      <p className="text-primary/70 text-xs">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Platform Stats */}
            {/* <Card className="border bg-chart-2/5 border-chart-2/15">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-chart-2/10 rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-chart-2">Platform Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-chart-2">500+</div>
                    <div className="text-xs text-chart-2/70">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-chart-2">$2.5M+</div>
                    <div className="text-xs text-chart-2/70">Raised</div>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}
