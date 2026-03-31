import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

function statusClass(status) {
  if (status === "verified") return "bg-primary/15 text-primary border-primary/25";
  if (status === "rejected") return "bg-destructive/15 text-destructive border-destructive/25";
  if (status === "pending") return "bg-chart-4/15 text-chart-4 border-chart-4/25";
  return "bg-muted text-muted-foreground";
}

export default function OrganizerProfile() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentReuseSummary, setDocumentReuseSummary] = useState(null);

  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    accountType: "savings",
    bankAddress: "",
    bankCountry: "",
    fullLegalName: "",
    dateOfBirth: "",
    nationality: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
    taxId: "",
  });

  const [documents, setDocuments] = useState({
    governmentId: { url: "", type: "passport" },
    bankProof: { url: "", type: "bank_statement" },
    addressProof: { url: "", type: "utility_bill" },
    taxDocument: { url: "", type: "tax_id" },
  });

  const isVerificationApproved =
    profileStatus === "verified" || profileStatus === "approved";

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/organizer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load organizer profile.");
      }

      const data = await res.json();
      setProfileStatus(data.verificationStatus);
      setRejectionReason(data.profile?.rejectionReason || "");
      setDocumentReuseSummary(data.documentReuseSummary || null);

      setDocuments((prev) => ({
        ...prev,
        ...(data.documentDefaults || {}),
      }));

      if (data.profile) {
        const profile = data.profile;
        setFormData((prev) => ({
          ...prev,
          accountHolderName: profile.bankDetails?.accountHolderName || "",
          bankName: profile.bankDetails?.bankName || "",
          accountType: profile.bankDetails?.accountType || "savings",
          bankAddress: profile.bankDetails?.bankAddress || "",
          bankCountry: profile.bankDetails?.bankCountry || "",
          fullLegalName: profile.kycInfo?.fullLegalName || "",
          dateOfBirth: profile.kycInfo?.dateOfBirth
            ? String(profile.kycInfo.dateOfBirth).slice(0, 10)
            : "",
          nationality: profile.kycInfo?.nationality || "",
          street: profile.kycInfo?.address?.street || "",
          city: profile.kycInfo?.address?.city || "",
          state: profile.kycInfo?.address?.state || "",
          postalCode: profile.kycInfo?.address?.postalCode || "",
          country: profile.kycInfo?.address?.country || "",
          phoneNumber: profile.kycInfo?.phoneNumber || "",
          taxId: profile.kycInfo?.taxId || "",
        }));

        setDocuments((prev) => ({
          ...prev,
          ...(profile.documents || {}),
        }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to load organizer profile.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentTypeChange = (docType, type) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], type },
    }));
  };

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("document", file);
      payload.append("documentType", docType);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/organizer/profile/upload-document`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: payload,
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload document");
      }

      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          url: data.url,
          key: data.key,
          source: "uploaded",
        },
      }));

      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !documents.governmentId.url ||
      !documents.bankProof.url ||
      !documents.addressProof.url
    ) {
      toast.error("Please upload Government ID, Bank Proof, and Address Proof");
      return;
    }

    if (!formData.accountNumber) {
      toast.error("Account number is required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/organizer/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankDetails: {
            accountHolderName: formData.accountHolderName,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber,
            swiftCode: formData.swiftCode,
            iban: formData.iban,
            accountType: formData.accountType,
            bankAddress: formData.bankAddress,
            bankCountry: formData.bankCountry,
          },
          documents: {
            governmentId: documents.governmentId,
            bankProof: documents.bankProof,
            addressProof: documents.addressProof,
            ...(documents.taxDocument.url && {
              taxDocument: documents.taxDocument,
            }),
          },
          kycInfo: {
            fullLegalName: formData.fullLegalName,
            dateOfBirth: formData.dateOfBirth,
            nationality: formData.nationality,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
              country: formData.country,
            },
            phoneNumber: formData.phoneNumber,
            taxId: formData.taxId,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to save organizer profile");
      }

      toast.success("Organizer profile submitted for verification");
      setProfileStatus("pending");
      setRejectionReason("");
    } catch (err) {
      toast.error(err.message || "Failed to save organizer profile");
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page px-4 py-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Organizer</p>
          <h1 className="text-2xl font-bold text-foreground">Profile & Verification</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Set up your one-time KYC and bank profile to enable withdrawals.
          </p>
        </div>

      <Card className="border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Verification Status</span>
            <Badge className={statusClass(profileStatus)}>
              {(profileStatus || "not_submitted").toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Withdrawals are enabled only when your organizer profile is
            verified.
          </CardDescription>
        </CardHeader>
        {profileStatus === "rejected" && rejectionReason && (
          <CardContent>
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-destructive">
              <p className="font-medium">Review Feedback</p>
              <p className="mt-1 whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {isVerificationApproved ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile Already Approved</CardTitle>
            <CardDescription>
              Your organizer profile and KYC verification are approved. No
              further action is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If your legal or bank details change, contact support to request a
              profile review update.
            </p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, accountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankCountry">Bank Country *</Label>
                <Input
                  id="bankCountry"
                  name="bankCountry"
                  value={formData.bankCountry}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KYC Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullLegalName">Full Legal Name *</Label>
                <Input
                  id="fullLegalName"
                  name="fullLegalName"
                  value={formData.fullLegalName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>
                Reused documents are prefilled from your approved organizer
                application. Upload only missing documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentReuseSummary?.reusableDocumentsCount > 0 && (
                <div className="rounded-md border border-chart-2/20 bg-chart-2/5 p-3 text-sm text-chart-2">
                  {documentReuseSummary.reusableDocumentsCount} document(s)
                  reused from your approved organizer application. Bank Proof
                  still requires a dedicated upload.
                </div>
              )}

              {[
                ["governmentId", "Government ID", true],
                ["bankProof", "Bank Proof", true],
                ["addressProof", "Address Proof", true],
                ["taxDocument", "Tax Document", false],
              ].map(([key, label, required]) => (
                <div key={key} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {label} {required ? "*" : "(Optional)"}
                    </p>
                    {documents[key].url && (
                      <Badge>
                        {documents[key].source === "organizer_application"
                          ? "Reused"
                          : "Uploaded"}
                      </Badge>
                    )}
                  </div>

                  <Select
                    value={documents[key].type}
                    onValueChange={(value) =>
                      handleDocumentTypeChange(key, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {key === "governmentId" && (
                        <>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">
                            Driver License
                          </SelectItem>
                          <SelectItem value="national_id">
                            National ID
                          </SelectItem>
                        </>
                      )}
                      {key === "bankProof" && (
                        <>
                          <SelectItem value="bank_statement">
                            Bank Statement
                          </SelectItem>
                          <SelectItem value="bank_letter">
                            Bank Letter
                          </SelectItem>
                          <SelectItem value="cancelled_check">
                            Cancelled Check
                          </SelectItem>
                        </>
                      )}
                      {key === "addressProof" && (
                        <>
                          <SelectItem value="utility_bill">
                            Utility Bill
                          </SelectItem>
                          <SelectItem value="bank_statement">
                            Bank Statement
                          </SelectItem>
                          <SelectItem value="government_letter">
                            Government Letter
                          </SelectItem>
                        </>
                      )}
                      {key === "taxDocument" && (
                        <>
                          <SelectItem value="tax_id">Tax ID</SelectItem>
                          <SelectItem value="ssn">SSN</SelectItem>
                          <SelectItem value="ein">EIN</SelectItem>
                          <SelectItem value="vat_certificate">
                            VAT Certificate
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-primary">
                    <Upload className="h-4 w-4" />
                    Upload file
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, key)}
                    />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || uploading}
            className="w-full"
          >
            {(loading || uploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit for Verification
          </Button>
        </form>
      )}
      </div>
    </div>
  );
}
