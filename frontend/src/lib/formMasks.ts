import type { FormEvent } from "react";

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function formatCpf(value: string) {
  const digits = onlyDigits(value, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCrp(value: string) {
  const digits = onlyDigits(value, 7);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `CRP ${digits}`;
  }

  return `CRP ${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCpfInput(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatCpf(event.currentTarget.value);
}

export function maskPhoneInput(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatPhone(event.currentTarget.value);
}

export function maskCrpInput(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatCrp(event.currentTarget.value);
}
