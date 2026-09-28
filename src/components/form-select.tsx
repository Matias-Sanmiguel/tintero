"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormSelect({
  name,
  defaultValue = "",
  options,
  disabled,
  id,
}: {
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  id?: string;
}) {
  const normalized = defaultValue || "__none__";
  const [value, setValue] = useState(
    options.some((option) => option.value === normalized) ? normalized : (options[0]?.value ?? "__none__"),
  );

  return (
    <>
      <input type="hidden" name={name} value={value === "__none__" ? "" : value} />
      <Select value={value} onValueChange={setValue} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
