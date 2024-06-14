import React from 'react'
import Canvas from './Canvas'


function generateRandomDarkGreenColor() {
    // Generate random shades of dark green
    const minGreen = 20; // Minimum value for green component
    const maxGreen = 120; // Maximum value for green component
    const green = Math.floor(Math.random() * (maxGreen - minGreen + 1) + minGreen);
    
    // Set red and blue components to low values to maintain darker shades
    const red = Math.floor(Math.random() * 20); // Low red component
    const blue = Math.floor(Math.random() * 20); // Low blue component
    
    // Construct the RGB color string
    const color = `rgb(${red}, ${green}, ${blue})`;
    
    return color;
  }
  
  // Example usage
const FooterGame = () => {

    let count = 0;

    const drawCircle = (ctx, frameCount) => {
        // ctx.clearRect(0, 0, 70, 200)
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
        // ctx.fill()
      }

    
      
      const drawRectangle = (ctx, x, y) => {
        const randomX = (Math.random() * window.innerWidth + 20).toFixed(0);
        const randomY = (Math.random() * 350).toFixed(0);
        const randomRadius = (Math.random() * 80).toFixed(0);
        let randomGreenColor = 'red'
        count++
        if(count > 5 ){
            randomGreenColor =`#ebebeb`;
            count = 0
        }else {
             randomGreenColor = generateRandomDarkGreenColor();
            
        }
      
        // Draw a circle with random properties
        ctx.fillStyle = randomGreenColor;
        ctx.beginPath();
        ctx.arc(randomX,500-randomY, 20 * Math.sin(randomRadius * 0.05) ** 2, 0, 2 * Math.PI);
        ctx.fill();
    
      };
      
      return <Canvas draw={drawCircle} handleClick={drawRectangle} />
    
}

export default FooterGame