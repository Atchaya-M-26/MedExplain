const ChatHistory = require('../models/ChatHistory');
const ExtractedData = require('../models/ExtractedData');
const User = require('../models/User');
const { processChat } = require('../services/chatbotService');

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message, reportId, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    // Fetch structured data for this report
    let structuredData = null;
    let summary = '';
    let history = [];

    if (reportId) {
      try {
        const extracted = await ExtractedData.findOne({ reportId: reportId }).lean();
        if (extracted) {
          structuredData = extracted;
          summary = extracted.summary || '';
          console.log(`Chatbot: found ExtractedData for report ${reportId}, condition: ${extracted.condition}`);
        } else {
          console.log(`Chatbot: no ExtractedData found for reportId ${reportId}`);
        }
      } catch (e) {
        console.error('Chatbot: error fetching ExtractedData:', e.message);
      }
    }

    // Fetch patient history (last 5 records)
    const priorRecords = await ExtractedData.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(5).lean();
    history = priorRecords;

    // Get user language preference
    const user = await User.findById(req.user.id).select('language').lean();
    const lang = language || user?.language || 'en';

    // Process with chatbot service
    const result = processChat(message, structuredData, summary, history, lang);

    // Save to chat history
    let chatHistory = await ChatHistory.findOne({ userId: req.user.id, reportId: reportId || null });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.user.id, reportId: reportId || null, messages: [] });
    }
    chatHistory.messages.push({ type: 'user', content: message });
    chatHistory.messages.push({ type: 'bot', content: result.response });
    await chatHistory.save();

    res.status(200).json({
      success: true,
      response: result.response,
      original_english: result.original_english,
      simplified_terms: result.simplified_terms,
      intent: result.intent,
      chatId: chatHistory._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/chatbot/history/:reportId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      reportId: req.params.reportId,
    });
    res.status(200).json({ success: true, data: chatHistory?.messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
