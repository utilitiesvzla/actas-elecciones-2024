const data = require('./static/original/RESULTADOS_2024_JSON_V1.json');

const max = 50;

let actas: any[] = [];

const chunks = data.reduce((acc: any[], item: any, index: number) => {
  const chunkIndex = Math.floor(index / max);
  acc[chunkIndex] = [...(acc[chunkIndex] || []), item];
  return acc;
}, []);

for (const [number, chunk] of chunks.entries()) {
  const response = await Promise.all(
    chunk.map(async (item: any, i: number) => {
      const fileName = item.URL.split('/').pop();
      const filePath = `./static/actas/${fileName}`;

      const newItem = {
        ...item,
        URL: filePath
      };

      if (await Bun.file(filePath).exists()) {
        return newItem;
      }

      const response = await fetch(item.URL);
      const buffer = Buffer.from(await response.arrayBuffer());

      await Bun.write(filePath, buffer);

      const index = i + 1 + number * max;

      if (index % max === 0) {
        const percentage = ((index + 1) / data.length) * 100;
        console.log(`[${index}/${data.length}] ${percentage.toFixed(2)}%`);
      }

      return newItem
    })
  );

  actas = [...actas, ...response];
}


Bun.write('./static/actas.json', JSON.stringify(actas, null, 2));
