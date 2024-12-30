'use client';

export default function Header({ title, block, className }: any) {
  return (
    <div className={`pb-10 p-[70px] ${className}`}>
      <div className="flex h-full items-center">
        <h1 className="text-5xl font-bold">
          {title}
          <p style={{ color: '#00BB83' }}>{block}</p>
        </h1>
      </div>
    </div>
  );
}
