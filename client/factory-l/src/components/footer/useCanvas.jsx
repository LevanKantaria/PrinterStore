import { useRef, useEffect } from 'react'

const useCanvas = (draw,handleClick) => {
  
  const canvasRef = useRef(null)
  
  useEffect(() => {
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId
    
    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    handleClick(context,);
    }
    render()

    const handleMouseClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
    };
    

    canvas.addEventListener('click', handleMouseClick);

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      canvas.removeEventListener('click', handleMouseClick);

    }
  }, [draw])
  
  return canvasRef
}

export default useCanvas