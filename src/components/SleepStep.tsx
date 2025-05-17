'use client';

import { useState } from 'react';

interface SleepData {
  sleepHours: number;
  sleepQualityImproved: boolean;
}

interface SleepStepProps {
  onComplete: (data: SleepData) => void;
}

export default function SleepStep({ onComplete }: SleepStepProps) {
  const [sleepHours, setSleepHours] = useState<string>('');
  const [sleepQualityImproved, setSleepQualityImproved] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hours = parseFloat(sleepHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError('Por favor, insira um número válido de horas (entre 0 e 24)');
      return;
    }

    if (sleepQualityImproved === null) {
      setError('Por favor, responda se sentiu melhoria na qualidade do sono');
      return;
    }

    onComplete({
      sleepHours: hours,
      sleepQualityImproved
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-2xl border border-border p-8 transform transition-all duration-300 hover:scale-[1.02] animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-card-foreground mb-4">Etapa 3: Sono</h2>

        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-8">
          <p className="text-primary-foreground text-[black]">
            Se você conseguiu ter um bom desempenho nas etapas anteriores, você provavelmente vai ter um sono melhor!
            Gastar energia com atividades físicas e se alimentando de forma consistente vai com certeza te ajudar no sono.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="sleepHours" className="block text-lg font-medium text-card-foreground mb-2">
              Quantas horas você dormiu de ontem para hoje?
            </label>
            <input
              type="number"
              id="sleepHours"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              step="0.5"
              min="0"
              max="24"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              placeholder="Ex: 7.5"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-card-foreground mb-2">
              Você sentiu uma melhoria na qualidade do seu sono?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: 'Sim' },
                { value: false, label: 'Não' }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSleepQualityImproved(option.value)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${sleepQualityImproved === option.value
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
          Finalizar
        </button>
      </form>
    </div>
  );
} 