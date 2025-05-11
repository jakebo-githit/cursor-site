import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, ChevronRight, ClipboardCheck, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const AssessmentForm = () => {
  const { t } = useTranslation();
  const questions = t('assessment.questions', { returnObjects: true }) as {
    question: string;
    options: string[];
  }[];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsComplete(false);
    setShowResult(false);
  };

  // Simple algorithm to determine recommendation based on answers
  const getRecommendation = () => {
    // This is a simplified example - in a real application, you would have a more sophisticated algorithm
    const hasGallstones = answers[0] === 0; // "Yes" to having gallstones
    const stoneLocation = answers[1]; // Location of stones
    const stoneSize = answers[2]; // Size of stones
    const previousSurgery = answers[3] === 0; // "Yes" to previous surgery
    const symptoms = answers[4]; // Current symptoms
    const age = answers[5]; // Age group
    const otherDiseases = answers[6]; // Other diseases

    // High suitability: Confirmed gallstones, in bile duct, medium size, with symptoms
    if (hasGallstones && (stoneLocation === 1 || stoneLocation === 2) && (stoneSize === 1 || stoneSize === 2) && symptoms > 0) {
      return {
        suitable: true,
        message: t('common.home') === 'Home' 
          ? 'Based on your responses, POCS technology may be highly suitable for your condition. We recommend scheduling a consultation with Dr. Liu Bo for a thorough evaluation.'
          : '根据您的回答，POCS技术可能非常适合您的病情。我们建议您预约刘波主任进行全面评估。',
        icon: <ClipboardCheck className="text-green-500" size={48} />
      };
    }
    
    // Medium suitability: Gallstones but unclear location or very large
    else if (hasGallstones && (stoneLocation === 4 || stoneSize === 3)) {
      return {
        suitable: null,
        message: t('common.home') === 'Home' 
          ? 'Your condition may be suitable for POCS treatment, but more detailed assessment is needed. Please consult with Dr. Liu Bo and bring your imaging results.'
          : '您的情况可能适合POCS治疗，但需要更详细的评估。请咨询刘波主任并携带您的影像学检查结果。',
        icon: <AlertTriangle className="text-yellow-500" size={48} />
      };
    }
    
    // Low suitability: No confirmed gallstones or other concerns
    else {
      return {
        suitable: false,
        message: t('common.home') === 'Home' 
          ? 'Based on your responses, we need more information to determine if POCS is right for you. Please schedule a consultation for professional evaluation.'
          : '根据您的回答，我们需要更多信息来确定POCS是否适合您。请安排咨询以获得专业评估。',
        icon: <AlertTriangle className="text-red-500" size={48} />
      };
    }
  };

  const recommendation = showResult ? getRecommendation() : null;

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 md:p-8">
      {!showResult ? (
        <>
          {/* Assessment Questions */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>{t('common.home') === 'Home' ? 'Question' : '问题'} {currentQuestion + 1}/{questions.length}</span>
              <span>{Math.round(((isComplete ? questions.length : currentQuestion) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-secondary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((isComplete ? questions.length : currentQuestion) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </div>

          {!isComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-medium text-primary-900 mb-4">
                {questions[currentQuestion].question}
              </h3>
              
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-primary-50 transition-colors flex justify-between items-center"
                    onClick={() => handleAnswer(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{option}</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h3 className="text-xl font-medium text-primary-900 mb-4">
                {t('common.home') === 'Home' ? 'Assessment Complete!' : '评估完成！'}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('common.home') === 'Home' 
                  ? 'Thank you for completing the assessment. Click the button below to see your results.'
                  : '感谢您完成评估。点击下方按钮查看结果。'}
              </p>
              <Button 
                onClick={handleSubmit} 
                variant="secondary"
                className="flex items-center justify-center"
              >
                <Send size={18} className="mr-2" />
                {t('assessment.submit')}
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        // Results Display
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            {recommendation?.icon}
          </div>
          
          <h3 className="text-xl font-medium text-primary-900 mb-4">
            {t('common.home') === 'Home' ? 'Your Assessment Result' : '您的评估结果'}
          </h3>
          
          <div className={`p-6 rounded-lg mb-6 ${
            recommendation?.suitable === true 
              ? 'bg-green-50 border border-green-200'
              : recommendation?.suitable === false
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className="text-gray-700 mb-4">
              {recommendation?.message}
            </p>
            <p className="text-gray-600 text-sm italic">
              {t('assessment.disclaimer')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={resetAssessment} 
              variant="outline"
            >
              {t('common.home') === 'Home' ? 'Restart Assessment' : '重新评估'}
            </Button>
            <Button 
              to="/contact" 
              variant="primary"
            >
              {t('common.appointment')}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentForm;