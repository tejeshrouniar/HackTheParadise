import { useId } from "react";

export function PhoneNumberField({
  value,
  onChange,
  invalid,
  disabled,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
}) {
  const hintId = useId();
  return (
    <label>
      Phone number
      <input
        type="tel"
        autoComplete="tel"
        maxLength={32}
        value={value}
        disabled={disabled}
        required={required}
        aria-describedby={hintId}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <small id={hintId} aria-live="polite">
        {invalid
          ? "Enter + followed by your country code and number (7–15 digits)."
          : "Enter your number after the country code. You can change the code if needed."}
        {" This number is private."}
      </small>
    </label>
  );
}
