import ResidentPropertyForm from "./components/property-forms/resident";
import MunicipalPropertyForm from "./components/property-forms/municipal";
import CommercialPropertyForm from "./components/property-forms/commercial";
import PropertiesList from "./properties-list";

import { Card } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Page() {
  return (
    <>
      <Breadcrumb className="hidden md:flex -mt-[44px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/employees">Properties</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultValue="manageEmployee">
        <div className="flex items-center !mb-4">
          <TabsList>
            <TabsTrigger value="manageEmployee">Manage Properties</TabsTrigger>
            <TabsTrigger value="addNewEmployee">Add New Property</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="manageEmployee">
          <Card x-chunk="dashboard-05-chunk-3">
            <div className="hidden space-y-2 p-6 pb-8 md:block">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                  Manage Properties
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage & Update Property details
                </p>
              </div>
              <Separator className="my-6" />
              <div className="flex-1 ">
                <PropertiesList />
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="addNewEmployee">
          <Card x-chunk="dashboard-05-chunk-3">
            <div className="hidden space-y-2 p-6 pb-18 md:block">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                  Add New Property
                </h2>
                <p className="text-sm text-muted-foreground">
                  Verify all the details before submission.
                </p>
              </div>
              <Separator className="my-6" />
              <div className="flex-1 lg:max-w-sm">
                <Tabs defaultValue="residentBuilding">
                  <div className="flex items-center !mb-4">
                    <TabsList>
                      <TabsTrigger value="residentBuilding">
                        Resident Building
                      </TabsTrigger>
                      <TabsTrigger value="commercial">Commercial</TabsTrigger>
                      <TabsTrigger value="municipal">Municipal</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="residentBuilding">
                    <ResidentPropertyForm />
                  </TabsContent>
                  <TabsContent value="commercial">
                    <CommercialPropertyForm />
                  </TabsContent>
                  <TabsContent value="municipal">
                    <MunicipalPropertyForm />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
