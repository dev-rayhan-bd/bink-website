import { Building2, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/ui/custom/DashboardHeader";
import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import { formatDate, getInitials } from "@/lib/utils";
import { getCompany } from "@/services/company.service";
import { getMyProfile } from "@/services/user.service";
//
export default async function CompanyProfilePage() {
  const profileResponse = await getMyProfile();

  if (!profileResponse.success) {
    throw new Error(profileResponse.message || "Unable to load profile");
  }

  const profile = profileResponse.data;
  const companyResponse = await getCompany(profile._id);

  if (!companyResponse.success) {
    throw new Error(companyResponse.message || "Unable to load company");
  }

  const company = companyResponse.data;

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <DashboardHeader
          title="Company Profile"
          description="View your company and account information."
        >
          <ChangePasswordModal />
        </DashboardHeader>

        <section className="max-w-5xl overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              {(company.image || company.logo) && (
                <AvatarImage src={company.image || company.logo} alt={company.firstName || company.fullName || company.name || "Company"} />
              )}
              <AvatarFallback>{getInitials(company.firstName || company.fullName || company.name || "Company")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {company.firstName || company.fullName || company.name || "Company"}
                </h2>
                <Badge variant={company.status === "active" ? "active" : "blocked"}>
                  {company.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{company.slug}</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <ProfileDetail icon={<Mail />} label="Company Email" value={company.email} />
            <ProfileDetail icon={<MapPin />} label="Address" value={company.address || "—"} />
            <ProfileDetail icon={<Building2 />} label="Member Since" value={formatDate(company.createdAt)} />
          </div>
        </section>

        <section className="max-w-5xl rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Account Information
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <ProfileDetail icon={<UserRound />} label="Account Name" value={profile.fullName} />
            <ProfileDetail icon={<Mail />} label="Login Email" value={profile.email || "—"} />
            <ProfileDetail icon={<ShieldCheck />} label="Role" value={profile.role} />
            <ProfileDetail icon={<ShieldCheck />} label="Authentication" value={profile.authType || "—"} />
          </div>
        </section>

        <section className="max-w-5xl rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Company Branding
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <ColorDetail
              label="Primary Color"
              color={company.branding?.primaryColor || "#8ACDDE"}
            />
            <ColorDetail
              label="Secondary Color"
              color={company.branding?.secondaryColor || "#E9308F"}
            />
            <ProfileDetail
              icon={<Building2 />}
              label="Video Title"
              value={company.branding?.videoTitle || "Not set"}
            />
            <ProfileDetail
              icon={<UserRound />}
              label="Presenter"
              value={company.branding?.presenterName || "Not set"}
            />
            <ProfileDetail
              icon={<ShieldCheck />}
              label="Presenter Designation"
              value={company.branding?.presenterDesignation || "Not set"}
            />
            <ProfileDetail
              icon={<Building2 />}
              label="Video Description"
              value={company.branding?.videoDescription || "Not set"}
            />
          </div>

          {company.branding?.videoUrl && (
            <video
              src={company.branding.videoUrl}
              controls
              className="mt-6 max-h-96 w-full rounded-md border border-border bg-background"
            />
          )}
        </section>
      </DashboardPageLayout>
    </div>
  );
}

function ColorDetail({ label, color }: { label: string; color: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="size-6 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium uppercase text-foreground">
          {color || "Not set"}
        </span>
      </div>
    </div>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 wrap-break-word text-sm font-medium capitalize text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
