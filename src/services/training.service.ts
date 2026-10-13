"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { buildQueryString } from "@/lib/buildQueryString";
import { createMultipartBody } from "@/lib/createMultipartBody";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { getSessionCookieOptions } from "@/lib/sessionCookieOptions";
import type { ApiResponse } from "@/lib/types/api.type";
import type { TQuery } from "@/lib/types/global.type";
import type {
  AddModuleToTopicPayload,
  AssignTrainingPayload,
  CreateTrainingPayload,
  DuplicateTrainingPayload,
  GenerateTrainingLinkPayload,
  ReorderTopicsPayload,
  SendTrainingInvitePayload,
  Topic,
  TopicData,
  Training,
  TrainingAuthData,
  TrainingAuthenticatePayload,
  TrainingInvitation,
  TrainingInviteLink,
  TrainingListResponse,
  UpdateTrainingPayload,
  UserTrainingView,
} from "@/lib/types/training.type";

const TRAININGS_TAG = "trainings";

const setTrainingSessionCookies = async (data: TrainingAuthData | null) => {
  if (!data) return;

  const cookieStore = await cookies();
  const options = await getSessionCookieOptions();

  if (data.accessToken) cookieStore.set("accessToken", data.accessToken, options);
  if (data.refreshToken) cookieStore.set("refreshToken", data.refreshToken, options);
  if (data.user?.guestId) cookieStore.set("guestId", data.user.guestId, options);
};

export const getTrainings = async (params: TQuery = {}) =>
  nextServerFetch<TrainingListResponse>(`/training${buildQueryString(params)}`, {
    next: { tags: [TRAININGS_TAG], revalidate: 3600 },
  });

export const getMyTrainings = async () =>
  nextServerFetch<ApiResponse<Training[]>>("/training/my-trainings", {
    cache: "no-store",
  });

export const getTraining = async (trainingId: string) =>
  nextServerFetch<ApiResponse<Training>>(`/training/${trainingId}`, {
    auth: "optional",
    next: { tags: [TRAININGS_TAG, `training-${trainingId}`], revalidate: 3600 },
  });

export const getTrainingTopics = async (trainingId: string) =>
  nextServerFetch<ApiResponse<Topic[]>>(`/training/${trainingId}/topics`, {
    cache: "no-store",
  });

export const getTrainingTopic = async (trainingId: string, topicId: string) =>
  nextServerFetch<ApiResponse<Topic>>(
    `/training/${trainingId}/topics/${topicId}`,
    { cache: "no-store" },
  );

export const createTraining = async <T = Training>({
  data,
  thumbnailImage,
}: CreateTrainingPayload) => {
  const response = await nextServerFetch<ApiResponse<T>>("/training", {
    method: "POST",
    body: createMultipartBody(data, { thumbnailImage }),
  });

  if (response.success) updateTag(TRAININGS_TAG);
  return response;
};

export const updateTraining = async <T = Training>(
  trainingId: string,
  { thumbnailImage, ...data }: UpdateTrainingPayload,
) => {
  const body = thumbnailImage
    ? createMultipartBody(data, { thumbnailImage })
    : data;

  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}`,
    { method: "PATCH", body },
  );

  if (response.success) {
    updateTag(TRAININGS_TAG);
    updateTag(`training-${trainingId}`);
  }
  return response;
};

export const assignTrainingToCompany = async <T = Training>(
  trainingId: string,
  payload: AssignTrainingPayload,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/assign`,
    { method: "PATCH", body: payload },
  );

  if (response.success) {
    updateTag(TRAININGS_TAG);
    updateTag(`training-${trainingId}`);
  }
  return response;
};

export const duplicateTraining = async <T = Training>(
  trainingId: string,
  payload: DuplicateTrainingPayload,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/duplicate`,
    { method: "POST", body: payload },
  );

  if (response.success) updateTag(TRAININGS_TAG);
  return response;
};

export const deleteTraining = async <T = unknown>(trainingId: string) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}`,
    { method: "DELETE" },
  );

  if (response.success) {
    updateTag(TRAININGS_TAG);
    updateTag(`training-${trainingId}`);
  }
  return response;
};

