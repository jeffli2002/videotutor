// Test TTS improvements with multiple languages
import { AnimationGenerator } from './src/services/animationGenerator.js';

console.log('🧪 Testing TTS Improvements with Multiple Languages\n');

const generator = new AnimationGenerator();

// Test cases with math symbols
const testCases = [
  {
    language: 'en',
    text: 'Find the area of a triangle with base = 8 and height = 6. Use the formula A = 1/2 × base × height',
    description: 'English with math symbols'
  },
  {
    language: 'zh',
    text: '求底边为8，高为6的三角形面积。使用公式 A = 1/2 × 底 × 高',
    description: 'Chinese with math symbols'
  },
  {
    language: 'es',
    text: 'Encuentra el área de un triángulo con base = 8 y altura = 6. Usa la fórmula A = 1/2 × base × altura',
    description: 'Spanish with math symbols'
  },
  {
    language: 'ja',
    text: '底辺が8、高さが6の三角形の面積を求めなさい。公式 A = 1/2 × 底辺 × 高さ',
    description: 'Japanese with math symbols'
  },
  {
    language: 'fr',
    text: 'Trouvez l\'aire d\'un triangle avec base = 8 et hauteur = 6. Utilisez la formule A = 1/2 × base × hauteur',
    description: 'French with math symbols'
  }
];

// Test markdown removal
const markdownTest = {
  language: 'en',
  text: '**Step 1**: Calculate the area using the formula `A = 1/2 × b × h`. The *result* is [24 square units](https://example.com)',
  description: 'Markdown formatting removal'
};

console.log('=== Testing Math Symbol Conversion ===\n');

testCases.forEach(test => {
  console.log(`📝 ${test.description}:`);
  console.log(`Input: ${test.text}`);
  const cleaned = generator.cleanTextForTTS(test.text, test.language);
  console.log(`Output: ${cleaned}`);
  console.log('---\n');
});

console.log('=== Testing Markdown Removal ===\n');
console.log(`📝 ${markdownTest.description}:`);
console.log(`Input: ${markdownTest.text}`);
const cleanedMarkdown = generator.cleanTextForTTS(markdownTest.text, markdownTest.language);
console.log(`Output: ${cleanedMarkdown}`);
console.log('---\n');

// Test page-based TTS generation
const testPages = [
  { text: '**Problem**: Find the area of a triangle with base = 8 and height = 6' },
  { text: 'Step 1: Apply the formula A = 1/2 × base × height' },
  { text: 'Step 2: Substitute values: A = 1/2 × 8 × 6' },
  { text: 'Step 3: Calculate: A = 1/2 × 48 = 24' },
  { text: '**Answer**: The area is 24 square units' }
];

console.log('=== Testing Page-based TTS Generation ===\n');

['en', 'zh', 'es'].forEach(lang => {
  console.log(`📝 Language: ${lang}`);
  const ttsContent = generator.generateTTSContentFromPages(testPages, lang);
  console.log(`Output: ${ttsContent}`);
  console.log(`Length: ${ttsContent.length} characters`);
  console.log('---\n');
});

console.log('✅ TTS Improvement Tests Complete!');