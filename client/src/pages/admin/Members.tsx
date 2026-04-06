import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getMembers,
  createAdminMember,
  getAdminMembershipTiers,
  updateMember,
  deleteMember,
} from "@/lib/api";
import type { Member } from "@shared/schema";

type AdminTierRow = { id: string; amharicVersion: string };

function tierBadgeClass(tier: string) {
  const t = tier.toLowerCase();
  if (t.includes("platinum"))
    return "border-yellow-500 text-yellow-600 bg-yellow-50";
  if (t.includes("gold")) return "border-primary text-primary bg-primary/5";
  if (t.includes("silver")) return "border-zinc-400 text-zinc-700 bg-zinc-50";
  return "border-zinc-200 text-zinc-800 bg-zinc-50";
}

/** Random membership id: FK- + alphanumeric chunk (low collision risk). */
function generateMembershipNumber(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      const hex = crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 14)
        .toUpperCase();
      return `FK-${hex}`;
    }
  } catch {
    /* fall through */
  }
  const a = Date.now().toString(36).toUpperCase();
  const b = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `FK-${a}${b}`;
}

export default function AdminMembers() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<AdminTierRow[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    dateOfBirth: "",
    country: "Ethiopia",
    city: "",
    tier: "",
    status: "active",
    membershipNumber: "",
    photoUrl: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminMembershipTiers();
        if (!cancelled && Array.isArray(data)) {
          setMembershipTiers(
            data.map((row: { id: string; amharicVersion?: string }) => ({
              id: String(row.id),
              amharicVersion: String(row.amharicVersion ?? ""),
            })),
          );
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load membership tiers",
          });
        }
      } finally {
        if (!cancelled) setTiersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const hay = [
        m.fullName,
        m.membershipNumber,
        m.phone,
        m.email ?? "",
        m.tier,
        m.city,
        m.country,
        m.status,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [members, searchQuery]);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load members",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setPhotoPreview(null);
    const firstTierId = membershipTiers[0]?.id ?? "";
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      dateOfBirth: "",
      country: "Ethiopia",
      city: "",
      tier: firstTierId,
      status: "active",
      membershipNumber: generateMembershipNumber(),
      photoUrl: "",
      expiryDate: "",
    });
    setIsDialogOpen(true);
  };

  const uploadPhotoFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Upload failed",
      );
    }
    if (typeof data.photoUrl !== "string") {
      throw new Error("Invalid upload response");
    }
    return data.photoUrl;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please use an image under 5MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setPhotoUploading(true);
    try {
      const photoUrl = await uploadPhotoFile(file);
      setFormData((prev) => ({ ...prev, photoUrl }));
      setPhotoPreview(null);
      toast({
        title: "Photo uploaded",
        description: "Image saved for this member.",
      });
    } catch (err) {
      setPhotoPreview(null);
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: msg,
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: "" }));
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setPhotoPreview(null);
    const exp =
      member.expiryDate != null
        ? new Date(member.expiryDate as unknown as string)
            .toISOString()
            .slice(0, 10)
        : "";
    setFormData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email ?? "",
      password: "",
      dateOfBirth: member.dateOfBirth,
      country: member.country,
      city: member.city,
      tier: member.tier,
      status: member.status,
      membershipNumber: member.membershipNumber,
      photoUrl: member.photoUrl || "",
      expiryDate: exp,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingMember) {
        const patch: Record<string, unknown> = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth,
          country: formData.country.trim(),
          city: formData.city.trim(),
          tier: formData.tier,
          status: formData.status,
          membershipNumber: formData.membershipNumber.trim(),
          photoUrl: formData.photoUrl.trim() || null,
          email: formData.email.trim()
            ? formData.email.trim().toLowerCase()
            : null,
        };
        if (formData.expiryDate.trim()) {
          patch.expiryDate = new Date(
            `${formData.expiryDate.trim()}T12:00:00`,
          ).toISOString();
        }
        await updateMember(editingMember.id, patch);
        toast({
          title: "Success",
          description: "Member updated successfully.",
        });
      } else {
        if (
          !formData.fullName.trim() ||
          !formData.phone.trim() ||
          !formData.dateOfBirth ||
          !formData.city.trim() ||
          !formData.country.trim()
        ) {
          toast({
            variant: "destructive",
            title: "Missing information",
            description:
              "Please fill in full name, phone, date of birth, country, and city.",
          });
          return;
        }
        if (!formData.tier) {
          toast({
            variant: "destructive",
            title: "Membership tier required",
            description:
              membershipTiers.length === 0
                ? "Add membership tiers in Settings (Membership Fees) first."
                : "Please select a membership tier.",
          });
          return;
        }
        const payload: Record<string, unknown> = {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth,
          country: formData.country.trim(),
          city: formData.city.trim(),
          tier: formData.tier,
          status: formData.status,
          membershipNumber: formData.membershipNumber.trim() || undefined,
          photoUrl: formData.photoUrl.trim() || undefined,
        };
        if (formData.email.trim()) {
          payload.email = formData.email.trim().toLowerCase();
        }
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }
        if (formData.expiryDate.trim()) {
          payload.expiryDate = new Date(
            `${formData.expiryDate.trim()}T12:00:00`,
          ).toISOString();
        }
        await createAdminMember(payload);
        toast({
          title: "Success",
          description:
            "Member registered without payment. They can sign in if a password was set.",
        });
      }
      fetchMembers();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save member";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      await deleteMember(id);
      toast({ title: "Success", description: "Member deleted successfully." });
      fetchMembers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete member",
      });
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Phone,Tier,Status,Joined\n" +
      members
        .map(
          (m) =>
            `${m.membershipNumber},${m.fullName},${m.phone},${m.tier},${m.status},${new Date(m.joinedDate).toLocaleDateString()}`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "members_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Started",
      description: "Downloading member list...",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900">
              Members
            </h1>
            <p className="text-muted-foreground">
              Manage club membership and subscriptions.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setPhotoPreview(null);
                  setPhotoUploading(false);
                  if (photoInputRef.current) photoInputRef.current.value = "";
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  onClick={handleCreate}
                  data-testid="button-add-member"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto sm:w-full">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? "Edit Member" : "Add member (no payment)"}
                  </DialogTitle>
                  {!editingMember && (
                    <p className="text-sm text-muted-foreground text-left font-normal">
                      Creates a member record immediately using tiers from your
                      database. No Chapa checkout.
                    </p>
                  )}
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      data-testid="input-phone"
                      placeholder="09xxxxxxxx or 07xxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (optional)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      data-testid="input-email"
                    />
                  </div>
                  {!editingMember && (
                    <div className="space-y-2">
                      <Label>Password (optional)</Label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        data-testid="input-password"
                        placeholder="Min. 6 characters if set"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank if the member will set a password later.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      data-testid="input-dob"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        data-testid="input-country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        data-testid="input-city"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Membership tier</Label>
                    <Select
                      value={formData.tier || undefined}
                      onValueChange={(val) =>
                        setFormData({ ...formData, tier: val })
                      }
                      disabled={tiersLoading || membershipTiers.length === 0}
                    >
                      <SelectTrigger data-testid="select-tier">
                        <SelectValue
                          placeholder={
                            tiersLoading
                              ? "Loading tiers…"
                              : membershipTiers.length === 0
                                ? "No tiers — add in Settings"
                                : "Select tier"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipTiers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="font-mono text-xs mr-2">
                              {t.id}
                            </span>
                            {t.amharicVersion || "—"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) =>
                        setFormData({ ...formData, status: val })
                      }
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Membership expires</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      data-testid="input-expiry"
                    />
                    <p className="text-xs text-muted-foreground">
                      On create, leave blank to let the server set expiry to one
                      year from today.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Membership number</Label>
                      {!editingMember && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs shrink-0"
                          onClick={() =>
                            setFormData((f) => ({
                              ...f,
                              membershipNumber: generateMembershipNumber(),
                            }))
                          }
                          data-testid="button-regenerate-membership-number"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          New code
                        </Button>
                      )}
                    </div>
                    <Input
                      value={formData.membershipNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          membershipNumber: e.target.value,
                        })
                      }
                      readOnly={!editingMember}
                      className={
                        !editingMember
                          ? "bg-muted font-mono text-sm"
                          : "font-mono text-sm"
                      }
                      data-testid="input-membership-number"
                    />
                    {!editingMember && (
                      <p className="text-xs text-muted-foreground">
                        Generated automatically. Use “New code” if you need
                        another random ID.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Photo (optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Upload from your computer (max 5MB).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-28 h-28 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
                        {photoPreview || formData.photoUrl ? (
                          <img
                            src={photoPreview || formData.photoUrl}
                            alt="Member"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon
                            className="h-10 w-10 text-zinc-300"
                            aria-hidden
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={handlePhotoChange}
                          data-testid="input-member-photo-file"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={photoUploading}
                            onClick={() => photoInputRef.current?.click()}
                            data-testid="button-choose-member-photo"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {photoUploading ? "Uploading…" : "Choose image"}
                          </Button>
                          {(photoPreview || formData.photoUrl) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={photoUploading}
                              onClick={handleRemovePhoto}
                              data-testid="button-remove-member-photo"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={photoUploading}
                    data-testid="button-save-member"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2 bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative w-full max-w-none sm:flex-1 sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, phone, email, tier…"
                className="pl-9 bg-zinc-50 border-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            {searchQuery.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start sm:self-auto shrink-0"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </Button>
            )}
          </div>
          {members.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {searchQuery.trim()
                ? `Showing ${filteredMembers.length} of ${members.length} members`
                : `${members.length} member${members.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No members yet. Add your first member to get started.
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No members match “{searchQuery.trim()}”. Try a different search.
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="sm:hidden p-2">
                <div className="divide-y divide-zinc-200">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono font-medium text-sm truncate">
                            {member.membershipNumber}
                          </div>
                          <div className="font-medium text-zinc-900 truncate">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.phone}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            Joined:{" "}
                            {new Date(member.joinedDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={tierBadgeClass(member.tier)}
                          >
                            {member.tier.toUpperCase()}
                          </Badge>

                          <Badge
                            className={`
                                ${
                                  member.status === "active"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : ""
                                }
                                ${
                                  member.status === "expired"
                                    ? "bg-zinc-500 hover:bg-zinc-600"
                                    : ""
                                }
                                ${
                                  member.status === "pending"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : ""
                                }
                              `}
                          >
                            {member.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                          data-testid={`button-edit-${member.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block w-full">
                <Table className="min-w-[820px] sm:min-w-0">
                  <TableHeader>
                    <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                      <TableHead className="w-[140px]">ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        data-testid={`row-member-${member.id}`}
                      >
                        <TableCell className="font-mono font-medium">
                          {member.membershipNumber}
                        </TableCell>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={tierBadgeClass(member.tier)}
                          >
                            {member.tier.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`
                                ${
                                  member.status === "active"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : ""
                                }
                                ${
                                  member.status === "expired"
                                    ? "bg-zinc-500 hover:bg-zinc-600"
                                    : ""
                                }
                                ${
                                  member.status === "pending"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : ""
                                }
                              `}
                          >
                            {member.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.joinedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            data-testid={`button-edit-${member.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
