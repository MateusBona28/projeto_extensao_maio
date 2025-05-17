'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

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

interface DailyData {
  date: string;
  data: UserData;
}

export default function FeedbackDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [previousData, setPreviousData] = useState<UserData | null>(null);
  const [progressData, setProgressData] = useState<DailyData[]>([]);

  useEffect(() => {
    // Buscar dados do usuário atual
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData);

      // Buscar histórico de dados
      const today = new Date().toISOString().split('T')[0];
      const historyData: DailyData[] = [];

      // Adicionar dados de hoje
      if (parsedData.lastSubmission === today) {
        historyData.push({
          date: today,
          data: parsedData
        });
      }

      // Buscar dados anteriores
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('userData_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (data.lastSubmission && data.lastSubmission !== today) {
              historyData.push({
                date: data.lastSubmission,
                data: data
              });
            }
          } catch (error) {
            console.error('Erro ao processar dados:', error);
          }
        }
      }

      // Ordenar por data (mais recente primeiro)
      const sortedData = historyData.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setProgressData(sortedData);

      // Definir dados anteriores se houver
      if (sortedData.length > 1) {
        setPreviousData(sortedData[1].data);
      }
    }
  }, []);

  if (!userData) return null;

  const getAlimentationFeedback = () => {
    if (!userData.alimentation) return null;

    const isGood = userData.alimentation.mealsCount >= 3 && userData.alimentation.balancedNutrition;
    const wasGood = previousData?.alimentation?.mealsCount
      ? previousData.alimentation.mealsCount >= 3 && previousData.alimentation.balancedNutrition
      : false;

    return {
      status: isGood ? 'bom' : 'pode melhorar',
      message: isGood
        ? 'Excelente! Continue mantendo uma alimentação balanceada e regular.'
        : `Tente aumentar para pelo menos 3 refeições diárias${!userData.alimentation.balancedNutrition ? ' e melhorar a distribuição dos nutrientes' : ''}.`,
      progress: previousData ? (isGood === wasGood ? 'mantido' : isGood ? 'melhorou' : 'piorou') : 'novo'
    };
  };

  const getExerciseFeedback = () => {
    if (!userData.exercise) return null;

    const isGood = userData.exercise.exerciseDuration !== 'none' && userData.exercise.ateBeforeExercise;
    const wasGood = previousData?.exercise?.exerciseDuration
      ? previousData.exercise.exerciseDuration !== 'none' && previousData.exercise.ateBeforeExercise
      : false;

    return {
      status: isGood ? 'bom' : 'pode melhorar',
      message: isGood
        ? 'Ótimo! Continue se exercitando regularmente e se alimentando antes dos treinos.'
        : `Tente praticar pelo menos 30 minutos de exercício${!userData.exercise.ateBeforeExercise ? ' e se alimentar antes do treino' : ''}.`,
      progress: previousData ? (isGood === wasGood ? 'mantido' : isGood ? 'melhorou' : 'piorou') : 'novo'
    };
  };

  const getSleepFeedback = () => {
    if (!userData.sleep) return null;

    const isGood = userData.sleep.sleepHours >= 7 && userData.sleep.sleepQualityImproved;
    const wasGood = previousData?.sleep?.sleepHours
      ? previousData.sleep.sleepHours >= 7 && previousData.sleep.sleepQualityImproved
      : false;

    return {
      status: isGood ? 'bom' : 'pode melhorar',
      message: isGood
        ? 'Perfeito! Continue mantendo uma boa rotina de sono.'
        : `Tente dormir pelo menos 7 horas${!userData.sleep.sleepQualityImproved ? ' e melhorar a qualidade do seu sono' : ''}.`,
      progress: previousData ? (isGood === wasGood ? 'mantido' : isGood ? 'melhorou' : 'piorou') : 'novo'
    };
  };

  const alimentationFeedback = getAlimentationFeedback();
  const exerciseFeedback = getExerciseFeedback();
  const sleepFeedback = getSleepFeedback();

  const calculateProgress = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getExerciseProgress = (current: string, previous: string) => {
    const values = {
      'none': 0,
      '30min': 50,
      'more30min': 100
    };
    return values[current as keyof typeof values] - values[previous as keyof typeof values];
  };

  const getProgressFeedback = () => {
    if (!progressData.length) {
      return {
        title: 'Comece seu Progresso',
        message: 'Registre suas atividades diárias para acompanhar sua evolução.',
        type: 'info'
      };
    }

    if (progressData.length === 1) {
      return {
        title: 'Primeiro Registro',
        message: 'Continue registrando suas atividades para ver seu progresso ao longo do tempo.',
        type: 'info'
      };
    }

    const lastDay = progressData[0];
    const previousDay = progressData[1];

    const improvements = [];

    // Verifica melhorias na alimentação
    const lastMeals = lastDay.data.alimentation?.mealsCount || 0;
    const prevMeals = previousDay.data.alimentation?.mealsCount || 0;
    if (lastMeals > prevMeals) {
      improvements.push('alimentação');
    }

    // Verifica melhorias no exercício
    if (lastDay.data.exercise?.exerciseDuration !== 'none' &&
      previousDay.data.exercise?.exerciseDuration === 'none') {
      improvements.push('exercício');
    }

    // Verifica melhorias no sono
    const lastSleep = lastDay.data.sleep?.sleepHours || 0;
    const prevSleep = previousDay.data.sleep?.sleepHours || 0;
    if (lastSleep > prevSleep) {
      improvements.push('sono');
    }

    if (improvements.length > 0) {
      return {
        title: 'Progresso Detectado!',
        message: `Melhorias em: ${improvements.join(', ')}. Continue assim!`,
        type: 'success'
      };
    }

    return {
      title: 'Mantenha o Foco',
      message: 'Seus resultados estão estáveis. Tente estabelecer novas metas para melhorar ainda mais.',
      type: 'warning'
    };
  };

  const exportToXLSX = () => {
    if (!progressData.length) {
      alert('Não há dados para exportar. Continue registrando suas atividades para gerar relatórios.');
      return;
    }

    try {
      // Preparar dados para a planilha
      const data = progressData.map(day => ({
        'Data': new Date(day.date).toLocaleDateString('pt-BR'),
        'Nome': day.data.name,
        'Idade': day.data.age,
        'Refeições': day.data.alimentation?.mealsCount || 'N/A',
        'Nutrição Balanceada': day.data.alimentation?.balancedNutrition ? 'Sim' : 'Não',
        'Duração do Exercício': day.data.exercise?.exerciseDuration === 'none' ? 'Nenhum' :
          day.data.exercise?.exerciseDuration === '30min' ? '1-30 minutos' : '+30 minutos',
        'Alimentação Pré-Exercício': day.data.exercise?.ateBeforeExercise ? 'Sim' : 'Não',
        'Horas de Sono': day.data.sleep?.sleepHours || 'N/A',
        'Qualidade do Sono Melhorou': day.data.sleep?.sleepQualityImproved ? 'Sim' : 'Não'
      }));

      // Criar uma nova planilha
      const ws = XLSX.utils.json_to_sheet(data);

      // Ajustar largura das colunas
      const wscols = [
        { wch: 12 }, // Data
        { wch: 20 }, // Nome
        { wch: 8 },  // Idade
        { wch: 10 }, // Refeições
        { wch: 20 }, // Nutrição Balanceada
        { wch: 20 }, // Duração do Exercício
        { wch: 25 }, // Alimentação Pré-Exercício
        { wch: 12 }, // Horas de Sono
        { wch: 25 }  // Qualidade do Sono Melhorou
      ];
      ws['!cols'] = wscols;

      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Meu Progresso');

      // Gerar o arquivo
      const fileName = `meu-progresso-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Ocorreu um erro ao exportar os dados. Por favor, tente novamente.');
    }
  };

  const progressFeedback = getProgressFeedback();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-card-foreground mb-2">Seu Progresso, {userData?.name}!</h2>
        <p className="text-black mb-4">Acompanhe sua evolução e mantenha o foco nos seus objetivos</p>

        <button
          onClick={exportToXLSX}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar Meus Resultados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Alimentação */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">Alimentação</h3>
          {alimentationFeedback && (
            <>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${alimentationFeedback.status === 'bom' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {alimentationFeedback.status}
              </div>
              <p className="text-black mb-4 font-medium">{alimentationFeedback.message}</p>
              <div className="text-sm text-black">
                Progresso: {alimentationFeedback.progress}
              </div>
            </>
          )}
        </div>

        {/* Card de Exercício */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">Exercício</h3>
          {exerciseFeedback && (
            <>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${exerciseFeedback.status === 'bom' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {exerciseFeedback.status}
              </div>
              <p className="text-black mb-4 font-medium">{exerciseFeedback.message}</p>
              <div className="text-sm text-black">
                Progresso: {exerciseFeedback.progress}
              </div>
            </>
          )}
        </div>

        {/* Card de Sono */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">Sono</h3>
          {sleepFeedback && (
            <>
              <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${sleepFeedback.status === 'bom' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {sleepFeedback.status}
              </div>
              <p className="text-black mb-4 font-medium">{sleepFeedback.message}</p>
              <div className="text-sm text-black">
                Progresso: {sleepFeedback.progress}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gráfico de Progresso */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-card-foreground">Progresso Diário</h3>
          <div className={`px-3 py-1 rounded-full text-sm ${progressFeedback.type === 'success' ? 'bg-green-100 text-green-800' :
            progressFeedback.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
            {progressFeedback.title}
          </div>
        </div>

        <p className="text-black mb-6 font-medium">{progressFeedback.message}</p>

        <div className="space-y-4">
          {progressData.length > 1 ? (
            progressData.map((day, index) => {
              if (index === progressData.length - 1) return null;
              const nextDay = progressData[index + 1];

              const alimentationProgress = calculateProgress(
                day.data.alimentation?.mealsCount || 0,
                nextDay.data.alimentation?.mealsCount || 0
              );

              const exerciseProgress = getExerciseProgress(
                day.data.exercise?.exerciseDuration || 'none',
                nextDay.data.exercise?.exerciseDuration || 'none'
              );

              const sleepProgress = calculateProgress(
                day.data.sleep?.sleepHours || 0,
                nextDay.data.sleep?.sleepHours || 0
              );

              return (
                <div key={day.date} className="border-b border-border pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-black font-medium">
                      {new Date(day.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Alimentação</span>
                        <span className={alimentationProgress >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {alimentationProgress > 0 ? '+' : ''}{alimentationProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${alimentationProgress >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(alimentationProgress), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Exercício</span>
                        <span className={exerciseProgress >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {exerciseProgress > 0 ? '+' : ''}{exerciseProgress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${exerciseProgress >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(exerciseProgress), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Sono</span>
                        <span className={sleepProgress >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {sleepProgress > 0 ? '+' : ''}{sleepProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${sleepProgress >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs(sleepProgress), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-black mb-4">
                Registre suas atividades diárias para ver seu progresso ao longo do tempo.
              </p>
              <div className="h-32 flex items-center justify-center">
                <div className="text-black">
                  <svg
                    className="w-12 h-12 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-sm">Seus dados de progresso aparecerão aqui</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 