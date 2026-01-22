import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';

const dataDir = join(process.cwd(), 'docs', 'data');

async function minifyJson() {
  try {
    const files = await readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    let totalSaved = 0;

    for (const file of jsonFiles) {
      const filePath = join(dataDir, file);
      const originalStats = await stat(filePath);
      const originalSize = originalStats.size;

      const content = await readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);

      await writeFile(filePath, minified);

      const newStats = await stat(filePath);
      const newSize = newStats.size;
      const saved = originalSize - newSize;
      totalSaved += saved;

      console.log(`✅ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (${(saved/1024).toFixed(1)}KB 절약)`);
    }

    console.log(`\n📦 총 절약: ${(totalSaved/1024).toFixed(1)}KB`);
  } catch (error) {
    console.error('JSON minify 오류:', error.message);
  }
}

minifyJson();
