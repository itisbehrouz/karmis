/**
 * KARMİS V2 AI Adapter Interface
 * Provides unified access to deterministic offline local engine or optional cloud providers.
 */

const { LocalAiProvider } = require('./local');
const { OpenAiProvider } = require('./openai');
const { AnthropicAiProvider } = require('./anthropic');

function getAiProvider(preferredProvider = null) {
  let configuredInDb = null;
  try {
    const { getSetting } = require('../db');
    configuredInDb = getSetting('ai_provider');
  } catch {
    // db not ready
  }

  const chosen = preferredProvider || configuredInDb || process.env.KARMIS_AI_PROVIDER || (
    process.env.OPENAI_API_KEY ? 'openai' :
    process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'local'
  );

  switch (chosen.toLowerCase()) {
    case 'openai':
      return new OpenAiProvider();
    case 'anthropic':
      return new AnthropicAiProvider();
    case 'local':
    default:
      return new LocalAiProvider();
  }
}

module.exports = {
  getAiProvider,
  LocalAiProvider,
  OpenAiProvider,
  AnthropicAiProvider
};
