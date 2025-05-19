'use client';

import { useState } from 'react';

interface ExerciseData {
  exerciseDuration: '30min' | 'more30min' | 'none';
  ateBeforeExercise: boolean;
}

interface ExerciseStepProps {
  onComplete: (data: ExerciseData) => void;
}

export default function ExerciseStep({ onComplete }: ExerciseStepProps) {
  const [exerciseDuration, setExerciseDuration] = useState<ExerciseData['exerciseDuration'] | null>(null);
  const [ateBeforeExercise, setAteBeforeExercise] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseDuration) {
      setError('Por favor, selecione o tempo de exercício');
      return;
    }

    if (ateBeforeExercise === null) {
      setError('Por favor, responda se se alimentou antes do exercício');
      return;
    }

    onComplete({
      exerciseDuration,
      ateBeforeExercise
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-2xl border border-border p-8 transform transition-all duration-300 hover:scale-[1.02] animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-card-foreground mb-4">Etapa 2: Exercícios Físicos</h2>

        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-8">
          <p className="text-[#000]">
            Lembrando que se você se alimentar de 30 a 60 minutos antes de praticar as atividades físicas, você vai ter um melhor desempenho!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-card-foreground mb-2">
              Quantos minutos de exercício físico você praticou hoje?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: '30min', label: '1 - 30 minutos' },
                { value: 'more30min', label: '+ de 30 minutos' },
                { value: 'none', label: 'Não pratiquei hoje' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setExerciseDuration(option.value as ExerciseData['exerciseDuration'])}
                  className={`p-4 rounded-lg border transition-all duration-200 ${exerciseDuration === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:border-primary/50'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-card-foreground mb-2">
              Você se alimentou antes de realizar suas atividades para um melhor desempenho?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: 'Sim' },
                { value: false, label: 'Não' }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAteBeforeExercise(option.value)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${ateBeforeExercise === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:border-primary/50'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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
          Próxima Etapa
        </button>
      </form>
    </div>
  );
} 