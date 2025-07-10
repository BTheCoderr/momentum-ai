import { supabase } from './supabase';

// Embeddings Service for semantic search and pattern recognition
export class EmbeddingsService {
  private readonly EMBEDDING_MODEL = 'nomic-embed-text';
  private readonly EMBEDDING_DIMENSION = 384;
  private readonly ollamaURL = process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

  // Generate embedding for text
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.ollamaURL}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback to simple hash-based embedding for development
      return this.generateSimpleEmbedding(text);
    }
  }

  // Fallback embedding generation using simple hashing
  private generateSimpleEmbedding(text: string): number[] {
    const embedding = new Array(this.EMBEDDING_DIMENSION).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % this.EMBEDDING_DIMENSION;
      embedding[position] += 1.0 / Math.sqrt(words.length);
    });

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Store user behavior with embedding
  async storeUserBehavior(
    userId: string,
    behaviorType: 'goal_update' | 'check_in' | 'chat_message' | 'pattern',
    content: string,
    metadata: any = {}
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);
      
      await supabase.from('user_behavior_embeddings').insert({
        user_id: userId,
        behavior_type: behaviorType,
        content,
        embedding,
        metadata,
      });
    } catch (error) {
      console.error('Error storing user behavior:', error);
    }
  }

  // Generate and store coaching knowledge embeddings
  async generateCoachingKnowledgeEmbeddings(): Promise<void> {
    try {
      const { data: knowledge, error } = await supabase
        .from('coaching_knowledge_base')
        .select('id, content')
        .is('embedding', null);

      if (error) throw error;

      for (const item of knowledge || []) {
        const embedding = await this.generateEmbedding(item.content);
        
        await supabase
          .from('coaching_knowledge_base')
          .update({ embedding })
          .eq('id', item.id);
      }

      console.log(`Generated embeddings for ${knowledge?.length || 0} coaching knowledge items`);
    } catch (error) {
      console.error('Error generating coaching knowledge embeddings:', error);
    }
  }

  // Semantic search for coaching knowledge
  async searchCoachingKnowledge(
    query: string,
    threshold: number = 0.78,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('semantic_search_coaching_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching coaching knowledge:', error);
      return [];
    }
  }

  // Find similar user behaviors
  async findSimilarBehaviors(
    userId: string,
    query: string,
    threshold: number = 0.75,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('find_similar_behaviors', {
        user_id: userId,
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding similar behaviors:', error);
      return [];
    }
  }

  // Store pattern insights with embeddings
  async storePatternInsight(
    userId: string,
    patternType: 'peak_performance' | 'struggle_points' | 'motivation_triggers',
    title: string,
    description: string,
    confidence: number,
    supportingData: any = {},
    suggestedActions: string[] = []
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(description);
      
      await supabase.from('user_pattern_insights').insert({
        user_id: userId,
        pattern_type: patternType,
        insight_title: title,
        insight_description: description,
        confidence_score: confidence,
        supporting_data: supportingData,
        embedding,
        is_actionable: suggestedActions.length > 0,
        suggested_actions: suggestedActions,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    } catch (error) {
      console.error('Error storing pattern insight:', error);
    }
  }

  // Enhanced pattern recognition using embeddings
  async analyzeUserPatterns(userId: string): Promise<any> {
    try {
      // Get recent user behaviors
      const { data: behaviors, error } = await supabase
        .from('user_behavior_embeddings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const insights = await this.generatePatternInsights(userId, behaviors || []);
      return insights;
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return { insights: [], predictions: {} };
    }
  }

  private async generatePatternInsights(userId: string, behaviors: any[]): Promise<any> {
    const insights = [];
    
    if (behaviors.length === 0) {
      return { insights, predictions: {} };
    }

    // 1. Analyze behavior clustering
    const behaviorClusters = this.clusterBehaviors(behaviors);
    
    // 2. Identify peak performance patterns
    const peakPerformanceInsight = this.identifyPeakPerformance(behaviors);
    if (peakPerformanceInsight) {
      insights.push(peakPerformanceInsight);
      await this.storePatternInsight(
        userId,
        'peak_performance',
        peakPerformanceInsight.title,
        peakPerformanceInsight.description,
        peakPerformanceInsight.confidence,
        peakPerformanceInsight.supportingData,
        peakPerformanceInsight.suggestedActions
      );
    }

    // 3. Identify struggle points
    const struggleInsight = this.identifyStrugglePoints(behaviors);
    if (struggleInsight) {
      insights.push(struggleInsight);
      await this.storePatternInsight(
        userId,
        'struggle_points',
        struggleInsight.title,
        struggleInsight.description,
        struggleInsight.confidence,
        struggleInsight.supportingData,
        struggleInsight.suggestedActions
      );
    }

    // 4. Identify motivation triggers
    const motivationInsight = this.identifyMotivationTriggers(behaviors);
    if (motivationInsight) {
      insights.push(motivationInsight);
      await this.storePatternInsight(
        userId,
        'motivation_triggers',
        motivationInsight.title,
        motivationInsight.description,
        motivationInsight.confidence,
        motivationInsight.supportingData,
        motivationInsight.suggestedActions
      );
    }

    // 5. Generate predictions
    const predictions = this.generatePredictions(behaviors);

    return { insights, predictions };
  }

  private clusterBehaviors(behaviors: any[]): any {
    // Simple clustering based on behavior type and time
    const clusters = {
      morning: behaviors.filter(b => {
        const hour = new Date(b.created_at).getHours();
        return hour >= 6 && hour < 12;
      }),
      afternoon: behaviors.filter(b => {
        const hour = new Date(b.created_at).getHours();
        return hour >= 12 && hour < 18;
      }),
      evening: behaviors.filter(b => {
        const hour = new Date(b.created_at).getHours();
        return hour >= 18 || hour < 6;
      }),
    };

    return clusters;
  }

  private identifyPeakPerformance(behaviors: any[]): any | null {
    const successfulBehaviors = behaviors.filter(b => 
      b.behavior_type === 'goal_update' && 
      b.metadata?.success === true
    );

    if (successfulBehaviors.length < 5) return null;

    const hourCounts = {};
    successfulBehaviors.forEach(b => {
      const hour = new Date(b.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );

    const peakCount = hourCounts[peakHour];
    const confidence = Math.min(peakCount / successfulBehaviors.length, 0.95);

    if (confidence < 0.3) return null;

    return {
      type: 'peak_performance',
      title: 'Peak Performance Window Identified',
      description: `Your data shows highest success rates around ${peakHour}:00. You've completed ${peakCount} successful actions during this time.`,
      confidence,
      supportingData: {
        peak_hour: peakHour,
        success_count: peakCount,
        total_behaviors: successfulBehaviors.length
      },
      suggestedActions: [
        `Schedule your most important goals for ${peakHour}:00`,
        'Block this time in your calendar as "Peak Performance"',
        'Use this window for challenging tasks and goal planning'
      ]
    };
  }

  private identifyStrugglePoints(behaviors: any[]): any | null {
    const strugglingBehaviors = behaviors.filter(b => 
      b.behavior_type === 'chat_message' && 
      (b.content.toLowerCase().includes('struggling') || 
       b.content.toLowerCase().includes('difficult') ||
       b.content.toLowerCase().includes('hard'))
    );

    if (strugglingBehaviors.length < 3) return null;

    const commonWords = this.extractCommonWords(strugglingBehaviors.map(b => b.content));
    const confidence = Math.min(strugglingBehaviors.length / behaviors.length * 2, 0.9);

    return {
      type: 'struggle_points',
      title: 'Struggle Pattern Detected',
      description: `You've mentioned struggling with similar challenges ${strugglingBehaviors.length} times. Common themes: ${commonWords.join(', ')}.`,
      confidence,
      supportingData: {
        struggle_count: strugglingBehaviors.length,
        common_themes: commonWords,
        recent_struggles: strugglingBehaviors.slice(0, 3)
      },
      suggestedActions: [
        'Break down challenging goals into smaller steps',
        'Identify the root cause of these struggles',
        'Consider seeking support or resources for these areas'
      ]
    };
  }

  private identifyMotivationTriggers(behaviors: any[]): any | null {
    const positiveBehaviors = behaviors.filter(b => 
      b.behavior_type === 'chat_message' && 
      (b.content.toLowerCase().includes('motivated') || 
       b.content.toLowerCase().includes('excited') ||
       b.content.toLowerCase().includes('confident'))
    );

    if (positiveBehaviors.length < 3) return null;

    const triggers = this.extractCommonWords(positiveBehaviors.map(b => b.content));
    const confidence = Math.min(positiveBehaviors.length / behaviors.length * 2, 0.85);

    return {
      type: 'motivation_triggers',
      title: 'Motivation Triggers Identified',
      description: `You feel most motivated when discussing: ${triggers.join(', ')}. Use these as motivational anchors.`,
      confidence,
      supportingData: {
        trigger_words: triggers,
        positive_mentions: positiveBehaviors.length,
        contexts: positiveBehaviors.slice(0, 3)
      },
      suggestedActions: [
        'Reference these motivational themes in your goal setting',
        'Create visual reminders of these motivating factors',
        'Use these triggers when you need a motivation boost'
      ]
    };
  }

  private extractCommonWords(texts: string[]): string[] {
    const wordCounts = {};
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves']);

    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private generatePredictions(behaviors: any[]): any {
    const recentBehaviors = behaviors.slice(0, 20);
    const positiveCount = recentBehaviors.filter(b => 
      b.behavior_type === 'goal_update' && b.metadata?.success === true
    ).length;

    const successRate = positiveCount / Math.max(recentBehaviors.length, 1);
    
    return {
      goal_success_probability: Math.min(successRate * 1.2, 0.95),
      risk_factors: successRate < 0.3 ? ['low_recent_success', 'needs_intervention'] : [],
      recommended_interventions: successRate < 0.5 ? [
        'Schedule a coaching session',
        'Reduce goal complexity',
        'Increase check-in frequency'
      ] : [
        'Maintain current momentum',
        'Consider adding stretch goals'
      ]
    };
  }

  // Store AI conversation with embeddings
  async storeAIConversation(
    userId: string,
    userMessage: string,
    aiResponse: string,
    coachId: string,
    userContext: any,
    sentimentScore?: number
  ): Promise<void> {
    try {
      const messageEmbedding = await this.generateEmbedding(userMessage);
      const responseEmbedding = await this.generateEmbedding(aiResponse);

      await supabase.from('ai_conversations').insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        coach_id: coachId,
        user_context: userContext,
        message_embedding: messageEmbedding,
        response_embedding: responseEmbedding,
        sentiment_score: sentimentScore,
      });
    } catch (error) {
      console.error('Error storing AI conversation:', error);
    }
  }
}

// Export singleton instance
export const embeddingsService = new EmbeddingsService(); 