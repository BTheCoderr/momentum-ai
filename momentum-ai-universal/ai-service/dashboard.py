import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta
import json
from typing import Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_SERVICE_KEY", "")
)

# Page config
st.set_page_config(
    page_title="Momentum AI Dashboard",
    page_icon="🚀",
    layout="wide"
)

# Title
st.title("🚀 Momentum AI Dashboard")

# Sidebar
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Overview", "Model Performance", "User Analytics", "System Health"])

# Date filter
st.sidebar.title("Filter")
days = st.sidebar.slider("Last N days", 1, 30, 7)
date_from = datetime.now() - timedelta(days=days)

async def get_model_metrics() -> Dict[str, Any]:
    """Get model performance metrics"""
    try:
        response = await supabase.table("ai_metrics").select("*").gte("created_at", date_from.isoformat()).execute()
        return response.data or []
    except Exception as e:
        st.error(f"Error fetching metrics: {str(e)}")
        return []

async def get_user_analytics() -> Dict[str, Any]:
    """Get user behavior analytics"""
    try:
        response = await supabase.table("behavior_data").select("*").gte("created_at", date_from.isoformat()).execute()
        return response.data or []
    except Exception as e:
        st.error(f"Error fetching analytics: {str(e)}")
        return []

if page == "Overview":
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Active Users", "156", "+12%")
    with col2:
        st.metric("AI Interactions", "1.2k", "+8%")
    with col3:
        st.metric("Avg Response Time", "0.8s", "-5%")
    with col4:
        st.metric("Success Rate", "94%", "+2%")
    
    # Activity timeline
    st.subheader("Activity Timeline")
    data = pd.DataFrame({
        "date": pd.date_range(date_from, periods=days),
        "interactions": np.random.randint(100, 1000, days)
    })
    fig = px.line(data, x="date", y="interactions", title="Daily Interactions")
    st.plotly_chart(fig, use_container_width=True)

elif page == "Model Performance":
    st.header("Model Performance Metrics")
    
    # Model selection
    model = st.selectbox(
        "Select Model",
        ["llama2-7b-chat", "mistral-7b", "gemma-7b", "qwen-7b"]
    )
    
    # Performance metrics
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Response Time Distribution")
        times = np.random.normal(0.8, 0.2, 1000)
        fig = px.histogram(times, title="Response Times (seconds)")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("Success Rate Over Time")
        data = pd.DataFrame({
            "date": pd.date_range(date_from, periods=days),
            "success_rate": np.random.uniform(0.9, 0.98, days)
        })
        fig = px.line(data, x="date", y="success_rate", title="Success Rate")
        st.plotly_chart(fig, use_container_width=True)

elif page == "User Analytics":
    st.header("User Behavior Analytics")
    
    # User engagement
    st.subheader("User Engagement")
    engagement_data = pd.DataFrame({
        "category": ["Daily Active", "Weekly Active", "Monthly Active"],
        "users": [156, 892, 2341]
    })
    fig = px.bar(engagement_data, x="category", y="users", title="User Activity")
    st.plotly_chart(fig, use_container_width=True)
    
    # Behavior patterns
    st.subheader("Behavior Patterns")
    col1, col2 = st.columns(2)
    
    with col1:
        pattern_data = pd.DataFrame({
            "pattern": ["Morning", "Afternoon", "Evening", "Night"],
            "activity": [35, 42, 15, 8]
        })
        fig = px.pie(pattern_data, values="activity", names="pattern", title="Activity Distribution")
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        mood_data = pd.DataFrame({
            "date": pd.date_range(date_from, periods=days),
            "mood": np.random.uniform(3.5, 4.5, days)
        })
        fig = px.line(mood_data, x="date", y="mood", title="Average Mood Score")
        st.plotly_chart(fig, use_container_width=True)

else:  # System Health
    st.header("System Health Monitor")
    
    # System metrics
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("CPU Usage", "42%", "-5%")
        st.metric("Memory Usage", "3.2GB", "+0.1GB")
    
    with col2:
        st.metric("API Latency", "120ms", "-10ms")
        st.metric("Error Rate", "0.02%", "-0.01%")
    
    with col3:
        st.metric("Storage Used", "156GB", "+2GB")
        st.metric("Cache Hit Rate", "94%", "+1%")
    
    # Error log
    st.subheader("Recent Error Log")
    st.code("""
    2024-03-15 10:23:15 WARNING Rate limit reached for user_id=123
    2024-03-15 09:15:22 ERROR Failed to connect to Redis
    2024-03-15 08:45:11 WARNING High latency detected in vector search
    """)

# Footer
st.markdown("---")
st.markdown("Made with ❤️ by Momentum AI Team") 