import React from 'react'

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App render error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
          <div style={{ maxWidth: 520, width: '100%', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', marginBottom: 10 }}>Unable to render page</div>
            <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: 0, color: 'var(--text)' }}>Something went wrong while loading this screen.</h1>
            <p style={{ marginTop: 12, marginBottom: 24, color: 'var(--sub)', lineHeight: 1.6 }}>
              The page failed to render cleanly. Reloading or returning to the home page usually clears the issue.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => window.location.reload()}>
                Reload
              </button>
              <button className="btn-cf-outline" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => window.location.assign('/')}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
