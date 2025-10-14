import React, { useRef, useEffect, useState } from 'react';

const Canvas = ({ objects }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedObject, setDraggedObject] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null); // Reference to store animation frame ID


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 500; // Set fixed height

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      objects.forEach(obj => {
        if (obj.isMouseOver(mouseX, mouseY)) {
          setDraggedObject(obj);
          obj.isDragging = true;
          setIsDragging(true);
          setDragStart({ x: mouseX, y: mouseY });
        }
      });
    };

    const handleMouseMove = (e) => {
      if (isDragging && draggedObject) {
        const rect = canvas.getBoundingClientRect();
    

        // Move the dragged object
        if(draggedObject.shape ==='rectangle'){
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const newPosX = mouseX - 150 / 2;
          const newPosY = mouseY - 150 / 2;
          
          draggedObject.setPosition(newPosX, newPosY);
        }else {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          draggedObject.setPosition(mouseX, mouseY);
        }

        // Apply magnet effect to other objects
        objects.forEach(obj => {
          if (obj !== draggedObject) {
            const dx = draggedObject.x - obj.x;
            const dy = draggedObject.y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Apply attraction if the distance is within a certain range
            if (distance < 150) { // Adjust the attraction range as needed
              const forceX = -dx / distance * 0.25; // Adjust attraction force as needed
              const forceY =-dy / distance * 0.25; // Adjust attraction force as needed

              obj.velocityX += forceX;
              obj.velocityY += forceY;
            }
          }
        });
      }
    };

    const handleMouseUp = (e) => {
      if (draggedObject) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate momentum opposite to the drag direction
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;

        draggedObject.velocityX = deltaX * 0.051; // Adjust this factor as needed
        draggedObject.velocityY = deltaY * 0.051; // Adjust this factor as needed

        draggedObject.isDragging = false;
        setDraggedObject(null);
      }
      setIsDragging(false);
    };

    const drawAimLine = (ctx) => {
      if (isDragging && draggedObject) {
        ctx.beginPath();
        ctx.moveTo(draggedObject.x, draggedObject.y);
        ctx.lineTo(dragStart.x, dragStart.y);
        ctx.strokeStyle = '#00000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawBorders = (ctx) => {
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;

      // Top border
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();

      // Bottom border
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();

      // Left border
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(0, canvas.height);
      ctx.stroke();

      // Right border
      ctx.beginPath();
      ctx.moveTo(canvas.width, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBorders(ctx)
      objects.forEach(obj => {
        obj.update(canvas, objects);
        obj.draw(ctx);
      });

      // drawAimLine(ctx); // Draw the aim line
      animationRef.current = requestAnimationFrame(animate); // Update animation frame reference

    };

    animate();

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationRef.current); // Cancel animation frame on cleanup

    };
  }, [objects, isDragging, draggedObject, dragStart]);

  return <canvas style={{ width: '100%' }} ref={canvasRef} />;
};

export default Canvas;
