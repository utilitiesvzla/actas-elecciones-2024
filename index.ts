import pLimit from 'p-limit';

const data = require('./static/original/RESULTADOS_2024_JSON_V1.json');

const max = 50;

const limit = pLimit(max);

const response = await Promise.all(
  data.map(async (item: any, index: number) => {
    return limit(async () => {
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

      if (index % max === 0) {
        const percentage = ((index + 1) / data.length) * 100;
        console.log(`[${index + 1}/${data.length}] ${percentage.toFixed(2)}%`);
      }

      return newItem
    });
  })
);

Bun.write('./static/actas.json', JSON.stringify(response, null, 2));
