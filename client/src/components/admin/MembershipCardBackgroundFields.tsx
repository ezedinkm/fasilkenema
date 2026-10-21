import { useRef, useState, type RefObject } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export type MembershipCardBackgroundField =
  | "frontBackgroundUrl"
  | "backBackgroundUrl";

interface MembershipCardBackgroundFieldsProps {
  token: string | null | undefined;
  frontBackgroundUrl: string;
  backBackgroundUrl: string;
  onChange: (field: MembershipCardBackgroundField, url: string) => void;
}

export default function MembershipCardBackgroundFields({
  token,
  frontBackgroundUrl,
  backBackgroundUrl,
  onChange,
}: MembershipCardBackgroundFieldsProps) {
  const { toast } = useToast();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"front" | "back" | null>(null);

  const handleUpload = async (
    side: "front" | "back",
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

    setUploading(side);
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

      onChange(
        side === "front" ? "frontBackgroundUrl" : "backBackgroundUrl",
        result.photoUrl,
      );
      toast({
        title: `${side === "front" ? "Front" : "Back"} background uploaded`,
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
      setUploading(null);
    }
  };

  const renderSide = (
    side: "front" | "back",
    url: string,
    inputRef: RefObject<HTMLInputElement | null>,
  ) => {
    const label = side === "front" ? "Front background" : "Back background";
    const isUploading = uploading === side;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="aspect-[16/10] overflow-hidden rounded-md border bg-white">
          {url ? (
            <img
              src={url}
              alt={`${label} preview`}
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
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          aria-label={`Upload ${label.toLowerCase()}`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            void handleUpload(side, file);
            event.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading !== null}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading…" : "Choose image"}
          </Button>
          {url && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={uploading !== null}
              onClick={() =>
                onChange(
                  side === "front"
                    ? "frontBackgroundUrl"
                    : "backBackgroundUrl",
                  "",
                )
              }
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">Membership card backgrounds</p>
        <p className="text-xs text-muted-foreground">
          Use landscape images (about 540 × 340 px). Maximum file size: 5 MB.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {renderSide("front", frontBackgroundUrl, frontInputRef)}
        {renderSide("back", backBackgroundUrl, backInputRef)}
      </div>
    </div>
  );
}
