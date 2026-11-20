import { portfolio001 } from "./portfolio-001";
import type { AssessmentDefinition } from "./types";

/** Live private assessments. Not listed anywhere public; each is reachable only with its access code. */
export const ASSESSMENTS: Record<string, AssessmentDefinition> = { [portfolio001.id]: portfolio001 };

export function assessmentById(id: string): AssessmentDefinition | undefined {
  return Object.hasOwn(ASSESSMENTS, id) ? ASSESSMENTS[id] : undefined;
}

export const MAX_ANSWER_LENGTH = 8000;
