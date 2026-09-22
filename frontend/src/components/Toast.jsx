import React from 'react'

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item ${toast.type || 'info'}`}
          onClick={() => onDismiss(toast.id)}
        >
          <span>
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <div style={{ flex: 1 }}>{toast.message}</div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDismiss(toast.id)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
