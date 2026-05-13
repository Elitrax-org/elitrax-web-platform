import { Component } from 'react'
import ErrorState from './ErrorState'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  handleRetry = () => {
    this.setState({ error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title={this.props.fallbackTitle || 'Error en esta sección'}
          message={this.props.fallbackMessage || this.state.error.message || 'Ocurrió un error inesperado.'}
          icon="🚨"
          onRetry={this.props.onRetry ? this.handleRetry : undefined}
        />
      )
    }
    return this.props.children
  }
}
