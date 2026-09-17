"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorToast, getInitials, SuccessToast } from "@/lib/utils";
import { updateProfile } from "@/services/user.service";
import { useUserContext } from "@/providers/UserProvider";
import { SettingsButton } from "./SettingsButton";

export function EditProfileDrawer() {
  const { user } = useUserContext();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    "User";

  useEffect(
    () => () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const imageValue = formData.get("image");
    const image =
      imageValue instanceof File && imageValue.size > 0
        ? imageValue
        : undefined;

    if (!firstName) return ErrorToast("Voornaam is verplicht");

    setIsSaving(true);
    try {
      const response = await updateProfile({
        data: { firstName, lastName },
        image,
      });
      if (!response.success) throw new Error(response.message);

      SuccessToast(response.message || "Profiel succesvol bijgewerkt");
      setOpen(false);
      setImagePreview("");
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Niet mogelijk om profiel bij te werken",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setImagePreview("");
      }}
    >
      <DrawerTrigger asChild>
        <SettingsButton icon={Pencil} label="Profiel bewerken" />
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-120">
          <DrawerHeader>
            <DrawerTitle>Profiel bewerken</DrawerTitle>
            <DrawerDescription>
              Werk hieronder je persoonlijke gegevens bij.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-4 pb-0">
            <div className="grid grid-cols-2 gap-3">
              <ProfileField
                id="firstName"
                label="Voornaam"
                defaultValue={user?.firstName}
              />
              <ProfileField
                id="lastName"
                label="Achternaam"
                defaultValue={user?.lastName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profielfoto</Label>
              <label
                htmlFor="profileImage"
                className="flex cursor-pointer items-center gap-4 rounded-md border border-dashed p-3 hover:bg-muted/50"
              >
                <Avatar className="size-14">
                  {(imagePreview || user?.image) && (
                    <AvatarImage
                      src={imagePreview || user?.image}
                      alt="Profielfoto voorbeeld"
                    />
                  )}
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Kies een profielfoto</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG of WebP
                  </p>
                </div>
                <Input
                  id="profileImage"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setImagePreview(file ? URL.createObjectURL(file) : "");
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileEmail">E-mailadres</Label>
              <Input
                id="profileEmail"
                value={user?.email || ""}
                type="email"
                disabled
              />
            </div>
          </div>
          <DrawerFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Opslaan..." : "Wijzigingen opslaan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Annuleren
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileField({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        key={defaultValue}
        id={id}
        name={id}
        defaultValue={defaultValue}
      />
    </div>
  );
}
