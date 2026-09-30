/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm, Controller, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  generateQrSchema,
  GenerateQrFormValues,
} from "@/lib/validations/location-performance";

export function GenerateQRModal() {
  const [open, setOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const methods = useForm<GenerateQrFormValues>({
    resolver: zodResolver(generateQrSchema as any),
    defaultValues: {
      company: "",
      location: "",
      logMethod: "",
      password: "",
      courses: ["Social Safety"],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const selectedCourses = useWatch({ control, name: "courses" }) || [];

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setCourseSearch("");
    }
  };

  const handleRemoveCourse = (course: string) => {
    setValue(
      "courses",
      selectedCourses.filter((c) => c !== course),
      { shouldValidate: true }
    );
  };

  const handleAddCourse = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newCourse = courseSearch.trim();
      if (newCourse && !selectedCourses.includes(newCourse)) {
        setValue("courses", [...selectedCourses, newCourse], {
          shouldValidate: true,
        });
      }
      setCourseSearch("");
    }
  };

  const onSubmit = () => {
    // Add logic here to save data
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate New QR
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col p-6 sm:max-w-125">
        <DialogHeader className="mb-2 shrink-0">
          <DialogTitle className="text-xl font-bold uppercase tracking-wide text-foreground">
            Generate Access QR
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
              <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Select Client Company</FieldLabel>
                <Controller
                  control={control}
                  name="company"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unilever">Unilever</SelectItem>
                        <SelectItem value="retail">Retail Corp</SelectItem>
                        <SelectItem value="hema">Hema</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.company]} />
              </Field>

              <Field>
                <FieldLabel>Location/Team Name</FieldLabel>
                <Input placeholder="Type here" {...register("location")} />
                <FieldError errors={[errors.location]} />
              </Field>

              <Field>
                <FieldLabel>Select log Method</FieldLabel>
                <Controller
                  control={control}
                  name="logMethod"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select log method..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employ_id">Employ ID</SelectItem>
                        <SelectItem value="anonymous">Anonymous</SelectItem>
                        <SelectItem value="email">Email address</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.logMethod]} />
              </Field>

              <Field>
                <FieldLabel>Set Password</FieldLabel>
                <Input
                  type="password"
                  placeholder="Type here"
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field>
                <FieldLabel>Select Course To Link</FieldLabel>
                <div className="relative">
                  <Input
                    placeholder="Type course name and press enter..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    onKeyDown={handleAddCourse}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Selected Courses Tags */}
                {selectedCourses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedCourses.map((course) => (
                      <Badge
                        key={course}
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1.5 px-2 py-1 font-medium"
                      >
                        {course}
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(course)}
                          className="text-destructive hover:text-destructive/80 transition-colors focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FieldError errors={[errors.courses]} />
              </Field>
            </FieldGroup>
          </div>

          <div className="flex shrink-0 justify-end border-t pt-4 mt-4">
            <Button type="submit" className="w-full sm:w-auto px-8">
              Add
            </Button>
          </div>
        </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
