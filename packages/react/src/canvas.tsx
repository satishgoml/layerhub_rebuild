import * as React from "react"
import { Editor } from "@layerhub-io/core"
import { Context } from "./context"
import ResizeObserver from "resize-observer-polyfill"
import { EditorConfig } from "@layerhub-io/types"

interface Props {
  config?: Partial<EditorConfig>
}

export const Canvas = (props: Props) => {
  const context = React.useContext(Context)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = React.useState(false)
  const [startPanPosition, setStartPanPosition] = React.useState({ x: 0, y: 0 })
  const editorRef = React.useRef<Editor | null>(null)

  React.useEffect(() => {
    const container = containerRef.current as HTMLDivElement
    const { clientHeight, clientWidth } = container
    const editor = new Editor({
      id: "layerhub_io_canvas",
      config: {
        ...props.config,
        size: {
          width: clientWidth,
          height: clientHeight,
        },
      },
      state: context,
    })
    editorRef.current = editor

    const resizeObserver = new ResizeObserver((entries) => {
      const { width = clientWidth, height = clientHeight } = (entries[0] && entries[0].contentRect) || {}
      editor.canvas.resize({
        width,
        height,
      })
    })
    resizeObserver.observe(container)

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('wheel', handleWheel)

    return () => {
      editor.destroy()
      if (container) {
        resizeObserver.unobserve(container)
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseup', handleMouseUp)
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  const handleMouseDown = (e: MouseEvent) => {
    setIsPanning(true)
    setStartPanPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning || !editorRef.current) return
    const dx = e.clientX - startPanPosition.x
    const dy = e.clientY - startPanPosition.y
    editorRef.current.canvas.canvas.relativePan({ x: dx, y: dy })
    setStartPanPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (editorRef.current) {
      if (e.shiftKey) {
        // Shift + wheel for horizontal scrolling
        editorRef.current.canvas.canvas.relativePan({ x: -e.deltaY, y: 0 })
      } else {
        // Normal wheel for vertical scrolling
        editorRef.current.canvas.canvas.relativePan({ x: 0, y: -e.deltaY })
      }
    }
  }

  return (
    <div
      id="layerhub_io_canvas_container"
      ref={containerRef}
      style={{ flex: 1, position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
        }}
      >
        <canvas id="layerhub_io_canvas"></canvas>
      </div>
    </div>
  )
}
