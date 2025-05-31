import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserRoleContext } from "@/context/UserRoleContext";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import ROUTES from "@/routes/routes";

const campaignSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  imageUrl: z.string().url(),
  target: z.number().min(1),
});

export default function CreateCampaign() {
  const { role } = useContext(UserRoleContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(campaignSchema) });
  const onSubmit = async (data) => {
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) navigate(ROUTES.HOME);
  };
  if (role !== "organizer")
    return (
      <p className="pt-20 text-center text-red-500">
        Switch to Organizer to create campaigns.
      </p>
    );
  return (
    <div className="pt-20 max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">New Campaign</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6">
          <FormField control={{}}>
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...register("title")} placeholder="Campaign title" />
              </FormControl>
              <FormMessage>{errors.title?.message}</FormMessage>
            </FormItem>
          </FormField>
          <FormField control={{}}>
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...register("description")}
                  placeholder="Campaign description"
                />
              </FormControl>
              <FormMessage>{errors.description?.message}</FormMessage>
            </FormItem>
          </FormField>
          <FormField control={{}}>
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  {...register("imageUrl")}
                  placeholder="https://example.com/img.jpg"
                />
              </FormControl>
              <FormMessage>{errors.imageUrl?.message}</FormMessage>
            </FormItem>
          </FormField>
          <FormField control={{}}>
            <FormItem>
              <FormLabel>Target Amount ($)</FormLabel>
              <FormControl>
                <Input type="number" {...register("target")} />
              </FormControl>
              <FormMessage>{errors.target?.message}</FormMessage>
            </FormItem>
          </FormField>
          <Button type="submit" className="w-full">
            Create Campaign
          </Button>
        </div>
      </Form>
    </div>
  );
}
