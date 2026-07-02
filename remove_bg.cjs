const { Jimp } = require('jimp');

async function processImage() {
  console.log("Loading image...");
  const image = await Jimp.read('d:\\NSC\\src\\assets\\mari_raw.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // We want to flood fill transparency starting from (0,0)
  // We'll consider pixels similar to the top-left pixel as background
  const targetColor = image.getPixelColor(0, 0);
  const targetR = (targetColor >> 24) & 255;
  const targetG = (targetColor >> 16) & 255;
  const targetB = (targetColor >> 8) & 255;
  
  function isSimilar(color) {
    const r = (color >> 24) & 255;
    const g = (color >> 16) & 255;
    const b = (color >> 8) & 255;
    // tolerance of 15 out of 255
    return Math.abs(r - targetR) < 15 && Math.abs(g - targetG) < 15 && Math.abs(b - targetB) < 15;
  }

  // BFS Queue
  const queue = [[0, 0]];
  const visited = new Uint8Array(w * h);
  visited[0] = 1;

  // Add all edges to queue as seeds to ensure we get around the character if she touches the bottom
  for (let x = 0; x < w; x++) {
    queue.push([x, 0]);
    queue.push([x, h - 1]);
    visited[x] = 1;
    visited[(h - 1) * w + x] = 1;
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y]);
    queue.push([w - 1, y]);
    visited[y * w] = 1;
    visited[y * w + w - 1] = 1;
  }

  let filled = 0;
  console.log("Flood filling...");
  
  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    
    if (isSimilar(image.getPixelColor(cx, cy))) {
      // Set alpha to 0
      image.setPixelColor(0x00000000, cx, cy);
      filled++;

      // check neighbors
      const neighbors = [
        [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          if (!visited[ny * w + nx]) {
            visited[ny * w + nx] = 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  console.log(`Filled ${filled} pixels. Saving...`);
  await image.write('d:\\NSC\\src\\assets\\mari-removebg.png');
  console.log("Done!");
}

processImage().catch(console.error);
