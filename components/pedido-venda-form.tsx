
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, Search, Edit } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EstoqueModal } from "@/components/estoque-modal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

export default function PedidoVendaForm() {
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

  const [pedido, setPedido] = useState({
    CODEMP: "1",
    CODCENCUS: "0",
    NUNOTA: "",
    DTNEG: new Date().toISOString().split('T')[0],
    DTFATUR: "",
    DTENTSAI: "",
    CODPARC: "",
    CODTIPOPER: "974",
    TIPMOV: "P",
    CODTIPVENDA: "1",
    CODVEND: "0",
    OBSERVACAO: "",
    VLOUTROS: 0,
    VLRDESCTOT: 0,
    VLRFRETE: 0,
    TIPFRETE: "S",
    ORDEMCARGA: "",
    CODPARCTRANSP: "0",
    PERCDESC: 0,
    CODNAT: "0",
    TIPO_CLIENTE: "PJ",
    CPF_CNPJ: "",
    IE_RG: "",
    RAZAO_SOCIAL: ""
  })

  const [itens, setItens] = useState<ItemPedido[]>([])

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
      return
    }
    
    try {
      const response = await fetch(`/api/sankhya/parceiros?searchName=${search}&pageSize=50`)
      const data = await response.json()
      setParceiros(data.parceiros || [])
      setShowParceirosDropdown(true)
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
    }
  }

  const selecionarParceiro = (codParc: string) => {
    const parceiro = parceiros.find(p => p.CODPARC === codParc)
    
    if (parceiro) {
      setPedido({
        ...pedido,
        CODPARC: codParc,
        TIPO_CLIENTE: parceiro.TIPPESSOA === 'J' ? 'PJ' : 'PF',
        CPF_CNPJ: parceiro.CGC_CPF || '',
        IE_RG: parceiro.IDENTINSCESTAD || '',
        RAZAO_SOCIAL: parceiro.RAZAOSOCIAL || parceiro.NOMEPARC || ''
      })
    } else {
      setPedido({ ...pedido, CODPARC: codParc })
    }
  }

  const buscarProdutos = async (search: string) => {
    try {
      const response = await fetch(`/api/sankhya/produtos?searchName=${search}&pageSize=20`)
      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
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

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const confirmarItem = () => {
    if (!itemAtual.CODPROD) {
      toast.error("Selecione um produto")
      return
    }

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
        throw new Error('Erro ao criar pedido')
      }

      toast.success("Pedido criado com sucesso!")

      setPedido({
        CODEMP: "1",
        CODCENCUS: "0",
        NUNOTA: "",
        DTNEG: new Date().toISOString().split('T')[0],
        DTFATUR: "",
        DTENTSAI: "",
        CODPARC: "",
        CODTIPOPER: "974",
        TIPMOV: "P",
        CODTIPVENDA: "1",
        CODVEND: "0",
        OBSERVACAO: "",
        VLOUTROS: 0,
        VLRDESCTOT: 0,
        VLRFRETE: 0,
        TIPFRETE: "S",
        ORDEMCARGA: "",
        CODPARCTRANSP: "0",
        PERCDESC: 0,
        CODNAT: "0",
        TIPO_CLIENTE: "PJ",
        CPF_CNPJ: "",
        IE_RG: "",
        RAZAO_SOCIAL: ""
      })
      setParceiroSearch("")
      setItens([])
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["parceiro", "itens"]} className="space-y-4">
        {/* Dados do Parceiro */}
        <AccordionItem value="parceiro" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded"></div>
              <span className="text-lg font-semibold text-green-800">Dados do Parceiro</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-3 relative">
                <Label htmlFor="parceiro" className="text-gray-700 font-medium">Parceiro *</Label>
                <div className="relative">
                  <Input
                    id="parceiro"
                    value={parceiroSearch}
                    onChange={(e) => buscarParceiros(e.target.value)}
                    onFocus={() => parceiroSearch.length >= 2 && setShowParceirosDropdown(true)}
                    placeholder="Digite o nome do parceiro..."
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                  {showParceirosDropdown && parceiros.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {parceiros.map((p) => (
                        <div
                          key={p.CODPARC}
                          className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors"
                          onClick={() => {
                            selecionarParceiro(p.CODPARC)
                            setParceiroSearch(p.NOMEPARC)
                            setShowParceirosDropdown(false)
                          }}
                        >
                          <div className="font-medium text-gray-800">{p.NOMEPARC}</div>
                          <div className="text-sm text-gray-500">{p.CGC_CPF}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {pedido.CODPARC && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Parceiro selecionado: {pedido.CODPARC}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_cliente" className="text-gray-700 font-medium">Tipo Cliente *</Label>
                <Select value={pedido.TIPO_CLIENTE} onValueChange={(value) => setPedido({ ...pedido, TIPO_CLIENTE: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj" className="text-gray-700 font-medium">CPF/CNPJ *</Label>
                <Input
                  id="cpf_cnpj"
                  value={pedido.CPF_CNPJ}
                  onChange={(e) => setPedido({ ...pedido, CPF_CNPJ: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ie_rg" className="text-gray-700 font-medium">IE/RG *</Label>
                <Input
                  id="ie_rg"
                  value={pedido.IE_RG}
                  onChange={(e) => setPedido({ ...pedido, IE_RG: e.target.value })}
                  placeholder="123.123.123"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="razao_social" className="text-gray-700 font-medium">Razão Social *</Label>
                <Input
                  id="razao_social"
                  value={pedido.RAZAO_SOCIAL}
                  onChange={(e) => setPedido({ ...pedido, RAZAO_SOCIAL: e.target.value })}
                  placeholder="Nome ou Razão Social"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dados da Nota */}
        <AccordionItem value="nota" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded"></div>
              <span className="text-lg font-semibold text-green-800">Dados da Nota</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dtneg" className="text-gray-700 font-medium">Data de Negociação *</Label>
                <Input
                  id="dtneg"
                  type="date"
                  value={pedido.DTNEG}
                  onChange={(e) => setPedido({ ...pedido, DTNEG: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dtfatur" className="text-gray-700 font-medium">Data de Faturamento</Label>
                <Input
                  id="dtfatur"
                  type="date"
                  value={pedido.DTFATUR}
                  onChange={(e) => setPedido({ ...pedido, DTFATUR: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dtentsai" className="text-gray-700 font-medium">Data de Entrada/Saída</Label>
                <Input
                  id="dtentsai"
                  type="date"
                  value={pedido.DTENTSAI}
                  onChange={(e) => setPedido({ ...pedido, DTENTSAI: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codtipoper" className="text-gray-700 font-medium">Modelo da Nota *</Label>
                <Input
                  id="codtipoper"
                  type="number"
                  value={pedido.CODTIPOPER}
                  onChange={(e) => setPedido({ ...pedido, CODTIPOPER: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="Ex: 974"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipmov" className="text-gray-700 font-medium">Tipo de Movimento</Label>
                <Select value={pedido.TIPMOV} onValueChange={(value) => setPedido({ ...pedido, TIPMOV: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P">Pedido</SelectItem>
                    <SelectItem value="V">Venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codtipvenda" className="text-gray-700 font-medium">Tipo de Negociação *</Label>
                <Input
                  id="codtipvenda"
                  value={pedido.CODTIPVENDA}
                  onChange={(e) => setPedido({ ...pedido, CODTIPVENDA: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="observacao" className="text-gray-700 font-medium">Observações</Label>
                <Textarea
                  id="observacao"
                  value={pedido.OBSERVACAO}
                  onChange={(e) => setPedido({ ...pedido, OBSERVACAO: e.target.value })}
                  rows={3}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Valores */}
        <AccordionItem value="valores" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded"></div>
              <span className="text-lg font-semibold text-green-800">Valores</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vlrfrete" className="text-gray-700 font-medium">Valor do Frete (R$)</Label>
                <Input
                  id="vlrfrete"
                  type="number"
                  step="0.01"
                  value={pedido.VLRFRETE}
                  onChange={(e) => setPedido({ ...pedido, VLRFRETE: parseFloat(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipfrete" className="text-gray-700 font-medium">Tipo de Frete</Label>
                <Select value={pedido.TIPFRETE} onValueChange={(value) => setPedido({ ...pedido, TIPFRETE: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S - Sem Frete</SelectItem>
                    <SelectItem value="C">C - CIF</SelectItem>
                    <SelectItem value="F">F - FOB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vloutros" className="text-gray-700 font-medium">Outros Valores (R$)</Label>
                <Input
                  id="vloutros"
                  type="number"
                  step="0.01"
                  value={pedido.VLOUTROS}
                  onChange={(e) => setPedido({ ...pedido, VLOUTROS: parseFloat(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percdesc" className="text-gray-700 font-medium">Desconto (%)</Label>
                <Input
                  id="percdesc"
                  type="number"
                  step="0.01"
                  value={pedido.PERCDESC}
                  onChange={(e) => setPedido({ ...pedido, PERCDESC: parseFloat(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vlrdesctot" className="text-gray-700 font-medium">Desconto Total (R$)</Label>
                <Input
                  id="vlrdesctot"
                  type="number"
                  step="0.01"
                  value={pedido.VLRDESCTOT}
                  onChange={(e) => setPedido({ ...pedido, VLRDESCTOT: parseFloat(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Itens do Pedido */}
        <AccordionItem value="itens" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg [&[data-state=closed]]:rounded-b-lg">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded"></div>
                <span className="text-lg font-semibold text-green-800">
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
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-3">
            {itens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Vlr. Unit.</TableHead>
                      <TableHead className="text-right">Desc. %</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.DESCRPROD}</div>
                            <div className="text-xs text-gray-500">Cód: {item.CODPROD}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.QTDNEG}</TableCell>
                        <TableCell className="text-right">
                          {item.VLRUNIT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-right">{item.PERCDESC}%</TableCell>
                        <TableCell className="text-right font-medium text-green-700">
                          {calcularTotal(item).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirModalEditarItem(index)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerItem(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
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

      <Card className="border-green-200 shadow-md">
        <CardContent className="pt-6 bg-gradient-to-br from-green-50 to-white">
          <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg border border-green-200">
            <span className="text-xl font-bold text-gray-700">Total do Pedido:</span>
            <span className="text-2xl font-bold text-green-700">
              {calcularTotalPedido().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <Button onClick={salvarPedido} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Pedido"}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Adicionar/Editar Item */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-green-200">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800">
              {currentItemIndex !== null ? 'Editar Item' : 'Adicionar Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Produto *</Label>
              <div className="flex gap-2">
                <Input
                  value={itemAtual.DESCRPROD || ''}
                  placeholder="Selecione um produto"
                  readOnly
                  className="flex-1 border-gray-300 bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowProdutoModal(true)
                    buscarProdutos('')
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Quantidade *</Label>
                <Input
                  type="number"
                  value={itemAtual.QTDNEG}
                  onChange={(e) => setItemAtual({ ...itemAtual, QTDNEG: parseFloat(e.target.value) || 0 })}
                  min="1"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Valor Unitário (R$) *</Label>
                <Input
                  type="number"
                  value={itemAtual.VLRUNIT}
                  onChange={(e) => setItemAtual({ ...itemAtual, VLRUNIT: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Desconto (%)</Label>
                <Input
                  type="number"
                  value={itemAtual.PERCDESC}
                  onChange={(e) => setItemAtual({ ...itemAtual, PERCDESC: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.01"
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Local de Estoque</Label>
                <Input
                  value={itemAtual.CODLOCALORIG}
                  onChange={(e) => setItemAtual({ ...itemAtual, CODLOCALORIG: e.target.value })}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total do Item:</span>
                <span className="text-xl font-bold text-green-700">
                  {calcularTotal(itemAtual).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarItem} className="bg-green-600 hover:bg-green-700 text-white">
              {currentItemIndex !== null ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Produto */}
      <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] border-green-200">
          <DialogHeader className="border-b border-green-100 pb-4">
            <DialogTitle className="text-green-800">Selecionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Buscar produto..."
              onChange={(e) => buscarProdutos(e.target.value)}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
            <div className="max-h-96 overflow-y-auto space-y-2">
              {produtos.map((produto) => (
                <Card
                  key={produto.CODPROD}
                  className="border-green-100 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 cursor-pointer" onClick={() => selecionarProduto(produto)}>
                        <p className="font-medium text-gray-800">{produto.DESCRPROD}</p>
                        <p className="text-sm text-gray-500">Cód: {produto.CODPROD}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-green-700">
                            {parseFloat(produto.VLRCOMERC || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Estoque: {parseFloat(produto.ESTOQUE || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            abrirModalEstoque(produto)
                          }}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Search className="w-4 h-4 mr-1" />
                          Estoque
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
