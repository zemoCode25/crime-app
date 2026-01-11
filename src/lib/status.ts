import { STATUSES } from "@/constants/crime-case";
import { CaseStatus } from "@/types/form-schema";

export function getStatusLabel(status: string) {
    const foundStatus = STATUSES.find((s) => s.value === status);
    return foundStatus?.label;
}