import Image from "next/image";
import InitialForm from '@/components/InitialForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <InitialForm />
      </div>
    </main>
  );
}
