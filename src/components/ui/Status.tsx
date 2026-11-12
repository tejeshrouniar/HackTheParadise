import { LoaderCircle, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

/** A provider-free book frame also works before auth and inside error boundaries. */
export function BookNotice({ title, children }: { title: string; children: ReactNode }) {
  return <section className="htp-book-notice" aria-label={title}>
    <div><span>HACK THE PARADISE</span><h1>{title}</h1></div>
    <div>{children}</div>
  </section>;
}
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
