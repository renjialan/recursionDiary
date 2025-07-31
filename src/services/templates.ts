import { Template } from '../types';

const getCurrentDateString = (): string => {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const successDiaryTemplate: Template = {
  id: 'success-diary',
  name: 'Daily Success Journal',
  description: 'Track productivity, health, learning, and goals with structured daily reflection',
  icon: 'target',
  category: 'personal',
  content: `# Daily Success Journal - ${getCurrentDateString()}

## 📊 How was yesterday's productivity?



## 🏃‍♂️ How was yesterday's health (diet, sleep, exercise)?



## 📚 What did I read yesterday?



## 🧠 What did I learn yesterday?



## 🔧 What didn't go well yesterday? How can I improve? What's the specific plan?



## 🏆 What went well? What's worth remembering?



## 🎯 What is today's top goal?



## 🚧 What is today's top block?



---
*Remember: Be brutally honest but balanced. Push yourself toward success while maintaining happiness and well-being.*`,
};

const founderTemplate: Template = {
  id: 'founder-journal',
  name: "Founder's Daily Log",
  description: 'Focus on metrics, team updates, customer feedback, and strategic decisions',
  icon: 'rocket',
  category: 'business',
  content: `# Founder's Daily Log - ${getCurrentDateString()}

## 📈 Key Metrics Today
**Revenue/Growth:**


**User Metrics:**


**Team Metrics:**


## 👥 Team & People Updates
**Hiring/Team Changes:**


**Team Wins & Challenges:**


**1-on-1 Insights:**


## 💬 Customer Conversations
**Key Feedback:**


**Support Issues:**


**Feature Requests:**


## 🚀 Product Progress
**Shipped Today:**


**In Progress:**


**Blockers:**


## 🎯 Strategic Decisions Made
**Big Decisions:**


**Why These Decisions:**


## 📋 Tomorrow's Top 3 Priorities
1. 
2. 
3. 

## 🚨 Critical Blockers to Resolve


---
*Stay focused on what moves the needle. Celebrate small wins, learn from setbacks.*`,
};

const couplesTemplate: Template = {
  id: 'couples-journal',
  name: 'Couples Journal',
  description: 'Strengthen your relationship with daily gratitude, communication, and shared goals',
  icon: 'heart',
  category: 'relationship',
  content: `# Couples Journal - ${getCurrentDateString()}

## 💕 What I appreciated about my partner today



## ⏰ Quality time we shared



## 💬 How we communicated today
**What went well:**


**What could improve:**


## 🎯 Progress on our shared goals
**Goals we worked on:**


**Next steps:**


## 🪞 Something I want to improve about myself



## 🌅 Our plan for tomorrow
**Together time:**


**Individual support:**


## 💝 Gratitude & Love Notes



---
*Strong relationships require intentional daily investment. Celebrate growth together.*`,
};

export const getAvailableTemplates = (): Template[] => {
  return [successDiaryTemplate, founderTemplate, couplesTemplate];
};

export const getTemplateById = (id: string): Template | undefined => {
  const templates = getAvailableTemplates();
  return templates.find(template => template.id === id);
};

export const getDailySuccessTemplate = (): Template => {
  return successDiaryTemplate;
};