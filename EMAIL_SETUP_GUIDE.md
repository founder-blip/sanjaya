# 📧 Email Notifications Setup Guide

## Current Status
✅ Email system is **fully implemented** and ready to use
⚠️ Currently in **MOCK MODE** (emails are logged, not sent) until you add your Resend API key

## What's Working Right Now

### When Someone Submits the "Get Started" Form:
1. **Admin Email (to founder@sanjaya.com)**
   - Subject: "🎉 New Inquiry: [Parent Name] for [Child Name]"
   - Contains: Full inquiry details, parent info, child info, message
   - Formatted with colors and organized sections
   
2. **Parent Confirmation Email (to submitter's email)**
   - Subject: "Thank You for Your Interest in Sanjaya"
   - Contains: Confirmation message, what happens next, inquiry details
   - Includes links to About, How It Works, FAQ pages

### Email Features:
- ✅ HTML formatted emails with professional design
- ✅ Non-blocking (async) - doesn't slow down form submission
- ✅ Color-coded sections for easy reading
- ✅ Mobile-responsive email templates
- ✅ Automatic fallback to mock mode if API key not configured

## How to Activate Real Email Sending

### Step 1: Get Resend API Key
1. Go to https://resend.com
2. Sign up for a free account (100 emails/day free)
3. Go to Dashboard → API Keys
4. Click "Create API Key"
5. Copy the key (starts with `re_...`)

### Step 2: Update Backend Environment Variable
1. SSH into your backend server OR use the emergent platform's environment variable manager
2. Edit `/app/backend/.env` file
3. Replace the placeholder:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
4. Restart backend:
   ```bash
   sudo supervisorctl restart backend
   ```

### Step 3: Verify Email Domain (Optional but Recommended)
- In Resend dashboard, add your domain (sanjaya.com)
- Follow their DNS setup instructions
- This allows you to send from emails like `noreply@sanjaya.com` instead of `onboarding@resend.dev`
- Update `SENDER_EMAIL` in `.env` after domain verification

## Testing Email System

### Test 1: Submit a Form
1. Go to https://youth-support-3.preview.emergentagent.com/get-started
2. Fill out the form with your own email
3. Submit
4. Check your inbox for confirmation email
5. Check founder@sanjaya.com inbox for admin notification

### Test 2: Check Logs (Mock Mode)
Without API key, emails are logged:
```bash
tail -f /var/log/supervisor/backend.out.log | grep EMAIL
```

You'll see:
```
[EMAIL MOCK] To: founder@sanjaya.com, Subject: 🎉 New Inquiry: ...
[EMAIL MOCK] To: parent@example.com, Subject: Thank You for Your Interest...
```

## Email Templates

### Admin Email Template Includes:
- 🎉 Eye-catching subject line
- Parent contact information (name, email, phone)
- Child information (name, age, school)
- Parent's message (if provided)
- Submission date and time
- Unique inquiry ID
- Call-to-action to respond within 24 hours

### Parent Confirmation Email Includes:
- Warm welcome message
- What happens next (3-step process)
- Their inquiry details for reference
- Links to learn more about Sanjaya
- Contact information for questions
- Professional sign-off

## Customization Options

### Change Admin Email:
Edit `/app/backend/.env`:
```
ADMIN_EMAIL=youremail@sanjaya.com
```

### Change Sender Email (after domain verification):
Edit `/app/backend/.env`:
```
SENDER_EMAIL=noreply@sanjaya.com
```

### Modify Email Templates:
Edit `/app/backend/server.py` - find the `submit_inquiry` function
Look for `admin_html` and `parent_html` variables

## Troubleshooting

### Emails Not Sending?
1. Check if API key is set correctly in `.env`
2. Restart backend: `sudo supervisorctl restart backend`
3. Check logs: `tail -100 /var/log/supervisor/backend.err.log`
4. Verify Resend account is active and has credits

### Testing Mode
Resend free tier only sends to verified email addresses until you verify your domain.
- Verify your email in Resend dashboard
- Or verify your domain to send to anyone

### Email Goes to Spam?
- Verify your sending domain in Resend
- Add SPF and DKIM records (Resend provides these)
- Warm up your domain by sending gradually

## API Integration Details

### Backend Endpoint:
- POST `/api/inquiries`
- Automatically triggers email sending
- Non-blocking (uses async tasks)

### Email Function:
```python
send_email_async(to_email, subject, html_content)
```

## Cost Estimate

### Resend Pricing:
- **Free Tier**: 100 emails/day, 3,000/month
- **Pay as you go**: $0.10 per 1,000 emails
- **Pro Plan**: $20/month for 50,000 emails

### Your Expected Usage:
- Assume 10 inquiries/day = 20 emails/day (2 per inquiry)
- 600 emails/month
- **Free tier is sufficient!**

## Support

If you need help:
1. Check Resend documentation: https://resend.com/docs
2. View Resend dashboard for delivery status
3. Check backend logs for email sending errors

---

**Status**: Email system ready to go live once you add your Resend API key!
