import 'regenerator-runtime';
import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TbMessageCircle } from 'react-icons/tb';
import { FaRobot } from 'react-icons/fa';
import { FiX, FiVolume2, FiVolumeX, FiSend, FiMic } from 'react-icons/fi';
import { usePortfolio } from '../contexts/PortfolioContext';
import { motion, AnimatePresence } from 'framer-motion';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;

const ChatBot = ({ onClose }) => {
    const { assets, portfolioValue, portfolioChangePercent, portfolioChangeAmount } = usePortfolio();
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Investfolio AI assistant. How can I help you manage your investments today?", isUser: false }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const chatEndRef = useRef(null);

    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

    const isApiKeyConfigured = !!genAI;

    // Auto scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Handle speech output (Text to Speech)
    const speakText = (text) => {
        if (isMuted || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // Cancel any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    // Auto-send voice transcript when user stops speaking
    useEffect(() => {
        if (!listening && transcript.trim()) {
            const voiceInput = transcript.trim();
            addMessage(voiceInput, true);
            processUserInput(voiceInput);
            resetTranscript();
        }
    }, [listening, transcript]);

    const addMessage = (text, isUser) => {
        setMessages((prev) => [...prev, { text, isUser }]);
        if (!isUser && !isMuted) {
            speakText(text);
        }
    };

    const handleListenToggle = () => {
        if (!browserSupportsSpeechRecognition) {
            addMessage("Speech recognition is not supported in this browser. Please try Chrome.", false);
            return;
        }
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            stopSpeech();
            SpeechRecognition.startListening({ continuous: false });
        }
    };

    const processUserInput = async (input) => {
        if (!isApiKeyConfigured) {
            addMessage("I am currently in demo mode. Please configure your VITE_GEMINI_API_KEY in the frontend environment file (.env) to talk to me.", false);
            return;
        }

        setIsProcessing(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Create dynamic context of user's investments to make AI smart
            const systemInstruction = `You are the Investfolio AI assistant. You help the user manage, optimize, and analyze their investments.
Here is the user's current portfolio status:
- Total Value: $${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Profit/Loss: $${portfolioChangeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${portfolioChangePercent.toFixed(2)}%)
- Assets Owned: ${assets.length > 0 ? JSON.stringify(assets.map(a => ({ name: a.name, symbol: a.symbol, type: a.type, quantity: a.quantity, currentPrice: a.currentPrice }))) : "No assets added yet"}

Answer user questions about their portfolio or general financial queries. Be friendly, concise, and professional. Provide helpful suggestions but clarify you aren't providing official financial advice.`;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser: ${input}` }] }]
            });

            const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't get a response. Please try again.";
            addMessage(responseText, false);
        } catch (error) {
            console.error("Gemini API Error:", error);
            addMessage("Sorry, I had trouble reaching my brain. Please check your internet or API key.", false);
        }
        setIsProcessing(false);
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        const input = e.target.userInput.value;
        if (input.trim() && !isProcessing) {
            stopSpeech();
            addMessage(input, true);
            processUserInput(input);
            e.target.userInput.value = '';
        }
    };

    const handleChipClick = (query) => {
        stopSpeech();
        addMessage(query, true);
        processUserInput(query);
    };

    const handleClose = () => {
        stopSpeech();
        if (listening) SpeechRecognition.stopListening();
        onClose();
    };

    const helperChips = [
        "How is my portfolio doing?",
        "What are my assets?",
        "Give me investment tips"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-4 md:right-6 w-[360px] md:w-[400px] h-[550px] rounded-3xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl shadow-2xl z-50 flex flex-col overflow-hidden text-slate-100"
        >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-primary-600/30 to-secondary-600/30 border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                            <FaRobot className="text-xl text-white animate-pulse" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm leading-tight">Investfolio AI</h3>
                        <p className="text-xs text-slate-400">Always online</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setIsMuted((prev) => {
                                const newMuted = !prev;
                                if (newMuted) stopSpeech();
                                return newMuted;
                            });
                        }}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                        title={isMuted ? "Unmute Bot Voice" : "Mute Bot Voice"}
                    >
                        {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                    </button>
                    <button 
                        onClick={handleClose} 
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200"
                    >
                        <FiX size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {!isApiKeyConfigured && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mb-3 space-y-2">
                        <p className="font-semibold flex items-center">
                            ⚠️ API Key Configuration Needed
                        </p>
                        <p>
                            Please set your Google Gemini API key as <code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-amber-300">VITE_GEMINI_API_KEY</code> in your frontend environment file (.env) to enable real AI responses.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-md ${
                                message.isUser
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-none'
                                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none'
                            }`}
                        >
                            <p className="whitespace-pre-line">{message.text}</p>
                        </div>
                    </motion.div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2.5 h-2.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                
                {listening && (
                    <div className="flex justify-end">
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl rounded-tr-none px-4 py-3 shadow-md text-xs flex items-center space-x-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <span>{transcript || "Listening..."}</span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-5 pb-2 pt-1 flex flex-wrap gap-2">
                {helperChips.map((chip, i) => (
                    <button
                        key={i}
                        onClick={() => handleChipClick(chip)}
                        className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all duration-200"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                    <form onSubmit={handleTextSubmit} className="flex-1 relative">
                        <input
                            type="text"
                            name="userInput"
                            disabled={isProcessing}
                            placeholder="Ask me anything about your portfolio..."
                            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:opacity-55 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white shadow-md transition-all duration-200 disabled:opacity-50"
                        >
                            <FiSend size={16} />
                        </button>
                    </form>
                    <button
                        onClick={handleListenToggle}
                        disabled={isProcessing}
                        className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md ${
                            listening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        } disabled:opacity-50`}
                        title={listening ? "Stop Listening" : "Start Voice Input"}
                    >
                        <FiMic size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const ChatBotToggle = () => {
    const [isChatBotOpen, setIsChatBotOpen] = useState(false);

    return (
        <div>
            <AnimatePresence>
                {!isChatBotOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsChatBotOpen(true)}
                        className="fixed bottom-6 right-6 bg-gradient-to-tr from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white p-4 rounded-2xl shadow-xl z-40 transition-all duration-200 transform hover:-translate-y-1"
                        title="AI Assistant"
                    >
                        <TbMessageCircle className="text-2xl" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatBotOpen && (
                    <ChatBot onClose={() => setIsChatBotOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBotToggle;