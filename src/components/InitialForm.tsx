'use client';

import { useState, useEffect } from 'react';
import AlimentationStep from './AlimentationStep';
import ExerciseStep from './ExerciseStep';
import SleepStep from './SleepStep';
import FeedbackDashboard from './FeedbackDashboard';

interface UserData {
  name: string;
  age: number;
  lastSubmission?: string;
  alimentation?: {
    mealsCount: number;
    balancedNutrition: boolean;
  };
  exercise?: {
    exerciseDuration: '30min' | 'more30min' | 'none';
    ateBeforeExercise: boolean;
  };
  sleep?: {
    sleepHours: number;
    sleepQualityImproved: boolean;
  };
}

type Step = 'initial' | 'alimentation' | 'exercise' | 'sleep';

export default function InitialForm() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('initial');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData);

      const today = new Date().toISOString().split('T')[0];

      // Se já respondeu hoje e completou todas as etapas, mostra o dashboard
      if (parsedData.lastSubmission === today &&
        parsedData.alimentation &&
        parsedData.exercise &&
        parsedData.sleep) {
        return;
      }

      // Se já respondeu hoje mas não completou todas as etapas, continua de onde parou
      if (parsedData.lastSubmission === today) {
        if (parsedData.alimentation && parsedData.exercise) {
          setCurrentStep('sleep');
        } else if (parsedData.alimentation) {
          setCurrentStep('exercise');
        } else {
          setCurrentStep('alimentation');
        }
        return;
      }

      // Se é um novo dia, começa da etapa 1 (alimentação)
      if (parsedData.name && parsedData.age) {
        setCurrentStep('alimentation');
      }
    }
  }, []);

  const handleStepTransition = (nextStep: Step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 500);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 120) {
      setError('Por favor, insira uma idade válida');
      return;
    }

    const newUserData: UserData = {
      name,
      age: ageNumber,
      lastSubmission: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem('userData', JSON.stringify(newUserData));
    setUserData(newUserData);
    setError('');
    handleStepTransition('alimentation');
  };

  const handleAlimentationComplete = (alimentationData: { mealsCount: number; balancedNutrition: boolean }) => {
    if (!userData) return;

    const updatedUserData: UserData = {
      ...userData,
      alimentation: alimentationData
    };

    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    handleStepTransition('exercise');
  };

  const handleExerciseComplete = (exerciseData: { exerciseDuration: '30min' | 'more30min' | 'none'; ateBeforeExercise: boolean }) => {
    if (!userData) return;

    const updatedUserData: UserData = {
      ...userData,
      exercise: exerciseData
    };

    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    handleStepTransition('sleep');
  };

  const handleSleepComplete = (sleepData: { sleepHours: number; sleepQualityImproved: boolean }) => {
    if (!userData) return;

    const updatedUserData: UserData = {
      ...userData,
      sleep: sleepData,
      lastSubmission: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
  };

  if (userData?.lastSubmission === new Date().toISOString().split('T')[0] &&
    userData.alimentation &&
    userData.exercise &&
    userData.sleep) {
    return <FeedbackDashboard />;
  }

  return (
    <div className={`${isTransitioning ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      {currentStep === 'initial' && (
        <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-2xl border border-border p-8 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-card-foreground mb-2">Bem-vindo ao Formulário</h2>
            <p className="text-muted-foreground">Preencha seus dados diariamente para acompanhar seu progresso e melhorar sua rotina!</p>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground">
                Nome
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                placeholder="Digite seu nome"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="block text-sm font-medium text-card-foreground">
                Idade
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                placeholder="Digite sua idade"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive animate-shake">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 font-medium text-lg"
            >
              Começar
            </button>
          </form>
        </div>
      )}

      {currentStep === 'alimentation' && (
        <AlimentationStep onComplete={handleAlimentationComplete} />
      )}

      {currentStep === 'exercise' && (
        <ExerciseStep onComplete={handleExerciseComplete} />
      )}

      {currentStep === 'sleep' && (
        <SleepStep onComplete={handleSleepComplete} />
      )}
    </div>
  );
} 