import { useState } from "react";
import { safeUrl } from "../../lib/validation";
export function Avatar({
  name,
  url,
  size = 38,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState<string>();
  const valid = safeUrl(url);
  return (
    <span
      className="sc-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {valid && failed !== valid ? (
        <img
          src={valid}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(valid)}
        />
      ) : (
        name.trim().slice(0, 2).toUpperCase() || "S"
      )}
    </span>
  );
}
