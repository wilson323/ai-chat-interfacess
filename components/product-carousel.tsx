"use client"

import { Typography } from "antd"
import { cn } from "@/lib/utils"

const { Title } = Typography

interface Product {
  id: string
  title: string
  price: number
  image: string
}

const products: Product[] = [
  {
    id: "1",
    title: "Quantum Glass 无线耳机 无损音质",
    price: 1599,
    image: "/placeholder.svg?height=120&width=140",
  },
  {
    id: "2",
    title: "Nebula Glass 智能手表 健康监测",
    price: 1299,
    image: "/placeholder.svg?height=120&width=140",
  },
  {
    id: "3",
    title: "Photon Glass 快充充电宝 10000mAh",
    price: 299,
    image: "/placeholder.svg?height=120&width=140",
  },
  {
    id: "4",
    title: "Mecha Glass X9 机械键盘 游戏专用",
    price: 899,
    image: "/placeholder.svg?height=120&width=140",
  },
  {
    id: "5",
    title: "Vision Glass 4K高清摄像头",
    price: 1599,
    image: "/placeholder.svg?height=120&width=140",
  },
]

export default function ProductCarousel() {
  return (
    <div
      className={cn(
        "p-4.5 bg-bg-color/70 backdrop-blur-xl border-t border-b border-border-color",
        "overflow-x-auto whitespace-nowrap scrollbar-hide relative z-10",
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-line to-transparent opacity-40"></div>

      <Title level={5} className="text-light-text mb-3.5 flex items-center whitespace-normal">
        <span className="mr-2.5 text-base">✨</span> 科技新品推荐
      </Title>

      <div className="flex gap-3.5">
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              "inline-block w-[140px] cursor-pointer transition-all duration-400",
              "hover:-translate-y-1 vertical-align-top whitespace-normal",
            )}
          >
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className={cn(
                "w-full h-[120px] rounded-[14px] object-cover mb-2.5",
                "border border-border-color shadow-md transition-all duration-400",
                "backdrop-blur-sm hover:border-primary-color/60 hover:shadow-primary/25",
              )}
            />
            <div className="text-sm font-medium line-clamp-2 h-10 leading-tight">{product.title}</div>
            <div className="text-primary-color font-semibold text-base mt-1.5">¥{product.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
