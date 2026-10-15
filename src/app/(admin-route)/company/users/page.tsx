import { columns } from "@/components/company/users/CompanyUserColumn";
import { DataTable } from "@/components/ui/custom/data-table";
import { DashboardHeader } from "@/components/ui/custom/DashboardHeader";
import DashboardPageLayout from "@/components/ui/custom/DashboardPageLayout";
import type { TSearchParams } from "@/lib/types/global.type";
import { getCompanyUsers } from "@/services/user.service";

export const dynamic = "force-dynamic";

export default async function CompanyUsersPage({
  searchParams,
}: {
  searchParams: TSearchParams;
}) {
  const params = await searchParams;
  const response = await getCompanyUsers(params);

  if (!response.success) {
    throw new Error(response.message || "Unable to load company users");
  }

  return (
    <div className="animate-fadeIn">
      <DashboardPageLayout>
        <DashboardHeader
          title="User Management"
          description="View all enrolled users within your company."
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
            searchPlaceholder="Search users..."
          />
        </div>
      </DashboardPageLayout>
    </div>
  );
}
