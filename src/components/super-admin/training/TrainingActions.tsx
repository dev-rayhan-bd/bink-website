"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/custom/confirmation-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanyDropdownItem } from "@/lib/types/company.type";
import type { TeamDropdownItem } from "@/lib/types/team.type";
import type { Training, TrainingCompany } from "@/lib/types/training.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { getCompanyTeamDropdown } from "@/services/team.service";
import {
  assignTrainingToCompany,
  deleteTraining,
  duplicateTraining,
} from "@/services/training.service";

type TrainingActionsProps = {
  training: Training;
  companies: CompanyDropdownItem[];
};

const getTrainingCompanyId = (company: Training["companyId"]) => {
  if (!company) return "";
  if (typeof company === "string") return company;
  return company._id;
};

export function TrainingActions({ training, companies }: TrainingActionsProps) {
  const router = useRouter();
  const initialCompanyId = getTrainingCompanyId(training.companyId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  
  const initialTeamId = typeof training.teamId === "object" && training.teamId ? training.teamId._id : (training.teamId || "");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);
  const [teams, setTeams] = useState<TeamDropdownItem[]>([]);
  const [isLoadingTeams, startLoadingTeams] = useTransition();

  const selectedCompanyName = useMemo(() => {
    const company = training.companyId as TrainingCompany | string | null | undefined;
    if (company && typeof company === "object") return company.firstName || company.email;
    return companies.find((item) => item._id === selectedCompanyId)?.firstName || "Select company";
  }, [companies, selectedCompanyId, training.companyId]);

  const loadTeams = (companyId: string, nextTeamId = "") => {
    setSelectedCompanyId(companyId);
    setSelectedTeamId(nextTeamId);
    setTeams([]);

    if (!companyId) return;

    startLoadingTeams(async () => {
      try {
        const response = await getCompanyTeamDropdown<TeamDropdownItem[]>(companyId, { limit: 100 });
        if (!response.success) throw new Error(response.message);
        setTeams(response.data || []);
      } catch (error: unknown) {
        ErrorToast(error instanceof Error ? error.message : "Unable to load teams");
      }
    });
  };

  const openAssignModal = () => {
    setIsAssignOpen(true);
    loadTeams(initialCompanyId, initialTeamId);
  };

  const handleAssign = async () => {
    if (!selectedCompanyId) {
      ErrorToast("Select a company first");
      return;
    }

    if (!selectedTeamId) {
      ErrorToast("Select a team first");
      return;
    }

    setIsAssigning(true);
    try {
      const response = await assignTrainingToCompany(training._id, {
        companyId: selectedCompanyId,
        teamId: selectedTeamId,
      });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Training assigned successfully");
      setIsAssignOpen(false);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to assign training");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteTraining(training._id);
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Training deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to delete training");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newTitle = String(formData.get("newTitle") || "").trim();

    if (!newTitle) {
      ErrorToast("New training title is required");
      return;
    }

    setIsDuplicating(true);
    try {
      const response = await duplicateTraining<Training>(training._id, { newTitle });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Training duplicated successfully");
      setIsDuplicateOpen(false);
      form.reset();
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to duplicate training");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="icon" title="Assign company and team" onClick={openAssignModal}>
            <Building2 />
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[60vh] overflow-y-auto md:h-auto">
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              Choose the company and team that should receive this training.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field>
              <FieldLabel>Company</FieldLabel>
              <Select value={selectedCompanyId} onValueChange={(value) => loadTeams(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedCompanyName} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Team</FieldLabel>
              <Select
                value={selectedTeamId}
                onValueChange={setSelectedTeamId}
                disabled={!selectedCompanyId || isLoadingTeams}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select team"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isAssigning} onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isAssigning || isLoadingTeams} onClick={() => void handleAssign()}>
              <Building2 /> {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDuplicateOpen} onOpenChange={setIsDuplicateOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="icon" title="Duplicate training">
            <Copy />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Training</DialogTitle>
            <DialogDescription>
              Create a copy of this training with a new title.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDuplicate} className="space-y-5">
            <Field>
              <FieldLabel htmlFor={`duplicate-training-${training._id}`}>
                New Title
              </FieldLabel>
              <Input
                id={`duplicate-training-${training._id}`}
                name="newTitle"
                defaultValue={`${training.title} Copy`}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isDuplicating}
                onClick={() => setIsDuplicateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isDuplicating}>
                <Copy /> {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete training?"
        description="This training will be removed from the directory. Topics and assignments tied to it may no longer be available."
        confirmText="Delete Training"
        loadingText="Deleting..."
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        actionTrigger={
          <Button type="button" variant="outline" size="icon" title="Delete training">
            <Trash2 />
          </Button>
        }
      />

      <Button asChild variant="outline" size="icon">
        <Link href={`/super-admin/training/${training._id}`}>
         <Eye />
        </Link>
      </Button>
    </div>
  );
}