export const addTopicToTraining = async <T = Topic>(
  trainingId: string,
  payload: TopicData,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/topics`,
    { method: "POST", body: payload },
  );

  if (response.success) {
    updateTag(TRAININGS_TAG);
    updateTag(`training-${trainingId}`);
  }
  return response;
};

export const updateTopic = async <T = Topic>(
  trainingId: string,
  topicId: string,
  payload: Partial<TopicData>,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/topics/${topicId}`,
    { method: "PATCH", body: payload },
  );

  if (response.success) updateTag(`training-${trainingId}`);
  return response;
};

export const deleteTopic = async <T = unknown>(
  trainingId: string,
  topicId: string,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/topics/${topicId}`,
    { method: "DELETE" },
  );

  if (response.success) updateTag(`training-${trainingId}`);
  return response;
};

export const addModuleToTopic = async <T = Topic>(
  trainingId: string,
  topicId: string,
  payload: AddModuleToTopicPayload,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/topics/${topicId}/modules`,
    { method: "POST", body: payload },
  );

  if (response.success) {
    updateTag(`training-${trainingId}`);
    updateTag("modules");
  }
  return response;
};

export const removeModuleFromTopic = async <T = Topic>(
  trainingId: string,
  topicId: string,
  moduleId: string,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/topics/${topicId}/modules/${moduleId}`,
    { method: "DELETE" },
  );

  if (response.success) updateTag(`training-${trainingId}`);
  return response;
};

export const reorderTopics = async <T = Topic[]>(
  trainingId: string,
  payload: ReorderTopicsPayload,
) => {
  const response = await nextServerFetch<ApiResponse<T>>(
    `/training/${trainingId}/reorder-topics`,
    { method: "PATCH", body: payload },
  );

  if (response.success) updateTag(`training-${trainingId}`);
  return response;
};

export const generateTrainingShareLink = async (
  trainingId: string,
  payload: GenerateTrainingLinkPayload = {},
) =>
  nextServerFetch<ApiResponse<TrainingInviteLink>>(
    `/training/${trainingId}/generate-link`,
    { method: "POST", body: payload },
  );

export const sendTrainingInvite = async (
  trainingId: string,
  payload: SendTrainingInvitePayload,
) =>
  nextServerFetch<ApiResponse<TrainingInviteLink>>(
    `/training/${trainingId}/send-invite`,
    { method: "POST", body: payload },
  );

export const getTrainingInvitations = async (trainingId: string) =>
  nextServerFetch<ApiResponse<TrainingInvitation[]>>(
    `/training/${trainingId}/invitations`,
    { cache: "no-store" },
  );

export const resendTrainingInvitation = async (invitationId: string) =>
  nextServerFetch<ApiResponse<TrainingInvitation>>(
    `/training/invitations/${invitationId}/resend`,
    { method: "POST" },
  );

export const getTrainingInviteByToken = async (token: string) =>
  nextServerFetch<ApiResponse<Training>>(`/training-invite/by-token/${token}`, {
    auth: "none",
    cache: "no-store",
  });

export const joinTrainingByToken = async (inviteToken: string) =>
  getTrainingInviteByToken(inviteToken);

export const getCompanyTrainings = async (companyId: string) =>
  nextServerFetch<ApiResponse<Training[]>>(`/training/company/${companyId}`, {
    next: {
      tags: [TRAININGS_TAG, `company-${companyId}-trainings`],
      revalidate: 3600,
    },
  });

export const getUserTrainingView = async (trainingId: string) =>
  nextServerFetch<ApiResponse<UserTrainingView>>(
    `/training/${trainingId}/user-view`,
    { cache: "no-store" },
  );

export const authenticateTraining = async (
  trainingId: string,
  payload: TrainingAuthenticatePayload,
): Promise<ApiResponse<TrainingAuthData | null>> => {
  const endpoint = `/training/${trainingId}/authenticate`;

  try {
    const response = await nextServerFetch<ApiResponse<TrainingAuthData>>(
      endpoint,
      { method: "POST", body: payload, auth: "none" },
    );

    if (response.success) {
      await setTrainingSessionCookies(response.data);
      updateTag("me");
      updateTag(TRAININGS_TAG);
    }

    return response;
  } catch (error: unknown) {

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to join training",
      data: null,
    };
  }
};

