"""
AI Session Intelligence System
- Session log management
- Behavioral tag extraction
- Trend analysis
- Parent report generation
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import logging
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

EMERGENT_API_KEY = "sk-emergent-5A47c973eA392266a9"

def set_database(database):
    global db
    db = database

def verify_observer_token(token: str):
    from observer_routes import verify_observer_token as verify
    return verify(token)

# ==================== SESSION LOG MANAGEMENT ====================

@router.post("/observer/session-log")
async def create_session_log(
    child_id: str,
    session_date: str,
    duration_minutes: int,
    session_notes: str,
    token: str,
    mood_observed: Optional[str] = "neutral",
    energy_level: Optional[str] = "medium",
    engagement_level: Optional[str] = "moderate",
    topics_discussed: Optional[str] = "",
    concerns_noted: Optional[str] = "",
    positive_observations: Optional[str] = ""
):
    """Create a detailed session log for AI analysis"""
    try:
        user = verify_observer_token(token)
        observer_id = user['id']
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": observer_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        session_log = {
            "id": f"session-{uuid.uuid4().hex[:12]}",
            "child_id": child_id,
            "observer_id": observer_id,
            "session_date": session_date,
            "duration_minutes": duration_minutes,
            "session_notes": session_notes,
            "mood_observed": mood_observed,
            "energy_level": energy_level,
            "engagement_level": engagement_level,
            "topics_discussed": topics_discussed,
            "concerns_noted": concerns_noted,
            "positive_observations": positive_observations,
            "behavioral_tags": [],  # Will be filled by AI
            "ai_processed": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.session_logs.insert_one(session_log)
        
        # Trigger AI analysis in background
        try:
            await analyze_session_log(session_log["id"], token)
        except Exception as e:
            logger.warning(f"AI analysis deferred: {str(e)}")
        
        return {
            "success": True,
            "session_log": {
                "id": session_log["id"],
                "session_date": session_date,
                "mood_observed": mood_observed
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating session log: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create session log")

@router.get("/observer/session-logs/{child_id}")
async def get_session_logs(child_id: str, token: str, limit: int = 30):
    """Get session logs for a child"""
    try:
        user = verify_observer_token(token)
        
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        logs = await db.session_logs.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("session_date", -1).to_list(limit)
        
        return {"session_logs": logs, "child": child}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch session logs")

# ==================== AI BEHAVIORAL TAG EXTRACTION ====================

@router.post("/observer/analyze-session/{session_id}")
async def analyze_session_log(session_id: str, token: str):
    """AI analysis of a session log to extract behavioral tags"""
    try:
        user = verify_observer_token(token)
        
        session_log = await db.session_logs.find_one({
            "id": session_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not session_log:
            raise HTTPException(status_code=404, detail="Session log not found")
        
        # Get child info
        child = await db.children.find_one({"id": session_log['child_id']}, {"_id": 0})
        
        # Create prompt for behavioral tag extraction
        prompt = f"""Analyze this session log and extract behavioral tags, patterns, and insights.

**Child:** {child['name']}, Age {child['age']}, {child['grade']}
**Session Date:** {session_log['session_date']}
**Duration:** {session_log['duration_minutes']} minutes
**Mood Observed:** {session_log['mood_observed']}
**Energy Level:** {session_log['energy_level']}
**Engagement:** {session_log['engagement_level']}

**Session Notes:**
{session_log['session_notes']}

**Topics Discussed:**
{session_log.get('topics_discussed', 'Not specified')}

**Positive Observations:**
{session_log.get('positive_observations', 'Not specified')}

**Concerns Noted:**
{session_log.get('concerns_noted', 'Not specified')}

Please provide:
1. **Behavioral Tags** (list 3-7 tags like: "shows_empathy", "anxiety_indicators", "social_confidence", "creative_expression", "emotional_regulation", "peer_relationships", "family_attachment", "academic_stress", "self_esteem_building", "communication_growth")
2. **Emotional State Summary** (1-2 sentences)
3. **Key Patterns Noticed** (2-3 bullet points)
4. **Recommended Focus Areas** (1-2 suggestions for next session)

