import React, { useState } from 'react';
import { Bot, Mic, MicOff, Send, Volume2, X, Sparkles, MessageSquare } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useLanguage } from '../../contexts/LanguageContext';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const { isListening, startListening, simulateSpeech, speak } = useVoiceInput();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: language === 'mr'
        ? 'नमस्कार! मी तुमचा स्वास्थ्य सेतू सहाय्यक आहे. तुम्ही मला अपॉइंटमेंट, रेफरल किंवा औषध साठ्याबद्दल विचारू शकता.'
        : language === 'hi'
        ? 'नमस्ते! मैं आपका स्वास्थ्य सेतु सहायक हूँ। आप मुझसे अपॉइंटमेंट, रेफरल या दवा उपलब्धता के बारे में पूछ सकते हैं।'
        : 'Hello! I am your Swasthya Setu Navigation Assistant. You can ask me about your appointments, referral status, or medicine availability.',
      timestamp: 'Just now'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent responses for prototype
    setTimeout(() => {
      let botResponse = '';
      const q = textToSend.toLowerCase();

      if (q.includes('referral') || q.includes('रेफरल')) {
        botResponse = language === 'mr'
          ? 'तुमचे रेफरल ठाणे जिल्हा सामान्य रुग्णालयातील (डॉ. अनन्या जोशी - स्त्रीरोग तज्ञ) यांच्याकडे वर्ग केले असून ते स्वीकारले गेले आहे.'
          : language === 'hi'
          ? 'आपका रेफरल ठाणे जिला सिविल अस्पताल (स्त्रीरोग विशेषज्ञ डॉ. अनन्या जोशी) द्वारा स्वीकार कर लिया गया है।'
          : 'Your referral to Thane District Civil Hospital (Dr. Ananya Joshi, OB/GYN) has been ACCEPTED. Your scheduled visit is tomorrow at 09:30 AM.';
      } else if (q.includes('appointment') || q.includes('अपॉइंटमेंट') || q.includes('तपासणी') || q.includes('कधी')) {
        botResponse = language === 'mr'
          ? 'तुमची प्राथमिक आरोग्य केंद्र कल्याण येथे आज सकाळी १०:३० वाजता टेलिकन्सल्टेशन अपॉइंटमेंट आहे (टोकन क्रमांक: A-024, रांग क्रमांक: २).'
          : language === 'hi'
          ? 'आपकी पीएचसी कल्याण में आज सुबह १०:३० बजे टेली-परामर्श अपॉइंटमेंट है (टोकन: A-024, कतार संख्या: २)।'
          : 'You have a high-priority Teleconsultation appointment scheduled at PHC Kalyan today at 10:30 AM (Token: A-024, Queue Position: 2).';
      } else if (q.includes('medicine') || q.includes('औषध') || q.includes('दवा') || q.includes('paracetamol') || q.includes('labetalol')) {
        botResponse = language === 'mr'
          ? 'लॅबेटालॉल १०० मिग्रॅ आणि पॅरासिटामॉल ५०० मिग्रॅ पीएचसी कल्याण आणि ग्रामीण रुग्णालय डोंबिवली येथे उपलब्ध आहे.'
          : language === 'hi'
          ? 'लैबेटालोल १०० मिलीग्राम और पैरासिटामोल ५०० मिलीग्राम पीएचसी कल्याण व डोंबिवली ग्रामीण अस्पताल में पर्याप्त स्टॉक में उपलब्ध हैं।'
          : 'Labetalol 100mg (350 units) and Paracetamol 500mg (1800 units) are currently AVAILABLE at PHC Kalyan Rural.';
      } else {
        botResponse = language === 'mr'
          ? 'मी तुमचे प्रश्न समजून घेतले आहेत. अधिक मदतीसाठी आपल्या गावातील आशा सेविका सुनिता गायकवाड यांच्याशी संपर्क साधा.'
          : language === 'hi'
          ? 'मैंने आपकी जानकारी दर्ज कर ली है। सहायता हेतु अपनी निकटतम आशा कार्यकर्ता से संपर्क करें।'
          : 'I have logged your request. For clinical evaluation, please consult your assigned Medical Officer at PHC Kalyan.';
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, botMsg]);
      speak(botResponse);
    }, 600);
  };

  const handleVoiceTrigger = () => {
    startListening((spokenText) => {
      setInput(spokenText);
      handleSend(spokenText);
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-gov-navy to-gov-blue text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-400 text-slate-950 rounded-xl shadow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Swasthya Voice & Care AI</h3>
            <p className="text-[10px] text-amber-200">Multilingual Care Navigation Aid</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-gov-blue transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5 text-xs">
        <button
          onClick={() => handleSend(language === 'mr' ? 'माझी अपॉइंटमेंट कधी आहे?' : language === 'hi' ? 'मेरी अपॉइंटमेंट कब है?' : 'When is my appointment?')}
          className="px-2.5 py-1 bg-white hover:bg-gov-ice border border-slate-300 rounded-full text-gov-navy font-medium transition shadow-2xs"
        >
          📅 {language === 'mr' ? 'अपॉइंटमेंट स्थिती' : 'Check Appointment'}
        </button>
        <button
          onClick={() => handleSend(language === 'mr' ? 'माझे रेफरल कुठे आहे?' : language === 'hi' ? 'मेरा रेफरल कहाँ है?' : 'Where is my referral?')}
          className="px-2.5 py-1 bg-white hover:bg-gov-ice border border-slate-300 rounded-full text-gov-navy font-medium transition shadow-2xs"
        >
          🔄 {language === 'mr' ? 'रेफरल माहिती' : 'Track Referral'}
        </button>
        <button
          onClick={() => handleSend('Where is Labetalol 100mg available?')}
          className="px-2.5 py-1 bg-white hover:bg-gov-ice border border-slate-300 rounded-full text-gov-navy font-medium transition shadow-2xs"
        >
          💊 {language === 'mr' ? 'औषध साठा' : 'Medicine Stock'}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gov-navy text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-2xs'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'bot' && (
              <button
                onClick={() => speak(msg.text)}
                className="text-[10px] text-gov-blue hover:underline flex items-center gap-1 mt-1 pl-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen Audio</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceTrigger}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-red-600 text-white animate-ping'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
            title="Click to speak (Marathi, Hindi, English)"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'mr'
                ? 'येथे प्रश्न विचारा किंवा बोला...'
                : language === 'hi'
                ? 'यहाँ प्रश्न पूछें या बोलें...'
                : 'Ask question or speak in Marathi / Hindi...'
            }
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-navy"
          />

          <button
            type="submit"
            className="p-2.5 bg-gov-navy hover:bg-gov-blue text-white rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-500 italic">
          *Decision support assistant for navigation & status tracking. Not a medical doctor.
        </p>
      </div>

    </div>
  );
};
