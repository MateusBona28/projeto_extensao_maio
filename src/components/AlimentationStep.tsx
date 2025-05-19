'use client';

import { useState } from 'react';

interface AlimentationData {
  mealsCount: number;
  balancedNutrition: boolean;
}

interface AlimentationStepProps {
  onComplete: (data: AlimentationData) => void;
}

export default function AlimentationStep({ onComplete }: AlimentationStepProps) {
  const [mealsCount, setMealsCount] = useState<number>(0);
  const [balancedNutrition, setBalancedNutrition] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mealsCount === 0) {
      setError('Por favor, selecione a quantidade de refeições');
      return;
    }

    if (balancedNutrition === null) {
      setError('Por favor, responda se balanceou os nutrientes');
      return;
    }

    onComplete({
      mealsCount,
      balancedNutrition
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-2xl border border-border p-8 transform transition-all duration-300 hover:scale-[1.02]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-card-foreground mb-4">Etapa 1: Alimentação</h2>

        <div className="space-y-4 mb-8 text-left">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-primary-foreground font-medium text-[#000]">Mantenha sua dieta em dia!</p>
          </div>

          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-secondary-foreground">
              Tente contabilizar os nutrientes que você está ingerindo para uma melhoria futura da sua alimentação!
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">Sabendo disso, responda as perguntas seguintes:</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-card-foreground mb-2">
              Quantas refeições você fez no dia?
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              O ideal seriam pelo menos 3 refeições ao dia, uma em cada período
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setMealsCount(number)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${mealsCount === number
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:border-primary/50'
                    }`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-card-foreground mb-2">
              Você balanceou corretamente os nutrientes em cada refeição?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: 'Sim' },
                { value: false, label: 'Não' }
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setBalancedNutrition(option.value)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${balancedNutrition === option.value
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
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
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