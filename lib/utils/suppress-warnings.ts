// Utility to suppress specific React warnings in development
export function suppressReactWarnings() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn
    const originalError = console.error

    console.warn = (...args) => {
      const message = args[0]
      if (typeof message === 'string') {
        // Suppress useLayoutEffect SSR warnings
        if (message.includes('useLayoutEffect does nothing on the server')) {
          return
        }
        // Suppress other specific warnings if needed
        // if (message.includes('other warning pattern')) {
        //   return
        // }
      }
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      const message = args[0]
      if (typeof message === 'string') {
        // Suppress specific error messages if needed
        if (message.includes('useLayoutEffect does nothing on the server')) {
          return
        }
      }
      originalError.apply(console, args)
    }
  }
}
