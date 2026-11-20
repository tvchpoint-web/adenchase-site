/**
 * A private assessment: a short, invitation-only questionnaire for one prospective client.
 * Everything a visitor sees comes from its definition, so a new assessment is a new definition
 * file (plus its access-code environment variable), not a new page.
 */
export interface AssessmentQuestion {
  /** Short heading, e.g. "Portfolio Overview". */
  title: string;
  /** The question itself (also the field's label). */
  prompt: string;
  /** Optional follow-up line shown with the prompt. */
  followUp?: string;
  /** Optional guidance or examples under the field. */
  helper?: string;
}

export interface AssessmentDefinition {
  /** Stable identifier; also the URL segment: /private/<id>. Lowercase words and digits joined by hyphens. */
  id: string;
  /** Page title, e.g. "Pat's Property & Legacy Assessment". */
  title: string;
  subtitle: string;
  /** The person the assessment is prepared for (used in greetings). */
  recipientName: string;
  /** Introduction paragraphs. */
  introduction: string[];
  questions: AssessmentQuestion[];
  completion: { heading: string; paragraphs: string[] };
  /**
   * Name of the server environment variable that holds this assessment's access code. The code is
   * never in the source or the browser bundle; it is checked on the server only.
   */
  accessCodeEnv: string;
}
