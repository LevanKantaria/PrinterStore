import React, { useEffect, useState } from 'react';
import Canvas from './Canvas';
import PhysicsObject from './PhysicalObject';

function generateRandomDarkGreenColor() {
  // Generate random shades of dark green
  const minGreen = 40; // Minimum value for green component
  const maxGreen = 240; // Maximum value for green component
  const green = Math.floor(Math.random() * (maxGreen - minGreen + 1) + minGreen);
  
  // Set red and blue components to low values to maintain darker shades
  const red = Math.floor(Math.random() * 100); // Low red component
  const blue = Math.floor(Math.random() * 100); // Low blue component
  
  // Construct the RGB color string
  const color = `rgb(${red}, ${green}, ${blue})`;
  
  return color;
}

const objectGenerator = () => {
  const linkedIn = new PhysicsObject(30, 30, 75 ,'blue','rectangle','linkedin' , 30,150 ,150)
  const balls = [linkedIn];
  const numBalls = 30; // Number of balls to generate

  for (let i = 0; i < numBalls; i++) {
    const randomX = Math.random() * (window.innerWidth - 100) + 50; // Random X position within visible area
    const randomY = Math.random() * 800; // Random Y position (adjust as needed)
    const randomRadius = Math.random() * (30 - 14) + 15; // Random radius between 15 and 50
    const randomColor = generateRandomDarkGreenColor(); // Random dark green color

    balls.push(new PhysicsObject(randomX, randomY, randomRadius, randomColor, 'circle', null, 10));
  }

  return balls;
};

const FooterGame = () => {
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    const generatedObjects = objectGenerator();
    setObjects(generatedObjects);
  }, []); // Empty dependency array ensures this runs once on mount

  return <Canvas objects={objects} />;
};

export default FooterGame;
