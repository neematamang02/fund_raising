import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, DollarSign, Building2, CreditCard, FileText, MapPin, Phone } from "lucide-react";

const WithdrawalRequest = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [formData, setFormData] = useState({
    amount: "",
    // Bank Details
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    iban: "",
    accountType: "savings",
    bankAddress: "",
    bankCountry: "",
    // KYC Info
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

  useEffect(() => {
    fetchCampaignAndBalance();
  }, [campaignId]);

  const fetchCampaignAndBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch campaign details
      const campaignRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);
      }

      // Fetch available balance
      const balanceRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/withdrawal-requests/available-balance/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setAvailableBalance(balanceData.availableBalance);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load campaign data");
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
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", docType);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/withdrawal-requests/upload-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.url) {
        setDocuments((prev) => ({
          ...prev,
          [docType]: { ...prev[docType], url: data.url, key: data.key },
        }));
        toast.success(`${docType.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`);
      } else {
        toast.error(data.message || "Failed to upload document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(formData.amount) > availableBalance) {
      toast.error(`Amount exceeds available balance of $${availableBalance}`);
      return;
    }

    // Validate required documents
    if (!documents.governmentId.url || !documents.bankProof.url || !documents.addressProof.url) {
      toast.error("Please upload all required documents (Government ID, Bank Proof, Address Proof)");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/withdrawal-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId,
          amount: parseFloat(formData.amount),
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
            ...(documents.taxDocument.url && { taxDocument: documents.taxDocument }),
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

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted successfully!");
        navigate("/my-campaigns");
      } else {
        toast.error(data.message || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Request Withdrawal</h1>
        <p className="text-muted-foreground">
          Submit a withdrawal request for your campaign funds
        </p>
      </div>

      {campaign && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>Available Balance: ${availableBalance.toFixed(2)}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Withdrawal Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Withdrawal Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                Available: ${availableBalance.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                  placeholder="For US banks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  placeholder="For international"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  placeholder="For international"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAddress">Bank Address</Label>
              <Input
                id="bankAddress"
                name="bankAddress"
                value={formData.bankAddress}
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

        {/* KYC Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Personal Information (KYC)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="state">State/Province</Label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="SSN, EIN, VAT, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Required Documents
            </CardTitle>
            <CardDescription>
              Upload clear, legible copies of the following documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Government ID */}
            <div className="space-y-3">
              <Label>Government ID *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={documents.governmentId.type}
                  onValueChange={(value) => handleDocumentTypeChange("governmentId", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "governmentId")}
                    disabled={uploading}
                  />
                  {documents.governmentId.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(documents.governmentId.url, "_blank")}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Proof */}
            <div className="space-y-3">
              <Label>Bank Proof *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={documents.bankProof.type}
                  onValueChange={(value) => handleDocumentTypeChange("bankProof", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="bank_letter">Bank Letter</SelectItem>
                    <SelectItem value="cancelled_check">Cancelled Check</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "bankProof")}
                    disabled={uploading}
                  />
                  {documents.bankProof.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(documents.bankProof.url, "_blank")}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Address Proof */}
            <div className="space-y-3">
              <Label>Address Proof *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={documents.addressProof.type}
                  onValueChange={(value) => handleDocumentTypeChange("addressProof", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility_bill">Utility Bill</SelectItem>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="government_letter">Government Letter</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "addressProof")}
                    disabled={uploading}
                  />
                  {documents.addressProof.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(documents.addressProof.url, "_blank")}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Document (Optional) */}
            <div className="space-y-3">
              <Label>Tax Document (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={documents.taxDocument.type}
                  onValueChange={(value) => handleDocumentTypeChange("taxDocument", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax_id">Tax ID</SelectItem>
                    <SelectItem value="ssn">SSN</SelectItem>
                    <SelectItem value="ein">EIN</SelectItem>
                    <SelectItem value="vat_certificate">VAT Certificate</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "taxDocument")}
                    disabled={uploading}
                  />
                  {documents.taxDocument.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(documents.taxDocument.url, "_blank")}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/my-campaigns")}
            disabled={loading || uploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Withdrawal Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WithdrawalRequest;
