import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Storicode could not render this screen:", error.message);
  }
  render() {
    return this.state.failed ? (
      <div className="sc-empty">
        <h1>Let’s try that again.</h1>
        <p>
          This screen couldn’t open. Your saved account data is still there.
        </p>
        <button className="sc-button" onClick={() => location.reload()}>
          Reload Storicode
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
