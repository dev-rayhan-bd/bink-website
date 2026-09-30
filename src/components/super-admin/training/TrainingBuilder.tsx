"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  Link2,
  Mail,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationModal } from "@/components/ui/custom/confirmation-modal";
import { TrainingEditModal } from "./TrainingEditModal";
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
import type { LearningModule } from "@/lib/types/module.type";
import type {
  Topic,
  Training,
  TrainingInviteLink,
  TrainingModuleSummary,
} from "@/lib/types/training.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import {
  addModuleToTopic,
  addTopicToTraining,
  deleteTopic,
  generateTrainingShareLink,
  removeModuleFromTopic,
  sendTrainingInvite,
  updateTopic,
} from "@/services/training.service";

type TrainingBuilderProps = {
  training: Training;
  modules: LearningModule[];
};

const isModuleSummary = (value: string | TrainingModuleSummary): value is TrainingModuleSummary =>
  typeof value !== "string";

const getTopicModules = (topic: Topic) => {
  if (topic.modules?.length) return topic.modules;
  return (topic.moduleIds || []).filter(isModuleSummary);
};

const getTrainingLink = (data?: TrainingInviteLink) => {
  if (!data) return "";
  if (data.trainingLink) return data.trainingLink;
  if (data.shareLink) return data.shareLink;
  if (data.link) return data.link;
  if (data.url) return data.url;
  if (data.token) return `/training/join/${data.token}`;
  if (data.inviteToken) return `/training/join/${data.inviteToken}`;
  return "";
};

