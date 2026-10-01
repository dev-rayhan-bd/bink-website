import type { ApiResponse } from "./api.type";
import type { TMeta } from "./global.type";

export type ModuleQuestionType =
  | "Information"
  | "MCQ"
  | "Swipe"
  | "Ordering"
  | "Chat Scenario"
  | "Video"
  | "Simulated Call"
  | "Rating"
  | "Free Input";

export type ModuleMessage = {
  sender: string;
  text: string;
  isUser?: boolean;
};

export interface IChatStepOption {
  optionId: string;
  text: string;
  nextStepId?: string | null;
  feedback?: string;
  isCorrect?: boolean;
}

export interface IChatStepMessage {
  sender: string;
  text: string;
  isUser?: boolean;
}

export interface IChatStep {
  stepId: string;
  messages: IChatStepMessage[];
  options?: IChatStepOption[];
}

export type ModuleQuestion = {
  id: string;
  type: ModuleQuestionType;
  content?: string;
  isScored: boolean;
  colorCode?: string;
  blockColor?: string;
  explanation?: string;
  feedback?: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
  leftLabel?: string;
  rightLabel?: string;
  correctDirection?: "left" | "right";
  items?: string[];
  messages?: ModuleMessage[];
  senderName?: string;
  senderAvatar?: string;
  initialStepId?: string;
  chatSteps?: IChatStep[];
  videoUrl?: string;
  callerName?: string;
  callerPhoto?: string;
  postCallVideoUrl?: string;
  postCallMessage?: string;
  scale?: number;
};

export type ModuleCreator = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ModuleTeam = {
  _id: string;
  name: string;
};

export type LearningModule = {
  _id: string;
  title: string;
  description: string;
  thumbnailImage: string;
  questions: ModuleQuestion[];
  status: "draft" | "published" | string;
  createdBy: ModuleCreator | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  companyId?: string;
  topicId?: string;
  teamId?: ModuleTeam;
};

export type ModuleListResponse = ApiResponse<LearningModule[]> & {
  meta: TMeta;
};

export type ModuleData = {
  title: string;
  description: string;
  questions: ModuleQuestion[];
};

export type CreateModulePayload = {
  data: ModuleData;
  thumbnailImage: Blob;
  questionFiles?: Record<string, Blob | undefined>;
};

export type UpdateModulePayload = Partial<ModuleData> & {
  thumbnailImage?: Blob;
  questionFiles?: Record<string, Blob | undefined>;
};

export type DuplicateModulePayload = {
  title: string;
};

export type AssignModulesPayload = {
  moduleIds: string[];
  companyId: string;
  teamId: string;
};

export type UserModuleAnswer = {
  questionId: string;
  answer: string | number | string[];
  isCorrect?: boolean;
  score?: number;
};

export type UserModuleProgress = {
  _id: string;
  userId: string;
  companyId: string;
  teamId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed" | string;
  progressPercentage: number;
  completedQuestions: number;
  totalQuestions: number;
  answers: UserModuleAnswer[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type UserModuleDetails = {
  module: LearningModule;
  userProgress: UserModuleProgress;
};

export type LearningPathStats = {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  overallProgressPercentage: number;
  averageScore: number;
};

export type LearningPathUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type LearningPathModule = Partial<LearningModule> & {
  moduleId?: string | LearningModule;
  module?: LearningModule;
  progress?: UserModuleProgress;
  userProgress?: UserModuleProgress;
  progressPercentage?: number;
  completedQuestions?: number;
  totalQuestions?: number;
  score?: number;
};

export type LearningPathData = {
  overallStats: LearningPathStats;
  user: LearningPathUser;
  modules: LearningPathModule[];
};

export type ModuleAnswerValue =
  | string
  | number
  | string[]
  | { stepId: string; optionId: string }[]
  | Record<string, unknown>;

export type SubmitModuleAnswerPayload = {
  moduleId: string;
  questionId: string;
  answer: ModuleAnswerValue;
};

export type SubmitModuleAnswerResult = {
  questionId: string;
  isCorrect: boolean | null;
  score: number;
  correctAnswer?: ModuleAnswerValue;
  explanation?: string;
  completedQuestions: number;
  totalQuestions: number;
  progressPercentage: number;
  moduleScore: number;
  moduleStatus: "not_started" | "in_progress" | "completed" | string;
};


