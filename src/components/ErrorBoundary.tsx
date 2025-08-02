import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('🚨 Error info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                The app encountered an error and couldn't load properly.
              </p>
              
              <details className="text-left">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
                  Show Error Details
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
              
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 