export function TrainingBuilder({ training, modules }: TrainingBuilderProps) {
  const router = useRouter();
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [attachModalTopicId, setAttachModalTopicId] = useState<string>();
  const [pendingTopicId, setPendingTopicId] = useState<string>();
  const [editingTopicId, setEditingTopicId] = useState<string>();
  const [selectedModules, setSelectedModules] = useState<Record<string, string[]>>({});

  const companyName =
    typeof training.companyId === "object" && training.companyId
      ? training.companyId.firstName
      : "Unassigned";

  const teamName =
    typeof training.teamId === "object" && training.teamId
      ? training.teamId.name
      : typeof training.teamId === "string"
        ? (training.teamId.length === 24 ? "Assigned" : training.teamId)
        : "Unassigned";

  const moduleById = useMemo(
    () => new Map(modules.map((module) => [module._id, module])),
    [modules],
  );

  const handleAddTopic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!title) {
      ErrorToast("Topic title is required");
      return;
    }

    setIsAddingTopic(true);
    try {
      const response = await addTopicToTraining(training._id, {
        title,
        description,
      });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Topic added successfully");
      form.reset();
      setIsTopicModalOpen(false);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to add topic");
    } finally {
      setIsAddingTopic(false);
    }
  };

  const handleGenerateLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const expiresInDays = Number(formData.get("expiresInDays") || 30);

    setIsGeneratingLink(true);
    try {
      const response = await generateTrainingShareLink(training._id, {
        expiresInDays: Number.isFinite(expiresInDays) ? expiresInDays : 30,
      });
      if (!response.success) throw new Error(response.message);

      const link = getTrainingLink(response.data);
      setGeneratedLink(link);
      SuccessToast(response.message || "Training link generated successfully");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to generate link");
    } finally {
      setIsGeneratingLink(false);
    }
  };


  const handleDownloadQr = async () => {
    if (!training.qrCodeUrl) {
      ErrorToast("No QR code available");
      return;
    }

    const filename = `${training.title || "training"}-qr-code.png`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      const link = document.createElement("a");
      link.href = training.qrCodeUrl;
      link.download = filename || "training-qr-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      SuccessToast("QR code download started");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to download QR code");
    }
  };
  const handleCopyLink = async () => {
    if (!generatedLink) {
      ErrorToast("Generate a link first");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedLink);
      SuccessToast("Training link copied");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to copy link");
    }
  };

  const handleSendInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      ErrorToast("Invite email is required");
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await sendTrainingInvite(training._id, { email });
      if (!response.success) throw new Error(response.message);
      const link = getTrainingLink(response.data);
      if (link) setGeneratedLink(link);
      SuccessToast(response.message || "Invite email sent successfully");
      form.reset();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to send invite");
    } finally {
      setIsSendingInvite(false);
    }
  };
  const handleAttachModule = async (topicId: string) => {
    const moduleIds = selectedModules[topicId] || [];
    if (moduleIds.length === 0) {
      ErrorToast("Select at least one module");
      return;
    }

    setPendingTopicId(topicId);
    try {
      const response = await addModuleToTopic(training._id, topicId, { moduleIds });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Modules added to topic");
      setSelectedModules((current) => ({ ...current, [topicId]: [] }));
      setAttachModalTopicId(undefined);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to add modules");
    } finally {
      setPendingTopicId(undefined);
    }
  };

  const toggleSelectedModule = (topicId: string, moduleId: string) => {
    setSelectedModules((current) => {
      const selected = current[topicId] || [];
      const next = selected.includes(moduleId)
        ? selected.filter((id) => id !== moduleId)
        : [...selected, moduleId];

      return { ...current, [topicId]: next };
    });
  };


  const handleUpdateTopic = async (
    event: React.FormEvent<HTMLFormElement>,
    topicId: string,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!title) {
      ErrorToast("Topic title is required");
      return;
    }

    setPendingTopicId(topicId);
    try {
      const response = await updateTopic(training._id, topicId, {
        title,
        description,
      });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Topic updated successfully");
      setEditingTopicId(undefined);
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to update topic");
    } finally {
      setPendingTopicId(undefined);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    setPendingTopicId(topicId);
    try {
      const response = await deleteTopic(training._id, topicId);
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Topic deleted successfully");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to delete topic");
    } finally {
      setPendingTopicId(undefined);
    }
  };
  const handleRemoveModule = async (topicId: string, moduleId: string) => {
    setPendingTopicId(topicId);
    try {
      const response = await removeModuleFromTopic(training._id, topicId, moduleId);
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Module removed from topic");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to remove module");
    } finally {
      setPendingTopicId(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost">
          <Link href="/super-admin/training">
            <ArrowLeft /> Back to Training
          </Link>
        </Button>
      </div>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={training.status === "published" ? "active" : "outline"}>
                      {training.status}
                    </Badge>
                    <Badge variant="outline">{training.authType || "auth not set"}</Badge>
                  </div>
                  <h1 className="font-heading text-2xl font-bold">{training.title}</h1>
                </div>
                <TrainingEditModal training={training} />
              </div>
              <p className="text-sm text-muted-foreground">
                {training.description || "No description"}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="mt-1 font-medium">{companyName}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Team</p>
                <p className="mt-1 font-medium">{teamName}</p>
              </div>
              <div className="rounded-md border bg-background p-3">
                <p className="text-xs text-muted-foreground">Passcode</p>
                <p className="mt-1 font-medium">{training.passcode || "Not required"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-md border bg-background p-3 text-center">
            {training.qrCodeUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={training.qrCodeUrl} alt="Training QR code" className="mx-auto size-36 object-contain" />
                <Button type="button" variant="outline" size="sm" onClick={() => void handleDownloadQr()}>
                  <Download /> Download QR
                </Button>
              </>
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
                No QR code
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-bold">Training Link</h2>
              <p className="text-sm text-muted-foreground">
                Generate the same training join link used by the QR code.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field>
                <FieldLabel htmlFor="expires-in-days">Expires In Days</FieldLabel>
                <Input
                  id="expires-in-days"
                  name="expiresInDays"
                  type="number"
                  min="1"
                  defaultValue="30"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={isGeneratingLink}>
                  <Link2 /> {isGeneratingLink ? "Generating..." : "Generate Link"}
                </Button>
              </div>
            </div>
            {generatedLink && (
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input readOnly value={generatedLink} aria-label="Generated share link" />
                <Button type="button" variant="outline" onClick={() => void handleCopyLink()}>
                  <Copy /> Copy
                </Button>
              </div>
            )}
          </form>

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-bold">Invite Email</h2>
              <p className="text-sm text-muted-foreground">
                Send the training link to a learner by email.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  placeholder="learner@example.com"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={isSendingInvite}>
                  {isSendingInvite ? <Mail /> : <Send />}
                  {isSendingInvite ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold">Topics</h2>
            <p className="text-sm text-muted-foreground">
              Create topics first, then attach existing modules under each topic.
            </p>
          </div>
          <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
            <DialogTrigger asChild>
              <Button type="button">
                <Plus /> Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form
                onSubmit={handleAddTopic}
                className="space-y-5 h-[60vh] overflow-y-auto md:h-auto"
              >
                <DialogHeader>
                  <DialogTitle>Add Topic</DialogTitle>
                  <DialogDescription>
                    Add a topic inside this training. Modules can be attached after the topic is created.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="topic-title">Topic Title</FieldLabel>
                    <Input id="topic-title" name="title" placeholder="Emotion & Aggression" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="topic-description">Description</FieldLabel>
                    <Input
                      id="topic-description"
                      name="description"
                      placeholder="Understanding behavior"
                    />
                  </Field>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAddingTopic}>
                    <Plus /> {isAddingTopic ? "Adding..." : "Add Topic"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <div className="space-y-4">
        {(training.topics || []).length > 0 ? (
          training.topics?.map((topic) => {
            const topicModules = getTopicModules(topic);
            const attachedIds = new Set(topicModules.map((module) => module._id));
            const availableModules = modules.filter((module) => !attachedIds.has(module._id));

            return (
              <section key={topic._id} className="rounded-md border border-border bg-card p-5 shadow-sm">
                {editingTopicId === topic._id ? (
                  <form
                    onSubmit={(event) => void handleUpdateTopic(event, topic._id)}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor={`edit-topic-title-${topic._id}`}>
                          Topic Title
                        </FieldLabel>
                        <Input
                          id={`edit-topic-title-${topic._id}`}
                          name="title"
                          defaultValue={topic.title}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`edit-topic-description-${topic._id}`}>
                          Description
                        </FieldLabel>
                        <Input
                          id={`edit-topic-description-${topic._id}`}
                          name="description"
                          defaultValue={topic.description || ""}
                        />
                      </Field>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={pendingTopicId === topic._id}
                        onClick={() => setEditingTopicId(undefined)}
                      >
                        <X /> Cancel
                      </Button>
                      <Button type="submit" disabled={pendingTopicId === topic._id}>
                        <Save /> {pendingTopicId === topic._id ? "Saving..." : "Save Topic"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Topic {topic.order ?? "-"}</Badge>
                        <Badge variant="secondary">
                          {topic.moduleCount ?? topicModules.length} modules
                        </Badge>
                      </div>
                      <h2 className="font-heading text-xl font-bold">{topic.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {topic.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={Boolean(pendingTopicId)}
                        onClick={() => setEditingTopicId(topic._id)}
                        title="Edit topic"
                      >
                        <Pencil />
                      </Button>
                      <ConfirmationModal
                        title="Delete topic?"
                        description="This topic will be removed from the training. Attached modules will remain in the module library."
                        confirmText="Delete Topic"
                        loadingText="Deleting..."
                        variant="destructive"
                        isLoading={pendingTopicId === topic._id}
                        onConfirm={() => void handleDeleteTopic(topic._id)}
                        actionTrigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={Boolean(pendingTopicId)}
                            title="Delete topic"
                          >
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <Dialog
                    open={attachModalTopicId === topic._id}
                    onOpenChange={(open) => {
                      setAttachModalTopicId(open ? topic._id : undefined);
                      if (open) {
                        setSelectedModules((current) => ({ ...current, [topic._id]: [] }));
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={pendingTopicId === topic._id || availableModules.length === 0}
                      >
                        <Plus /> Attach Module
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex max-h-[85vh] flex-col p-6 sm:max-w-xl">
                      <DialogHeader className="shrink-0">
                        <DialogTitle>Attach Modules</DialogTitle>
                        <DialogDescription>
                          Select one or more modules to add under this topic.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                        {availableModules.map((module) => {
                          const checked = (selectedModules[topic._id] || []).includes(module._id);
                          return (
                            <label
                              key={module._id}
                              className="flex cursor-pointer items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleSelectedModule(topic._id, module._id)}
                              />
                              <span className="min-w-0 space-y-1">
                                <span className="block font-medium">{module.title}</span>
                                <span className="line-clamp-2 block text-xs text-muted-foreground">
                                  {module.description || "No description"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <DialogFooter className="shrink-0 border-t pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={pendingTopicId === topic._id}
                          onClick={() => setAttachModalTopicId(undefined)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          disabled={
                            pendingTopicId === topic._id ||
                            (selectedModules[topic._id] || []).length === 0
                          }
                          onClick={() => void handleAttachModule(topic._id)}
                        >
                          <Plus /> {pendingTopicId === topic._id ? "Attaching..." : "Attach Modules"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-5 space-y-3">
                  {topicModules.length > 0 ? (
                    topicModules.map((module) => {
                      const fullModule = moduleById.get(module._id);
                      return (
                        <div key={module._id} className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="font-medium">{module.title}</p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {module.description || fullModule?.description || "No description"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={module.status === "published" ? "active" : "outline"}>
                              {module.status}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={pendingTopicId === topic._id}
                              onClick={() => void handleRemoveModule(topic._id, module._id)}
                              title="Remove module"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No modules attached to this topic yet.
                    </div>
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Add the first topic to start building this training.
          </div>
        )}
      </div>
    </div>
  );
}






