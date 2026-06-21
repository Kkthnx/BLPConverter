import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("BLP Converter error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-workspace-bg p-8">
          <AlertTriangle className="h-12 w-12 text-workspace-cyan" />
          <h1 className="text-xl font-semibold text-white">
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-sm text-workspace-silver-muted">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg border border-workspace-cyan/40 bg-workspace-cyan/10 px-4 py-2 text-sm text-workspace-cyan transition hover:bg-workspace-cyan/20"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
