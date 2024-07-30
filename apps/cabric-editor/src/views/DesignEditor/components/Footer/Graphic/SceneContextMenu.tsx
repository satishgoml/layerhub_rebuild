import React from "react"
import { Block } from "baseui/block"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import { nanoid } from "nanoid"
import useOnClickOutside from "~/hooks/useOnClickOutside"
import { getDefaultTemplate } from "~/constants/design-editor"
import { useEditor, useFrame } from "@layerhub-io/react"

export default function () {
  const {
    scenes,
    setScenes,
    setContextMenuTimelineRequest,
    contextMenuTimelineRequest,
    setCurrentScene,
    setCurrentDesign,
  } = useDesignEditorContext()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const editor = useEditor()
  const frame = useFrame()
  useOnClickOutside(ref, () => {
    setContextMenuTimelineRequest({ ...contextMenuTimelineRequest, visible: false })
  })

  const timelineItemsContainerBounds = document.getElementById("TimelineItemsContainer")?.getBoundingClientRect() || {
    top: 0,
    left: 0,
  }

  const makeDeleteScene = async () => {
    const updatedScenes = scenes.filter((scene) => scene.id !== contextMenuTimelineRequest.id)

    setContextMenuTimelineRequest({ ...contextMenuTimelineRequest, visible: false })
    if (updatedScenes[0]) {
      setScenes(updatedScenes)
    } else {
      const defaultTemplate = getDefaultTemplate({
        width: frame.width,
        height: frame.height,
      })

      await editor.scene.importFromJSON(defaultTemplate)
      setCurrentDesign({
        id: nanoid(),
        frame: defaultTemplate.frame,
        metadata: {},
        name: "Untitled Design",
        preview: "",
        scenes: [],
        type: "VIDEO",
      })
      const initialDesign = editor.scene.exportToJSON() as any
      const preview = await editor.renderer.render(initialDesign)
      setCurrentScene({ ...initialDesign, preview: preview, duration: 5000 })
      setScenes([{ ...initialDesign, preview: preview, duration: 5000 }])
    }
  }

  const makeAddScene = () => {}

  const makeDuplicateScene = () => {
    const currentScene = scenes.find((scene) => scene.id === contextMenuTimelineRequest.id)
    const updatedScenes = [...scenes, { ...currentScene, id: nanoid() }]
    //  @ts-ignore
    setScenes(updatedScenes)
    setContextMenuTimelineRequest({ ...contextMenuTimelineRequest, visible: false })
  }
  console.log({ contextMenuTimelineRequest })
  return (
    <Block
      ref={ref}
      style={{
        width: "160px",
        position: "absolute",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 0 1px rgba(64,87,109,0.07),0 2px 12px rgba(53,71,90,0.2)",
        zIndex: 4,
        top: `${contextMenuTimelineRequest.top - timelineItemsContainerBounds.top - 80}px`,
        left: `${contextMenuTimelineRequest.left - timelineItemsContainerBounds.left}px`,
        padding: "0.5rem 0",
      }}
    >
      <Block
        onClick={makeDuplicateScene}
        style={{
          fontSize: "14px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          padding: "0 1rem",

        }}
      >
        Duplicate Scene
      </Block>
      <Block
        onClick={makeDeleteScene}
        style={{
          fontSize: "14px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        Delete Scene
      </Block>
    </Block>
  )
}
