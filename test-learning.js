const http = require('http');

console.log('========================================');
console.log('Testing Learning System');
console.log('========================================\n');

// Simple request to trigger a subagent
const testPayload = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [
    {
      role: "user",
      content: "Use the Explore agent to find all JavaScript files in the src directory."
    }
  ]
};

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Sending request to trigger Explore agent...\n');
const startTime = Date.now();

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const duration = Date.now() - startTime;
    console.log(`\nRequest completed in ${(duration / 1000).toFixed(1)} seconds\n`);

    try {
      const response = JSON.parse(data);

      if (response.error) {
        console.log('❌ Error:', response.error);
        return;
      }

      console.log('✓ Response received');
      console.log(`Content blocks: ${response.content?.length || 0}\n`);

      // Wait a moment for learning to complete (async)
      console.log('Waiting for learning to complete (3s)...');
      setTimeout(() => {
        console.log('\n========================================');
        console.log('Checking Skillbooks');
        console.log('========================================\n');

        const fs = require('fs');
        const path = require('path');
        const skillbooksDir = path.join(process.cwd(), 'data', 'skillbooks');

        try {
          const files = fs.readdirSync(skillbooksDir);
          console.log(`Found ${files.length} skillbook(s):\n`);

          files.forEach(file => {
            const filepath = path.join(skillbooksDir, file);
            const content = fs.readFileSync(filepath, 'utf8');
            const skillbook = JSON.parse(content);

            console.log(`📚 ${skillbook.agentType}`);
            console.log(`   Skills: ${skillbook.skills.length}`);
            console.log(`   Last saved: ${new Date(skillbook.savedAt).toLocaleString()}\n`);

            if (skillbook.skills.length > 0) {
              console.log('   Learned patterns:');
              skillbook.skills.slice(0, 3).forEach(([pattern, skill]) => {
                console.log(`   - ${skill.pattern} (confidence: ${Math.round(skill.confidence * 100)}%)`);
              });
              console.log('');
            }
          });

          console.log('========================================');
          console.log('Test Complete!');
          console.log('========================================\n');
          process.exit(0);

        } catch (error) {
          console.log('⚠️  Error reading skillbooks:', error.message);
          process.exit(1);
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response (first 500 chars):', data.substring(0, 500));
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
  process.exit(1);
});

req.write(JSON.stringify(testPayload));
req.end();
