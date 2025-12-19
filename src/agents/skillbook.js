const logger = require("../logger");
const path = require("path");
const fs = require("fs").promises;

/**
 * Skillbook - Persistent knowledge store for agent learning
 * Each agent type has its own skillbook that evolves with experience
 */
class Skillbook {
  constructor(agentType) {
    this.agentType = agentType;
    this.skills = new Map(); // pattern → skill object
    this.loaded = false;
  }

  /**
   * Add or update a skill
   * Uses incremental merging - doesn't replace existing knowledge
   */
  addSkill(skill) {
    if (!skill.pattern || !skill.action) {
      logger.warn({ skill }, "Invalid skill format, skipping");
      return false;
    }

    const key = this._normalizePattern(skill.pattern);
    const existing = this.skills.get(key);

    if (existing) {
      // Merge with existing skill
      existing.useCount++;
      existing.lastUsed = Date.now();

      // Update confidence (weighted average)
      const newConfidence = skill.confidence || 0.5;
      existing.confidence = (existing.confidence * 0.7) + (newConfidence * 0.3);

      // Update action if new one has higher confidence
      if (newConfidence > existing.confidence) {
        existing.action = skill.action;
        existing.reasoning = skill.reasoning || existing.reasoning;
      }

      logger.debug({
        agentType: this.agentType,
        pattern: skill.pattern,
        confidence: existing.confidence
      }, "Updated existing skill");
    } else {
      // Add new skill
      this.skills.set(key, {
        pattern: skill.pattern,
        action: skill.action,
        reasoning: skill.reasoning || "",
        tools: skill.tools || [],
        confidence: skill.confidence || 0.5,
        useCount: 1,
        createdAt: Date.now(),
        lastUsed: Date.now()
      });

      logger.info({
        agentType: this.agentType,
        pattern: skill.pattern,
        totalSkills: this.skills.size
      }, "Added new skill");
    }

    return true;
  }

  /**
   * Get top N skills for context injection
   * Sorted by: confidence * useCount * recency
   */
  getTopSkills(n = 5) {
    if (this.skills.size === 0) {
      return [];
    }

    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    return Array.from(this.skills.values())
      .map(skill => {
        // Recency factor (skills used recently are more valuable)
        const age = now - skill.lastUsed;
        const recencyFactor = Math.max(0.1, 1 - (age / maxAge));

        // Combined score
        const score = skill.confidence * skill.useCount * recencyFactor;

        return { ...skill, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map(skill => ({
        pattern: skill.pattern,
        action: skill.action,
        reasoning: skill.reasoning,
        confidence: skill.confidence
      }));
  }

  /**
   * Format skills for prompt injection
   */
  formatForPrompt(skills = null) {
    const topSkills = skills || this.getTopSkills(5);

    if (topSkills.length === 0) {
      return "";
    }

    const formatted = topSkills.map((skill, i) => {
      const confidenceBar = "█".repeat(Math.round(skill.confidence * 5));
      return `${i + 1}. ${skill.pattern}
   → ${skill.action}
   ${skill.reasoning ? `   Why: ${skill.reasoning}` : ''}
   Confidence: ${confidenceBar} ${Math.round(skill.confidence * 100)}%`;
    }).join("\n\n");

    return `
## Previously Learned Skills

You've successfully used these patterns before. Consider applying them:

${formatted}

Apply these learnings when relevant, but don't force them if the situation differs.
`;
  }

  /**
   * Record when a skill is used
   */
  recordUsage(pattern, successful = true) {
    const key = this._normalizePattern(pattern);
    const skill = this.skills.get(key);

    if (skill) {
      skill.useCount++;
      skill.lastUsed = Date.now();

      // Adjust confidence based on success
      if (successful) {
        skill.confidence = Math.min(1.0, skill.confidence + 0.05);
      } else {
        skill.confidence = Math.max(0.1, skill.confidence - 0.1);
      }

      logger.debug({
        agentType: this.agentType,
        pattern,
        successful,
        newConfidence: skill.confidence
      }, "Recorded skill usage");
    }
  }

  /**
   * Prune low-quality skills
   */
  prune(minConfidence = 0.2, minUseCount = 3) {
    let pruned = 0;

    for (const [key, skill] of this.skills.entries()) {
      // Remove skills that have been tried multiple times but remain low confidence
      if (skill.useCount >= minUseCount && skill.confidence < minConfidence) {
        this.skills.delete(key);
        pruned++;
      }
    }

    if (pruned > 0) {
      logger.info({
        agentType: this.agentType,
        pruned,
        remaining: this.skills.size
      }, "Pruned low-confidence skills");
    }

    return pruned;
  }

  /**
   * Get statistics
   */
  getStats() {
    const skills = Array.from(this.skills.values());

    return {
      agentType: this.agentType,
      totalSkills: skills.length,
      averageConfidence: skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length || 0,
      totalUses: skills.reduce((sum, s) => sum + s.useCount, 0),
      highConfidenceSkills: skills.filter(s => s.confidence >= 0.8).length
    };
  }

  /**
   * Save to disk (JSON format)
   */
  async save() {
    const filepath = this._getFilePath();

    try {
      // Ensure directory exists
      const dir = path.dirname(filepath);
      await fs.mkdir(dir, { recursive: true });

      const data = {
        agentType: this.agentType,
        skills: Array.from(this.skills.entries()),
        savedAt: Date.now(),
        version: "1.0"
      };

      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');

      logger.debug({
        agentType: this.agentType,
        filepath,
        skillCount: this.skills.size
      }, "Saved skillbook");

      return true;
    } catch (error) {
      logger.error({
        error: error.message,
        agentType: this.agentType,
        filepath
      }, "Failed to save skillbook");
      return false;
    }
  }

  /**
   * Load from disk
   */
  async load() {
    if (this.loaded) {
      return true; // Already loaded
    }

    const filepath = this._getFilePath();

    try {
      const content = await fs.readFile(filepath, 'utf8');
      const data = JSON.parse(content);

      if (data.agentType !== this.agentType) {
        throw new Error(`Agent type mismatch: expected ${this.agentType}, got ${data.agentType}`);
      }

      // Restore skills map
      this.skills = new Map(data.skills);
      this.loaded = true;

      logger.info({
        agentType: this.agentType,
        skillCount: this.skills.size,
        filepath
      }, "Loaded skillbook");

      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet - this is fine for new agents
        logger.debug({
          agentType: this.agentType,
          filepath
        }, "No existing skillbook found, starting fresh");
        this.loaded = true;
        return true;
      }

      logger.error({
        error: error.message,
        agentType: this.agentType,
        filepath
      }, "Failed to load skillbook");

      this.loaded = true; // Mark as loaded to prevent retries
      return false;
    }
  }

  /**
   * Clear all skills (use with caution)
   */
  clear() {
    this.skills.clear();
    logger.warn({
      agentType: this.agentType
    }, "Cleared skillbook");
  }

  /**
   * Get file path for this agent's skillbook
   */
  _getFilePath() {
    const dataDir = path.join(process.cwd(), 'data', 'skillbooks');
    return path.join(dataDir, `${this.agentType.toLowerCase()}.json`);
  }

  /**
   * Normalize pattern for consistent matching
   */
  _normalizePattern(pattern) {
    return pattern.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Static method: Load skillbook for agent type
   */
  static async load(agentType) {
    const skillbook = new Skillbook(agentType);
    await skillbook.load();
    return skillbook;
  }

  /**
   * Static method: Get or create skillbook
   */
  static async getOrCreate(agentType) {
    return Skillbook.load(agentType);
  }
}

module.exports = Skillbook;
