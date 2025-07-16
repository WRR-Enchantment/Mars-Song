import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-400 mt-10">
          <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
          <p>Silakan muat ulang halaman atau coba lagi nanti.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
