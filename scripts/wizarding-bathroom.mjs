// Side elevation at native pixel scale. The walkable floor starts at y=256.
export function bathroomArtwork() {
  const rect = (x, y, width, height, color) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`;
  const wall = Array.from({ length: 11 }, (_, row) =>
    Array.from({ length: 17 }, (_, col) => {
      const x = col * 32 - (row % 2) * 16;
      const y = row * 20;
      const colors = ["#263c47", "#2a414b", "#304650", "#293f4a"];
      return rect(x + 1, y + 1, 30, 18, colors[(row * 5 + col * 7) % colors.length]) +
        rect(x + 2, y + 2, 28, 2, "#38505a") + rect(x + 4, y + 15, 12, 2, "#223842");
    }).join("")
  ).join("");
  const arch = "M0 112V34h4V24h6V16h8V8h12V4h24v4h12v8h8v8h6v10h4v78Z";
  const windowFrame = (x, y) => `<g transform="translate(${x} ${y})">
    <path d="${arch}" fill="#567783"/><path d="M8 106V35h5V25h8V17h10V12h22v5h10v8h8v10h5v71Z" fill="#16293e"/>
    <path d="M12 102V39h6V29h8V22h10v-5h12v5h10v7h8v10h6v63Z" fill="#355a70"/>
    <path d="M20 102V54h9V42h10v-6h12v6h9v12h8v48Z" fill="#527c91"/>
    ${rect(39, 17, 5, 85, "#1c354a")}${rect(13, 63, 58, 4, "#1c354a")}
    ${rect(12, 103, 61, 4, "#85a2a4")}${rect(-4, 110, 92, 5, "#9aada9")}${rect(0, 115, 84, 5, "#1b3039")}
  </g>`;
  const sink = x => `<g transform="translate(${x} 171)">
    ${rect(5, 15, 64, 5, "#b6cbc1")}${rect(8, 20, 58, 8, "#7eaca5")}${rect(14, 28, 46, 6, "#466d70")}
    ${rect(28, 33, 17, 32, "#749b95")}${rect(28, 35, 5, 27, "#9dbab0")}${rect(24, 64, 25, 5, "#496c6b")}
    ${rect(28, 5, 15, 4, "#c6a064")}${rect(30, 9, 5, 7, "#ad8351")}${rect(13, 10, 4, 5, "#c6a064")}${rect(54, 10, 4, 5, "#c6a064")}
  </g>`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="320" shape-rendering="crispEdges">
    ${rect(0, 0, 512, 320, "#192933")}${wall}
    <path d="M0 0h512v26h-28v-6h-24v-6H54v6H27v6H0Z" fill="#14242d"/>
    ${windowFrame(170, 35)}${windowFrame(278, 35)}
    ${rect(0, 162, 512, 7, "#52666a")}${rect(0, 169, 512, 4, "#192c35")}
    ${rect(0, 214, 512, 42, "#213a40")}${rect(0, 215, 512, 3, "#4a6669")}
    <path d="M20 253V97h113v156h-10V111H30v142Z" fill="#152e33"/>
    ${rect(30, 111, 91, 131, "#3b6365")}${rect(34, 115, 82, 5, "#648b87")}
    ${rect(40, 128, 3, 106, "#527b77")}${rect(107, 122, 5, 115, "#29494e")}${rect(98, 175, 12, 4, "#b48e53")}
    ${sink(168)}${sink(270)}
    ${rect(392, 221, 62, 6, "#adc0ae")}${rect(397, 227, 52, 7, "#749695")}
    ${rect(404, 234, 38, 22, "#4a6c71")}${rect(404, 234, 5, 22, "#648888")}
    ${rect(0, 255, 512, 5, "#a8a38a")}${rect(0, 260, 512, 6, "#4e6260")}
    ${rect(0, 266, 512, 54, "#253e47")}
    <path d="M0 284h512M0 305h512M24 266v18m64-18v18m64-18v18m64-18v18m64-18v18m64-18v18m64-18v18m64-18v18M56 284v21m64-21v21m64-21v21m64-21v21m64-21v21m64-21v21m64-21v21m64-21v21" stroke="#142a35" stroke-width="2"/>
    ${rect(0, 309, 512, 11, "#172c35")}
  </svg>`);
}
