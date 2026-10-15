import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import { DashboardHeader } from "@/components/ui/custom/DashboardHeader";
import { DashboardStats } from "@/components/super-admin/dashboard/DashboardStats";
import { BehavioralChart } from "@/components/super-admin/dashboard/BehavioralChart";
import { ModuleComplianceList } from "@/components/super-admin/clients/ModuleComplianceList";
import { getMyProfile } from "@/services/user.service";
import { getCompanyAnalytics } from "@/services/company.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const profileResponse = await getMyProfile().catch(() => null);
  const companyId = profileResponse?.success ? profileResponse.data._id : "";

  let analytics = null;
  if (companyId) {
    const analyticsResponse = await getCompanyAnalytics(companyId).catch(() => null);
    if (analyticsResponse?.success) {
      analytics = analyticsResponse.data;
    }
  }

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <DashboardHeader 
          title={analytics?.company?.name ? `${analytics.company.name} Overview` : "Company Dashboard"} 
          description="Real-time overview of active employees, training progress, and organization performance." 
        />
        <DashboardStats companyStats={analytics?.stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-125">
          <BehavioralChart 
            data={analytics?.barChart?.chartData || []} 
            averageIncrease={analytics?.barChart?.averageIncreasePercentage || 0}
          />
          <div className="col-span-1 h-full">
            <ModuleComplianceList modules={analytics?.moduleCompliance || []} />
          </div>
        </div>
      </DashboardPageLayout>
    </div>
  );
}
