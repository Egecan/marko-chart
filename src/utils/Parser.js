
export function parseJsonArray(data, xDimension, yDimensionArray, colorArray = [], idArray = [], nameArray = [] ) {

  const colors =  [
    "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00",
    "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707",
    "#651067", "#329262", "#5574a6", "#3b3eac"
  ];

  const lines = [];

  // Transform a single string into an array
  if ( typeof yDimensionArray === "string" ) yDimensionArray = [yDimensionArray];

  // eslint-disable-next-line
  yDimensionArray.map((yDimension, i) => {
    lines.push({
      id: idArray[i] || `${xDimension}-${yDimension}`,
      name: nameArray[i],
      color: colorArray[i] || colors[i % colors.length],
      points: []
    });
  });
  
  // eslint-disable-next-line
  data.map(d => {
    // eslint-disable-next-line
    lines.map((line, j) => {
      line.points.push({
        x: d[xDimension],
        y: d[yDimensionArray[j]],
        sharpe: d["sharpe"],
        weights: d["weights"]
      });
    });
  });

  return lines;
}
