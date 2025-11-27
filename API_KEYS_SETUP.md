# API Keys Configuration Guide

Brain Dump requires two API keys to function properly. Here's where and how to add them:

## Location

All API keys are stored in the `.env` file at the root of your project.

**File path:** `/tmp/cc-agent/60791724/project/.env`

## Required API Keys

### 1. OpenAI API Key

**Purpose:** Powers the AI features including:
- Thought analysis and categorization
- Overall reflection generation
- Compassionate insights

**Where to get it:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**How to add it:**
Open `.env` and replace this line:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2. ElevenLabs API Key

**Purpose:** Provides voice narration for:
- Question reading during thought exploration
- Creating a more immersive experience

**Where to get it:**
1. Go to https://elevenlabs.io/
2. Sign up or log in
3. Navigate to your Profile Settings
4. Click on "API Keys"
5. Copy your API key

**How to add it:**
Open `.env` and replace this line:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

With your actual key:
```
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Supabase Configuration

The Supabase keys are already configured and working:
- `NEXT_PUBLIC_SUPABASE_URL` - Already set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Already set

**You don't need to modify these!**

---

## After Adding Keys

1. Save the `.env` file
2. Restart your development server if it's running
3. The app will now have full functionality including:
   - AI-powered thought categorization
   - Voice narration of questions
   - Overall reflection generation
   - Thought bubble visualization with insights

---

## Testing the Keys

To verify your API keys are working:

1. **OpenAI:** Start a session, add thoughts, and check if categorization works on the thoughts visualization page
2. **ElevenLabs:** During the question exploration, audio narration should play automatically

---

## Security Notes

- Never commit the `.env` file to version control
- Keep your API keys private
- The `.env` file is already in `.gitignore`
- API keys are only used server-side (in API routes)

---

## Cost Considerations

**OpenAI:**
- Uses GPT-4 model
- Typically costs $0.03-0.06 per thought analysis
- Used for thought categorization and reflection generation

**ElevenLabs:**
- Free tier: 10,000 characters/month
- Paid plans start at $5/month for 30,000 characters
- Used for narrating questions during sessions

---

## Need Help?

If you encounter issues:
1. Verify keys are copied correctly (no extra spaces)
2. Check API provider dashboards for usage/limits
3. Ensure you have billing enabled on both platforms
4. Restart the dev server after adding keys
