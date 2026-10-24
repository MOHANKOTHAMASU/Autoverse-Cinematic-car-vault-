// AutoVerse Stage 15: Admin Assistant Management & Tool Telemetry Console
// Allows authorized staff to inspect AI provider credentials, rate limits,
// and diagnostic audit logs of tool executions.

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Save,
  Key,
} from 'lucide-react';
import {
  getAssistantConfig,
  updateAssistantConfig,
  getAssistantMetrics,
} from '../../utils/assistantStore';
import type { AIProviderConfig, AssistantAdminMetrics } from '../../types/assistant';

export const AdminAssistantPage: React.FC = () => {
  const [config, setConfig] = useState<AIProviderConfig>(getAssistantConfig());
  const [metrics, setMetrics] = useState<AssistantAdminMetrics>(getAssistantMetrics());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getAssistantConfig());
      setMetrics(getAssistantMetrics());
    };
    window.addEventListener('autoverse_assistant_config_updated', handleUpdate);
    window.addEventListener('autoverse_assistant_metrics_updated', handleUpdate);
    return () => {
      window.removeEventListener('autoverse_assistant_config_updated', handleUpdate);
      window.removeEventListener('autoverse_assistant_metrics_updated', handleUpdate);
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssistantConfig(config);
    setToastMessage('AI Assistant settings & telemetry parameters updated successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '5rem',
            right: '2rem',
            zIndex: 10000,
            backgroundColor: '#090c12',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '0.85rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={16} color="var(--accent-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ADMINISTRATION CONSOLE
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '0.25rem 0' }}>
          AI Automotive Assistant & Tool Diagnostics
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
          Manage LLM provider abstractions, inspect sandboxed tool executions, and audit system performance metrics.
        </p>
      </div>

      {/* Metrics Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
            <Activity size={16} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Inquiries</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>{metrics.totalQueries}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Automotive conversational sessions</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.35rem' }}>
            <Zap size={16} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Tool Invocations</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
            {Object.values(metrics.toolExecutions).reduce((a, b) => a + b, 0)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Catalog queries, comparisons & TCO</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.35rem' }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Avg Latency</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{metrics.averageResponseTimeMs}ms</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deterministic sandboxed retrieval</span>
        </div>

        <div className="card-glass" style={{ padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '0.35rem' }}>
            <Shield size={16} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Failed Calls</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>{metrics.failedCalls}</div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0 security violations detected</span>
        </div>
      </div>

      {/* Two Column Layout: Configuration Form + Tool Execution Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: AI Configuration */}
        <div
          className="card-glass"
          style={{
            padding: '1.75rem',
            borderRadius: '14px',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Bot size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              AI Engine & Provider Settings
            </h2>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Active Provider Status Banner */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: config.isConfigured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${config.isConfigured ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
              }}
            >
              {config.isConfigured ? (
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
              ) : (
                <AlertTriangle size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: config.isConfigured ? '#10b981' : '#f59e0b' }}>
                  {config.isConfigured ? 'Live Provider Connected' : 'AutoVerse Neural Engine Active (Local Deterministic)'}
                </strong>
                <div>
                  {config.isConfigured
                    ? `Live streaming active via ${config.modelName}. Credentials securely masked.`
                    : 'To connect Google Gemini API, add VITE_GEMINI_API_KEY to your .env file. The engine currently executes deterministic tool retrieval from real vehicle records.'}
                </div>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Active Provider Architecture
              </label>
              <select
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(7, 9, 13, 0.8)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              >
                <option value="autoverse_neural">AutoVerse Neural Engine (Offline Deterministic v15)</option>
                <option value="gemini">Google Gemini 1.5 / 2.0 Flash</option>
                <option value="openai">OpenAI GPT-4o Mini Abstraction</option>
                <option value="anthropic">Anthropic Claude 3.5 Haiku Abstraction</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Model Identifier
              </label>
              <input
                type="text"
                value={config.modelName}
                onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(7, 9, 13, 0.8)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Masked API Key Display */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Server Credential (Masked)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Key size={14} color="var(--text-muted)" />
                <span>{config.apiKeyMasked || 'NO_REMOTE_KEY_CONFIGURED (LOCAL_NEURAL_MODE)'}</span>
              </div>
            </div>

            {/* Rate Limit Per Minute */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Rate Limit Threshold (Queries / Minute)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={config.rateLimitPerMinute}
                onChange={(e) => setConfig({ ...config, rateLimitPerMinute: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(7, 9, 13, 0.8)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Prompt Version */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Automotive System Prompt Revision
              </label>
              <input
                type="text"
                disabled
                value={config.systemPromptVersion}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--accent-cyan)',
                color: '#07090d',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Save size={15} />
              <span>Save AI Parameters</span>
            </button>
          </form>
        </div>

        {/* Right Column: Sandboxed Tool Breakdown & Execution Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tool Distribution */}
          <div className="card-glass" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
              Tool Execution Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Object.entries(metrics.toolExecutions).map(([toolName, count]) => (
                <div
                  key={toolName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={14} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      {toolName}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {count} calls
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Log */}
          <div className="card-glass" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-medium)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
              Recent Telemetry Logs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {metrics.recentToolLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(7, 9, 13, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {log.toolName}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.durationMs}ms</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
