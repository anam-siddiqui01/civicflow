import { useEffect, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Check, Info, X } from 'lucide-react'
import type { PriorityLevel } from '../types'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
  size?: 'regular' | 'small'
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'regular', icon, className = '', children, ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${size === 'small' ? 'button-small' : ''} ${className}`} {...props}>{icon}{children}</button>
}

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>
}

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return <Badge className={`priority-${level.toLowerCase()}`}>{level}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={`status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</Badge>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1 className="page-title">{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action}</div>
}

export function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children?: ReactNode }) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-top"><div><h2 id="modal-title" className="section-title">{title}</h2>{description && <p className="section-caption">{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={16} /></button></div>{children}</section></div>
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timer)
  }, [onClose])
  return <div className="toast" role="status"><Check size={16} />{message}<button className="icon-button" onClick={onClose} aria-label="Dismiss notification"><X size={14} /></button></div>
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon"><Info size={19} /></div><h3>{title}</h3><p>{message}</p>{action}</div>
}

export function LoadingState() {
  return <div className="card card-pad" aria-label="Loading"><div className="skeleton" style={{ width: '32%', height: 13, marginBottom: 14 }} /><div className="skeleton" style={{ width: '70%', height: 25, marginBottom: 10 }} /><div className="skeleton" style={{ width: '92%', height: 12 }} /></div>
}