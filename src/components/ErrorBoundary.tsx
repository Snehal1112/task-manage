import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Database, Bug } from 'lucide-react';
import { clearTasksFromStorage } from '@/utils/storage';
import { CONTEXT_ICON_SIZES } from '@/utils/iconSizes';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorReportingTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging with context
    const errorContext = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      isolate: this.props.isolate,
    };

    console.group(`🚨 Error Boundary - ${this.state.errorId}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', errorContext);
    console.groupEnd();

    // Store error information
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report error to external service in production (with debouncing)
    if (process.env.NODE_ENV === 'production') {
      if (this.errorReportingTimeout) {
        clearTimeout(this.errorReportingTimeout);
      }

      this.errorReportingTimeout = setTimeout(() => {
        this.reportError(error, errorInfo, errorContext);
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.errorReportingTimeout) {
      clearTimeout(this.errorReportingTimeout);
    }
  }

  private reportError = async (error: Error, errorInfo: React.ErrorInfo, context: Record<string, unknown>) => {
    // This would integrate with error reporting services like Sentry, LogRocket, etc.
    // For now, we'll just prepare the error data
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
    };

    // In production, send to error reporting service
    console.info('Error report prepared:', errorReport);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1
    });
  };

  handleClearStorage = () => {
    try {
      clearTasksFromStorage();
      this.handleReset();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  handleReportBug = () => {
    const errorDetails = {
      error: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack?.substring(0, 500) || 'No stack trace',
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    };

    const body = `**Error Report**

Error ID: ${errorDetails.errorId}
Timestamp: ${errorDetails.timestamp}
Message: ${errorDetails.error}

**Stack Trace:**
\`\`\`
${errorDetails.stack}
\`\`\`

**Steps to Reproduce:**
1. [Please describe what you were doing when this error occurred]

**Browser:** ${navigator.userAgent}
**URL:** ${window.location.href}`;

    const githubUrl = `https://github.com/your-org/task-manage/issues/new?title=${encodeURIComponent(`Bug Report: ${errorDetails.error}`)}&body=${encodeURIComponent(body)}`;
    window.open(githubUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isIsolated = this.props.isolate;
      const hasRetriedMultipleTimes = this.state.retryCount > 2;

      return (
        <div className={`${isIsolated ? 'p-4' : 'min-h-screen'} bg-background flex items-center justify-center`}>
          <Card className={`${isIsolated ? 'w-full' : 'max-w-lg w-full'} ${isIsolated ? 'border-destructive/20' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className={CONTEXT_ICON_SIZES.errorIcon} />
                {isIsolated ? 'Component Error' : 'Application Error'}
              </CardTitle>
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isIsolated
                    ? 'This component encountered an error, but the rest of the application should continue working.'
                    : 'An unexpected error occurred. Please try one of the recovery options below.'
                  }
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Retry attempts: {this.state.retryCount}
                  </p>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs font-mono break-all text-destructive">
                      {this.state.error.message}
                    </p>
                  </div>
                  {this.state.error.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        Stack trace
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={this.handleReset} variant="outline" size="sm">
                    <RefreshCw className={`${CONTEXT_ICON_SIZES.secondaryButton} mr-2`} />
                    Try Again
                  </Button>

                  {!isIsolated && (
                    <Button
                      onClick={() => window.location.reload()}
                      size="sm"
                    >
                      Reload Page
                    </Button>
                  )}
                </div>

                {hasRetriedMultipleTimes && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Still having trouble? Try these recovery options:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={this.handleClearStorage}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Database className={`${CONTEXT_ICON_SIZES.clearIcon} mr-2`} />
                        Clear Data
                      </Button>
                      <Button
                        onClick={this.handleReportBug}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Bug className={`${CONTEXT_ICON_SIZES.clearIcon} mr-2`} />
                        Report Bug
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
