"use client";

import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { editClient } from "@/services/index";

export default function EditClient({ clientDetails }: any) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<string>("");

  const formSchema = z
    .object({
      name: z
        .string()
        .min(1, { message: "Please enter Name" })
        .max(50),
      phone: z
        .string()
        .min(1, { message: "Please enter contact number" })
        .max(50),
      email: z
        .string()
        .min(1, { message: "Please enter email" })
        .email("This is not a valid email."),
      username: z.string().min(1, { message: "Please enter username" }).max(50),
      password: z.string().min(1, { message: "Please enter password" }).max(50),
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: clientDetails.client_name,
      phone: clientDetails.phone,
      email: clientDetails.email,
      username: clientDetails.username,
    },
  });

  async function onSubmit() {
    let values = form.getValues();
    setIsLoading(true);
    setIsError("");

    try {
      let clientDetailsForm = {
        client_id: clientDetails.client_id,
        client_name: values.name,
        phone: values.phone,
        email: values.email,
        username: values.username,
      };
      let res = await editClient(clientDetails.client_id, clientDetailsForm);
      if (res) {
        toast({
          title: "Successful",
          description: "Client details submitted successfully",
        });
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      if (e.response && e.response.data) {
        setIsError(e.response.data.error);
      }
      console.log(e);
    }
  }

  function clearForm() {
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input
                  id="Name"
                  placeholder="Name"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Phone No</FormLabel>
              <FormControl>
                <Input
                  id="phone"
                  placeholder="+1 XXXXXXXXX"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Id</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Name</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  placeholder="User Name"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          onClick={() => clearForm()}
          variant="outline"
          className="!mt-3 mr-3"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Clear
        </Button>

        <Button
          onClick={() => onSubmit()}
          className="!mt-3"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
