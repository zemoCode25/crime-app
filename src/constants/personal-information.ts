export const SEXES = [
  {value: "male", label: "Male"},
  {value: "female", label: "Female"}
] as const;

export const CIVIL_STATUSES = [
  {value: "single", label: "Single"},
  {value: "married", label: "Married"},
  {value: "widowed", label: "Widowed"},
  {value: "divorced", label: "Divorced"},
  {value: "legally separated", label: "Legally Separated"},
  {value: "annulled", label: "Annulled"},
] as const;

export const CASE_ROLES = [
  {value: "suspect", label: "Suspect"},
  {value: "complainant", label: "Complainant"},
  {value: "witness", label: "Witness"},
] as const;