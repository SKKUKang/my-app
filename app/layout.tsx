// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '시간표 분석기',
  description: '나의 시간표는 꿀강일까?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 헤드바 추가 */}
        <header className="bg-gradient-to-r from-teal-400 to-blue-500 text-white p-5 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-semibold tracking-wide">I Like GongGang</h1>
            {/* 네비게이션 없이 헤드바만 디자인 */}
          </div>
        </header>

        {/* 본문 내용 */}
        {children}
      </body>
    </html>
  );
}
