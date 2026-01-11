import { STATUSES } from "@/constants/crime-case";

export function getStatusLabel(status: string) {
    const foundStatus = STATUSES.find((s) => s.value === status);
    return foundStatus?.label;
}