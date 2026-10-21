import { useRef, useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export type MembershipCardBackgroundField = "frontBackgroundUrl";

interface MembershipCardBackgroundFieldsProps {
  token: string | null | undefined;
  frontBackgroundUrl: string;
  onChange: (field: MembershipCardBackgroundField, url: string) => void;
}

export default function MembershipCardBackgroundFields({
  token,
  frontBackgroundUrl,
  onChange,
}: MembershipCardBackgroundFieldsProps) {
  const { toast } = useToast();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    file?: File,
  ): Promise<void> => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Choose an image",
        description: "Only image files can be used as card backgrounds.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image is too large",
        description: "Choose an image smaller than 5 MB.",
        variant: "destructive",
      });
      return;
    }
    if (!token) {
      toast({
        title: "Admin session expired",
        description: "Sign in again to upload a card background.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch(
        "/api/admin/membership-tiers/upload-background",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.photoUrl !== "string") {
        throw new Error(result.error || "Could not upload the image.");
      }

      onChange("frontBackgroundUrl", result.photoUrl);
      toast({
        title: "Front background uploaded",
        description: "Save the tier to apply this card design.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Could not upload the image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Front card background</p>
        <p className="text-xs text-muted-foreground">
          Use a landscape image (about 540 × 340 px). Maximum file size: 5 MB.
        </p>
      </div>
      <div className="max-w-md space-y-2">
        <Label>Front background</Label>
        <div className="aspect-[16/10] overflow-hidden rounded-md border bg-white">
          {frontBackgroundUrl ? (
            <img
              src={frontBackgroundUrl}
              alt="Front card background preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              No image selected
            </div>
          )}
        </div>
        <input
          ref={frontInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          aria-label="Upload front card background"
          onChange={(event) => {
            const file = event.target.files?.[0];
            void handleUpload(file);
            event.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => frontInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Choose image"}
          </Button>
          {frontBackgroundUrl && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={uploading}
              onClick={() => onChange("frontBackgroundUrl", "")}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
