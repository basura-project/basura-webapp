import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AnalyticsPage() {
  return (
    <>
      <Breadcrumb className="hidden md:flex -mt-[44px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/analytics">Analytics</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="">
        <Card x-chunk="dashboard-05-chunk-3">
          <div className="hidden space-y-2 p-6 md:block">
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold tracking-tight">
                Analytics
              </h2>
              <p>Metrics for daily submissions, waste collected</p>
            </div>
            <Separator className="my-6" />
          </div>
        </Card>
      </div>
    </>
  );
}
