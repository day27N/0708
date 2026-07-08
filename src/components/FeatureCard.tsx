import React from 'react'

type FeatureCardProps = {
  title: string
  description: string
  icon: React.ReactNode
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-950 mb-2">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}
