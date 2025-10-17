
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, Search, Edit, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstoqueModal } from "@/components/estoque-modal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ItemPedido {
  CODPROD: string
  DESCRPROD?: string
  QTDNEG: number
  VLRUNIT: number
  PERCDESC: number
  CODLOCALORIG: string
  CONTROLE: string
  AD_QTDBARRA?: number
  CODVOL?: string
  IDALIQICMS?: string
}

interface PedidoVendaFromLeadProps {
  dadosIniciais: any
  onSuccess: () => void
  onCancel: () => void
}

export default function PedidoVendaFromLead({ dadosIniciais, onSuccess, onCancel }: PedidoVendaFromLeadProps) {
  const [loading, setLoading] = useState(false)
  const [parceiros, setParceiros] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [showProdutoModal, setShowProdutoModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)
  const [parceiroSearch, setParceiroSearch] = useState("")
  const [showParceirosDropdown, setShowParceirosDropdown] = useState(false)
  const [showEstoqueModal, setShowEstoqueModal] = useState(false)
  const [produtoEstoqueSelecionado, setProdutoEstoqueSelecionado] = useState<any | null>(null)
  const [removendoItem, setRemovendoItem] = useState<number | null>(null)

  const [pedido, setPedido] = useState({
    CODEMP: dadosIniciais.CODEMP || "1",
    CODCENCUS: dadosIniciais.CODCENCUS || "0",
    NUNOTA: dadosIniciais.NUNOTA || "",
    DTNEG: dadosIniciais.DTNEG || new Date().toISOString().split('T')[0],
    DTFATUR: dadosIniciais.DTFATUR || "",
    DTENTSAI: dadosIniciais.DTENTSAI || "",
    CODPARC: dadosIniciais.CODPARC || "",
    CODTIPOPER: dadosIniciais.CODTIPOPER || "974",
    TIPMOV: dadosIniciais.TIPMOV || "P",
    CODTIPVENDA: dadosIniciais.CODTIPVENDA || "1",
    CODVEND: dadosIniciais.CODVEND || "0",
    OBSERVACAO: dadosIniciais.OBSERVACAO || "",
    VLOUTROS: dadosIniciais.VLOUTROS || 0,
    VLRDESCTOT: dadosIniciais.VLRDESCTOT || 0,
    VLRFRETE: dadosIniciais.VLRFRETE || 0,
    TIPFRETE: dadosIniciais.TIPFRETE || "S",
    ORDEMCARGA: dadosIniciais.ORDEMCARGA || "",
    CODPARCTRANSP: dadosIniciais.CODPARCTRANSP || "0",
    PERCDESC: dadosIniciais.PERCDESC || 0,
    CODNAT: dadosIniciais.CODNAT || "0",
    TIPO_CLIENTE: dadosIniciais.TIPO_CLIENTE || "PJ",
    CPF_CNPJ: dadosIniciais.CPF_CNPJ || "",
    IE_RG: dadosIniciais.IE_RG || "",
    RAZAO_SOCIAL: dadosIniciais.RAZAO_SOCIAL || ""
  })

  const [itens, setItens] = useState<ItemPedido[]>([])

  useEffect(() => {
    // Mapear itens do lead para o formato correto
    if (dadosIniciais.itens && dadosIniciais.itens.length > 0) {
      const itensMapeados = dadosIniciais.itens.map((item: any) => ({
        CODPROD: String(item.CODPROD),
        DESCRPROD: item.DESCRPROD || '',
        QTDNEG: Number(item.QTDNEG) || 1,
        VLRUNIT: Number(item.VLRUNIT) || 0,
        PERCDESC: Number(item.PERCDESC) || 0,
        CODLOCALORIG: item.CODLOCALORIG || "700",
        CONTROLE: item.CONTROLE || "007",
        AD_QTDBARRA: item.AD_QTDBARRA || 1,
        CODVOL: item.CODVOL || "UN",
        IDALIQICMS: item.IDALIQICMS || "0"
      }))
      setItens(itensMapeados)
    }
  }, [dadosIniciais])

  const [itemAtual, setItemAtual] = useState<ItemPedido>({
    CODPROD: "",
    QTDNEG: 1,
    VLRUNIT: 0,
    PERCDESC: 0,
    CODLOCALORIG: "700",
    CONTROLE: "007",
    AD_QTDBARRA: 1,
    CODVOL: "UN",
    IDALIQICMS: "0"
  })

  useEffect(() => {
    carregarParceiros()
    // Preencher nome do parceiro se já tiver código
    if (dadosIniciais.CODPARC && dadosIniciais.RAZAO_SOCIAL) {
      setParceiroSearch(dadosIniciais.RAZAO_SOCIAL)
    }
  }, [])

  const carregarParceiros = async () => {
    try {
      const response = await fetch('/api/sankhya/parceiros?pageSize=100')
      const data = await response.json()
      setParceiros(data.parceiros || [])
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    }
  }

  const buscarParceiros = async (search: string) => {
    setParceiroSearch(search)
    
    if (search.length < 2) {
      setParceiros([])
      setShowParceirosDropdown(false)
      return
    }
    
    try {
      const response = await fetch(`/api/sankhya/parceiros?searchName=${encodeURIComponent(search)}&pageSize=50`)
      const data = await response.json()
      
      console.log('📋 Parceiros encontrados:', data.parceiros?.length || 0)
      
      if (data.parceiros && data.parceiros.length > 0) {
        setParceiros(data.parceiros)
        setShowParceirosDropdown(true)
      } else {
        setParceiros([])
        setShowParceirosDropdown(false)
      }
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
      setParceiros([])
      setShowParceirosDropdown(false)
    }
  }

  const selecionarParceiro = (parceiro: any) => {
    console.log('✅ Parceiro selecionado:', parceiro)
    
    setParceiroSearch(parceiro.NOMEPARC || parceiro.RAZAOSOCIAL || '')
    
    setPedido({
      ...pedido,
      CODPARC: String(parceiro.CODPARC),
      TIPO_CLIENTE: parceiro.TIPPESSOA === 'J' ? 'PJ' : 'PF',
      CPF_CNPJ: parceiro.CGC_CPF || '',
      IE_RG: parceiro.IDENTINSCESTAD || '',
      RAZAO_SOCIAL: parceiro.RAZAOSOCIAL || parceiro.NOMEPARC || ''
    })
    
    setShowParceirosDropdown(false)
  }

  // Estado para controlar o debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const buscarProdutos = async (search: string) => {
    // Só busca se tiver pelo menos 2 caracteres
    if (search.length < 2) {
      setProdutos([])
      return
    }

    try {
      const response = await fetch(`/api/sankhya/produtos?searchName=${encodeURIComponent(search)}&pageSize=20`)
      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProdutos([])
    }
  }

  const buscarProdutosComDebounce = (search: string) => {
    // Limpar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Criar novo timeout
    const timeout = setTimeout(() => {
      buscarProdutos(search)
    }, 500) // 500ms de delay

    setSearchTimeout(timeout)
  }

  const abrirModalNovoItem = () => {
    setItemAtual({
      CODPROD: "",
      QTDNEG: 1,
      VLRUNIT: 0,
      PERCDESC: 0,
      CODLOCALORIG: "700",
      CONTROLE: "007",
      AD_QTDBARRA: 1,
      CODVOL: "UN",
      IDALIQICMS: "0"
    })
    setCurrentItemIndex(null)
    setShowItemModal(true)
  }

  const abrirModalEditarItem = (index: number) => {
    setItemAtual({ ...itens[index] })
    setCurrentItemIndex(index)
    setShowItemModal(true)
  }

  const removerItem = async (index: number) => {
    setRemovendoItem(index)
    // Simulação de delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 300))
    setItens(itens.filter((_, i) => i !== index))
    setRemovendoItem(null)
    toast.success("Item removido")
  }

  const confirmarItem = async () => {
    if (!itemAtual.CODPROD) {
      toast.error("Selecione um produto")
      return
    }

    setLoading(true)
    
    // Simulação de delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 300))

    if (currentItemIndex !== null) {
      const novosItens = [...itens]
      novosItens[currentItemIndex] = { ...itemAtual }
      setItens(novosItens)
      toast.success("Item atualizado")
    } else {
      setItens([...itens, { ...itemAtual }])
      toast.success("Item adicionado")
    }

    setShowItemModal(false)
    setItemAtual({
      CODPROD: "",
      QTDNEG: 1,
      VLRUNIT: 0,
      PERCDESC: 0,
      CODLOCALORIG: "700",
      CONTROLE: "007",
      AD_QTDBARRA: 1,
      CODVOL: "UN",
      IDALIQICMS: "0"
    })
    
    setLoading(false)
  }

  const selecionarProduto = (produto: any) => {
    setItemAtual({
      ...itemAtual,
      CODPROD: produto.CODPROD,
      DESCRPROD: produto.DESCRPROD,
      VLRUNIT: parseFloat(produto.VLRCOMERC || 0)
    })
    setShowProdutoModal(false)
  }

  const abrirModalEstoque = (produto: any) => {
    setProdutoEstoqueSelecionado(produto)
    setShowEstoqueModal(true)
  }

  const calcularTotal = (item: ItemPedido) => {
    const total = item.QTDNEG * item.VLRUNIT
    const desconto = total * (item.PERCDESC / 100)
    return total - desconto
  }

  const calcularTotalPedido = () => {
    return itens.reduce((acc, item) => acc + calcularTotal(item), 0)
  }

  const salvarPedido = async () => {
    if (!pedido.CODPARC) {
      toast.error("Selecione um parceiro")
      return
    }

    if (!pedido.CPF_CNPJ || !pedido.IE_RG || !pedido.RAZAO_SOCIAL) {
      toast.error("Preencha todos os dados do cliente")
      return
    }

    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item ao pedido")
      return
    }

    setLoading(true)

    try {
      console.log('📦 Criando pedido de venda...')
      const response = await fetch('/api/sankhya/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pedido,
          itens: itens.map(item => ({
            CODPROD: item.CODPROD,
            QTDNEG: item.QTDNEG,
            VLRUNIT: item.VLRUNIT,
            PERCDESC: item.PERCDESC,
            CODLOCALORIG: item.CODLOCALORIG,
            CONTROLE: item.CONTROLE,
            AD_QTDBARRA: item.AD_QTDBARRA,
            CODVOL: item.CODVOL,
            IDALIQICMS: item.IDALIQICMS
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.statusMessage || 'Erro ao criar pedido'
        throw new Error(errorMessage)
      }

      const resultado = await response.json()
      console.log('✅ Pedido criado com sucesso!', resultado)
      
      toast.success("Pedido criado com sucesso!")
      
      // Chamar onSuccess que irá marcar o lead como ganho
      console.log('📤 Chamando onSuccess para atualizar status do lead...')
      onSuccess()
      
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error)
      toast.error(error.message || "Erro ao criar pedido")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <Accordion type="multiple" defaultValue={["parceiro", "nota", "itens"]} className="space-y-3">
        {/* Dados do Parceiro */}
        <AccordionItem value="parceiro" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Dados do Parceiro</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2 md:col-span-2">
                <Label className="text-xs">Parceiro *</Label>
                <div className="relative">
                  <Input
                    value={parceiroSearch}
                    onChange={(e) => buscarParceiros(e.target.value)}
                    onFocus={() => {
                      if (parceiroSearch.length >= 2 && parceiros.length > 0) {
                        setShowParceirosDropdown(true)
                      }
                    }}
                    onBlur={() => {
                      // Delay para permitir o clique no item
                      setTimeout(() => setShowParceirosDropdown(false), 200)
                    }}
                    placeholder="Digite o nome do parceiro (min. 2 caracteres)..."
                    className="text-sm"
                  />
                  {showParceirosDropdown && parceiros.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {parceiros.map((p) => (
                        <div
                          key={p.CODPARC}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm border-b last:border-b-0 transition-colors"
                          onClick={() => selecionarParceiro(p)}
                          onMouseDown={(e) => e.preventDefault()} // Previne o blur antes do click
                        >
                          <div className="font-medium text-gray-900">{p.NOMEPARC || p.RAZAOSOCIAL}</div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <span>CPF/CNPJ: {p.CGC_CPF || 'Não informado'}</span>
                            <span className="text-green-600">Cód: {p.CODPARC}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {parceiroSearch.length >= 2 && parceiros.length === 0 && !showParceirosDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500 text-center">
                      Nenhum parceiro encontrado
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo Cliente *</Label>
                <Select value={pedido.TIPO_CLIENTE} onValueChange={(value) => setPedido({ ...pedido, TIPO_CLIENTE: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">CPF/CNPJ *</Label>
                <Input
                  value={pedido.CPF_CNPJ}
                  onChange={(e) => setPedido({ ...pedido, CPF_CNPJ: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">IE/RG *</Label>
                <Input
                  value={pedido.IE_RG}
                  onChange={(e) => setPedido({ ...pedido, IE_RG: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Razão Social *</Label>
                <Input
                  value={pedido.RAZAO_SOCIAL}
                  onChange={(e) => setPedido({ ...pedido, RAZAO_SOCIAL: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dados da Nota */}
        <AccordionItem value="nota" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Dados da Nota</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Data Negociação *</Label>
                <Input
                  type="date"
                  value={pedido.DTNEG}
                  onChange={(e) => setPedido({ ...pedido, DTNEG: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo de Operação *</Label>
                <Input
                  value={pedido.CODTIPOPER}
                  onChange={(e) => setPedido({ ...pedido, CODTIPOPER: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo de Movimento</Label>
                <Select value={pedido.TIPMOV} onValueChange={(value) => setPedido({ ...pedido, TIPMOV: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">Pedido</SelectItem>
                    <SelectItem value="V">Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo de Venda *</Label>
                <Input
                  value={pedido.CODTIPVENDA}
                  onChange={(e) => setPedido({ ...pedido, CODTIPVENDA: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2 md:col-span-2">
                <Label className="text-xs">Observação</Label>
                <Textarea
                  value={pedido.OBSERVACAO}
                  onChange={(e) => setPedido({ ...pedido, OBSERVACAO: e.target.value })}
                  className="text-xs md:text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Valores */}
        <AccordionItem value="valores" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded"></div>
              <span className="text-sm md:text-base font-semibold text-green-800">Valores</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Valor Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLRFRETE}
                  onChange={(e) => setPedido({ ...pedido, VLRFRETE: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Tipo Frete</Label>
                <Select value={pedido.TIPFRETE} onValueChange={(value) => setPedido({ ...pedido, TIPFRETE: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Sem Frete</SelectItem>
                    <SelectItem value="C">CIF</SelectItem>
                    <SelectItem value="F">FOB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Outros Valores (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLOUTROS}
                  onChange={(e) => setPedido({ ...pedido, VLOUTROS: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Desconto (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.PERCDESC}
                  onChange={(e) => setPedido({ ...pedido, PERCDESC: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-xs">Desconto Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pedido.VLRDESCTOT}
                  onChange={(e) => setPedido({ ...pedido, VLRDESCTOT: parseFloat(e.target.value) || 0 })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Itens do Pedido */}
        <AccordionItem value="itens" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-3 md:px-4 py-2 md:py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-green-600 rounded"></div>
                <span className="text-sm md:text-base font-semibold text-green-800">
                  Itens do Pedido
                  {itens.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded-full">
                      {itens.length}
                    </span>
                  )}
                </span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  abrirModalNovoItem()
                }} 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
              >
                <Plus className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 md:px-4 pb-3 md:pb-4 pt-3">
            {itens.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 md:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">#</TableHead>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">Produto</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4">Qtd</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4 hidden sm:table-cell">Vlr. Unit.</TableHead>
                      <TableHead className="text-right text-[10px] md:text-xs px-1 md:px-4">Total</TableHead>
                      <TableHead className="text-[10px] md:text-xs px-1 md:px-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-[10px] md:text-xs px-1 md:px-4">{index + 1}</TableCell>
                        <TableCell className="text-[10px] md:text-xs px-1 md:px-4">
                          <div className="font-medium">{item.DESCRPROD}</div>
                          <div className="text-[8px] md:text-[10px] text-muted-foreground">Cód: {item.CODPROD}</div>
                        </TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4">{item.QTDNEG}</TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4 hidden sm:table-cell">{formatCurrency(item.VLRUNIT)}</TableCell>
                        <TableCell className="text-right text-[10px] md:text-xs px-1 md:px-4 font-medium text-green-700">
                          {formatCurrency(calcularTotal(item))}
                        </TableCell>
                        <TableCell className="px-1 md:px-4">
                          <div className="flex gap-0.5 md:gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => abrirModalEditarItem(index)} 
                              className="h-6 w-6 md:h-7 md:w-7"
                              disabled={removendoItem === index}
                            >
                              <Edit className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removerItem(index)} 
                              className="h-6 w-6 md:h-7 md:w-7 text-red-600"
                              disabled={removendoItem === index}
                            >
                              {removendoItem === index ? (
                                <div className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Total e Botões de Ação */}
      <Card className="border-green-200">
        <CardContent className="pt-3 md:pt-4 p-3 md:p-4">
          <div className="flex justify-between items-center mb-2 md:mb-3 p-2 md:p-3 bg-green-50 rounded-lg">
            <span className="font-bold text-xs md:text-sm">Total do Pedido:</span>
            <span className="text-base md:text-lg font-bold text-green-700">{formatCurrency(calcularTotalPedido())}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" className="flex-1 text-xs md:text-sm h-8 md:h-10">Cancelar</Button>
            <Button onClick={salvarPedido} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm h-8 md:h-10">
              <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              {loading ? "Salvando..." : "Salvar Pedido"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Adicionar/Editar Item */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {currentItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Produto *</Label>
              <div className="flex gap-2">
                <Input
                  value={itemAtual.DESCRPROD || ''}
                  placeholder="Selecione um produto"
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowProdutoModal(true)
                    buscarProdutos('')
                  }}
                  className="h-9 w-9"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Quantidade *</Label>
                <Input
                  type="number"
                  value={itemAtual.QTDNEG}
                  onChange={(e) => setItemAtual({ ...itemAtual, QTDNEG: parseFloat(e.target.value) || 0 })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Valor Unitário *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemAtual.VLRUNIT}
                  onChange={(e) => setItemAtual({ ...itemAtual, VLRUNIT: parseFloat(e.target.value) || 0 })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="text-base font-bold text-green-700">
                  {formatCurrency(calcularTotal(itemAtual))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemModal(false)} size="sm" disabled={loading}>Cancelar</Button>
            <Button onClick={confirmarItem} size="sm" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {currentItemIndex !== null ? 'Atualizando...' : 'Adicionando...'}
                </>
              ) : (
                currentItemIndex !== null ? 'Atualizar' : 'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Produto */}
      <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base">Selecionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Digite pelo menos 2 caracteres para buscar..."
              onChange={(e) => buscarProdutosComDebounce(e.target.value)}
              className="text-sm"
            />
            <div className="max-h-96 overflow-y-auto space-y-2">
              {produtos.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {searchTimeout ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      <span>Buscando produtos...</span>
                    </div>
                  ) : (
                    'Digite pelo menos 2 caracteres para buscar produtos'
                  )}
                </div>
              ) : (
                produtos.map((produto) => (
                  <Card
                    key={produto.CODPROD}
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => selecionarProduto(produto)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{produto.DESCRPROD}</p>
                          <p className="text-xs text-muted-foreground">Cód: {produto.CODPROD}</p>
                        </div>
                        <p className="font-bold text-sm text-green-700">
                          {formatCurrency(parseFloat(produto.VLRCOMERC || 0))}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Estoque */}
      <EstoqueModal
        isOpen={showEstoqueModal}
        onClose={() => setShowEstoqueModal(false)}
        product={produtoEstoqueSelecionado}
      />
    </div>
  )
}
