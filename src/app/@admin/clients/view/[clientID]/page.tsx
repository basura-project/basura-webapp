"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getClientDetails } from "@/services/index";
import { PencilLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ViewClient({ params: { clientID } }: any) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<string>("");
  const [clientDetails, setClientDetails] = React.useState<any>({});
  const [showAll, setShowAll] = React.useState(false);


  React.useEffect(() => {
    (async () => {
      try {
        let res = await getClientDetails(clientID);
        if (res.data) {
          setClientDetails(res.data);
        }
        setIsLoading(false);
        setIsError("");
      } catch (e: any) {
        setIsLoading(false);
        setIsError(e.response.data.error);
        console.log(e);
      }
    })();
  }, [isLoading]);

  const showAllProperties = () => setShowAll(true);

  const {client_id, client_name, phone, email, username, properties} = clientDetails

  return (
    <div className="grid gap-2">
      <Breadcrumb className="hidden md:flex -mt-[68px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>View #{clientID}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card x-chunk="dashboard-05-chunk-3">
        <div className="hidden space-y-2 p-6 md:block">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              Client Details
            </h2>
          </div>
          <Separator className="my-6" />
          {isLoading && (
            <p className="font-regular space-y-2 pt-2 md:block">Loading...</p>
          )}
          {!isLoading && isError == "" && (
            <div className="flex-1 py-2">
              {/* <div className="mb-3">
                <p className="font-medium">Client Id</p>
                <p className="font-normal">{client_id}</p>
              </div> */}
              <div className="mb-3">
                <p className="font-medium">Client Name :</p>
                <p className="font-normal">{client_name}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Client Phone No :</p>
                <p className="font-normal">{phone}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Email :</p>
                <p className="font-normal">{email}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Properties :</p>
                <ul className="flex items-center flex-wrap">
                  {(showAll ? properties : properties?.slice(0, 2)).map((propertyID: string, index: number) => (
                    <li key={propertyID} className="mr-2">
                      <p className="text-sm text-blue-700">
                        <Link href={`/properties/view/${propertyID}`}>
                          {index > 0 && ", "}
                          {propertyID}
                        </Link>
                      </p>
                    </li>
                  ))}
                  {!showAll && properties.length > 2 && (
                    <li>
                      <Button onClick={showAllProperties} variant="secondary" className="ml-2 p-2 h-6">
                        +{properties.length - 2}
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
              <div className="mb-3">
                <p className="font-medium">User Name :</p>
                <p className="font-normal">{username}</p>
              </div>
              <Button className="font-normal">
                <PencilLine size={16} />
                <Link
                  className="pl-2"
                  href={`/clients/edit/${client_id}`}
                >
                  Edit
                </Link>
              </Button>
            </div>
          )}
        </div>
        {isError !== "" && !isLoading && (
          <p className="text-[0.8rem] font-medium text-destructive space-y-2 pt-0 p-6 md:block">
            {isError}
          </p>
        )}
      </Card>
    </div>
  );
}
