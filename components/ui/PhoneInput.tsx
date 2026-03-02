"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "antd";
import {
  PHONE_COUNTRY_CODES,
  parsePhoneNumber,
  type PhoneCountryCode,
} from "@/config/phoneCodes";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Compound phone number input: country code selector + digits field.
 * Produces a combined "+{code}{digits}" string via `onChange`.
 * Integrates with Ant Design Form via value/onChange props.
 */
export default function PhoneInput({
  value,
  onChange,
  placeholder = "7012345678",
  disabled = false,
}: PhoneInputProps) {
  const parsed = parsePhoneNumber(value);
  const [code, setCode] = useState<PhoneCountryCode>(parsed.code);
  const [digits, setDigits] = useState<string>(parsed.digits);

  // Sync external value changes (e.g. form.setFieldsValue in edit mode)
  useEffect(() => {
    const p = parsePhoneNumber(value);
    setCode(p.code);
    setDigits(p.digits);
  }, [value]);

  function emit(newCode: PhoneCountryCode, newDigits: string) {
    const combined = newDigits.trim() ? `+${newCode}${newDigits.trim()}` : "";
    onChange?.(combined);
  }

  function handleCodeChange(newCode: PhoneCountryCode) {
    setCode(newCode);
    emit(newCode, digits);
  }

  function handleDigitsChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only numeric input
    const raw = e.target.value.replace(/\D/g, "");
    setDigits(raw);
    emit(code, raw);
  }

  return (
    <div className="flex gap-2">
      <Select<PhoneCountryCode>
        value={code}
        onChange={handleCodeChange}
        disabled={disabled}
        className="w-32 shrink-0"
        options={PHONE_COUNTRY_CODES.map((c) => ({
          value: c.value,
          label: c.label,
        }))}
        aria-label="Country code"
      />
      <Input
        value={digits}
        onChange={handleDigitsChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={15}
        className="flex-1"
        aria-label="Phone number"
      />
    </div>
  );
}
