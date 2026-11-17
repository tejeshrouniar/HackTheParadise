import { useId } from "react";

export function PhoneNumberField({
  value,
  onChange,
  invalid,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
}) {
  const hintId = useId();
  return (
    <label>
      Phone number <span className="sc-muted">(optional)</span>
      <input
        type="tel"
        autoComplete="tel"
        maxLength={32}
        value={value}
        disabled={disabled}
        aria-describedby={hintId}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <small id={hintId} aria-live="polite">
        {invalid
          ? "Enter + followed by your country code and number (7–15 digits), or leave it blank."
          : "Include your country code, for example +91 98765 43210."}
        {" Signed-in players can access this number."}
      </small>
    </label>
  );
}
