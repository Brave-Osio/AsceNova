import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render errors anywhere below it so a thrown error shows a
 * styled recovery panel instead of white-screening the whole app.
 * Must be a class component — React has no hook equivalent for
 * componentDidCatch/getDerivedStateFromError.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error caught by ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="relative flex min-h-svh items-center justify-center bg-mesh px-4">
        <div className="orb w-80 h-80 bg-violet-600/10 -top-20 -left-32" />
        <div className="glass-strong relative max-w-md rounded-3xl border border-white/8 p-10 text-center">
          <span className="text-5xl">⚠️</span>
          <h1 className="mt-4 text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-gray-400">
            An unexpected error occurred. Reloading the page usually fixes this.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
