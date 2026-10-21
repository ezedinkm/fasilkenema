import PublicLayout from "@/components/PublicLayout";
import { ASSETS } from "@/lib/mockData";
import cardBackground from "@/assets/card-bg.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { LogOut, User, FileImage, FileText } from "lucide-react";

interface MemberData {
  id: number;
  membershipNumber: string;
  fullName: string;
  phone: string;
  rank: string | null;
  gender: string | null;
  address: string | null;
  division: string | null;
  tier: string;
  photoUrl: string | null;
  expiryDate: string;
  status: string;
}

export default function MemberDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [member, setMember] = useState<MemberData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadJPG = async () => {
    if (!cardRef.current || !member) return;
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = "540px";
    el.style.minWidth = "540px";
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const link = document.createElement("a");
      link.download = `membership-card-${member.membershipNumber}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current || !member) return;
    const el = cardRef.current;
    const origWidth = el.style.width;
    const origMinWidth = el.style.minWidth;
    el.style.width = "540px";
    el.style.minWidth = "540px";
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 540,
        height: 340,
        windowWidth: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`membership-card-${member.membershipNumber}.pdf`);
    } finally {
      el.style.width = origWidth;
      el.style.minWidth = origMinWidth;
    }
  };

  useEffect(() => {
    const fetchMemberData = async () => {
      const token = localStorage.getItem("memberToken");

      if (!token) {
        setLocation("/member/login");
        return;
      }

      try {
        const response = await fetch("/api/member/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("memberToken");
          localStorage.removeItem("memberData");
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          });
          setLocation("/member/login");
          return;
        }

        const data = await response.json();
        setMember(data);
        localStorage.setItem("memberData", JSON.stringify(data));
      } catch {
        localStorage.removeItem("memberToken");
        localStorage.removeItem("memberData");
        setLocation("/member/login");
      }
    };

    fetchMemberData();
  }, [setLocation, toast]);

  const handleLogout = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberData");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    setLocation("/");
  };

  const { data: branding } = useQuery<any[]>({
    queryKey: ["/api/public/branding"],
    staleTime: Infinity,
  });

  const brandingSettings = {
    signature:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.signature")?.value
        : null) || null,
    authorizedPersonName:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.authorizedPersonName")
            ?.value
        : null) || null,
    stamp:
      (Array.isArray(branding)
        ? branding.find((s: any) => s.key === "branding.stamp")?.value
        : null) || null,
  };

  if (!member) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16 text-center">Loading...</div>
      </PublicLayout>
    );
  }

  const tierStyle = { accent: "border-green-600" };
  const expiryDate = new Date(member.expiryDate);
  const isExpired = expiryDate < new Date();

  return (
    <PublicLayout>
      <div className="container px-4 py-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">የ አባልነት መታወቂያ</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ውጣ
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Card
            ref={cardRef}
            className="overflow-hidden shadow-2xl rounded-2xl relative"
            style={{ width: "540px", height: "340px" }}
          >
            <div className="relative h-full">
              <img
                src={cardBackground}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />

              <div
                className="relative h-full flex flex-col"
                style={{ zIndex: 2 }}
              >
                <div
                  className="px-4 py-1.5 text-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                >
                  <p className="font-heading text-sm font-bold tracking-wide text-white drop-shadow-md">
                    መቻል ስፖርት ክለብ የደጋፊዎች ማህበር
                  </p>
                </div>

                <div className="flex-1 flex gap-3 px-3 pt-2 pb-1">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-white/60 shadow-lg">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.fullName}
                          className="w-full h-full object-cover"
                          data-testid="member-photo"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/20">
                          <User className="w-10 h-10 text-white/70" />
                        </div>
                      )}
                    </div>
                    <div
                      className="px-2 py-0.5 rounded-md text-center shadow-md"
                      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                      <p className="text-[7px] uppercase tracking-wider text-yellow-300">
                        MEMBERSHIP ID
                      </p>
                      <p
                        className="font-mono font-bold text-[10px] text-white"
                        data-testid="membership-number"
                      >
                        {member.membershipNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <p
                      className="font-bold text-sm leading-tight text-white drop-shadow-md mb-0.5"
                      data-testid="member-name"
                    >
                      {member.fullName}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">መአረግ:</span>{" "}
                        <span className="font-semibold">
                          {member.rank || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">ዖታ:</span>{" "}
                        <span className="font-semibold">
                          {member.gender || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">አድራሻ:</span>{" "}
                        <span className="font-semibold">
                          {member.address || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">ክፈለ ጦር/እዝ:</span>{" "}
                        <span className="font-semibold">
                          {member.division || "—"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">ስልክ ቁጥር:</span>{" "}
                        <span className="font-semibold">{member.phone}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300 text-[10px]">★</span>
                      <p className="text-[10px] text-white drop-shadow-sm">
                        <span className="text-white/70">የ ደጋፊነት ደረጃ:</span>{" "}
                        <span className="font-bold capitalize">
                          {member.tier}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {brandingSettings.stamp && (
                        <div style={{ width: "75px", height: "75px" }}>
                          <img
                            src={brandingSettings.stamp}
                            alt="Stamp"
                            className="w-full h-full object-contain rounded-full drop-shadow-lg"
                          />
                        </div>
                      )}
                    </div>
                    <div
                      className="p-1 bg-white rounded shadow-md mt-1"
                      data-testid="qr-code"
                    >
                      <QRCode
                        value={`${window.location.origin}/card/${member.membershipNumber}`}
                        size={42}
                        level="M"
                      />
                    </div>
                  </div>
                </div>

                {isExpired && (
                  <div className="mx-3 mb-1 px-3 py-0.5 bg-red-600/90 text-white text-[10px] text-center rounded font-bold">
                    ጊዜው ያለፈበት / EXPIRED
                  </div>
                )}

                <div
                  className="px-3 py-1.5 flex items-center justify-between"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                >
                  <div className="text-white text-[9px] space-y-0">
                    <p className="drop-shadow-sm">
                      ያገልግልበት ቀን:{" "}
                      {expiryDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color:
                          member.status === "active" ? "#90EE90" : "#FFB6C1",
                      }}
                    >
                      ሁኔታ: {member.status === "active" ? "ንቁ" : "ያልነቃ"}
                    </p>
                  </div>
                  {(brandingSettings.signature ||
                    brandingSettings.authorizedPersonName) && (
                    <div className="text-center">
                      {brandingSettings.signature && (
                        <img
                          src={brandingSettings.signature}
                          alt="Authorized Signature"
                          className="h-6 mx-auto"
                          style={{
                            filter: "brightness(0) invert(1)",
                            opacity: 0.9,
                          }}
                        />
                      )}
                      {brandingSettings.authorizedPersonName && (
                        <p className="text-[7px] text-white/80">
                          {brandingSettings.authorizedPersonName}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-white font-heading text-[9px] font-bold tracking-wide drop-shadow-sm">
                    መቻል ስፖርት ክለብ የደጋፊዎች ማህበር
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadJPG}
            data-testid="button-download-jpg"
          >
            <FileImage className="mr-2 h-4 w-4" /> Download JPG
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownloadPDF}
            data-testid="button-download-pdf"
          >
            <FileText className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
