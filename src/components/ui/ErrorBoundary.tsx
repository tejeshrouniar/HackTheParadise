import { Component, type ReactNode } from "react";
import { BookNotice } from "./Status";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Hack The Paradise could not render this screen:", error.message);
  }
  render() {
    return this.state.failed ? (
      <BookNotice title="Let’s try that again.">
        <p>
          This screen couldn’t open. Your saved account data is still there.
        </p>
        <button className="sc-button" onClick={() => location.reload()}>
          Reload Hack The Paradise
        </button>
      </BookNotice>
    ) : (
      this.props.children
    );
  }
}
