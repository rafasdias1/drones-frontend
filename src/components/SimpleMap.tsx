"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface SimpleMapProps {
  geoJsonData: any
  onFeatureClick?: (feature: any) => void
}

const SimpleMap: React.FC<SimpleMapProps> = ({ geoJsonData, onFeatureClick }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Ouvir mensagens do iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FEATURE_CLICK" && onFeatureClick) {
        onFeatureClick(event.data.feature)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [onFeatureClick])

  return (
    <iframe ref={iframeRef} src="/map.html" className="w-full h-full border-0" title="Mapa de Zonas de Voo"></iframe>
  )
}

export default SimpleMap

