import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon 
} from "lucide-react";

export function DocumentUploader({ 
  label, 
  description, 
  required = false, 
  accept = { "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileSelect,
  existingFile = null
}) {
  const [file, setFile] = useState(existingFile);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError(null);
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError("File is too large. Maximum size is 10MB.");
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Invalid file type. Please upload JPG, PNG, or PDF.");
      } else {
        setError(rejection.errors[0].message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="h-8 w-8" />;
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return <ImageIcon className="h-8 w-8" />;
    }
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {!file ? (
        <Card 
          {...getRootProps()} 
          className={`cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? "border-2 border-blue-500 bg-blue-50" 
              : error
              ? "border-2 border-red-300 bg-red-50"
              : "border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
          }`}
        >
          <CardContent className="p-6">
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className={`h-12 w-12 mx-auto mb-3 ${
                isDragActive ? "text-blue-600" : error ? "text-red-500" : "text-gray-400"
              }`} />
              <p className="text-sm text-gray-700 font-medium mb-1">
                {isDragActive 
                  ? "Drop your file here" 
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, or PDF (max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-green-600">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
              <FundraisingButton
                type="button"
                variant="ghost-trust"
                size="sm"
                onClick={removeFile}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </FundraisingButton>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

