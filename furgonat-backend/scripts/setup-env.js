const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const templatePath = path.join(__dirname, '..', 'env-template.txt');

// Kontrollo nëse .env ekziston
if (!fs.existsSync(envPath)) {
  console.log('📝 .env file nuk ekziston, po krijohet nga template...');
  
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, envPath);
    console.log('✅ .env file u krijua me sukses!');
  } else {
    console.error('❌ env-template.txt nuk u gjet!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file ekziston tashmë.');
}

