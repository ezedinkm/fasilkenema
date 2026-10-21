import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SITE_POPUP_SETTING_KEY } from "@shared/schema";

const DISMISSED_POPUP_STORAGE_KEY = "fasil-site-popup-dismissed";

function isSafePopupUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

export default function SitePopupNotification() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/public/settings"],
    staleTime: 30_000,
  });
  const popupSetting = Array.isArray(settings)
    ? settings.find((setting: any) => setting.key === SITE_POPUP_SETTING_KEY)
    : undefined;
  const popup =
    popupSetting?.value &&
    typeof popupSetting.value === "object" &&
    !Array.isArray(popupSetting.value)
      ? popupSetting.value
      : {};

  const message = typeof popup.text === "string" ? popup.text.trim() : "";
  const imageUrl =
    typeof popup.imageUrl === "string" ? popup.imageUrl.trim() : "";
  const buttonText =
    typeof popup.buttonText === "string" ? popup.buttonText.trim() : "";
  const linkUrl =
    typeof popup.linkUrl === "string" ? popup.linkUrl.trim() : "";
  const revision = [
    String(popupSetting?.updatedAt ?? ""),
    message,
    imageUrl,
    buttonText,
    linkUrl,
  ].join("|");
  const isConfigured =
    popup.enabled === true &&
    Boolean(message) &&
    isSafePopupUrl(imageUrl) &&
    isSafePopupUrl(linkUrl);

  const [dismissedRevision, setDismissedRevision] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(DISMISSED_POPUP_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [open, setOpen] = useState(false);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_POPUP_STORAGE_KEY, revision);
    } catch {
      // Keep the popup dismissible when browser storage is unavailable.
    }
    setDismissedRevision(revision);
    setOpen(false);
  };

  useEffect(() => {
    if (!isConfigured || dismissedRevision === revision) {
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [dismissedRevision, isConfigured, revision]);

  if (!isConfigured) return null;

  const isExternalLink = /^https?:\/\//i.test(linkUrl);
  const externalLinkProps = isExternalLink
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-xl gap-0 overflow-hidden border-0 p-0 sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Website announcement</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <a
          href={linkUrl}
          {...externalLinkProps}
          onClick={dismiss}
          className="block bg-zinc-100"
          aria-label={buttonText || "Open announcement"}
        >
          <img
            src={imageUrl}
            alt={message}
            className="max-h-[55vh] w-full object-contain"
          />
        </a>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="whitespace-pre-line text-base leading-relaxed text-zinc-800">
            {message}
          </p>
          {buttonText && (
            <a
              href={linkUrl}
              {...externalLinkProps}
              onClick={dismiss}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              {buttonText}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
