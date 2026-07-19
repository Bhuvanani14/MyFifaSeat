import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/** Props for the ErrorBoundary component. */
interface ErrorBoundaryProps {
  /** Child components to wrap with error protection. */
  children: ReactNode;
  /** Optional fallback UI to display instead of the default error panel. */
  fallback?: ReactNode;
}

/** Internal state for ErrorBoundary tracking. */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches unhandled JavaScript errors in any child component tree
 * and renders a graceful fallback UI instead of crashing the entire application.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <StadiumView />
 * </ErrorBoundary>
 * ```
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  /** Reset error state to allow the user to retry rendering. */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="glass-panel rounded-2xl p-8 border border-red-500/20 max-w-lg mx-auto mt-12 text-center space-y-4"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" aria-hidden="true" />
          <h2 className="font-display font-bold text-lg text-on-surface">
            Something went wrong
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            An unexpected error occurred while rendering this section. This has
            been logged for the operations team.
          </p>
          {this.state.error && (
            <pre className="text-[10px] font-mono text-red-400/70 bg-surface-container-lowest rounded-lg p-3 overflow-auto max-h-24 text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
            aria-label="Retry loading this section"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
