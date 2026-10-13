"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Video, X } from "lucide-react";
import { BrandingCompanySelect } from "@/components/super-admin/branding/BrandingCompanySelect";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Company,
  CompanyBrandingData,
  CompanyDropdownItem,
} from "@/lib/types/company.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { updateCompanyBranding } from "@/services/company.service";

export function BrandingForm({
  company,
  companies,
  selectedCompanyId,
}: {
  company: Company;
  companies: CompanyDropdownItem[];
  selectedCompanyId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [logo, setLogo] = useState<File>();
  const [video, setVideo] = useState<File>();

  console.log("=== BRANDING FETCHED DATA (Company) ===", {
    companyId: company._id,
    name: company.firstName || company.name,
    branding: company.branding,
    fullCompany: company,
  });

  const initialLogo =
    company.branding?.logo || company.logo || company.image || "";
  const initialVideo =
    company.branding?.videoUrl || (company as unknown as { videoUrl?: string }).videoUrl || "";

  const [logoPreview, setLogoPreview] = useState(initialLogo);
  const [videoPreview, setVideoPreview] = useState(initialVideo);
  const [form, setForm] = useState<CompanyBrandingData>({
    primaryColor:
      company.branding?.primaryColor ||
      (company as unknown as { primaryColor?: string }).primaryColor ||
      "#E9308F",
    secondaryColor:
      company.branding?.secondaryColor ||
      (company as unknown as { secondaryColor?: string }).secondaryColor ||
      "#8ACDDE",
    videoTitle:
      company.branding?.videoTitle ||
      (company as unknown as { videoTitle?: string }).videoTitle ||
      "",
    videoDescription:
      company.branding?.videoDescription ||
      (company as unknown as { videoDescription?: string }).videoDescription ||
      (company as unknown as { description?: string }).description ||
      "",
    presenterName:
      company.branding?.presenterName ||
      (company as unknown as { presenterName?: string }).presenterName ||
      "",
    presenterDesignation:
      company.branding?.presenterDesignation ||
      (company as unknown as { presenterDesignation?: string }).presenterDesignation ||
      "",
  });

  const updateField = (field: keyof CompanyBrandingData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const response = await updateCompanyBranding(company._id, {
        data: form,
        logo,
        video,
      });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Branding updated successfully");
      setLogo(undefined);
      setVideo(undefined);
      router.push(`/super-admin/clients/${company._id}/settings`);
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Unable to update branding",
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleLogoChange = (file?: File) => {
    setLogo(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview("");
    }
  };

  const handleVideoChange = (file?: File) => {
    setVideo(file);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-4xl flex-col gap-6 pb-12"
    >
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <Field>
          <FieldLabel>Client Company</FieldLabel>
          <BrandingCompanySelect
            companies={companies}
            value={selectedCompanyId}
          />
        </Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Applying..." : "Apply Branding"}
        </Button>
      </div>

      <FieldSet className="rounded-md border border-border bg-card p-6 shadow-sm">
        <FieldLabel>Logo Configuration</FieldLabel>
        <FieldDescription>
          Upload the company logo displayed on its client portal.
        </FieldDescription>
        <Field>
          <FieldLabel htmlFor="brandingLogo">Upload Logo</FieldLabel>
          <div className="relative h-40">
            <label
              htmlFor="brandingLogo"
              className="flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-border bg-background transition-colors hover:bg-muted/50"
            >
              <Input
                id="brandingLogo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleLogoChange(event.target.files?.[0])
                }
              />
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Company logo preview"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon /> Upload logo
                </span>
              )}
            </label>
            {logoPreview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-sm"
                onClick={() => {
                  handleLogoChange(undefined);
                  const input = document.getElementById(
                    "brandingLogo",
                  ) as HTMLInputElement;
                  if (input) input.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Recommended: 512 × 512 px square PNG with a transparent background.
            Keep clear padding around the logo so it remains readable in headers.
          </p>
        </Field>
      </FieldSet>

      <FieldSet className="rounded-md border border-border bg-card p-6 shadow-sm">
        <FieldLabel>Portal Colors</FieldLabel>
        <FieldDescription>
          Configure buttons, highlights, and progress colors.
        </FieldDescription>
        <FieldGroup className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="primaryBrandColor">
              Primary Brand Color
            </FieldLabel>
            <Input
              id="primaryBrandColor"
              type="color"
              value={form.primaryColor || "#E9308F"}
              onChange={(event) =>
                updateField("primaryColor", event.target.value)
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="secondaryBrandColor">
              Secondary Brand Color
            </FieldLabel>
            <Input
              id="secondaryBrandColor"
              type="color"
              value={form.secondaryColor || "#8ACDDE"}
              onChange={(event) =>
                updateField("secondaryColor", event.target.value)
              }
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-md border border-border bg-card p-6 shadow-sm">
        <FieldLabel>Welcome Video</FieldLabel>
        <FieldDescription>
          Configure the onboarding video shown to employees.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="brandingVideoTitle">Video Title</FieldLabel>
            <Input
              id="brandingVideoTitle"
              value={form.videoTitle || ""}
              onChange={(event) =>
                updateField("videoTitle", event.target.value)
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="brandingVideoDescription">
              Description
            </FieldLabel>
            <Textarea
              id="brandingVideoDescription"
              value={form.videoDescription || ""}
              onChange={(event) =>
                updateField("videoDescription", event.target.value)
              }
            />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="brandingPresenter">
                Presenter Name
              </FieldLabel>
              <Input
                id="brandingPresenter"
                value={form.presenterName || ""}
                onChange={(event) =>
                  updateField("presenterName", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="brandingDesignation">
                Presenter Designation
              </FieldLabel>
              <Input
                id="brandingDesignation"
                value={form.presenterDesignation || ""}
                onChange={(event) =>
                  updateField("presenterDesignation", event.target.value)
                }
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="brandingVideo">Upload Video</FieldLabel>
            <div className="relative h-48">
              <label
                htmlFor="brandingVideo"
                className="flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-border bg-background transition-colors hover:bg-muted/50"
              >
                <Input
                  id="brandingVideo"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(event) =>
                    handleVideoChange(event.target.files?.[0])
                  }
                />
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video /> Upload video
                  </span>
                )}
              </label>
              {videoPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full shadow-sm"
                  onClick={(event) => {
                    event.preventDefault();
                    handleVideoChange(undefined);
                    const input = document.getElementById(
                      "brandingVideo",
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
