import { LoaderCircle, AlertCircle } from "lucide-react";
export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="sc-loading" role="status">
      <LoaderCircle className="animate-spin" size={22} />
      {label}
    </div>
  );
}
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="sc-error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {retry && (
        <button className="sc-link" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