Format your response as JSON:
{{
  "behavioral_tags": ["tag1", "tag2", ...],
  "emotional_summary": "...",
  "patterns": ["pattern1", "pattern2", ...],
  "focus_areas": ["area1", "area2"]
}}"""

        chat = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert child psychologist analyzing session logs. Extract behavioral tags and patterns. Always respond in valid JSON format."
        ).with_model("openai", "gpt-4o-mini")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse AI response
        import json
        try:
            # Try to extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                analysis = json.loads(response[json_start:json_end])
            else:
                analysis = {
                    "behavioral_tags": ["session_completed"],
                    "emotional_summary": "Session recorded successfully",
                    "patterns": [],
                    "focus_areas": []
                }
        except json.JSONDecodeError:
            analysis = {
                "behavioral_tags": ["session_completed"],
                "emotional_summary": response[:200],
                "patterns": [],
                "focus_areas": []
            }
        
        # Update session log with AI analysis
        await db.session_logs.update_one(
            {"id": session_id},
            {"$set": {
                "behavioral_tags": analysis.get("behavioral_tags", []),
                "ai_analysis": analysis,
                "ai_processed": True,
                "ai_processed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update child's behavioral profile
        await update_child_behavioral_profile(session_log['child_id'], analysis.get("behavioral_tags", []))
        
        return {
            "success": True,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze session")

async def update_child_behavioral_profile(child_id: str, new_tags: List[str]):
    """Update child's aggregated behavioral profile"""
    try:
        profile = await db.behavioral_profiles.find_one({"child_id": child_id})
        
        if not profile:
            profile = {
                "child_id": child_id,
                "tag_frequency": {},
                "recent_tags": [],
                "trend_data": [],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        
        # Update tag frequency
        tag_freq = profile.get("tag_frequency", {})
        for tag in new_tags:
            tag_freq[tag] = tag_freq.get(tag, 0) + 1
        
        # Keep recent tags (last 50)
        recent_tags = profile.get("recent_tags", [])
        for tag in new_tags:
            recent_tags.insert(0, {
                "tag": tag,
                "date": datetime.now(timezone.utc).isoformat()
            })
        recent_tags = recent_tags[:50]
        
        # Update profile
        await db.behavioral_profiles.update_one(
            {"child_id": child_id},
            {"$set": {
                "tag_frequency": tag_freq,
                "recent_tags": recent_tags,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    except Exception as e:
        logger.error(f"Error updating behavioral profile: {str(e)}")

# ==================== TREND ANALYSIS ====================

@router.get("/observer/trends/{child_id}")
async def get_behavioral_trends(child_id: str, token: str, days: int = 30):
    """Get behavioral trends and patterns for a child"""
    try:
        user = verify_observer_token(token)
        
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        # Get session logs for period
        session_logs = await db.session_logs.find(
            {"child_id": child_id, "session_date": {"$gte": cutoff_date[:10]}},
            {"_id": 0}
        ).sort("session_date", 1).to_list(100)
        
        # Get behavioral profile
        profile = await db.behavioral_profiles.find_one({"child_id": child_id}, {"_id": 0})
        
        # Analyze trends
        mood_trend = []
        energy_trend = []
        engagement_trend = []
        all_tags = []
        
        for log in session_logs:
            date = log.get('session_date', '')
            mood_trend.append({"date": date, "value": log.get('mood_observed', 'neutral')})
            energy_trend.append({"date": date, "value": log.get('energy_level', 'medium')})
            engagement_trend.append({"date": date, "value": log.get('engagement_level', 'moderate')})
            all_tags.extend(log.get('behavioral_tags', []))
        
        # Calculate tag frequency for period
        tag_frequency = {}
        for tag in all_tags:
            tag_frequency[tag] = tag_frequency.get(tag, 0) + 1
        
        # Sort tags by frequency
        top_tags = sorted(tag_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Mood distribution
        mood_distribution = {}
        for item in mood_trend:
            mood = item['value']
            mood_distribution[mood] = mood_distribution.get(mood, 0) + 1
        
        return {
            "child": child,
            "period_days": days,
            "total_sessions": len(session_logs),
            "trends": {
                "mood": mood_trend,
                "energy": energy_trend,
                "engagement": engagement_trend
            },
            "mood_distribution": mood_distribution,
            "top_behavioral_tags": [{"tag": t[0], "count": t[1]} for t in top_tags],
            "behavioral_profile": profile
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch trends")

# ==================== PARENT REPORT GENERATION ====================

@router.post("/observer/generate-parent-report/{child_id}")
async def generate_parent_report(
    child_id: str, 
    token: str, 
    report_type: str = "weekly",  # daily, weekly, fortnightly, monthly, custom
    days: int = 7
):
    """Generate AI report for parents based on session logs
    
    Report Types:
    - daily: Last 1 day
    - weekly: Last 7 days
    - fortnightly: Last 14 days
    - monthly: Last 30 days
    - custom: Specify days parameter
    """
    # Map report types to days
    report_days_map = {
        "daily": 1,
        "weekly": 7,
        "fortnightly": 14,
        "monthly": 30
    }
    
    # Get actual days based on report type
    actual_days = report_days_map.get(report_type, days) if report_type != "custom" else days
    
    # Report type labels for display
    report_type_labels = {
        "daily": "Daily Report",
        "weekly": "Weekly Report", 
        "fortnightly": "Fortnightly Report",
        "monthly": "Monthly Report",
        "custom": f"Custom Report ({actual_days} days)"
    }
    report_label = report_type_labels.get(report_type, f"{actual_days}-Day Report")
    
    try:
        user = verify_observer_token(token)
        observer_id = user['id']
        
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": observer_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=actual_days)).isoformat()
        
        # Gather all data
        session_logs = await db.session_logs.find(
            {"child_id": child_id, "session_date": {"$gte": cutoff_date[:10]}},
            {"_id": 0}
        ).sort("session_date", -1).to_list(100)
        
        mood_entries = await db.mood_entries.find(
            {"child_id": child_id, "created_at": {"$gte": cutoff_date}},
            {"_id": 0}
        ).to_list(100)
        
        goals = await db.goals.find(
            {"child_id": child_id},
            {"_id": 0}
        ).to_list(50)
        
        profile = await db.behavioral_profiles.find_one({"child_id": child_id}, {"_id": 0})
        
        # Compile behavioral tags
        all_tags = []
        session_summaries = []
        for log in session_logs:
            all_tags.extend(log.get('behavioral_tags', []))
            session_summaries.append(f"- {log['session_date']}: {log.get('mood_observed', 'neutral')} mood, {log.get('engagement_level', 'moderate')} engagement. Notes: {log.get('session_notes', '')[:150]}")
        
        tag_freq = {}
        for tag in all_tags:
            tag_freq[tag] = tag_freq.get(tag, 0) + 1
        top_tags = sorted(tag_freq.items(), key=lambda x: x[1], reverse=True)[:8]
        
        # Mood analysis
        mood_counts = {}
        for log in session_logs:
            m = log.get('mood_observed', 'neutral')
            mood_counts[m] = mood_counts.get(m, 0) + 1
        
        # Goals summary
        active_goals = [g for g in goals if g.get('status') == 'active']
        completed_goals = [g for g in goals if g.get('status') == 'completed']
        
        # Create context-aware prompt based on report type
        report_context = {
            "daily": "Focus on today's session highlights and immediate observations. Keep it brief and actionable.",
            "weekly": "Summarize the week's patterns and provide a balanced view of progress and areas for attention.",
            "fortnightly": "Analyze two weeks of observations to identify emerging trends and consistent patterns.",
            "monthly": "Provide comprehensive analysis of the month's journey with detailed trend insights.",
            "custom": f"Analyze the past {actual_days} days of observations."
        }
        
        prompt = f"""Generate a {report_label} for {child['name']}.

**REPORT TYPE:** {report_label}
**CONTEXT:** {report_context.get(report_type, report_context['custom'])}

**CHILD PROFILE:**
- Name: {child['name']}
- Age: {child['age']} years old
- Grade: {child['grade']}
- School: {child.get('school', 'Not specified')}

**ANALYSIS PERIOD:** Last {actual_days} day(s)

**SESSION STATISTICS:**
- Total Sessions: {len(session_logs)}
- Mood Distribution: {', '.join([f"{k}: {v}" for k, v in mood_counts.items()]) if mood_counts else 'No data'}

**TOP BEHAVIORAL PATTERNS OBSERVED:**
{chr(10).join([f"- {tag}: observed {count} times" for tag, count in top_tags]) if top_tags else '- No patterns identified yet'}

**SESSION HIGHLIGHTS:**
{chr(10).join(session_summaries[:8]) if session_summaries else '- No sessions recorded in this period'}

**GOALS STATUS:**
- Active Goals: {len(active_goals)}
- Completed Goals: {len(completed_goals)}
- Active Goal Details: {', '.join([f"{g['title']} ({g['progress']}%)" for g in active_goals[:5]]) if active_goals else 'None'}

**POSITIVE OBSERVATIONS:**
{chr(10).join([f"- {log.get('positive_observations', '')[:100]}" for log in session_logs[:5] if log.get('positive_observations')]) or '- No specific positive observations recorded'}

**CONCERNS NOTED:**
{chr(10).join([f"- {log.get('concerns_noted', '')[:100]}" for log in session_logs[:5] if log.get('concerns_noted')]) or '- No concerns noted'}

{"Generate a brief daily update report with:" if report_type == "daily" else "Generate a comprehensive parent report with:"}

{"1. **Today's Highlights** (Key moments from today's session)" if report_type == "daily" else "1. **Warm Opening** (2-3 sentences greeting parents and summarizing the period)"}

{"2. **Mood & Engagement** (How the child was feeling and participating)" if report_type == "daily" else "2. **Your Child's Journey** (Overview of emotional wellness and growth observed)"}

{"3. **Key Observations** (What stood out today)" if report_type == "daily" else "3. **Behavioral Insights** (Key patterns and what they mean)"}

{"4. **Tomorrow's Focus** (What to watch for or encourage)" if report_type == "daily" else "4. **Celebration Points** (3-4 specific positive developments)"}

{'' if report_type == "daily" else '''5. **Growth Opportunities** (2-3 areas where continued support would help)

6. **Recommended Activities** (3-4 specific activities parents can do at home)

7. **Communication Tips** (How to talk with your child about their feelings)

8. **Looking Ahead** (Brief note on focus for next period)'''}

Write in a warm, supportive tone. {"Keep it concise for a daily update." if report_type == "daily" else "Be specific with examples where possible."} Make parents feel like partners in their child's journey."""

        chat = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a caring child development specialist writing reports for parents. Be warm, supportive, and use simple language. Focus on strengths while gently addressing growth areas."
        ).with_model("openai", "gpt-4o-mini")
        
        report_content = await chat.send_message(UserMessage(text=prompt))
        
        # Save report
        report = {
            "id": f"parent-report-{uuid.uuid4().hex[:12]}",
            "child_id": child_id,
            "observer_id": observer_id,
            "report_type": "parent_summary",
            "report_content": report_content,
            "data_period_days": days,
            "sessions_analyzed": len(session_logs),
            "behavioral_tags_summary": [{"tag": t[0], "count": t[1]} for t in top_tags],
            "mood_distribution": mood_counts,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "shared_with_parents": False
        }
        
        await db.parent_reports.insert_one(report)
        
        return {
            "success": True,
            "report": {
                "id": report["id"],
                "content": report_content,
                "generated_at": report["generated_at"],
                "sessions_analyzed": len(session_logs),
                "top_tags": [{"tag": t[0], "count": t[1]} for t in top_tags],
                "mood_distribution": mood_counts
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating parent report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.get("/observer/parent-reports/{child_id}")
async def get_parent_reports(child_id: str, token: str):
    """Get all parent reports for a child"""
    try:
        user = verify_observer_token(token)
        
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        reports = await db.parent_reports.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("generated_at", -1).to_list(50)
        
        return {"reports": reports, "child": child}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

@router.post("/observer/share-report/{report_id}")
async def share_report_with_parents(report_id: str, token: str):
    """Share a report with parents"""
    try:
        user = verify_observer_token(token)
        
        report = await db.parent_reports.find_one({
            "id": report_id,
            "observer_id": user['id']
        })
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        await db.parent_reports.update_one(
            {"id": report_id},
            {"$set": {
                "shared_with_parents": True,
                "shared_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"success": True, "message": "Report shared with parents"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sharing report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to share report")
