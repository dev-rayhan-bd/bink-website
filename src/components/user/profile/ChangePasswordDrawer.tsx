"use client";

import { type FormEvent, useState } from "react";
import { ShieldCheck } from "lucide-react";
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
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { changePassword } from "@/services/auth.service";
import { SettingsButton } from "./SettingsButton";

export function ChangePasswordDrawer() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const oldPassword = String(formData.get("oldPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!oldPassword || !newPassword) {
      return ErrorToast("Huidig en nieuw wachtwoord zijn verplicht");
    }
    if (newPassword !== confirmPassword) {
      return ErrorToast("Nieuwe wachtwoorden komen niet overeen");
    }

    setIsPending(true);
    try {
      const response = await changePassword({ oldPassword, newPassword });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Wachtwoord succesvol gewijzigd");
      setOpen(false);
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Kan wachtwoord niet wijzigen",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <SettingsButton icon={ShieldCheck} label="Wachtwoord wijzigen" />
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-120">
          <DrawerHeader>
            <DrawerTitle>Wachtwoord wijzigen</DrawerTitle>
            <DrawerDescription>
              Beveilig jouw account met een nieuw wachtwoord.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 p-4 pb-0">
            <PasswordField id="oldPassword" label="Huidig wachtwoord" />
            <PasswordField id="newPassword" label="Nieuw wachtwoord" />
            <PasswordField id="confirmPassword" label="Bevestig nieuw wachtwoord" />
          </div>
          <DrawerFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Bezig met opslaan..." : "Wachtwoord bijwerken"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuleren
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function PasswordField({ id, label }: { id: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type="password" />
    </div>
  );
}
