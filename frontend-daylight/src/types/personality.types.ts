export interface Answer {
  questionNumber: number;
  selectedOption: string;
}

export interface SubmitPersonalityTestDto {
  sessionId: string;
  answers: Answer[];
  relationshipStatus?: 'SINGLE' | 'MARRIED' | 'PREFER_NOT_SAY';
  intentOnDaylight?: string[];
  genderMixComfort?: 'TOTALLY_FINE' | 'PREFER_SAME_GENDER' | 'DEPENDS';
}