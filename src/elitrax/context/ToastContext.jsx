import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { T } from '../tokens'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  }, [addToast])

  const COLORS = {
    success: { bg: T.greenDim, border: T.green, icon: '✅' },
    error:   { bg: 'rgba(255,91,91,0.10)', border: T.red, icon: '❌' },
    warning: { bg: T.naranjaDim, border: T.naranja, icon: '⚠️' },
    info:    { bg: T.cianDim, border: T.cian, icon: 'ℹ️' },
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', top:16, right:16, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info
          return (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              style={{
                pointerEvents:'auto',
                background: c.bg,
                border: `1px solid ${c.border}44`,
                borderRadius: 10,
                padding: '12px 16px',
                display:'flex',
                alignItems:'center',
                gap: 10,
                maxWidth: 360,
                boxShadow: '0 8px 30px rgba(0,0,0,.4)',
                animation: 'slideIn .25s ease both',
                cursor:'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize:16, flexShrink:0 }}>{c.icon}</span>
              <span style={{ fontFamily:T.dm, fontSize:13, color:T.white, lineHeight:1.4 }}>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
