class PhysicsObject {
  constructor(x, y, radius, color,shape,title, mass, width, height, friction = 0.99) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.mass = mass // Mass proportional to area (or volume in 3D)
    this.velocityX = (Math.random() - 0.5) * 2;
    this.velocityY = (Math.random() - 0.5) * 2;
    this.friction = friction;
    this.isDragging = false;
    this.image = 'image'; // Custom image for the object
    this.text = title; // Custom text for the object
    this.shape = shape
    this.width = width
    this.angularVelocity = 0.02; // Initial rotational velocity (adjust as needed)
this.angle = 0
    this.height = height
  }

  update(canvas, objects) {
    if (!this.isDragging) {
      // Apply friction
      this.velocityX *= this.friction;
      this.velocityY *= this.friction;

      // Update position
      this.x += this.velocityX;
      this.y += this.velocityY;

      // Bounce off the walls
      if (this.x + this.radius > canvas.width) {
        this.x = canvas.width - this.radius;
        this.velocityX = -this.velocityX;
      } else if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.velocityX = -this.velocityX;
      }
      if (this.y + this.radius > canvas.height) {
        this.y = canvas.height - this.radius;
        this.velocityY = -this.velocityY;
      } else if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.velocityY = -this.velocityY;
      }
    }

    // Check for collisions with other objects
    objects.forEach(obj => {
      if (this !== obj && this.isCollidingWith(obj)) {
        this.resolveCollision(obj);
        
      }
    });
  }

  draw(ctx) {
    if(this.text === 'linkedin'){
      if (this.text) {
        ctx.rotate((45 * Math.PI) / 180);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const cornerRadius = 10; // Adjust corner radius as needed
        // ctx.save();
        // ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.moveTo(this.x + cornerRadius, this.y);
    ctx.lineTo(this.x + this.width - cornerRadius, this.y);
    ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius, cornerRadius);
    ctx.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
    ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height, cornerRadius);
    ctx.lineTo(this.x + cornerRadius, this.y + this.height);
    ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius, cornerRadius);
    ctx.lineTo(this.x, this.y + cornerRadius);
    ctx.arcTo(this.x, this.y, this.x + cornerRadius, this.y, cornerRadius);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.fillStyle = '#ffffff'; // White color for the text
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
      }

    }else {

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  isCollidingWith(obj) {
    if (this.shape === 'circle' && obj.shape === 'circle') {
      // Collision detection between two circles
      const distX = this.x - obj.x;
      const distY = this.y - obj.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      return distance < this.radius + obj.radius;
    } else if (this.shape === 'rectangle' && obj.shape === 'rectangle') {
      
      // Simplified collision detection using bounding circles for rectangles
      const thisRadius = Math.sqrt((this.width / 2) ** 2 + (this.height / 2) ** 2);
      const objRadius = Math.sqrt((obj.width / 2) ** 2 + (obj.height / 2) ** 2);
  
      const distX = this.x - obj.x;
      const distY = this.y - obj.y;
      const distance = Math.sqrt(distX * distX + distY * distY);
  
      return distance < thisRadius + objRadius;
    } else if (this.shape === 'circle' && obj.shape === 'rectangle') {
      // Collision detection between circle and rectangle
      const rectCenterX = obj.x + obj.width / 2;
      const rectCenterY = obj.y + obj.height / 2;
  
      let closestX, closestY;
  
      if (this.x < obj.x) {
        closestX = obj.x;
      } else if (this.x > obj.x + obj.width) {
        closestX = obj.x + obj.width;
      } else {
        closestX = this.x;
      }
  
      if (this.y < obj.y) {
        closestY = obj.y;
      } else if (this.y > obj.y + obj.height) {
        closestY = obj.y + obj.height;
      } else {
        closestY = this.y;
      }
  
      const distX = this.x - closestX;
      const distY = this.y - closestY;
      const distance = Math.sqrt(distX * distX + distY * distY);
  
      return distance < this.radius;
    } else if (this.shape === 'rectangle' && obj.shape === 'circle') {
      // Reverse of the above: Collision detection between circle and rectangle
      return obj.isCollidingWith(this);
    }
  
    return false; // Default to no collision
  }
  

  resolveCollision(obj) {
    const xVelocityDiff = this.velocityX - obj.velocityX;
    const yVelocityDiff = this.velocityY - obj.velocityY;

    const xDist = obj.x - this.x;
    const yDist = obj.y - this.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
      const angle = -Math.atan2(obj.y - this.y, obj.x - this.x);

      const u1 = this.rotate(this.velocityX, this.velocityY, angle);
      const u2 = this.rotate(obj.velocityX, obj.velocityY, angle);

      const v1 = {
        x: u1.x * (this.mass - obj.mass) / (this.mass + obj.mass) + u2.x * 2 * obj.mass / (this.mass + obj.mass),
        y: u1.y
      };
      const v2 = {
        x: u2.x * (obj.mass - this.mass) / (this.mass + this.mass) + u1.x * 2 * this.mass / (this.mass + this.mass),
        y: u2.y
      };

      const vFinal1 = this.rotate(v1.x, v1.y, -angle);
      const vFinal2 = this.rotate(v2.x, v2.y, -angle);

      this.velocityX = vFinal1.x;
      this.velocityY = vFinal1.y;

      obj.velocityX = vFinal2.x;
      obj.velocityY = vFinal2.y;
    }
  }

  rotate(x, y, angle) {
    return {
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle)
    };
  }

  isMouseOver(x, y) {
    if(this.shape === 'rectangle'){
      return x >= this.x && x <= this.x + this.width && y >= this.height && y <= this.y + this.height;

    } else if(this.shape ==='circle'){

      const distX = x - this.x;
      const distY = y - this.y;
      return Math.sqrt(distX * distX + distY * distY) < this.radius;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}

export default PhysicsObject;



// src/components/FooterGame.js
