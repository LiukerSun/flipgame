import { Chessboard } from "@/components/Chessboard/Chessboard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Chessboard />
    </main>
  );
}