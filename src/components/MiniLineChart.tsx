import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

type Props = {
  data: { date: string; value: number }[]
  color?: string
}

export default function MiniLineChart({ data, color = '#38bdf8' }: Props) {
  return (
    <div className="h-44 w-full rounded-[28px] bg-slate-50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 6, bottom: 8, left: 0 }}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
