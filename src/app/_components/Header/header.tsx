'use client';

export default function Header({ title, block, className }: any) {
  return (
    <div className={` p-[75px] ${className} border-b-2 border-[#101010]`}>
      <div className="flex h-full items-center">
        <h1 className="text-5xl font-bold">
          {title}
          <p style={{ color: '#00BB83' }}>{block}</p>
        </h1>
      </div>
    </div>
  );
}
