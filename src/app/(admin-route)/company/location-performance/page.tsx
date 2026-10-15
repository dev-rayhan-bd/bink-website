import { columns } from "@/components/company/location-performance/CompanyTeamColumn";
import { DashboardHeader } from "@/components/ui/custom/DashboardHeader";
import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import { DataTable } from "@/components/ui/custom/data-table";
import type { TSearchParams } from "@/lib/types/global.type";
import { getTeams } from "@/services/team.service";

export default async function LocationPerformancePage({
  searchParams,
}: {
  searchParams: TSearchParams;
}) {
  const params = await searchParams;
  const response = await getTeams(params);

  if (!response.success) {
    throw new Error(response.message || "Unable to load teams");
  }

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <DashboardHeader
          title="Our Teams"
          description="View the teams assigned to your company."
        />

        <div className="rounded-md border border-border bg-card p-4 shadow-sm">
          <DataTable
            columns={columns}
            data={response.data.result}
            meta={{
              page: response.data.meta.page,
              limit: response.data.meta.limit,
              total: response.data.meta.total,
              totalPages: response.data.meta.totalPage,
            }}
            limit={response.data.meta.limit}
            searchKey="searchTerm"
            searchPlaceholder="Search teams..."
          />
        </div>
      </DashboardPageLayout>
    </div>
  );
}
