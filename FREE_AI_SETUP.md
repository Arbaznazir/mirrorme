# 🆓 Free AI Models Setup for MirrorMe

MirrorMe now supports **multiple free AI providers** as alternatives to OpenAI! Here are your options:

## 🎯 **Quick Recommendations**

### **Best for Beginners**: DeepSeek API

- ✅ Easy setup (just need API key)
- ✅ Generous free tier
- ✅ High-quality responses
- ⏱️ Setup time: 2 minutes

### **Best for Privacy**: Ollama (Local)

- ✅ Completely free forever
- ✅ Runs on your computer
- ✅ No data sent to external servers
- ⏱️ Setup time: 5-10 minutes

## 🚀 **Option 1: DeepSeek API (Recommended)**

### **Why DeepSeek?**

- 🆓 Free tier with generous limits
- 🧠 Excellent reasoning capabilities
- 🚀 Fast response times
- 🔒 Privacy-focused company

### **Setup Steps:**

1. **Go to**: https://platform.deepseek.com/
2. **Sign up** for a free account
3. **Create API key** in the dashboard
4. **Add to MirrorMe**:
   ```bash
   # Edit backend/.env file
   DEEPSEEK_API_KEY=your-deepseek-api-key-here
   ```

### **Test it:**

```bash
cd backend
python test-free-ai.py
```

---

## 🦙 **Option 2: Ollama (Local AI)**

### **Why Ollama?**

- 🆓 Completely free forever
- 🏠 Runs locally on your computer
- 🔒 100% private (no data leaves your machine)
- 🌟 Supports Qwen, Llama, and other models

### **Setup Steps:**

#### **1. Install Ollama:**

- **Windows**: Download from https://ollama.ai/
- **Mac**: `brew install ollama`
- **Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`

#### **2. Download a Model:**

```bash
# Recommended: Qwen 2.5 (7B parameters)
ollama pull qwen2.5:7b

# Alternative: Smaller/faster model
ollama pull qwen2.5:3b

# Alternative: Llama model
ollama pull llama3.2:3b
```

#### **3. Start Ollama Server:**

```bash
ollama serve
```

#### **4. Test MirrorMe:**

```bash
cd backend
python test-free-ai.py
```

---

## ⚡ **Option 3: Groq API**

### **Why Groq?**

- 🆓 Generous free tier
- ⚡ Extremely fast inference
- 🤖 Multiple model options

### **Setup Steps:**

1. **Go to**: https://console.groq.com/
2. **Sign up** and get API key
3. **Add to MirrorMe**:
   ```bash
   # Edit backend/.env file
   GROQ_API_KEY=your-groq-api-key-here
   ```

---

## 🤝 **Option 4: Together AI**

### **Why Together AI?**

- 🆓 Free tier available
- 🌟 Access to latest open-source models
- 🔧 Good for experimentation

### **Setup Steps:**

1. **Go to**: https://api.together.xyz/
2. **Sign up** and create API key
3. **Add to MirrorMe**:
   ```bash
   # Edit backend/.env file
   TOGETHER_API_KEY=your-together-api-key-here
   ```

---

## 🔧 **Configuration File**

Your `backend/.env` file should look like this:

```bash
# Choose one or more AI providers (MirrorMe will try them in order)

# DeepSeek (Free tier) - Recommended
DEEPSEEK_API_KEY=your-deepseek-key-here

# Groq (Free tier) - Very fast
GROQ_API_KEY=your-groq-key-here

# Together AI (Free tier) - Latest models
TOGETHER_API_KEY=your-together-key-here

# Ollama (Local, completely free) - Most private
OLLAMA_URL=http://localhost:11434

# OpenAI (Paid) - Backup option
OPENAI_API_KEY=your-openai-key-here
```

## 🧪 **Testing Your Setup**

Run this to test all providers:

```bash
cd backend
python test-free-ai.py
```

Expected output:

```
✅ SUCCESS!
📍 Provider used: DeepSeek
💬 Response: Hello from a free AI model! I'm excited to help with your digital persona analysis!
🎉 Your MirrorMe system has AI-powered summaries!
```

## 🎯 **How It Works**

MirrorMe tries providers in this order:

1. **DeepSeek** (if API key provided)
2. **Groq** (if API key provided)
3. **Together AI** (if API key provided)
4. **Ollama** (if running locally)
5. **OpenAI** (if API key provided)
6. **Fallback** (smart analysis without AI)

## 📊 **Comparison Table**

| Provider        | Cost    | Setup       | Quality    | Speed      | Privacy    |
| --------------- | ------- | ----------- | ---------- | ---------- | ---------- |
| **DeepSeek**    | 🆓 Free | ⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐     |
| **Ollama**      | 🆓 Free | ⭐⭐ Medium | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| **Groq**        | 🆓 Free | ⭐⭐⭐ Easy | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     |
| **Together AI** | 🆓 Free | ⭐⭐⭐ Easy | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     |
| **OpenAI**      | 💰 Paid | ⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐       |

## 🎉 **You're Ready!**

With any of these free options, you'll get:

- ✨ Natural language persona summaries
- 🧠 AI-powered insights about your digital behavior
- 📈 Personalized recommendations
- 🔍 Thoughtful analysis of your interests

**Cost: $0.00** 🎯

---

## 🛠️ **Troubleshooting**

### **Ollama Issues:**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### **API Key Issues:**

- Make sure there are no extra spaces in your .env file
- Restart the MirrorMe backend after adding keys
- Check the provider's website for API key format

### **Still Not Working?**

MirrorMe will automatically fall back to smart analysis without AI. You'll still get:

- Topic extraction
- Interest mapping
- Personality traits
- Behavioral insights

Just without the natural language summaries!
