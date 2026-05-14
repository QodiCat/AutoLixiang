import { STATUS } from "../constants/task";

export function nextStatus(current, target) {
  return STATUS.indexOf(target) > STATUS.indexOf(current) ? target : current;
}
