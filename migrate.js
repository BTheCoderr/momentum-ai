#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Momentum AI Universal Migration Script\n');

const baseDir = path.dirname(__dirname);
const webSource = path.join(baseDir, 'momentum-ai');
const mobileSource = path.join(baseDir, 'momentum-ai'); // Same source since it's unified
const targetDir = process.cwd();

function copyDirectory(src, dest, exclude = []) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source directory ${src} not found, skipping...`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    if (exclude.includes(item)) return;
    
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('📁 Setting up directory structure...');

// Web app migration
console.log('🌐 Migrating web app...');
const webExclude = ['node_modules', '.next', '.expo', 'App.tsx', 'app.json', 'expo'];
copyDirectory(webSource, path.join(targetDir, 'web'), webExclude);

// Mobile app migration  
console.log('📱 Migrating mobile app...');
const mobileInclude = ['App.tsx', 'app.json', 'lib'];
if (fs.existsSync(path.join(mobileSource, 'App.tsx'))) {
  fs.copyFileSync(
    path.join(mobileSource, 'App.tsx'), 
    path.join(targetDir, 'mobile', 'App.tsx')
  );
}
if (fs.existsSync(path.join(mobileSource, 'app.json'))) {
  fs.copyFileSync(
    path.join(mobileSource, 'app.json'), 
    path.join(targetDir, 'mobile', 'app.json')
  );
}

// Copy shared lib directory
console.log('📚 Setting up shared libraries...');
if (fs.existsSync(path.join(mobileSource, 'lib'))) {
  copyDirectory(
    path.join(mobileSource, 'lib'), 
    path.join(targetDir, 'shared', 'lib')
  );
}

console.log('\n✅ Migration complete!');
console.log('\n🎯 Next steps:');
console.log('1. cd momentum-ai-universal');
console.log('2. npm install');
console.log('3. npm run install:all');
console.log('4. npm run dev:web      # Start web app');
console.log('5. npm run dev:mobile   # Start mobile app');
console.log('6. npm run dev:both     # Start both apps');

console.log('\n📝 Don\'t forget to:');
console.log('- Copy your .env files to web/ and mobile/ directories');
console.log('- Update import paths to use ../shared/lib/* where needed');
console.log('- Test both apps to ensure everything works');

console.log('\n🎉 Happy coding with Momentum AI Universal!'); 