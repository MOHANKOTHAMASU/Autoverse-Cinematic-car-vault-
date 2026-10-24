// AutoVerse Stage 15: Smart AI Automotive Assistant Full Page
// Features interactive conversational interface, tool call visualizers,
// verified source cards, vehicle recommendation carousels, and persistent histories.

import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getUserThreads,
  getThreadById,
  createNewThread,
  saveMessageToThread,
  deleteThread,
  getAssistantConfig,
} from '../utils/assistantStore';
import { executeAutoVerseAI } from '../utils/aiProvider';
import type { ChatMessage, ConversationThread, AIProviderConfig } from '../types/assistant';

const SUGGESTED_QUESTIONS = [
  'Find the best electric car for my budget.',
  'Compare the Porsche Taycan Turbo S with another EV.',
  'Which car suits daily commuting and family travel?',
  'Explain the difference between horsepower and torque.',
  'Estimate the five-year cost of owning an electric car.',
  'Help me choose between petrol, hybrid, and electric.',
  'Explain the safety ratings of a vehicle.',
  'Recommend cars based on my requirements.',
];

export const AssistantPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [config] = useState<AIProviderConfig>(getAssistantConfig());
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load user threads
  const loadThreads = () => {
    const userThreads = getUserThreads(currentUser?.id);
    setThreads(userThreads);

    if (userThreads.length > 0 && !activeThreadId) {
      setActiveThreadId(userThreads[0].id);
    } else if (userThreads.length === 0) {
      const newT = createNewThread('New Automotive Inquiry', currentUser?.id);
      setActiveThreadId(newT.id);
      setThreads([newT]);
    }
  };

  useEffect(() => {
    loadThreads();
    const handleUpdate = () => loadThreads();
    window.addEventListener('autoverse_assistant_threads_updated', handleUpdate);
    return () => window.removeEventListener('autoverse_assistant_threads_updated', handleUpdate);
  }, [currentUser?.id]);

  // Handle URL query parameters (e.g., from CarFinder or VehicleDetailPage quick triggers)
  useEffect(() => {
    const initialPrompt = searchParams.get('q');
    if (initialPrompt && !isProcessing) {
      setInputQuery(initialPrompt);
      // Automatically send if on new thread
      const currentThread = getThreadById(activeThreadId, currentUser?.id);
      if (currentThread && currentThread.messages.length === 0) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [searchParams, activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, streamingContent, isProcessing]);

  const activeThread = getThreadById(activeThreadId, currentUser?.id) || threads[0];

  const handleCreateNewChat = () => {
    const newT = createNewThread('New Automotive Inquiry', currentUser?.id);
    setActiveThreadId(newT.id);
    setInputQuery('');
    setMobileSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteThread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation history?')) {
      deleteThread(id, currentUser?.id);
      const remaining = getUserThreads(currentUser?.id).filter((t) => t.id !== id);
      if (remaining.length > 0) {
        setActiveThreadId(remaining[0].id);
      } else {
        const fresh = createNewThread('New Automotive Inquiry', currentUser?.id);
        setActiveThreadId(fresh.id);
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);
    setStreamingContent('');

    // 1. Append User Message
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    saveMessageToThread(activeThreadId, userMsg, currentUser?.id);

    try {
      // 2. Execute AI with streaming chunk hook
      const result = await executeAutoVerseAI(query, (chunk) => {
        setStreamingContent(chunk);
      });

      // 3. Append Assistant Message
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toISOString(),
        toolCalls: result.toolCalls,
        sources: result.sources,
        recommendedVehicles: result.recommendedVehicles,
        suggestedFollowUps: result.suggestedFollowUps,
      };

      saveMessageToThread(activeThreadId, assistantMsg, currentUser?.id);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `I encountered an unexpected issue while processing your automotive request: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toISOString(),
        error: err.message,
      };
      saveMessageToThread(activeThreadId, errorMsg, currentUser?.id);
    } finally {
      setIsProcessing(false);
      setStreamingContent('');
    }
  };

  return (
    <div
      style={{
        paddingTop: 'var(--header-height)',
        height: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* 1. SIDEBAR: CONVERSATION HISTORY */}
      <aside
        style={{
          width: '320px',
          backgroundColor: 'rgba(7, 9, 13, 0.95)',
          borderRight: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'transform 0.3s ease',
        }}
        className={mobileSidebarOpen ? 'assistant-sidebar open' : 'assistant-sidebar'}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} color="var(--accent-cyan)" />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                AutoVerse AI
              </span>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 700,
              }}
            >
              v15.0 NEURAL
            </span>
          </div>

          <button
            onClick={handleCreateNewChat}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--accent-cyan)',
              color: '#07090d',
              fontWeight: 700,
            }}
          >
            <Plus size={16} />
            <span>New Automotive Inquiry</span>
          </button>
        </div>

        {/* Threads List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem', paddingLeft: '0.5rem' }}>
            Inquiry History
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {threads.map((t) => {
              const isActive = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    setMobileSidebarOpen(false);
                  }}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                    <MessageSquare size={14} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {t.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteThread(e, t.id)}
                    title="Delete thread"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      opacity: isActive ? 1 : 0.4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(4, 6, 8, 0.5)',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={14} color="var(--accent-cyan)" />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Privacy Protected</span>
          </div>
          <div>All queries verified against official catalog & NCAP test benchmarks.</div>
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {/* Chat Header Bar */}
        <div
          style={{
            padding: '0.85rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(10, 14, 22, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="btn btn-secondary mobile-sidebar-toggle"
              style={{ padding: '0.4rem 0.65rem', display: 'none' }}
            >
              <Layers size={15} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {activeThread?.title || 'AutoVerse Automotive Assistant'}
                </h2>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: config.isConfigured ? 'rgba(0, 240, 255, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: config.isConfigured ? 'var(--accent-cyan)' : '#f59e0b',
                    border: `1px solid ${config.isConfigured ? 'rgba(0, 240, 255, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    fontWeight: 600,
                  }}
                >
                  {config.modelName}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Powered by 50+ Verified Catalog Models • Deterministic TCO Math • Euro / Bharat NCAP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/compare"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <SlidersHorizontal size={13} />
              <span>Compare Tool</span>
            </Link>
            <Link
              to="/ownership-calculator"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <DollarSign size={13} />
              <span>TCO Calc</span>
            </Link>
          </div>
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Welcome Card if Empty */}
          {(!activeThread || activeThread.messages.length === 0) && (
            <div style={{ maxWidth: '850px', margin: '2rem auto', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
                }}
              >
                <Sparkles size={32} color="var(--accent-cyan)" />
              </div>

              <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 0.8rem 0' }}>
                Ask AutoVerse AI Anything Automotive
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
                Real-world specs, head-to-head comparisons, transparent 5-year running cost calculations, and crash safety dossiers retrieved straight from our verified catalog.
              </p>

              {/* Suggested Questions Grid */}
              <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Suggested Inquiries
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      style={{
                        padding: '0.85rem 1.15rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                      }}
                    >
                      <span>{q}</span>
                      <ChevronRight size={15} color="var(--accent-cyan)" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          {activeThread?.messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '1rem',
                maxWidth: '920px',
                width: '100%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar Icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: msg.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 240, 255, 0.15)',
                  border: msg.role === 'user' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 240, 255, 0.35)',
                }}
              >
                {msg.role === 'user' ? <User size={18} color="#ffffff" /> : <Bot size={18} color="var(--accent-cyan)" />}
              </div>

              {/* Content Bubble */}
              <div
                style={{
                  flex: 1,
                  maxWidth: '820px',
                  backgroundColor: msg.role === 'user' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(12, 17, 26, 0.85)',
                  border: msg.role === 'user' ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid var(--border-medium)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                }}
              >
                {/* Tool Executions Pills */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                    {msg.toolCalls.map((tc) => (
                      <span
                        key={tc.id}
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(0, 240, 255, 0.08)',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                          color: 'var(--accent-cyan)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Zap size={12} />
                        <span>tool::{tc.name} ({tc.durationMs}ms)</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Main Content Markdown */}
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {msg.content}
                </div>

                {/* Recommended Vehicle Cards Carousel */}
                {msg.recommendedVehicles && msg.recommendedVehicles.length > 0 && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>
                      Recommended Verified Matches
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                      {msg.recommendedVehicles.map((rec) => (
                        <div
                          key={rec.slug}
                          style={{
                            backgroundColor: 'rgba(7, 9, 13, 0.9)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '10px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                              {rec.brand}
                            </span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.15rem 0 0.4rem 0' }}>
                              {rec.model} {rec.variant}
                            </h4>
                            <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, marginBottom: '0.4rem' }}>
                              {rec.currency} {rec.price.toLocaleString()} • {rec.horsepower} HP
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                              {rec.primaryReason}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <Link
                              to={`/cars/${rec.slug}`}
                              className="btn btn-secondary"
                              style={{ flex: 1, fontSize: '0.74rem', padding: '0.4rem', textAlign: 'center' }}
                            >
                              View Specs
                            </Link>
                            <Link
                              to={`/compare?cars=${rec.slug}`}
                              className="btn btn-primary"
                              style={{ flex: 1, fontSize: '0.74rem', padding: '0.4rem', textAlign: 'center', backgroundColor: 'var(--accent-cyan)', color: '#000' }}
                            >
                              Compare
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                      Verified Sources & References
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {msg.sources.map((s) => (
                        <Link
                          key={s.id}
                          to={s.url}
                          style={{
                            fontSize: '0.74rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent-cyan)';
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          <ExternalLink size={11} />
                          <span>{s.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar (Copy, Timestamp) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check size={13} color="#10b981" />
                          <span style={{ color: '#10b981' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Suggested Follow-Ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {msg.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSendMessage(fu)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(0, 240, 255, 0.04)',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          color: 'var(--accent-cyan)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.12)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.04)')}
                      >
                        <span>{fu}</span>
                        <ArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming Assistant In-Flight Bubble */}
          {isProcessing && streamingContent && (
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '820px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                }}
              >
                <Bot size={18} color="var(--accent-cyan)" />
              </div>
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(12, 17, 26, 0.85)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {streamingContent}
                <span className="cursor-blink" style={{ display: 'inline-block', width: '6px', height: '14px', backgroundColor: 'var(--accent-cyan)', marginLeft: '4px' }} />
              </div>
            </div>
          )}

          {/* Thinking / Tool Invocation Skeleton */}
          {isProcessing && !streamingContent && (
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '820px', alignItems: 'center' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                <Sparkles size={18} color="var(--accent-cyan)" className="spin-slow" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                <span className="pulse-dot" />
                <span>Executing automotive database tools & synthesizing engineering specs...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid var(--border-medium)',
            backgroundColor: 'rgba(10, 14, 22, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ maxWidth: '920px', margin: '0 auto' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'rgba(7, 9, 13, 0.9)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '0.45rem 0.65rem 0.45rem 1.25rem',
                transition: 'border-color 0.2s ease',
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about vehicle specs, 5-year running costs, comparisons, or safety ratings..."
                disabled={isProcessing}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                }}
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="btn btn-primary"
                style={{
                  padding: '0.6rem 1rem',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: inputQuery.trim() && !isProcessing ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: inputQuery.trim() && !isProcessing ? '#07090d' : 'var(--text-muted)',
                  cursor: inputQuery.trim() && !isProcessing ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>AutoVerse AI may reference verified catalog data, NCAP reports, and TCO regional tax rates.</span>
              <span>Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>Enter</kbd> to dispatch</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
