import React from "react";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  getGarbageAttributes,
  editGarbageAttribute,
  addGarbageAttribute,
  deleteGarbageAttribute,
} from "@/services/index";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface GarbageAttributeFormProps {
  mode: "add" | "edit" | "delete";
  attribute?: any; // Optional attribute data for edit/delete modes
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  attributeName: z.string().min(1, { message: "Please enter Name" }).max(50),
  color: z.string().min(1, { message: "Please enter Client Name" }).max(50),
});

export default function GarbageAttributeForm({
  mode,
  attribute,
  onSubmit,
  onCancel,
}: GarbageAttributeFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attributeName: mode === "edit" ? attribute.attribute_name : "",
      color: mode === "edit"? attribute.color : "#B67B43",
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsError("");

    try {
      let result;
      if (mode === "add") {
        result = await addGarbageAttribute({
          attribute_name: values.attributeName,
          color: values.color,
        });
      } else if (mode === "edit") {
        result = await editGarbageAttribute(attribute.attribute_name, {
          attribute_name: values.attributeName,
          color: values.color,
        });
      } else if (mode === "delete") {
        result = await deleteGarbageAttribute(attribute.attribute_name);
      }

      if (result) {
        toast({
          title: "Success",
          description:
            mode === "delete"
              ? "Attribute deleted successfully."
              : mode === "add"
              ? "Attribute added successfully."
              : "Attribute updated successfully.",
        });
        onSubmit(values);
      }
    } catch (error) {
      setIsError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={
          mode === "delete"
            ? (e) => {
                e.preventDefault();
                handleFormSubmit({} as any);
              }
            : form.handleSubmit(handleFormSubmit)
        }
        className="flex flex-col space-y-2"
      >
        {mode !== "delete" ? (
          <>
            <FormField
              control={form.control}
              name="attributeName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <FormLabel htmlFor="attributeName">Name</FormLabel>
                    <FormControl>
                      <Input
                        id="attributeName"
                        placeholder="Attribute Name"
                        type="text"
                        autoCapitalize="none"
                        autoComplete="attributeName"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormLabel htmlFor="Color">Color</FormLabel>
                  <FormControl>
                    <Input
                      id="Color"
                      type="color"
                      disabled={isLoading}
                      {...field}
                      style={{ backgroundColor: field.value }}
                      className="border-0 p-0 w-8 h-8 rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-6 flex justify-end">
              <Button type="submit" className="!mt-3" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : mode === "add" ? (
                  "Submit"
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p>
              Are you sure you want to delete "{attribute?.attribute_name}"?
            </p>
            <Button
              className="mt-6 ml-auto"
              type="submit"
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
            <Button
              onClick={onCancel}
              className="!mt-3 ml-3"
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
        {isError && <p className="text-red-500">{isError}</p>}
      </form>
    </Form>
  );
}
