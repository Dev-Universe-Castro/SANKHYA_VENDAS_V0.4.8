"use client"

import { useState } from "react"
import { Plus, Briefcase, ShoppingCart, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PedidoVendaRapido from "@/components/pedido-venda-rapido"

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPedidoModal, setShowPedidoModal] = useState(false)
  const router = useRouter()

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleOpenPedido = () => {
    setShowPedidoModal(true)
    setIsOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Action Buttons */}
        <div
          className={cn(
            "flex flex-col-reverse gap-3 transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <Button
            onClick={handleOpenPedido}
            className="h-12 px-4 rounded-full shadow-lg hover:shadow-xl transition-all"
            variant="secondary"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            +Pedidos
          </Button>

          <Button
            onClick={() => handleNavigate("/dashboard/leads")}
            className="h-12 px-4 rounded-full shadow-lg hover:shadow-xl transition-all"
            variant="secondary"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            +Negócios
          </Button>
        </div>

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            isOpen && "rotate-45"
          )}
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Modal de Pedido Rápido */}
      <PedidoVendaRapido
        isOpen={showPedidoModal}
        onClose={() => setShowPedidoModal(false)}
      />
    </>
  )
}