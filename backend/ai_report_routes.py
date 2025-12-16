"""
AI Report Generation Routes - Generate insights from session logs
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
import logging
from emergentintegrations import OpenAIClient

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

# Emergent LLM Key for OpenAI
EMERGENT_API_KEY = "sk-emergent-5A47c973eA392266a9"

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

def verify_observer_token(token: str):
    """Verify observer JWT token"""
    from observer_routes import verify_observer_token as verify
    return verify(token)

@router.post("/observer/generate-report/{child_id}")
async def generate_child_report(child_id: str, token: str, days: int = 30):
    """Generate AI-powered report for a child using session data"""
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
        
        # Collect data for report
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        
        # Get mood entries
        mood_entries = await db.mood_entries.find(
            {"child_id": child_id, "created_at": {"$gte": cutoff_date}},
            {"_id": 0}
        ).sort("logged_date", -1).to_list(100)
        
        # Get goals
        goals = await db.goals.find(
            {"child_id": child_id},
            {"_id": 0}
        ).to_list(50)
        
        # Get progress notes
        progress_notes = await db.progress_notes.find(
            {"child_id": child_id, "date": {"$gte": cutoff_date}},
            {"_id": 0}
        ).sort("date", -1).to_list(50)
        
        # Get appointments
        appointments = await db.appointments.find(
            {"child_id": child_id, "scheduled_date": {"$gte": cutoff_date}},
            {"_id": 0}
        ).sort("scheduled_date", -1).to_list(50)
        
        # Prepare data summary for AI
        mood_summary = {}
        for entry in mood_entries:
            mood = entry.get('mood', 'neutral')
            mood_summary[mood] = mood_summary.get(mood, 0) + 1
        
        goals_summary = {
            'total': len(goals),
            'active': len([g for g in goals if g.get('status') == 'active']),
            'completed': len([g for g in goals if g.get('status') == 'completed']),
            'avg_progress': sum([g.get('progress', 0) for g in goals]) / len(goals) if goals else 0
        }
        
        sessions_count = len([a for a in appointments if a.get('status') == 'completed'])
        
        # Create prompt for AI
        prompt = f"""Generate a comprehensive emotional support report for {child['name']}, a {child['age']}-year-old child in {child['grade']}.

**Data Analysis Period:** Last {days} days

**Child Information:**
- Name: {child['name']}
- Age: {child['age']}
- Grade: {child['grade']}
- School: {child['school']}

**Session Data:**
- Total Sessions: {sessions_count}
- Attendance Rate: {(sessions_count / len(appointments) * 100) if appointments else 0:.1f}%

**Mood Tracking:**
{', '.join([f"{mood}: {count}" for mood, count in mood_summary.items()])}
- Total Mood Entries: {len(mood_entries)}

**Goals Progress:**
- Total Goals: {goals_summary['total']}
- Active Goals: {goals_summary['active']}
- Completed Goals: {goals_summary['completed']}
- Average Progress: {goals_summary['avg_progress']:.1f}%

**Recent Mood Entries with Observer Notes:**
{chr(10).join([f"- {entry['logged_date']}: {entry['mood_emoji']} {entry['mood']} - {entry.get('notes', 'No notes')[:100]}" for entry in mood_entries[:10]])}

**Active Goals:**
{chr(10).join([f"- {goal['title']} ({goal['progress']}% complete) - {goal['description'][:100]}" for goal in goals if goal.get('status') == 'active'][:5])}

**Recent Progress Notes:**
{chr(10).join([f"- {note.get('date', 'N/A')}: {note.get('note', 'No note')[:150]}" for note in progress_notes[:5]])}

Please generate a professional report with the following sections:

1. **Executive Summary** (2-3 sentences overview)
2. **Emotional Wellness Overview** (Analysis of mood patterns and trends)
3. **Progress Highlights** (Key achievements and positive developments)
4. **Areas for Growth** (Constructive observations and opportunities)
5. **Goal Progress Analysis** (Detailed review of current goals)
6. **Recommendations** (3-5 specific, actionable recommendations for continued support)
7. **Parent Communication Tips** (How to discuss this progress with parents)

Make the report professional, empathetic, and actionable. Focus on the child's strengths while identifying growth areas. Use specific examples from the data provided."""

        # Generate report using OpenAI via Emergent Integrations
        try:
            client = OpenAIClient(api_key=EMERGENT_API_KEY)
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert child psychologist and emotional support specialist. Generate comprehensive, empathetic, and actionable reports for children's emotional development."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            report_content = response.choices[0].message.content
            
            # Save report to database
            report = {
                "id": f"report-{child_id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
                "child_id": child_id,
                "observer_id": observer_id,
                "report_content": report_content,
                "data_period_days": days,
                "sessions_analyzed": sessions_count,
                "mood_entries_analyzed": len(mood_entries),
                "goals_analyzed": len(goals),
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "metadata": {
                    "mood_summary": mood_summary,
                    "goals_summary": goals_summary,
                    "sessions_count": sessions_count
                }
            }
            
            await db.ai_reports.insert_one(report)
            
            return {
                "success": True,
                "report": {
                    "id": report["id"],
                    "content": report_content,
                    "generated_at": report["generated_at"],
                    "data_period_days": days,
                    "sessions_analyzed": sessions_count,
                    "mood_entries_analyzed": len(mood_entries)
                }
            }
            
        except Exception as ai_error:
            logger.error(f"AI generation error: {str(ai_error)}")
            raise HTTPException(status_code=500, detail=f"AI report generation failed: {str(ai_error)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

@router.get("/observer/reports/{child_id}")
async def get_child_reports(child_id: str, token: str):
    """Get all AI-generated reports for a child"""
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
        
        # Get all reports
        reports = await db.ai_reports.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("generated_at", -1).to_list(50)
        
        return {"reports": reports, "child": child}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

@router.get("/parent/child/{child_id}/reports")
async def get_child_reports_parent(child_id: str, token: str):
    """Get AI reports for a child (Parent view)"""
    try:
        from parent_routes import verify_parent_token
        user = verify_parent_token(token)
        parent_id = user['id']
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "parent_ids": parent_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get all reports
        reports = await db.ai_reports.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("generated_at", -1).to_list(50)
        
        return {"reports": reports, "child": child}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")
