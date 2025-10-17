
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth-service"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Sparkles, ArrowLeft, BarChart3, TrendingUp, Package, Users } from "lucide-react"
import { WidgetRenderer } from "@/components/widget-renderer"

interface Widget {
  tipo: "card" | "grafico_barras" | "grafico_linha" | "grafico_pizza" | "tabela"
  titulo: string
  dados: any
  metadados?: any
}

const SUGGESTED_PROMPTS = [
  {
    label: "Performance de Vendas",
    prompt: "Analise o desempenho de vendas dos últimos 6 meses e mostre os top 5 produtos mais vendidos",
    icon: TrendingUp
  },
  {
    label: "Análise de Leads",
    prompt: "Mostre uma análise completa dos meus leads: distribuição por estágio, taxa de conversão e leads mais valiosos",
    icon: BarChart3
  },
  {
    label: "Estoque Crítico",
    prompt: "Identifique produtos com estoque baixo e sugira ações de reposição baseadas no histórico de vendas",
    icon: Package
  },
  {
    label: "Análise de Clientes",
    prompt: "Analise o perfil dos meus clientes e identifique padrões de compra e oportunidades de cross-sell",
    icon: Users
  }
]

export default function AnalisePage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showInitial, setShowInitial] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push("/")
    }
  }, [router])

  const handleAnalyze = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return

    setInput("")
    setIsLoading(true)
    setShowInitial(false)
    setWidgets([])

    try {
      const response = await fetch("/api/gemini/analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) throw new Error("Erro ao processar análise")

      const data = await response.json()
      setWidgets(data.widgets || [])
    } catch (error) {
      console.error("Erro ao analisar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipClick = (prompt: string) => {
    handleAnalyze(prompt)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="border-b p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para escolhas de IA
          </Button>
        </div>

        {/* Área Principal */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
          {showInitial ? (
            <div className="flex flex-col items-center justify-center min-h-full py-12 space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-8 w-8" />
                <h1 className="text-2xl font-semibold">IA Análise de Dados</h1>
              </div>
              <p className="text-center text-muted-foreground max-w-md">
                Faça perguntas sobre seus dados e receba análises visuais em tempo real com gráficos, tabelas e insights automáticos.
              </p>

              {/* Chips de Sugestões */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl w-full mt-8">
                {SUGGESTED_PROMPTS.map((promptData) => {
                  const Icon = promptData.icon
                  return (
                    <Card
                      key={promptData.label}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleChipClick(promptData.prompt)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          {promptData.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{promptData.prompt}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-7xl mx-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Analisando seus dados...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {widgets.map((widget, index) => (
                    <WidgetRenderer key={index} widget={widget} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra de Input Fixa */}
        <div className="border-t bg-background p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze(input)}
              placeholder="Faça uma pergunta sobre seus dados..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleAnalyze(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
