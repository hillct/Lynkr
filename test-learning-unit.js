const Skillbook = require('./src/agents/skillbook');
const Reflector = require('./src/agents/reflector');
const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('Learning System Unit Test');
console.log('========================================\n');

async function testLearningSystem() {
  try {
    // Test 1: Create and save skillbook
    console.log('Test 1: Creating skillbook...');
    const skillbook = new Skillbook('Explore');

    // Add a test skill
    skillbook.addSkill({
      pattern: "Search task",
      action: "Use tools: Glob, Grep, Read",
      reasoning: "Successfully completed search task using these tools",
      tools: ["Glob", "Grep", "Read"],
      confidence: 0.75
    });

    console.log(`✓ Added 1 skill`);
    console.log(`  Total skills: ${skillbook.skills.size}\n`);

    // Test 2: Save skillbook
    console.log('Test 2: Saving skillbook...');
    const saved = await skillbook.save();
    console.log(`✓ Skillbook saved: ${saved}\n`);

    // Test 3: Load skillbook
    console.log('Test 3: Loading skillbook...');
    const loaded = await Skillbook.load('Explore');
    console.log(`✓ Loaded skillbook`);
    console.log(`  Skills: ${loaded.skills.size}\n`);

    // Test 4: Get top skills
    console.log('Test 4: Getting top skills...');
    const topSkills = loaded.getTopSkills(3);
    console.log(`✓ Top skills: ${topSkills.length}`);
    topSkills.forEach((skill, i) => {
      console.log(`  ${i + 1}. ${skill.pattern} (confidence: ${Math.round(skill.confidence * 100)}%)`);
    });
    console.log('');

    // Test 5: Format for prompt
    console.log('Test 5: Formatting for prompt...');
    const promptSection = loaded.formatForPrompt();
    console.log(`✓ Generated prompt section (${promptSection.length} chars):`);
    console.log(promptSection.substring(0, 200) + '...\n');

    // Test 6: Test Reflector
    console.log('Test 6: Testing Reflector...');
    const mockContext = {
      agentName: 'Test',
      taskPrompt: 'Find all JavaScript files in src directory',
      steps: 3,
      maxSteps: 10,
      inputTokens: 500,
      outputTokens: 300,
      transcript: [
        {
          type: 'tool_call',
          toolName: 'Glob',
          timestamp: Date.now() - 2000
        },
        {
          type: 'tool_call',
          toolName: 'Grep',
          timestamp: Date.now() - 1000
        },
        {
          type: 'tool_call',
          toolName: 'Read',
          timestamp: Date.now()
        }
      ]
    };

    const patterns = Reflector.reflect(mockContext, true);
    console.log(`✓ Reflector extracted ${patterns.length} patterns:`);
    patterns.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.pattern}`);
      console.log(`     Action: ${p.action}`);
      console.log(`     Confidence: ${Math.round(p.confidence * 100)}%`);
    });
    console.log('');

    // Test 7: Add reflected patterns to skillbook
    console.log('Test 7: Adding reflected patterns...');
    const testSkillbook = new Skillbook('Test');
    for (const pattern of patterns) {
      testSkillbook.addSkill(pattern);
    }
    console.log(`✓ Added ${patterns.length} patterns`);
    console.log(`  Total skills: ${testSkillbook.skills.size}\n`);

    // Test 8: Save test skillbook
    console.log('Test 8: Saving test skillbook...');
    await testSkillbook.save();
    console.log(`✓ Test skillbook saved\n`);

    // Test 9: List all skillbooks
    console.log('Test 9: Listing all skillbooks...');
    const skillbooksDir = path.join(process.cwd(), 'data', 'skillbooks');
    const files = fs.readdirSync(skillbooksDir);
    console.log(`✓ Found ${files.length} skillbook(s):`);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log('');

    console.log('========================================');
    console.log('✅ All Tests Passed!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLearningSystem();
