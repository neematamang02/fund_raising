import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { DocumentUploader } from "@/components/DocumentUploader";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

export default function ImageUploadDemo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  const canUpload = useMemo(
    () => selectedFile && !isUploading,
    [selectedFile, isUploading],
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image before uploading.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      const imageItem = {
        imageUrl: result.imageUrl,
        imageFullUrl: result.imageFullUrl,
        filename: result.filename,
      };

      setUploadedImages((prev) => [imageItem, ...prev]);
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError.message || "Unexpected upload error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Upload className="h-6 w-6 text-blue-600" />
                Local Image Upload Demo
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                Max 5MB • jpg/jpeg/png/gif/webp
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentUploader
              label="Select image"
              description="This uploads directly to local server storage and returns a public /uploads URL."
              required
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
              maxSize={5 * 1024 * 1024}
              onFileSelect={setSelectedFile}
              existingFile={null}
            />

            <div className="flex items-center gap-3">
              <FundraisingButton
                type="button"
                disabled={!canUpload}
                onClick={handleUpload}
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </FundraisingButton>

              {selectedFile && !isUploading && (
                <span className="text-sm text-slate-600">
                  Selected: {selectedFile.name}
                </span>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedImages.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-slate-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                Upload an image to see it appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div
                    key={image.filename}
                    className="rounded-lg border bg-white overflow-hidden"
                  >
                    <img
                      src={image.imageFullUrl || image.imageUrl}
                      alt={image.filename}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-3 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Upload successful
                      </div>
                      <p
                        className="text-sm text-slate-800 truncate"
                        title={image.filename}
                      >
                        {image.filename}
                      </p>
                      <a
                        href={image.imageFullUrl || image.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {image.imageUrl}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
