import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft, Circle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { useEventsStore } from '@/stores/eventsStore'
import { joinRoom, leaveRoom, sendMessage, sendTyping } from '@/services/socket'
import clsx from 'clsx'

export const ChatPage = () => {
  const { eventId }  = useParams()
  const { user }     = useAuthStore()
  const { fetchById, activeEvent } = useEventsStore()
  const { rooms, onlineUsers, typing, loadHistory } = useChatStore()

  const messages    = rooms[eventId] || []
  const online      = onlineUsers[eventId] || []
  const typingUsers = typing[eventId] || []

  const [text, setText]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef             = useRef(null)
  const typingTimer           = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    fetchById(eventId)
    loadHistory(eventId)
    joinRoom(eventId)
    return () => leaveRoom(eventId)
  }, [eventId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInput = (e) => {
    setText(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      sendTyping(eventId, true)
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setIsTyping(false)
      sendTyping(eventId, false)
    }, 1500)
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage(eventId, trimmed)
    setText('')
    clearTimeout(typingTimer.current)
    sendTyping(eventId, false)
    setIsTyping(false)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const othersTyping = typingUsers.filter((id) => id !== user?.id)

  // Group messages by author for bubble threading
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1]
    const isFirst = !prev || prev.user_id !== msg.user_id ||
      new Date(msg.created_at) - new Date(prev.created_at) > 5 * 60 * 1000
    acc.push({ ...msg, isFirst })
    return acc
  }, [])

  return (
    <div className="h-screen flex flex-col pt-16">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]
                      bg-ink-900/90 backdrop-blur-sm">
        <Link to={`/events/${eventId}`} className="btn-ghost !px-2 !py-2 text-ink-500">
          <ArrowLeft size={16} />
        </Link>

        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-sm text-ink-100 truncate">
            {activeEvent?.title || 'Chat del evento'}
          </h2>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <Circle size={6} className="fill-emerald-400 text-emerald-400" />
              {online.length} en línea
            </span>
          </div>
        </div>

        {/* Online avatars */}
        <div className="flex -space-x-1.5">
          {online.slice(0, 4).map((uid) => (
            <div key={uid}
              className="w-6 h-6 rounded-full bg-ink-700 border-2 border-ink-900
                         flex items-center justify-center text-[9px] font-bold text-ink-300">
              ?
            </div>
          ))}
          {online.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-ink-700 border-2 border-ink-900
                            flex items-center justify-center text-[9px] font-bold text-ink-500">
              +{online.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ink-800 border border-[var(--border)]
                            flex items-center justify-center">
              <Send size={20} className="text-ink-600" />
            </div>
            <p className="text-ink-500 text-sm">Sé el primero en escribir algo 👋</p>
          </div>
        )}

        {grouped.map((msg) => {
          const isMine = msg.user_id === user?.id
          return (
            <div
              key={msg.id}
              className={clsx(
                'flex items-end gap-2',
                isMine ? 'flex-row-reverse' : 'flex-row',
                msg.isFirst ? 'mt-3' : 'mt-0.5'
              )}
            >
              {/* Avatar — only for first in group */}
              <div className={clsx('w-7 h-7 flex-shrink-0', !msg.isFirst && 'invisible')}>
                {!isMine && (
                  <div className="w-7 h-7 rounded-full bg-ink-700 border border-[var(--border)]
                                  flex items-center justify-center text-xs font-bold text-ink-300">
                    {msg.user_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className={clsx('max-w-[72%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
                {msg.isFirst && !isMine && (
                  <span className="text-[10px] text-ink-500 mb-1 ml-1">{msg.user_name}</span>
                )}
                <div className={clsx(
                  'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                  isMine
                    ? 'bg-spark text-ink-900 font-medium rounded-br-sm'
                    : 'bg-ink-800 text-ink-100 border border-[var(--border)] rounded-bl-sm'
                )}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-ink-600 mt-1 mx-1">
                  {format(new Date(msg.created_at), 'HH:mm')}
                </span>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {othersTyping.length > 0 && (
          <div className="flex items-end gap-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-ink-700 border border-[var(--border)]" />
            <div className="bg-ink-800 border border-[var(--border)] px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span key={i}
                    className="w-1.5 h-1.5 rounded-full bg-ink-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-ink-900/90 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Escribe un mensaje…"
            rows={1}
            className="input resize-none flex-1 max-h-28 py-2.5 leading-relaxed"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
              text.trim()
                ? 'bg-spark text-ink-900 hover:bg-spark/90 shadow-[0_0_16px_rgba(255,204,77,0.3)] active:scale-95'
                : 'bg-ink-800 text-ink-600 cursor-not-allowed'
            )}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-ink-700 mt-1.5 ml-1">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}
