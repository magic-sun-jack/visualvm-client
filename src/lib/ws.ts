export type WebSocketMessageHandler = (data: any) => void

interface WebSocketClientOptions {
  url: string
  protocols?: string | string[]
  heartbeatIntervalMs?: number
  reconnectDelayMs?: number
  maxReconnectDelayMs?: number
}

export class ReconnectingWebSocketClient {
  private url: string
  private protocols?: string | string[]
  private ws: WebSocket | null = null
  private heartbeatTimer: number | null = null
  private reconnectDelayMs: number
  private readonly heartbeatIntervalMs: number
  private readonly maxReconnectDelayMs: number
  private readonly listeners = new Set<WebSocketMessageHandler>()
  private isClosing = false

  constructor(options: WebSocketClientOptions) {
    this.url = options.url
    this.protocols = options.protocols
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 15000
    this.reconnectDelayMs = options.reconnectDelayMs ?? 1000
    this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? 15000
  }

  connect() {
    this.isClosing = false
    this.ws = new WebSocket(this.url, this.protocols)

    this.ws.onopen = () => {
      this.startHeartbeat()
      // Reset backoff on successful connect
      this.reconnectDelayMs = 1000
    }

    this.ws.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        this.listeners.forEach((cb) => cb(data))
      } catch {
        // Fallback raw forward
        this.listeners.forEach((cb) => cb(event.data))
      }
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      if (!this.isClosing) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      // Let onclose handle reconnect
    }
  }

  close() {
    this.isClosing = true
    this.stopHeartbeat()
    this.ws?.close()
    this.ws = null
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws.send(payload)
    }
  }

  onMessage(cb: WebSocketMessageHandler) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', ts: Date.now() })
    }, this.heartbeatIntervalMs)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect() {
    const delay = this.reconnectDelayMs
    setTimeout(() => {
      // Exponential backoff with cap
      this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, this.maxReconnectDelayMs)
      this.connect()
    }, delay)
  }
}


